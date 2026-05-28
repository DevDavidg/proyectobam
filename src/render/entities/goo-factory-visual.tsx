import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { ReactElement } from 'react';
import type { Group } from 'three';
import type { BuildingStatus } from '../../core/types/building';

type MaterialToken = 'gold' | 'iron' | 'wood' | 'goo' | 'stone';

type GooFactoryVisualProps = {
  level: number;
  footprintX: number;
  footprintZ: number;
  status?: BuildingStatus;
  hp?: number;
  maxHp?: number;
  createMaterial: (fallbackColor: string, token: MaterialToken) => ReactElement;
};

type GooFactoryTier = 'L1_2' | 'L3_5' | 'L6_9' | 'L10';
type GooFactoryState = 'in-action' | 'normal' | 'damaged' | 'destroyed';

const resolveTier = (level: number): GooFactoryTier => {
  if (level >= 10) {
    return 'L10';
  }
  if (level >= 6) {
    return 'L6_9';
  }
  if (level >= 3) {
    return 'L3_5';
  }
  return 'L1_2';
};

const resolveState = (status?: BuildingStatus, hp?: number, maxHp?: number): GooFactoryState => {
  const ratio = maxHp && maxHp > 0 ? (hp ?? maxHp) / maxHp : 1;
  if (ratio <= 0.12) {
    return 'destroyed';
  }
  if (ratio < 0.55) {
    return 'damaged';
  }
  if (status === 'ACTIVE') {
    return 'in-action';
  }
  return 'normal';
};

export const GooFactoryVisual = ({
  level,
  footprintX,
  footprintZ,
  status,
  hp,
  maxHp,
  createMaterial,
}: GooFactoryVisualProps) => {
  const capRef = useRef<Group | null>(null);
  const bubbleRef = useRef<Group | null>(null);
  const pipePulseRef = useRef<Group | null>(null);
  const tier = resolveTier(level);
  const visualState = resolveState(status, hp, maxHp);
  const baseRadius = Math.max(0.36, Math.min(0.54, Math.min(footprintX, footprintZ) * 0.26));

  const tierSpecs = useMemo(() => {
    if (tier === 'L10') {
      return { ringCount: 4, sidePipeCount: 6, scaffoldHeight: 1.6, tankScale: 1.2 };
    }
    if (tier === 'L6_9') {
      return { ringCount: 3, sidePipeCount: 5, scaffoldHeight: 1.35, tankScale: 1.12 };
    }
    if (tier === 'L3_5') {
      return { ringCount: 2, sidePipeCount: 4, scaffoldHeight: 1.12, tankScale: 1.04 };
    }
    return { ringCount: 1, sidePipeCount: 3, scaffoldHeight: 0.95, tankScale: 1 };
  }, [tier]);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const isActive = visualState === 'in-action';
    const capSpeed = isActive ? 1.4 : 0.25;
    const pulseSpeed = isActive ? 4.2 : 1.2;
    if (capRef.current) {
      capRef.current.rotation.y += delta * capSpeed;
      if (visualState === 'damaged') {
        capRef.current.rotation.z = Math.sin(elapsed * 5.5) * 0.03;
      }
    }
    if (bubbleRef.current) {
      const baseScale = visualState === 'in-action' ? 1.02 : 0.92;
      const pulse = Math.sin(elapsed * pulseSpeed) * (isActive ? 0.1 : 0.03);
      bubbleRef.current.scale.setScalar(baseScale + pulse);
    }
    if (pipePulseRef.current) {
      const pulse = isActive ? 1 + Math.sin(elapsed * 6.5) * 0.06 : 1;
      pipePulseRef.current.scale.set(pulse, 1, pulse);
    }
  });

  if (visualState === 'destroyed') {
    return (
      <group rotation={[0.12, 0, -0.25]} position={[0, 0.02, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
          <cylinderGeometry args={[baseRadius + 0.22, baseRadius + 0.28, 0.14, 16]} />
          {createMaterial('#5f4634', 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[0.12, 0.12, -0.1]} rotation={[0.35, 0.7, 0.4]}>
          <torusGeometry args={[baseRadius + 0.04, 0.06, 8, 18, Math.PI * 1.55]} />
          {createMaterial('#d7a647', 'gold')}
        </mesh>
        <mesh castShadow receiveShadow position={[-0.2, 0.1, 0.16]} rotation={[0.1, -0.45, 0.1]}>
          <sphereGeometry args={[0.22, 12, 10]} />
          {createMaterial('#4c8f42', 'goo')}
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[baseRadius + 0.22, baseRadius + 0.28, 0.22, 18]} />
        {createMaterial('#7a5238', 'wood')}
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.46, 0]}>
        <cylinderGeometry args={[baseRadius * tierSpecs.tankScale, (baseRadius + 0.05) * tierSpecs.tankScale, 0.72, 18]} />
        {createMaterial('#4f9f48', 'goo')}
      </mesh>

      <group ref={bubbleRef} position={[0, 0.74, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.18 + (tier === 'L10' ? 0.08 : tier === 'L6_9' ? 0.05 : 0.02), 12, 12]} />
          {createMaterial('#6edc6b', 'goo')}
        </mesh>
      </group>

      <group ref={capRef} position={[0, 0.96, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.12, 0.14, 0.26, 10]} />
          {createMaterial('#8fa3b8', 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          {createMaterial('#c8d2df', 'iron')}
        </mesh>
      </group>

      <group ref={pipePulseRef}>
        {Array.from({ length: tierSpecs.sidePipeCount }).map((_, index, arr) => {
          const angle = (Math.PI * 2 * index) / arr.length;
          const ringRadius = baseRadius + 0.28;
          const x = Math.cos(angle) * ringRadius;
          const z = Math.sin(angle) * ringRadius;
          return (
            <group key={`goo-factory-pipe-${index}`} position={[x, 0.42, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
              <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
                <cylinderGeometry args={[0.035, 0.05, 0.32, 8]} />
                {createMaterial('#c99643', 'gold')}
              </mesh>
              <mesh castShadow receiveShadow position={[0.11, 0.28, 0]}>
                <torusGeometry args={[0.11, 0.028, 8, 14, Math.PI * 0.8]} />
                {createMaterial('#d8a949', 'gold')}
              </mesh>
            </group>
          );
        })}
      </group>

      {Array.from({ length: tierSpecs.ringCount }).map((_, ringIndex) => (
        <mesh key={`goo-factory-ring-${ringIndex}`} castShadow receiveShadow position={[0, 0.48 + ringIndex * 0.18, 0]}>
          <torusGeometry args={[baseRadius + 0.1 + ringIndex * 0.03, 0.028, 8, 20]} />
          {createMaterial('#c8923f', 'gold')}
        </mesh>
      ))}

      {tier !== 'L1_2' ? (
        <mesh castShadow receiveShadow position={[baseRadius + 0.32, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, tierSpecs.scaffoldHeight, 8]} />
          {createMaterial('#b8843f', 'gold')}
        </mesh>
      ) : null}

      {tier === 'L6_9' || tier === 'L10' ? (
        <mesh castShadow receiveShadow position={[-(baseRadius + 0.26), 0.78, -0.08]} rotation={[0, 0, Math.PI / 8]}>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          {createMaterial('#9ca8b8', 'iron')}
        </mesh>
      ) : null}

      {tier === 'L10' ? (
        <mesh castShadow receiveShadow position={[0, 1.22, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.24, 0.03, 10, 28]} />
          {createMaterial('#e1b052', 'gold')}
        </mesh>
      ) : null}

      {visualState === 'damaged' ? (
        <group rotation={[0.06, 0, -0.08]}>
          <mesh castShadow receiveShadow position={[0.2, 0.64, -0.16]} rotation={[0.3, 0.2, 0.5]}>
            <boxGeometry args={[0.22, 0.08, 0.12]} />
            {createMaterial('#6b7280', 'iron')}
          </mesh>
          <mesh castShadow receiveShadow position={[-0.3, 0.16, 0.18]} rotation={[0, 0.45, 0]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            {createMaterial('#3f7f3f', 'goo')}
          </mesh>
        </group>
      ) : null}
    </group>
  );
};
