import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Group } from 'three';
import { AdditiveBlending } from 'three';
import { useGameStore } from '../../state/game-store';
import type { ResourceOrb, ResourceOrbResourceType } from '../../state/game-store/types';

type OrbVisual = {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  trailColor: string;
  scale: number;
};

const ORB_VISUAL_BY_TYPE: Record<ResourceOrbResourceType, OrbVisual> = {
  twigs: {
    color: '#8b5a2b',
    emissive: '#7c4b1f',
    emissiveIntensity: 0.58,
    trailColor: '#c69457',
    scale: 0.22,
  },
  pebbles: {
    color: '#d4dae3',
    emissive: '#9aa7b9',
    emissiveIntensity: 0.46,
    trailColor: '#e5e9f0',
    scale: 0.22,
  },
  putty: {
    color: '#a855f7',
    emissive: '#6d28d9',
    emissiveIntensity: 1.15,
    trailColor: '#d8b4fe',
    scale: 0.24,
  },
  goo: {
    color: '#22c55e',
    emissive: '#15803d',
    emissiveIntensity: 1.3,
    trailColor: '#86efac',
    scale: 0.25,
  },
};

const easeInOutCubic = (t: number): number => t * t * (3 - 2 * t);
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const ARC_HOVER_OFFSET = 1.6;
const ARC_PEAK_BOOST = 1.1;
const DROP_PHASE_START = 0.72;
const SINK_DEPTH = 0.18;

type OrbFrame = {
  x: number;
  y: number;
  z: number;
  visible: boolean;
  progress: number;
  phase: 'arc' | 'drop' | 'done';
};

const interpolateOrbPosition = (orb: ResourceOrb, now: number): OrbFrame => {
  const elapsed = now - orb.startedAt - orb.delayMs;
  if (elapsed <= 0) {
    return { x: orb.startX, y: orb.startY, z: orb.startZ, visible: false, progress: 0, phase: 'arc' };
  }
  const rawProgress = Math.min(1, elapsed / orb.durationMs);
  const hoverY = orb.targetY + ARC_HOVER_OFFSET;

  if (rawProgress < DROP_PHASE_START) {
    const localT = rawProgress / DROP_PHASE_START;
    const easedT = easeInOutCubic(localT);
    const x = orb.startX + (orb.targetX - orb.startX) * easedT;
    const z = orb.startZ + (orb.targetZ - orb.startZ) * easedT;
    const baseLine = orb.startY + (hoverY - orb.startY) * easedT;
    const peakHeight = Math.max(orb.startY, hoverY) + ARC_PEAK_BOOST;
    const lift = Math.sin(easedT * Math.PI) * Math.max(0, peakHeight - hoverY);
    return {
      x,
      y: baseLine + lift,
      z,
      visible: true,
      progress: rawProgress,
      phase: 'arc',
    };
  }

  const dropLocalT = (rawProgress - DROP_PHASE_START) / (1 - DROP_PHASE_START);
  const accelT = easeOutCubic(dropLocalT);
  const sinkTargetY = orb.targetY - SINK_DEPTH;
  const droppedY = hoverY + (sinkTargetY - hoverY) * accelT;
  return {
    x: orb.targetX,
    y: droppedY,
    z: orb.targetZ,
    visible: rawProgress < 1.02,
    progress: rawProgress,
    phase: dropLocalT >= 1 ? 'done' : 'drop',
  };
};

type OrbMeshProps = {
  orb: ResourceOrb;
};

const OrbMesh = ({ orb }: OrbMeshProps) => {
  const groupRef = useRef<Group>(null);
  const visual = ORB_VISUAL_BY_TYPE[orb.resourceType];

  useFrame(() => {
    const node = groupRef.current;
    if (!node) {
      return;
    }
    const now = Date.now();
    const frame = interpolateOrbPosition(orb, now);
    node.visible = frame.visible;
    if (!frame.visible) {
      return;
    }
    node.position.set(frame.x, frame.y, frame.z);

    const isDropPhase = frame.phase !== 'arc';
    const arcWobble = 0.85 + 0.25 * Math.sin(frame.progress * Math.PI);
    const orbSize = visual.scale * orb.sizeFactor;
    let scale = orbSize * arcWobble;

    if (isDropPhase) {
      const dropLocalT = Math.min(1, Math.max(0, (frame.progress - DROP_PHASE_START) / (1 - DROP_PHASE_START)));
      const shrinkFactor = 1 - dropLocalT * 0.85;
      scale = orbSize * shrinkFactor;
    }

    node.scale.setScalar(Math.max(0.02, scale));
    node.rotation.y += 0.18;
    node.rotation.x += 0.12;
  });

  return (
    <group ref={groupRef} position={[orb.startX, orb.startY, orb.startZ]} visible={false}>
      <mesh castShadow={false}>
        <sphereGeometry args={[1, 18, 18]} />
        <meshStandardMaterial
          color={visual.color}
          emissive={visual.emissive}
          emissiveIntensity={visual.emissiveIntensity}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>
      <mesh scale={1.6} castShadow={false}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshBasicMaterial color={visual.trailColor} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh scale={2.4} castShadow={false}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color={visual.trailColor} transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <mesh scale={3.1} castShadow={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          color={visual.trailColor}
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

const PRUNE_INTERVAL_MS = 250;

export const ResourceCollectionLayer = () => {
  const resourceOrbs = useGameStore((state) => state.resourceOrbs);
  const pruneExpiredResourceOrbs = useGameStore((state) => state.pruneExpiredResourceOrbs);
  const lastPruneRef = useRef<number>(0);
  const orbList = useMemo(() => resourceOrbs, [resourceOrbs]);

  useFrame(() => {
    const now = Date.now();
    if (now - lastPruneRef.current < PRUNE_INTERVAL_MS) {
      return;
    }
    lastPruneRef.current = now;
    pruneExpiredResourceOrbs();
  });

  useEffect(() => {
    return () => {
      lastPruneRef.current = 0;
    };
  }, []);

  if (orbList.length === 0) {
    return null;
  }

  return (
    <>
      {orbList.map((orb) => (
        <OrbMesh key={orb.id} orb={orb} />
      ))}
    </>
  );
};
