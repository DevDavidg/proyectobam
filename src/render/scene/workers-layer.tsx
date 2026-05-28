import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Group, Mesh } from 'three';
import { EntityType } from '../../ecs/components/components';
import { useGameStore } from '../../state/game-store';
import type { RenderEntitySnapshot } from '../../ecs/systems/sync-grid-system';
import type { Worker } from '../../state/game-store/types';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';

type WorkerMeshProps = {
  worker: Worker;
  targetBuilding?: RenderEntitySnapshot;
};

const WORKER_LINES = {
  walking: ['Off to work', "I'm on it!", 'On my way', 'In a jiffy'],
  working: ['All in a days work', 'Job done!', 'Lookin good!', 'No problem!'],
  idle: ['All done boss', 'Perfect!', 'Hope you like it', 'That was easy'],
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

const WorkerMesh = ({ worker, targetBuilding }: WorkerMeshProps) => {
  const rootRef = useRef<Group>(null);
  const torsoRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const toolRef = useRef<Mesh>(null);
  const workParticleRefs = useRef<Array<Mesh | null>>([]);
  const animationOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  const previousStateRef = useRef(worker.state);
  const nextAmbientLineAtRef = useRef<number>(Date.now() + 3500 + Math.random() * 3500);
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
    : targetBuilding
      ? Math.atan2(targetBuilding.x + targetBuilding.sizeX / 2 - worker.x, targetBuilding.y + targetBuilding.sizeY / 2 - worker.y)
      : 0;

  const pushSpeech = (line: string, state: Worker['state']): void => {
    if (!line) {
      return;
    }
    const now = Date.now();
    setSpeechLine(line);
    setSpeechExpiresAt(now + 1800);
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
    if (worker.state === 'MOVING_TO_TASK' || worker.state === 'RETURNING') {
      pushSpeech(pickRandomLine(WORKER_LINES.walking), worker.state);
    } else if (worker.state === 'WORKING') {
      pushSpeech(pickRandomLine(WORKER_LINES.working), worker.state);
    } else if (worker.state === 'IDLE') {
      pushSpeech(pickRandomLine(WORKER_LINES.idle), worker.state);
    }
    previousStateRef.current = worker.state;
  }, [worker.state]);

  useFrame((state) => {
    if (
      !rootRef.current ||
      !torsoRef.current ||
      !leftArmRef.current ||
      !rightArmRef.current ||
      !leftLegRef.current ||
      !rightLegRef.current ||
      !toolRef.current
    ) {
      return;
    }

    const nowMs = Date.now();
    if (nowMs > speechExpiresAt && speechLine) {
      setSpeechLine('');
    }
    if (nowMs >= nextAmbientLineAtRef.current && isWorking) {
      pushSpeech(pickRandomLine(WORKER_LINES.working), worker.state);
      nextAmbientLineAtRef.current = nowMs + 6000 + Math.random() * 5000;
    }

    const t = state.clock.elapsedTime + animationOffset;
    if (rootRef.current) {
      const currentHeading = normalizeAngle(rootRef.current.rotation.y);
      const nextHeading = currentHeading + normalizeAngle(desiredHeading - currentHeading) * 0.22;
      rootRef.current.rotation.y = nextHeading;
    }
    if (isMoving) {
      const walkSpeed = isReturning ? 7.4 : 10;
      const legSwing = Math.sin(t * walkSpeed) * (isReturning ? 0.4 : 0.55);
      const armSwing = Math.sin(t * walkSpeed + Math.PI) * (isReturning ? 0.22 : 0.45);
      const bobAmplitude = isReturning ? 0.025 : 0.035;
      const baseHeight = isReturning ? 0.52 : 0.6;
      torsoRef.current.position.y = baseHeight + Math.sin(t * walkSpeed * 2) * bobAmplitude;
      torsoRef.current.rotation.x = isReturning ? 0.28 : 0;
      torsoRef.current.rotation.z = Math.sin(t * walkSpeed) * (isReturning ? 0.1 : 0.06);
      leftLegRef.current.rotation.x = legSwing;
      rightLegRef.current.rotation.x = -legSwing;
      leftArmRef.current.rotation.x = -armSwing + (isReturning ? 0.55 : 0);
      rightArmRef.current.rotation.x = armSwing + (isReturning ? 0.55 : 0);
      toolRef.current.rotation.z = Math.sin(t * walkSpeed) * (isReturning ? 0.05 : 0.25);
      return;
    }

    if (isWorking) {
      const hammerSwing = Math.sin(t * 7) * 0.9;
      torsoRef.current.position.y = 0.58 + Math.sin(t * 7) * 0.015;
      torsoRef.current.rotation.x = 0.18;
      leftLegRef.current.rotation.x = 0.1;
      rightLegRef.current.rotation.x = -0.1;
      leftArmRef.current.rotation.x = 0.2;
      rightArmRef.current.rotation.x = -1.1 + hammerSwing;
      toolRef.current.rotation.z = -0.2 + Math.sin(t * 14) * 0.45;
      torsoRef.current.rotation.z = Math.sin(t * 7) * 0.04;
      workParticleRefs.current.forEach((particle, index) => {
        if (!particle) {
          return;
        }
        const phase = t * 4 + index * 1.2;
        const lateral = Math.sin(phase) * 0.08;
        const forward = 0.22 + Math.abs(Math.cos(phase * 1.35)) * 0.15;
        particle.visible = true;
        particle.position.set(lateral, 0.14 + Math.abs(Math.sin(phase * 1.4)) * 0.32, forward);
        const scale = 0.04 + Math.abs(Math.sin(phase * 2)) * 0.03;
        particle.scale.setScalar(scale);
      });
      return;
    }

    torsoRef.current.position.y = 0.6 + Math.sin(t * 2.5) * 0.02;
    torsoRef.current.rotation.x = 0;
    torsoRef.current.rotation.z = 0;
    leftLegRef.current.rotation.x = 0;
    rightLegRef.current.rotation.x = 0;
    leftArmRef.current.rotation.x = Math.sin(t * 2.2) * 0.08;
    rightArmRef.current.rotation.x = -Math.sin(t * 2.2) * 0.08;
    toolRef.current.rotation.z = 0;
    workParticleRefs.current.forEach((particle) => {
      if (!particle) {
        return;
      }
      particle.visible = false;
    });
  });

  return (
    <group ref={rootRef} position={[worldX, 0, worldZ]}>
      <group ref={torsoRef} position={[0, 0.6, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
          <capsuleGeometry args={[0.17, 0.25, 6, 12]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.45} metalness={0.08} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.58, 0]}>
          <sphereGeometry args={[0.17, 16, 16]} />
          <meshStandardMaterial color="#60a5fa" roughness={0.4} metalness={0.05} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.06, 0.6, 0.15]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color="#e5e7eb" emissive="#1d4ed8" emissiveIntensity={0.5} />
        </mesh>
        <mesh castShadow receiveShadow position={[-0.06, 0.6, 0.15]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color="#e5e7eb" emissive="#1d4ed8" emissiveIntensity={0.5} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.25, -0.14]}>
          <boxGeometry args={[0.2, 0.2, 0.1]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
        </mesh>
        {isReturning ? (
          <group position={[0, 0.85, -0.02]}>
            <mesh castShadow receiveShadow rotation={[0.4, 0.18, 0.12]}>
              <boxGeometry args={[0.32, 0.18, 0.22]} />
              <meshStandardMaterial color="#8a5a2c" roughness={0.85} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, 0.13, 0]} rotation={[0.4, 0.18, 0.12]}>
              <boxGeometry args={[0.36, 0.04, 0.26]} />
              <meshStandardMaterial color="#5b3a1a" roughness={0.85} />
            </mesh>
            <mesh castShadow receiveShadow position={[-0.06, 0.18, 0.08]} rotation={[0.6, -0.2, 0.5]}>
              <cylinderGeometry args={[0.018, 0.018, 0.34, 6]} />
              <meshStandardMaterial color="#caa15a" roughness={0.5} />
            </mesh>
            <mesh castShadow receiveShadow position={[0.08, 0.2, -0.04]} rotation={[0.3, 0.4, -0.2]}>
              <cylinderGeometry args={[0.018, 0.018, 0.3, 6]} />
              <meshStandardMaterial color="#a3804a" roughness={0.55} />
            </mesh>
          </group>
        ) : null}
      </group>

      <group ref={leftArmRef} position={[-0.2, 0.78, 0]}>
        <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.06, 0.22, 4, 8]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.45} />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.2, 0.78, 0]}>
        <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.06, 0.22, 4, 8]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.45} />
        </mesh>
        <mesh ref={toolRef} castShadow receiveShadow position={[0.03, -0.4, 0.08]}>
          <boxGeometry args={[0.06, 0.32, 0.06]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.72} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.03, -0.57, 0.08]}>
          <boxGeometry args={[0.18, 0.08, 0.14]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.55} roughness={0.3} />
        </mesh>
      </group>

      <group ref={leftLegRef} position={[-0.09, 0.34, 0]}>
        <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.07, 0.26, 4, 8]} />
          <meshStandardMaterial color="#1e40af" roughness={0.5} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.09, 0.34, 0]}>
        <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.07, 0.26, 4, 8]} />
          <meshStandardMaterial color="#1e40af" roughness={0.5} />
        </mesh>
      </group>

      <mesh receiveShadow position={[0, 0.02, 0]}>
        <circleGeometry args={[0.25, 16]} />
        <meshBasicMaterial color="#1f2937" transparent opacity={0.22} />
      </mesh>
      {speechLine ? (
        <Html position={[0, 1.28, 0]} center>
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
      <group position={[0, 0.08, 0]}>
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
        <WorkerMesh key={worker.id} worker={worker} targetBuilding={worker.assignedBuildingId ? targetBuildingById.get(worker.assignedBuildingId) : undefined} />
      ))}
    </>
  );
};
