import { PerspectiveCamera } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Color, FogExp2 } from 'three';
import type { PerspectiveCamera as ThreePerspectiveCamera } from 'three';
import { PerfCanvas } from '../../app/perf-canvas';
import { ENHANCED_BUILDING_CATALOG } from '../../core/constants/catalog';
import type { BuildingType } from '../../core/types/building';
import { BuildingPreviewVisual } from '../../render/entities/building-preview-visual';
import { TerrainGround } from '../../render/scene/terrain';
import { CELL_SIZE, GRID_SIZE, getGridWorldSize } from '../../utils/coordinates';

/** Matches game day sky / wrapper while canvas loads. */
export const BUILDING_INFO_PREVIEW_BG = '#86c43e';

const PREVIEW_FOG_COLOR = '#6ea67c';
const PREVIEW_FOG_DENSITY = 0.024;
const PREVIEW_TERRAIN_EXTENT = 18;
const PREVIEW_CAMERA_POLAR = 0.92;

type PreviewableBuildingType = Exclude<BuildingType, 'PREVIEW'>;

const ZOOM_MIN = 0.55;
const ZOOM_MAX = 1.65;
const ZOOM_STEP = 0.12;
const DEFAULT_ZOOM = 1;
const DRAG_ROTATION_SENSITIVITY = 0.012;
const DRAG_START_THRESHOLD_PX = 4;
const TERRAIN_GRID_OPACITY = 0.07;

const PreviewAtmosphere = () => {
  const { scene } = useThree();

  useEffect(() => {
    const fog = new FogExp2(PREVIEW_FOG_COLOR, PREVIEW_FOG_DENSITY);
    scene.fog = fog;
    scene.background = new Color(BUILDING_INFO_PREVIEW_BG);
    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene]);

  return null;
};

type BuildingInfoPreviewSceneProps = {
  type: PreviewableBuildingType;
  level: number;
  zoom: number;
  rotationY: number;
  worldSize: number;
};

const BuildingInfoPreviewScene = ({
  type,
  level,
  zoom,
  rotationY,
  worldSize,
}: BuildingInfoPreviewSceneProps) => {
  const safeLevel = Math.max(1, level);
  const definition = ENHANCED_BUILDING_CATALOG[type];
  const sizeX = definition?.size.x ?? 2;
  const sizeY = definition?.size.y ?? 2;
  const maxSpan = Math.max(sizeX, sizeY) * CELL_SIZE;
  const baseDistance = Math.max(3.6, maxSpan * 1.28);
  const cameraDistance = baseDistance / zoom;
  const heroTargetY = 1.35;
  const cameraRef = useRef<ThreePerspectiveCamera | null>(null);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [invalidate, type, safeLevel, zoom, rotationY]);

  useEffect(() => {
    if (!cameraRef.current) {
      return;
    }
    const horizontal = Math.sin(PREVIEW_CAMERA_POLAR) * cameraDistance;
    const height = Math.cos(PREVIEW_CAMERA_POLAR) * cameraDistance;
    cameraRef.current.position.set(horizontal * 0.85, height, horizontal * 0.85);
    cameraRef.current.lookAt(0, heroTargetY, 0);
    cameraRef.current.updateProjectionMatrix();
    invalidate();
    const timers = [80, 350, 800].map((delay) => globalThis.setTimeout(() => invalidate(), delay));
    return () => timers.forEach((timer) => globalThis.clearTimeout(timer));
  }, [cameraDistance, heroTargetY, invalidate, type, safeLevel, zoom]);

  return (
    <>
      <PreviewAtmosphere />
      <PerspectiveCamera ref={cameraRef} makeDefault fov={26} near={0.1} far={280} />
      <hemisphereLight intensity={0.45} groundColor="#17340f" color="#cdeeb8" />
      <ambientLight intensity={0.22} color="#1a2e15" />
      <directionalLight
        castShadow
        position={[-8, 18, 12]}
        intensity={2.45}
        color="#FFF5D6"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={45}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.001}
      />
      <directionalLight position={[18, 12, 22]} intensity={0.45} color="#8bc5ff" />
      <TerrainGround
        worldSize={worldSize}
        gridOpacity={TERRAIN_GRID_OPACITY}
        extentMultiplier={PREVIEW_TERRAIN_EXTENT}
      />
      <group rotation={[0, rotationY, 0]}>
        <Suspense fallback={null}>
          <BuildingPreviewVisual
            type={type}
            level={safeLevel}
            sizeX={sizeX}
            sizeY={sizeY}
            cellSize={CELL_SIZE}
          />
        </Suspense>
      </group>
      <mesh rotation={[-Math.PI / 2, 0.32, 0]} position={[0.12, 0.014, 0.14]} scale={[1, 0.62, 1]}>
        <circleGeometry args={[0.92, 36]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </>
  );
};

type BuildingInfoPreviewProps = {
  type: PreviewableBuildingType;
  level: number;
  className?: string;
};

export const BuildingInfoPreview = ({ type, level, className }: BuildingInfoPreviewProps) => {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const safeLevel = Math.max(1, level);
  const worldSize = useMemo(() => getGridWorldSize(GRID_SIZE, CELL_SIZE), []);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    lastX: 0,
    hasPassedThreshold: false,
  });

  useEffect(() => {
    setZoom(DEFAULT_ZOOM);
    setRotationY(0);
  }, [type, safeLevel]);

  const handleZoomIn = useCallback((): void => {
    setZoom((current) => Math.min(ZOOM_MAX, Number((current + ZOOM_STEP).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback((): void => {
    setZoom((current) => Math.max(ZOOM_MIN, Number((current - ZOOM_STEP).toFixed(2))));
  }, []);

  const endDrag = useCallback((target: HTMLDivElement, pointerId: number): void => {
    dragStateRef.current.active = false;
    dragStateRef.current.hasPassedThreshold = false;
    setIsDragging(false);
    if (target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      hasPassedThreshold: false,
    };
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragStateRef.current;
    if (!drag.active || event.pointerId !== drag.pointerId) {
      return;
    }
    event.preventDefault();
    const deltaX = event.clientX - drag.lastX;
    drag.lastX = event.clientX;

    if (!drag.hasPassedThreshold) {
      const totalMoved = Math.abs(event.clientX - drag.startX);
      if (totalMoved < DRAG_START_THRESHOLD_PX) {
        return;
      }
      drag.hasPassedThreshold = true;
    }

    if (deltaX === 0) {
      return;
    }

    setRotationY((current) => current + deltaX * DRAG_ROTATION_SENSITIVITY);
  }, []);

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      if (event.pointerId !== dragStateRef.current.pointerId) {
        return;
      }
      endDrag(event.currentTarget, event.pointerId);
    },
    [endDrag],
  );

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      if (event.pointerId !== dragStateRef.current.pointerId) {
        return;
      }
      endDrag(event.currentTarget, event.pointerId);
    },
    [endDrag],
  );

  const handleLostPointerCapture = useCallback((): void => {
    dragStateRef.current.active = false;
    dragStateRef.current.hasPassedThreshold = false;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const element = previewRef.current;
    if (!element) {
      return;
    }
    const handleWheelNative = (event: WheelEvent): void => {
      event.preventDefault();
      if (event.deltaY < 0) {
        setZoom((current) => Math.min(ZOOM_MAX, Number((current + ZOOM_STEP).toFixed(2))));
        return;
      }
      setZoom((current) => Math.max(ZOOM_MIN, Number((current - ZOOM_STEP).toFixed(2))));
    };
    element.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => element.removeEventListener('wheel', handleWheelNative);
  }, []);

  return (
    <div className={className ?? 'w-full'}>
      <div
        ref={previewRef}
        className={`relative h-[min(300px,44vh)] w-full overflow-hidden rounded-lg border border-emerald-900/30 select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ backgroundColor: BUILDING_INFO_PREVIEW_BG, touchAction: 'none' }}
        aria-label="Vista previa 3D. Arrastra en horizontal para girar; rueda o botones para zoom."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handleLostPointerCapture}
      >
        <PerfCanvas
          className="pointer-events-none absolute inset-0 h-full w-full"
          shadows
          dpr={[1, 1.75]}
          frameloop="demand"
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'low-power',
            stencil: false,
            depth: true,
          }}
        >
          <BuildingInfoPreviewScene
            type={type}
            level={safeLevel}
            zoom={zoom}
            rotationY={rotationY}
            worldSize={worldSize}
          />
        </PerfCanvas>
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          tabIndex={0}
          aria-label="Alejar vista del modelo"
          className="ui-button min-w-10 border-amber-800/60 bg-amber-950/50 px-2.5 py-1 text-sm text-amber-50"
          onClick={handleZoomOut}
        >
          −
        </button>
        <span className="min-w-28 text-center text-[10px] text-amber-200/80">Girar ↔ · Zoom</span>
        <button
          type="button"
          tabIndex={0}
          aria-label="Acercar vista del modelo"
          className="ui-button min-w-10 border-amber-800/60 bg-amber-950/50 px-2.5 py-1 text-sm text-amber-50"
          onClick={handleZoomIn}
        >
          +
        </button>
      </div>
    </div>
  );
};
