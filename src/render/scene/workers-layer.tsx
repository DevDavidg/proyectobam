import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Group, Mesh } from 'three';
import { EntityType } from '../../ecs/components/components';
import { useGameStore } from '../../state/game-store';
import type { RenderEntitySnapshot } from '../../ecs/systems/sync-grid-system';
import type { Worker } from '../../state/game-store/types';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';
import { computeTownHallDoorWorld } from '../entities/town-hall-visual/world-anchors';
import {
  applyWalkPose,
  applyWorkingPose,
  hideWorkParticles,
  stepFractionTowards,
  type WorkerAnimRefs,
} from './worker-animation';

type DoorWorldPosition = {
  x: number;
  z: number;
};

type WorkerMeshProps = {
  worker: Worker;
  targetBuilding?: RenderEntitySnapshot;
  doorWorldPosition: DoorWorldPosition | null;
};

const EMERGE_DURATION_MS = 1100;
const ENTER_DURATION_MS = 1100;
const DOOR_INSIDE_DEPTH = 0.7;
const DOOR_OUTSIDE_OFFSET = 0.12;
const EMERGE_SCALE_END = 0.18;
const EMERGE_THROUGH_DOOR_END = 0.62;
const ENTER_THROUGH_DOOR_START = 0.45;
const ENTER_SCALE_START = 0.84;

const easeInOutCubic = (t: number): number => t * t * (3 - 2 * t);
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

type TransitionState = {
  type: 'emerging' | 'entering';
  startedAt: number;
};

const SPEECH_DURATION_MS = 2200;
const MAX_SPEECH_LINES_PER_TASK = 2;
const AMBIENT_SPEECH_INTERVAL_MS = 14000;

const WORKER_LINES = {
  walking: ['?Voy!', '?Ya voy!', 'En camino', '?A trabajar!'],
  working: ['?Toma!', '?Aqu? vamos!', '?Trabajando!', '?Casi listo!'],
  idle: ['?Listo jefe!', '?Terminado!', '?Hecho!', '?F?cil!'],
} as const;

let workerAudioContext: AudioContext | null = null;

const getWorkerAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined' || !window.AudioContext) {
    return null;
  }
  if (!workerAudioContext) {
    workerAudioContext = new window.AudioContext();
  }
  return workerAudioContext;
};

const unlockWorkerAudio = (): void => {
  const context = getWorkerAudioContext();
  if (!context || context.state === 'running') {
    return;
  }
  void context.resume();
};

const playWorkerSfx = (state: Worker['state']): void => {
  const context = getWorkerAudioContext();
  if (!context || context.state !== 'running') {
    return;
  }
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const baseFrequency = state === 'WORKING' ? 340 : state === 'MOVING_TO_TASK' ? 520 : 460;
  const endFrequency = state === 'WORKING' ? 260 : 680;
  oscillator.type = state === 'WORKING' ? 'square' : 'triangle';
  oscillator.frequency.setValueAtTime(baseFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + 0.12);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.13);
};

const pickRandomLine = (lines: readonly string[]): string => lines[Math.floor(Math.random() * lines.length)] ?? lines[0] ?? '';

const normalizeAngle = (angle: number): number => {
  let normalized = angle;
  while (normalized > Math.PI) {
    normalized -= Math.PI * 2;
  }
  while (normalized < -Math.PI) {
    normalized += Math.PI * 2;
  }
  return normalized;
};

const WorkerMesh = ({ worker, targetBuilding, doorWorldPosition }: WorkerMeshProps) => {
  const rootRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const leftEyeRef = useRef<Group>(null);
  const rightEyeRef = useRef<Group>(null);
  const mouthRef = useRef<Mesh>(null);
  const hammerRef = useRef<Group>(null);
  const workParticleRefs = useRef<Array<Mesh | null>>([]);
  const animationOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  const previousStateRef = useRef(worker.state);
  const transitionRef = useRef<TransitionState | null>(null);
  const renderPositionRef = useRef<{ x: number; z: number } | null>(null);
  const lastRenderPositionRef = useRef<{ x: number; z: number } | null>(null);
  const renderHeadingRef = useRef<number | null>(null);
  const walkPhaseRef = useRef<number>(0);
  const walkWeightRef = useRef<number>(0);
  const workWeightRef = useRef<number>(0);
  const renderSpeedRef = useRef<number>(0);
  const nextAmbientLineAtRef = useRef<number>(Date.now() + 8000 + Math.random() * 4000);
  const speechCountRef = useRef<number>(0);
  const lastSfxAtRef = useRef<number>(0);
  const [speechLine, setSpeechLine] = useState<string>('');
  const [speechExpiresAt, setSpeechExpiresAt] = useState<number>(0);

  const [worldX, , worldZ] = gridToWorldCenter(worker.x, worker.y, 1, 1, GRID_SIZE, CELL_SIZE);
  const nextWaypoint = worker.path[0];
  const isMoving = worker.state === 'MOVING_TO_TASK' || worker.state === 'RETURNING';
  const isReturning = worker.state === 'RETURNING';
  const isWorking = worker.state === 'WORKING';
  const [targetWorldX, , targetWorldZ] = targetBuilding
    ? gridToWorldCenter(targetBuilding.x, targetBuilding.y, targetBuilding.sizeX, targetBuilding.sizeY, GRID_SIZE, CELL_SIZE)
    : [worldX, 0, worldZ];
  const desiredHeading = nextWaypoint
    ? Math.atan2(nextWaypoint.x - worker.x, nextWaypoint.y - worker.y)
    : isWorking && typeof worker.taskTargetX === 'number'
      ? Math.atan2(
          (targetBuilding ? targetBuilding.x + targetBuilding.sizeX / 2 : worker.taskTargetX) - worker.x,
          (targetBuilding ? targetBuilding.y + targetBuilding.sizeY / 2 : worker.taskTargetY ?? worker.y) - worker.y,
        )
      : targetBuilding
        ? Math.atan2(targetBuilding.x + targetBuilding.sizeX / 2 - worker.x, targetBuilding.y + targetBuilding.sizeY / 2 - worker.y)
        : 0;

  const clearSpeech = (): void => {
    setSpeechLine('');
    setSpeechExpiresAt(0);
  };

  const pushSpeech = (line: string, state: Worker['state']): void => {
    if (!line || speechCountRef.current >= MAX_SPEECH_LINES_PER_TASK) {
      return;
    }
    const now = Date.now();
    setSpeechLine(line);
    setSpeechExpiresAt(now + SPEECH_DURATION_MS);
    speechCountRef.current += 1;
    if (now - lastSfxAtRef.current < 260) {
      return;
    }
    lastSfxAtRef.current = now;
    playWorkerSfx(state);
  };

  useEffect(() => {
    const previous = previousStateRef.current;
    if (previous === worker.state) {
      return;
    }
    if (previous === 'IDLE' && worker.state === 'MOVING_TO_TASK') {
      transitionRef.current = { type: 'emerging', startedAt: performance.now() };
      speechCountRef.current = 0;
      nextAmbientLineAtRef.current = Date.now() + 8000;
    } else if (worker.state === 'IDLE' && previous !== 'IDLE') {
      transitionRef.current = { type: 'entering', startedAt: performance.now() };
    }
    if (worker.state === 'RETURNING' || worker.state === 'IDLE') {
      clearSpeech();
      speechCountRef.current = 0;
    } else if (worker.state === 'MOVING_TO_TASK') {
      pushSpeech(pickRandomLine(WORKER_LINES.walking), worker.state);
    } else if (worker.state === 'WORKING') {
      pushSpeech(pickRandomLine(WORKER_LINES.working), worker.state);
    }
    previousStateRef.current = worker.state;
  }, [worker.state]);

  useFrame((state, rawDelta) => {
    if (!rootRef.current) {
      return;
    }

    const dt = Math.max(0, Math.min(0.05, rawDelta));
    const transition = transitionRef.current;
    const door = doorWorldPosition;
    const performanceNow = performance.now();

    let targetX = worldX;
    let targetZ = worldZ;
    let snapPosition = false;
    let visibleNow = true;
    let scaleNow = 1;

    if (transition && door) {
      const elapsed = performanceNow - transition.startedAt;
      const duration = transition.type === 'emerging' ? EMERGE_DURATION_MS : ENTER_DURATION_MS;
      const insideX = door.x;
      const insideZ = door.z - DOOR_INSIDE_DEPTH;
      const outsideX = door.x;
      const outsideZ = door.z + DOOR_OUTSIDE_OFFSET;

      if (elapsed >= duration) {
        transitionRef.current = null;
        if (transition.type === 'entering') {
          visibleNow = false;
          scaleNow = 0.0001;
          targetX = insideX;
          targetZ = insideZ;
          snapPosition = true;
        } else {
          targetX = worldX;
          targetZ = worldZ;
          snapPosition = true;
        }
      } else {
        const progress = elapsed / duration;
        if (transition.type === 'emerging') {
          if (progress < EMERGE_SCALE_END) {
            const localT = easeOutCubic(progress / EMERGE_SCALE_END);
            scaleNow = localT;
            targetX = insideX;
            targetZ = insideZ;
          } else if (progress < EMERGE_THROUGH_DOOR_END) {
            const localT = easeInOutCubic(
              (progress - EMERGE_SCALE_END) / (EMERGE_THROUGH_DOOR_END - EMERGE_SCALE_END),
            );
            scaleNow = 1;
            targetX = insideX + (outsideX - insideX) * localT;
            targetZ = insideZ + (outsideZ - insideZ) * localT;
          } else {
            const localT = easeInOutCubic(
              (progress - EMERGE_THROUGH_DOOR_END) / (1 - EMERGE_THROUGH_DOOR_END),
            );
            scaleNow = 1;
            targetX = outsideX + (worldX - outsideX) * localT;
            targetZ = outsideZ + (worldZ - outsideZ) * localT;
          }
        } else if (progress < ENTER_THROUGH_DOOR_START) {
          const localT = easeInOutCubic(progress / ENTER_THROUGH_DOOR_START);
          scaleNow = 1;
          targetX = worldX + (outsideX - worldX) * localT;
          targetZ = worldZ + (outsideZ - worldZ) * localT;
        } else if (progress < ENTER_SCALE_START) {
          const localT = easeInOutCubic(
            (progress - ENTER_THROUGH_DOOR_START) / (ENTER_SCALE_START - ENTER_THROUGH_DOOR_START),
          );
          scaleNow = 1;
          targetX = outsideX + (insideX - outsideX) * localT;
          targetZ = outsideZ + (insideZ - outsideZ) * localT;
        } else {
          const localT = easeInOutCubic((progress - ENTER_SCALE_START) / (1 - ENTER_SCALE_START));
          scaleNow = Math.max(0.0001, 1 - localT);
          targetX = insideX;
          targetZ = insideZ;
        }
        snapPosition = true;
      }
    } else if (worker.state === 'IDLE') {
      visibleNow = false;
    }

    if (!visibleNow) {
      rootRef.current.visible = false;
      rootRef.current.scale.setScalar(scaleNow);
      renderPositionRef.current = null;
      lastRenderPositionRef.current = null;
      renderHeadingRef.current = null;
      walkWeightRef.current = 0;
      workWeightRef.current = 0;
      renderSpeedRef.current = 0;
      walkPhaseRef.current = 0;
      hideWorkParticles(workParticleRefs.current);
      return;
    }

    rootRef.current.visible = true;
    rootRef.current.scale.setScalar(scaleNow);

    const previousRender = renderPositionRef.current;
    let renderX: number;
    let renderZ: number;
    if (snapPosition || !previousRender) {
      renderX = targetX;
      renderZ = targetZ;
    } else {
      const positionLerp = stepFractionTowards(dt, 14);
      renderX = previousRender.x + (targetX - previousRender.x) * positionLerp;
      renderZ = previousRender.z + (targetZ - previousRender.z) * positionLerp;
    }
    renderPositionRef.current = { x: renderX, z: renderZ };
    rootRef.current.position.set(renderX, 0, renderZ);

    const lastRender = lastRenderPositionRef.current;
    let frameSpeed = renderSpeedRef.current;
    if (lastRender && dt > 0) {
      const dx = renderX - lastRender.x;
      const dz = renderZ - lastRender.z;
      const instSpeed = Math.hypot(dx, dz) / dt;
      const speedLerp = stepFractionTowards(dt, 8);
      frameSpeed = frameSpeed + (instSpeed - frameSpeed) * speedLerp;
    }
    renderSpeedRef.current = frameSpeed;
    lastRenderPositionRef.current = { x: renderX, z: renderZ };

    const wantsWalk = !isWorking && frameSpeed > 0.45;
    const targetWalkWeight = wantsWalk ? 1 : 0;
    walkWeightRef.current += (targetWalkWeight - walkWeightRef.current) * stepFractionTowards(dt, 7);
    const walkWeight = walkWeightRef.current;

    const targetWorkWeight = isWorking ? 1 : 0;
    workWeightRef.current += (targetWorkWeight - workWeightRef.current) * stepFractionTowards(dt, 7);
    const workWeight = workWeightRef.current;

    const minWalkPhaseSpeed = 2.4;
    const maxWalkPhaseSpeed = 11;
    const speedDrivenPhase = Math.min(
      maxWalkPhaseSpeed,
      Math.max(minWalkPhaseSpeed, frameSpeed * 3.0),
    );
    const phaseSpeed = walkWeight > 0.05 ? speedDrivenPhase : minWalkPhaseSpeed * 0.25;
    walkPhaseRef.current = (walkPhaseRef.current + phaseSpeed * dt) % (Math.PI * 2);

    let effectiveHeading = desiredHeading;
    if (transition && door) {
      const refX = renderX;
      const refZ = renderZ;
      if (transition.type === 'entering') {
        const targetHeadingX = door.x - refX;
        const targetHeadingZ = door.z - DOOR_INSIDE_DEPTH - refZ;
        if (Math.hypot(targetHeadingX, targetHeadingZ) > 0.05) {
          effectiveHeading = Math.atan2(targetHeadingX, targetHeadingZ);
        }
      } else if (transition.type === 'emerging') {
        const elapsed = performanceNow - transition.startedAt;
        const progress = elapsed / EMERGE_DURATION_MS;
        if (progress < EMERGE_THROUGH_DOOR_END) {
          const targetHeadingX = door.x - refX;
          const targetHeadingZ = door.z + DOOR_OUTSIDE_OFFSET - refZ;
          if (Math.hypot(targetHeadingX, targetHeadingZ) > 0.05) {
            effectiveHeading = Math.atan2(targetHeadingX, targetHeadingZ);
          }
        }
      }
    }

    const previousHeading = renderHeadingRef.current ?? effectiveHeading;
    const angDelta = normalizeAngle(effectiveHeading - previousHeading);
    const headingLerp = stepFractionTowards(dt, 9);
    const nextHeading = previousHeading + angDelta * headingLerp;
    renderHeadingRef.current = nextHeading;
    rootRef.current.rotation.y = nextHeading;

    if (
      !bodyRef.current ||
      !leftEyeRef.current ||
      !rightEyeRef.current ||
      !mouthRef.current ||
      !hammerRef.current
    ) {
      return;
    }

    const nowMs = Date.now();
    if (nowMs > speechExpiresAt && speechLine) {
      clearSpeech();
    }
    if (
      isWorking &&
      !speechLine &&
      speechCountRef.current < MAX_SPEECH_LINES_PER_TASK &&
      nowMs >= nextAmbientLineAtRef.current
    ) {
      pushSpeech(pickRandomLine(WORKER_LINES.working), worker.state);
      nextAmbientLineAtRef.current = nowMs + AMBIENT_SPEECH_INTERVAL_MS;
    }

    const ambientTime = state.clock.elapsedTime + animationOffset;
    const animRefs: WorkerAnimRefs = {
      body: bodyRef.current,
      leftEye: leftEyeRef.current,
      rightEye: rightEyeRef.current,
      mouth: mouthRef.current,
      hammer: hammerRef.current,
    };

    if (workWeight > 0.01) {
      applyWorkingPose(
        animRefs,
        { time: ambientTime, weight: workWeight, taskType: worker.taskType },
        workParticleRefs.current,
      );
    } else {
      applyWalkPose(animRefs, {
        phase: walkPhaseRef.current,
        weight: walkWeight,
        isReturning,
        speed: frameSpeed,
        ambientTime,
      });
      hideWorkParticles(workParticleRefs.current);
    }
  });

  return (
    <group ref={rootRef} position={[worldX, 0, worldZ]} visible={worker.state !== 'IDLE'}>
      <group ref={bodyRef} position={[0, 0.34, 0]}>
        <mesh receiveShadow>
          <sphereGeometry args={[0.28, 24, 24]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.38} metalness={0.06} />
        </mesh>

        <group ref={leftEyeRef} position={[-0.12, 0.1, 0.22]}>
          <mesh receiveShadow>
            <sphereGeometry args={[0.11, 14, 14]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.25} />
          </mesh>
          <mesh receiveShadow position={[0, 0, 0.07]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
          <mesh position={[0.025, 0.025, 0.1]}>
            <sphereGeometry args={[0.014, 6, 6]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
        </group>

        <group ref={rightEyeRef} position={[0.12, 0.1, 0.22]}>
          <mesh receiveShadow>
            <sphereGeometry args={[0.11, 14, 14]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.25} />
          </mesh>
          <mesh receiveShadow position={[0, 0, 0.07]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
          <mesh position={[0.025, 0.025, 0.1]}>
            <sphereGeometry args={[0.014, 6, 6]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
        </group>

        <mesh ref={mouthRef} position={[0, -0.05, 0.24]}>
          <boxGeometry args={[0.14, 0.05, 0.03]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
        </mesh>

        <group ref={hammerRef} position={[0.18, -0.04, 0.12]}>
          <mesh receiveShadow position={[0, -0.14, 0]}>
            <boxGeometry args={[0.05, 0.28, 0.05]} />
            <meshStandardMaterial color="#8b5a2b" roughness={0.72} />
          </mesh>
          <mesh receiveShadow position={[0, -0.3, 0]}>
            <boxGeometry args={[0.16, 0.07, 0.1]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.55} roughness={0.3} />
          </mesh>
        </group>

        {isReturning ? (
          <group position={[0, 0.2, -0.08]}>
            <mesh receiveShadow rotation={[0.3, 0.2, 0.1]}>
              <boxGeometry args={[0.28, 0.16, 0.2]} />
              <meshStandardMaterial color="#8a5a2c" roughness={0.85} />
            </mesh>
            <mesh receiveShadow position={[0, 0.11, 0]} rotation={[0.3, 0.2, 0.1]}>
              <boxGeometry args={[0.32, 0.04, 0.24]} />
              <meshStandardMaterial color="#5b3a1a" roughness={0.85} />
            </mesh>
          </group>
        ) : null}
      </group>

      <mesh receiveShadow position={[0, 0.02, 0]}>
        <circleGeometry args={[0.22, 16]} />
        <meshBasicMaterial color="#1f2937" transparent opacity={0.22} />
      </mesh>
      {speechLine ? (
        <Html position={[0, 0.95, 0]} center>
          <div className="pointer-events-none rounded-md border border-amber-300/70 bg-amber-50/95 px-2 py-1 text-[10px] font-bold text-amber-900 shadow-md">
            {speechLine}
          </div>
        </Html>
      ) : null}
      {targetBuilding && (isWorking || worker.state === 'MOVING_TO_TASK') ? (
        <mesh position={[targetWorldX - worldX, 0.03, targetWorldZ - worldZ]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.16, 0.32, 20]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} />
        </mesh>
      ) : null}
      <group position={[0, 0.08, 0.34]}>
        {Array.from({ length: 6 }).map((_, index) => (
          <mesh
            key={`${worker.id}-dust-${index}`}
            ref={(node) => (workParticleRefs.current[index] = node)}
            visible={false}
            castShadow={false}
            receiveShadow={false}
          >
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? '#facc15' : '#fbbf24'}
              emissive="#fff7c2"
              emissiveIntensity={0.65}
              transparent
              opacity={0.92}
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const WorkersLayer = () => {
  const workers = useGameStore((state) => state.workers);
  const entities = useGameStore((state) => state.entities);
  const targetBuildingById = useMemo(
    () =>
      new Map(
        entities
          .filter((entity) => entity.sourceId && entity.kind !== EntityType.ENEMY && entity.kind !== EntityType.PREVIEW)
          .map((entity) => [entity.sourceId as string, entity])
      ),
    [entities]
  );

  const doorWorldPosition = useMemo<DoorWorldPosition | null>(() => {
    const townHall = entities.find(
      (entity) => entity.kind === EntityType.TOWN_HALL && entity.status !== 'DESTROYED'
    );
    if (!townHall) {
      return null;
    }
    const anchor = computeTownHallDoorWorld(townHall);
    return { x: anchor.x, z: anchor.z };
  }, [entities]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleUnlockAudio = () => {
      unlockWorkerAudio();
      window.removeEventListener('pointerdown', handleUnlockAudio);
      window.removeEventListener('keydown', handleUnlockAudio);
    };
    window.addEventListener('pointerdown', handleUnlockAudio);
    window.addEventListener('keydown', handleUnlockAudio);
    return () => {
      window.removeEventListener('pointerdown', handleUnlockAudio);
      window.removeEventListener('keydown', handleUnlockAudio);
    };
  }, []);

  return (
    <>
      {workers.map((worker) => (
        <WorkerMesh
          key={worker.id}
          worker={worker}
          targetBuilding={worker.assignedBuildingId ? targetBuildingById.get(worker.assignedBuildingId) : undefined}
          doorWorldPosition={doorWorldPosition}
        />
      ))}
    </>
  );
};
