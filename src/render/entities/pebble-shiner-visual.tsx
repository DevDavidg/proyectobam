import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { ReactElement } from 'react';
import type { Group } from 'three';
import type { BuildingStatus } from '../../core/types/building';

type MaterialToken = 'gold' | 'iron' | 'wood' | 'goo' | 'stone';

type PebbleShinerVisualProps = {
  level: number;
  footprintX: number;
  footprintZ: number;
  status?: BuildingStatus;
  hp?: number;
  maxHp?: number;
  createMaterial: (fallbackColor: string, token: MaterialToken) => ReactElement;
};

type PebbleTier = 'L1_2' | 'L3_5' | 'L6_9' | 'L10';
type PebbleState = 'in-action' | 'normal' | 'damaged' | 'destroyed';

const resolveTier = (level: number): PebbleTier => {
  if (level >= 10) return 'L10';
  if (level >= 6) return 'L6_9';
  if (level >= 3) return 'L3_5';
  return 'L1_2';
};

const resolveState = (status?: BuildingStatus, hp?: number, maxHp?: number): PebbleState => {
  const ratio = maxHp && maxHp > 0 ? (hp ?? maxHp) / maxHp : 1;
  if (ratio <= 0.12) return 'destroyed';
  if (ratio < 0.55) return 'damaged';
  if (status === 'ACTIVE') return 'in-action';
  return 'normal';
};

export const PebbleShinerVisual = ({
  level,
  footprintX,
  footprintZ,
  status,
  hp,
  maxHp,
  createMaterial,
}: PebbleShinerVisualProps) => {
  const topRigRef = useRef<Group | null>(null);
  const rubbleRef = useRef<Group | null>(null);
  const tier = resolveTier(level);
  const visualState = resolveState(status, hp, maxHp);
  const baseRadius = Math.max(0.42, Math.min(0.64, Math.min(footprintX, footprintZ) * 0.28));

  const tierSpecs = useMemo(() => {
    if (tier === 'L10') {
      return { beltCount: 4, towerHeight: 1.2, pipeCount: 3, roofScale: 1.08 };
    }
    if (tier === 'L6_9') {
      return { beltCount: 3, towerHeight: 1.02, pipeCount: 2, roofScale: 1.02 };
    }
    if (tier === 'L3_5') {
      return { beltCount: 2, towerHeight: 0.86, pipeCount: 1, roofScale: 0.96 };
    }
    return { beltCount: 1, towerHeight: 0.7, pipeCount: 1, roofScale: 0.9 };
  }, [tier]);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    if (topRigRef.current) {
      const spinSpeed = visualState === 'in-action' ? 0.9 : 0.15;
      topRigRef.current.rotation.y += delta * spinSpeed;
      if (visualState === 'damaged') {
        topRigRef.current.rotation.z = Math.sin(elapsed * 3.6) * 0.04;
      }
    }
    if (rubbleRef.current) {
      const wobble = visualState === 'in-action' ? 0.03 : 0.01;
      rubbleRef.current.position.y = Math.sin(elapsed * 2.4) * wobble;
    }
  });

  if (visualState === 'destroyed') {
    return (
      <group rotation={[0.18, 0.2, -0.35]} position={[0, 0.04, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
          <sphereGeometry args={[baseRadius + 0.2, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          {createMaterial('#8f9baa', 'stone')}
        </mesh>
        <mesh castShadow receiveShadow position={[0.16, 0.22, -0.1]} rotation={[0.24, 0, 0.2]}>
          <coneGeometry args={[0.36, 0.32, 5]} />
          {createMaterial('#c7a178', 'wood')}
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.24, 0]}>
        <cylinderGeometry args={[baseRadius + 0.2, baseRadius + 0.24, 0.3, 14]} />
        {createMaterial('#6e7786', 'stone')}
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.56, 0]}>
        <cylinderGeometry args={[baseRadius + 0.1, baseRadius + 0.16, tierSpecs.towerHeight, 16]} />
        {createMaterial('#9ca6b5', 'stone')}
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.62 + tierSpecs.towerHeight * 0.5, 0]}>
        <coneGeometry args={[baseRadius * tierSpecs.roofScale, 0.5, 6]} />
        {createMaterial('#c8a17a', 'wood')}
      </mesh>

      {Array.from({ length: tierSpecs.beltCount }).map((_, index) => (
        <mesh key={`pebble-belt-${index}`} castShadow receiveShadow position={[0, 0.42 + index * 0.2, 0]}>
          <torusGeometry args={[baseRadius + 0.14 + index * 0.03, 0.04, 8, 18]} />
          {createMaterial('#aab3c0', 'stone')}
        </mesh>
      ))}

      <group ref={topRigRef} position={[0, 0.84 + tierSpecs.towerHeight * 0.5, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.07, 0.09, 0.32, 10]} />
          {createMaterial('#7e8ea2', 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          {createMaterial('#ccd3dc', 'iron')}
        </mesh>
      </group>

      {Array.from({ length: tierSpecs.pipeCount }).map((_, index, arr) => {
        const angle = (Math.PI * 2 * index) / arr.length;
        const x = Math.cos(angle) * (baseRadius + 0.25);
        const z = Math.sin(angle) * (baseRadius + 0.25);
        return (
          <group key={`pebble-pipe-${index}`} position={[x, 0.52, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.04, 0.05, 0.42, 8]} />
              {createMaterial('#8b97a8', 'stone')}
            </mesh>
            <mesh castShadow receiveShadow position={[0.14, 0.14, 0]}>
              <torusGeometry args={[0.12, 0.03, 8, 14, Math.PI * 0.75]} />
              {createMaterial('#a3adbb', 'stone')}
            </mesh>
          </group>
        );
      })}

      {tier === 'L10' ? (
        <group position={[0.24, 1.22, -0.08]}>
          <mesh castShadow receiveShadow>
            <torusGeometry args={[0.15, 0.04, 8, 16]} />
            {createMaterial('#6b7280', 'iron')}
          </mesh>
          <mesh castShadow receiveShadow position={[0.18, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.2, 0.06, 0.14]} />
            {createMaterial('#535d6d', 'iron')}
          </mesh>
        </group>
      ) : null}

      <group ref={rubbleRef}>
        {Array.from({ length: visualState === 'damaged' ? 10 : 6 }).map((_, index) => {
          const angle = (Math.PI * 2 * index) / (visualState === 'damaged' ? 10 : 6);
          const radius = baseRadius + (visualState === 'damaged' ? 0.32 : 0.24);
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          return (
            <mesh key={`pebble-rubble-${index}`} castShadow receiveShadow position={[x, 0.06, z]} rotation={[0.1, angle, 0.2]}>
              <boxGeometry args={[0.08, 0.06, 0.07]} />
              {createMaterial('#bec6cf', 'stone')}
            </mesh>
          );
        })}
      </group>

      {visualState === 'damaged' ? (
        <group rotation={[0.08, 0, -0.1]}>
          <mesh castShadow receiveShadow position={[-0.2, 0.76, 0.08]} rotation={[0.25, 0.6, 0]}>
            <boxGeometry args={[0.22, 0.1, 0.14]} />
            {createMaterial('#5f6672', 'iron')}
          </mesh>
          <mesh castShadow receiveShadow position={[0.18, 0.94, -0.2]} rotation={[0.12, 0.2, 0.45]}>
            <coneGeometry args={[0.09, 0.16, 5]} />
            {createMaterial('#c59b74', 'wood')}
          </mesh>
        </group>
      ) : null}
    </group>
  );
};
