import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { MOUSE, OrthographicCamera, Spherical, TOUCH, Vector3 } from 'three';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';
import {
  createCelebrationState,
  sampleCelebrationFrame,
  type CameraCelebrationState,
} from './camera-celebration';
import { resolveCameraCollision } from './camera-collision';
import {
  CAMERA_DAMPING_FACTOR,
  CAMERA_MAX_POLAR_ANGLE,
  CAMERA_MAX_ZOOM,
  CAMERA_MIN_POLAR_ANGLE,
  CAMERA_MIN_ZOOM,
  CAMERA_PAN_SPEED,
  CAMERA_HORIZONTAL_DRAG_SENSITIVITY,
  CAMERA_VERTICAL_DRAG_SENSITIVITY,
} from './camera-config';

type CameraControllerProps = {
  worldSize: number;
};

type OrbitDragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startPhi: number;
  startTheta: number;
};

type PanDragState = {
  pointerId: number;
  startX: number;
  startY: number;
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const offsetVector = new Vector3();
const spherical = new Spherical();
const resolvedPosition = new Vector3();
const panRight = new Vector3();
const panUp = new Vector3();
const panDelta = new Vector3();

const MOUSE_NONE = -1 as MOUSE;

const isPanModifierPressed = (event: PointerEvent | MouseEvent): boolean => event.metaKey || event.ctrlKey;

const configureFreecamControls = (controls: OrbitControlsImpl): void => {
  controls.mouseButtons = {
    LEFT: MOUSE_NONE,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE_NONE,
  };
  controls.touches = {
    ONE: TOUCH.ROTATE,
    TWO: TOUCH.DOLLY_PAN,
  };
};

const readOrbitAngles = (
  controls: OrbitControlsImpl,
  orthoCamera: OrthographicCamera,
): { phi: number; theta: number } => {
  offsetVector.copy(orthoCamera.position).sub(controls.target);
  spherical.setFromVector3(offsetVector);
  return { phi: spherical.phi, theta: spherical.theta };
};

const applyOrbitAngles = (
  controls: OrbitControlsImpl,
  orthoCamera: OrthographicCamera,
  theta: number,
  phi: number,
): void => {
  offsetVector.copy(orthoCamera.position).sub(controls.target);
  spherical.setFromVector3(offsetVector);
  spherical.theta = theta;
  spherical.phi = clamp(phi, CAMERA_MIN_POLAR_ANGLE, CAMERA_MAX_POLAR_ANGLE);
  offsetVector.setFromSpherical(spherical);
  orthoCamera.position.copy(controls.target).add(offsetVector);
  controls.update();
};

const applyPanDrag = (
  controls: OrbitControlsImpl,
  orthoCamera: OrthographicCamera,
  deltaX: number,
  deltaY: number,
): void => {
  const scale = (CAMERA_PAN_SPEED * 2.4) / orthoCamera.zoom;

  orthoCamera.updateMatrixWorld();
  panRight.setFromMatrixColumn(orthoCamera.matrixWorld, 0);
  panUp.setFromMatrixColumn(orthoCamera.matrixWorld, 1);

  panDelta.copy(panRight).multiplyScalar(-deltaX * scale);
  panDelta.add(panUp.multiplyScalar(deltaY * scale));

  controls.target.add(panDelta);
  orthoCamera.position.add(panDelta);
  controls.update();
};

const beginCelebration = (
  controls: OrbitControlsImpl,
  orthoCamera: OrthographicCamera,
  celebration: NonNullable<ReturnType<typeof useGameStore.getState>['cameraCelebration']>,
): CameraCelebrationState => {
  const [endTargetX, endTargetY, endTargetZ] = gridToWorldCenter(
    celebration.gridX,
    celebration.gridY,
    celebration.sizeX,
    celebration.sizeY,
    GRID_SIZE,
    CELL_SIZE,
  );

  return createCelebrationState({
    now: performance.now(),
    startTarget: [controls.target.x, controls.target.y, controls.target.z],
    endTarget: [endTargetX, endTargetY, endTargetZ],
    startZoom: orthoCamera.zoom,
    startAzimuth: controls.getAzimuthalAngle(),
    buildingId: celebration.buildingId,
  });
};

export const CameraController = ({ worldSize }: CameraControllerProps) => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const celebrationRef = useRef<CameraCelebrationState | null>(null);
  const lastCelebrationTokenRef = useRef<number | null>(null);
  const isUserControllingRef = useRef(false);
  const controlsConfiguredRef = useRef(false);
  const orbitDragRef = useRef<OrbitDragState | null>(null);
  const panDragRef = useRef<PanDragState | null>(null);

  const cameraCelebration = useGameStore((state) => state.cameraCelebration);
  const clearCameraCelebration = useGameStore((state) => state.clearCameraCelebration);
  const engine = useGameStore((state) => state.engine);

  const { camera, gl } = useThree();

  const handleUserStart = (): void => {
    if (celebrationRef.current) {
      celebrationRef.current = null;
      clearCameraCelebration();
    }
    isUserControllingRef.current = true;
  };

  const handleUserEnd = (): void => {
    isUserControllingRef.current = false;
  };

  useEffect(() => {
    const domElement = gl.domElement;

    const releasePointer = (pointerId: number): void => {
      if (domElement.hasPointerCapture(pointerId)) {
        domElement.releasePointerCapture(pointerId);
      }
    };

    const handlePointerDown = (event: PointerEvent): void => {
      const controls = controlsRef.current;
      if (!controls || event.button !== 0) {
        return;
      }

      if (isPanModifierPressed(event)) {
        orbitDragRef.current = null;
        panDragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
        };
        domElement.setPointerCapture(event.pointerId);
        handleUserStart();
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      panDragRef.current = null;
      const { phi, theta } = readOrbitAngles(controls, camera as OrthographicCamera);
      orbitDragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startPhi: phi,
        startTheta: theta,
      };
      domElement.setPointerCapture(event.pointerId);
      handleUserStart();
      event.preventDefault();
      event.stopPropagation();
    };

    const handlePointerMove = (event: PointerEvent): void => {
      const controls = controlsRef.current;
      if (!controls) {
        return;
      }

      const panDrag = panDragRef.current;
      if (panDrag && panDrag.pointerId === event.pointerId) {
        const deltaX = event.clientX - panDrag.startX;
        const deltaY = event.clientY - panDrag.startY;
        applyPanDrag(controls, camera as OrthographicCamera, deltaX, deltaY);
        event.preventDefault();
        return;
      }

      const orbitDrag = orbitDragRef.current;
      if (!orbitDrag || orbitDrag.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - orbitDrag.startX;
      const deltaY = event.clientY - orbitDrag.startY;
      applyOrbitAngles(
        controls,
        camera as OrthographicCamera,
        orbitDrag.startTheta - deltaX * CAMERA_HORIZONTAL_DRAG_SENSITIVITY,
        orbitDrag.startPhi - deltaY * CAMERA_VERTICAL_DRAG_SENSITIVITY,
      );
      event.preventDefault();
    };

    const handlePointerUp = (event: PointerEvent): void => {
      const orbitDrag = orbitDragRef.current;
      const panDrag = panDragRef.current;

      if (orbitDrag?.pointerId === event.pointerId) {
        orbitDragRef.current = null;
        releasePointer(event.pointerId);
        handleUserEnd();
      }

      if (panDrag?.pointerId === event.pointerId) {
        panDragRef.current = null;
        releasePointer(event.pointerId);
        handleUserEnd();
      }
    };

    domElement.addEventListener('pointerdown', handlePointerDown, true);
    domElement.addEventListener('pointermove', handlePointerMove, true);
    domElement.addEventListener('pointerup', handlePointerUp, true);
    domElement.addEventListener('pointercancel', handlePointerUp, true);

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown, true);
      domElement.removeEventListener('pointermove', handlePointerMove, true);
      domElement.removeEventListener('pointerup', handlePointerUp, true);
      domElement.removeEventListener('pointercancel', handlePointerUp, true);
    };
  }, [camera, gl]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) {
      return;
    }

    if (!controlsConfiguredRef.current) {
      configureFreecamControls(controls);
      controlsConfiguredRef.current = true;
    }

    const orthoCamera = camera as OrthographicCamera;
    const halfWorld = worldSize / 2;
    const buildings = engine.getState().buildings;

    if (
      cameraCelebration &&
      lastCelebrationTokenRef.current !== cameraCelebration.token &&
      !isUserControllingRef.current
    ) {
      celebrationRef.current = beginCelebration(controls, orthoCamera, cameraCelebration);
      lastCelebrationTokenRef.current = cameraCelebration.token;
    }

    if (!cameraCelebration) {
      celebrationRef.current = null;
      lastCelebrationTokenRef.current = null;
    }

    if (celebrationRef.current && !isUserControllingRef.current) {
      const now = performance.now();
      let celebration = celebrationRef.current;
      let frame = sampleCelebrationFrame(celebration, now);

      if (celebration.phase === 'pan_zoom' && frame.phase === 'orbit') {
        celebration = {
          ...celebration,
          phase: 'orbit',
          phaseStartedAt: now,
          startAzimuth: controls.getAzimuthalAngle(),
        };
        celebrationRef.current = celebration;
        frame = sampleCelebrationFrame(celebration, now);
      }

      controls.target.set(frame.target[0], frame.target[1], frame.target[2]);
      orthoCamera.zoom = frame.zoom;

      offsetVector.copy(orthoCamera.position).sub(controls.target);
      spherical.setFromVector3(offsetVector);
      spherical.theta = frame.azimuth;
      offsetVector.setFromSpherical(spherical);
      orthoCamera.position.copy(controls.target).add(offsetVector);

      const excludeIds = new Set([celebration.buildingId]);
      resolvedPosition.copy(resolveCameraCollision(orthoCamera.position, buildings, excludeIds));
      orthoCamera.position.copy(resolvedPosition);

      orthoCamera.updateProjectionMatrix();
      controls.update();

      if (frame.done) {
        celebrationRef.current = null;
        clearCameraCelebration();
      }
      return;
    }

    controls.target.x = clamp(controls.target.x, -halfWorld, halfWorld);
    controls.target.z = clamp(controls.target.z, -halfWorld, halfWorld);
    controls.target.y = 0;

    orthoCamera.zoom = clamp(orthoCamera.zoom, CAMERA_MIN_ZOOM, CAMERA_MAX_ZOOM);
    orthoCamera.updateProjectionMatrix();

    resolvedPosition.copy(resolveCameraCollision(orthoCamera.position, buildings));
    if (!resolvedPosition.equals(orthoCamera.position)) {
      orthoCamera.position.copy(resolvedPosition);
      controls.update();
    }
  }, 1);

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 0, 0]}
      enablePan={false}
      enableRotate={false}
      enableZoom
      enableDamping
      dampingFactor={CAMERA_DAMPING_FACTOR}
      minPolarAngle={CAMERA_MIN_POLAR_ANGLE}
      maxPolarAngle={CAMERA_MAX_POLAR_ANGLE}
      minZoom={CAMERA_MIN_ZOOM}
      maxZoom={CAMERA_MAX_ZOOM}
      onStart={handleUserStart}
      onEnd={handleUserEnd}
    />
  );
};
