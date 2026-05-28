import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { ReactElement } from 'react';
import type { Group } from 'three';
import type { BuildingStatus } from '../../core/types/building';

type MaterialToken = 'gold' | 'iron' | 'wood' | 'goo' | 'stone';

type PuttySquisherVisualProps = {
  level: number;
  footprintX: number;
  footprintZ: number;
  status?: BuildingStatus;
  hp?: number;
  maxHp?: number;
  createMaterial: (fallbackColor: string, token: MaterialToken) => ReactElement;
};

type PuttyTier = 'L1_2' | 'L3_5' | 'L6_9' | 'L10';
type PuttyState = 'in-action' | 'normal' | 'damaged' | 'destroyed';

const resolveTier = (level: number): PuttyTier => {
  if (level >= 10) return 'L10';
  if (level >= 6) return 'L6_9';
  if (level >= 3) return 'L3_5';
  return 'L1_2';
};

const resolveState = (status?: BuildingStatus, hp?: number, maxHp?: number): PuttyState => {
  const ratio = maxHp && maxHp > 0 ? (hp ?? maxHp) / maxHp : 1;
  if (ratio <= 0.12) return 'destroyed';
  if (ratio < 0.55) return 'damaged';
  if (status === 'ACTIVE') return 'in-action';
  return 'normal';
};

export const PuttySquisherVisual = ({
  level,
  footprintX,
  footprintZ,
  status,
  hp,
  maxHp,
  createMaterial,
}: PuttySquisherVisualProps) => {
  const pressRef = useRef<Group | null>(null);
  const wheelRef = useRef<Group | null>(null);
  const gooPulseRef = useRef<Group | null>(null);
  const tier = resolveTier(level);
  const visualState = resolveState(status, hp, maxHp);
  const baseRadius = Math.max(0.34, Math.min(0.54, Math.min(footprintX, footprintZ) * 0.25));

  const tierSpecs = useMemo(() => {
    if (tier === 'L10') return { pipeCount: 4, legCount: 6, wheelRadius: 0.27, vesselHeight: 0.82 };
    if (tier === 'L6_9') return { pipeCount: 3, legCount: 5, wheelRadius: 0.23, vesselHeight: 0.74 };
    if (tier === 'L3_5') return { pipeCount: 2, legCount: 4, wheelRadius: 0.2, vesselHeight: 0.64 };
    return { pipeCount: 1, legCount: 3, wheelRadius: 0.16, vesselHeight: 0.54 };
  }, [tier]);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    if (pressRef.current) {
      const y = visualState === 'in-action'
        ? 0.78 + Math.sin(elapsed * 3.2) * 0.06
        : 0.8 + Math.sin(elapsed * 1.4) * 0.015;
      pressRef.current.position.y = y;
    }
    if (wheelRef.current) {
      wheelRef.current.rotation.z += delta * (visualState === 'in-action' ? 1.9 : 0.2);
    }
    if (gooPulseRef.current) {
      const pulse = visualState === 'in-action' ? 1 + Math.sin(elapsed * 5.5) * 0.09 : 1 + Math.sin(elapsed * 1.6) * 0.02;
      gooPulseRef.current.scale.setScalar(pulse);
    }
  });

  if (visualState === 'destroyed') {
    return (
      <group position={[0, 0.03, 0]} rotation={[0.12, 0.3, -0.28]}>
        <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
          <sphereGeometry args={[baseRadius + 0.16, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          {createMaterial('#c98f31', 'gold')}
        </mesh>
        <mesh castShadow receiveShadow position={[0.06, 0.02, 0.04]} rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.22, 0.06, 12]} />
          {createMaterial('#864f8f', 'goo')}
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[baseRadius + 0.2, baseRadius + 0.24, 0.22, 16]} />
        {createMaterial('#9a652e', 'gold')}
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.42, 0]}>
        <cylinderGeometry args={[baseRadius + 0.06, baseRadius + 0.1, tierSpecs.vesselHeight, 16]} />
        {createMaterial('#cc8f2f', 'gold')}
      </mesh>

      <group ref={gooPulseRef} position={[0, 0.46, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[baseRadius * 0.62, 12, 10]} />
          {createMaterial('#8a4ab6', 'goo')}
        </mesh>
      </group>

      <group ref={pressRef} position={[0, 0.8, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.34, 10]} />
          {createMaterial('#b8c0cf', 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.09, 10, 10]} />
          {createMaterial('#d5dbe5', 'iron')}
        </mesh>
      </group>

      <group ref={wheelRef} position={[baseRadius + 0.24, 0.88, 0]}>
        <mesh castShadow receiveShadow rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[tierSpecs.wheelRadius, 0.04, 8, 18]} />
          {createMaterial('#a2abb8', 'iron')}
        </mesh>
        <mesh castShadow receiveShadow rotation={[0, Math.PI / 2, Math.PI / 3]}>
          <boxGeometry args={[tierSpecs.wheelRadius * 1.7, 0.04, 0.08]} />
          {createMaterial('#9098a6', 'iron')}
        </mesh>
        <mesh castShadow receiveShadow rotation={[0, Math.PI / 2, -Math.PI / 3]}>
          <boxGeometry args={[tierSpecs.wheelRadius * 1.7, 0.04, 0.08]} />
          {createMaterial('#9098a6', 'iron')}
        </mesh>
      </group>

      {Array.from({ length: tierSpecs.pipeCount }).map((_, index, arr) => {
        const angle = (Math.PI * 2 * index) / arr.length;
        const x = Math.cos(angle) * (baseRadius + 0.2);
        const z = Math.sin(angle) * (baseRadius + 0.2);
        return (
          <group key={`putty-pipe-${index}`} position={[x, 0.36, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.03, 0.045, 0.34, 8]} />
              {createMaterial('#744787', 'goo')}
            </mesh>
            <mesh castShadow receiveShadow position={[0.1, 0.14, 0]}>
              <torusGeometry args={[0.1, 0.026, 8, 14, Math.PI * 0.85]} />
              {createMaterial('#8a55a3', 'goo')}
            </mesh>
          </group>
        );
      })}

      {Array.from({ length: tierSpecs.legCount }).map((_, index, arr) => {
        const angle = (Math.PI * 2 * index) / arr.length;
        const x = Math.cos(angle) * (baseRadius + 0.14);
        const z = Math.sin(angle) * (baseRadius + 0.14);
        return (
          <group key={`putty-leg-${index}`} position={[x, 0.1, z]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.03, 0.045, 0.18, 8]} />
              {createMaterial('#8f5f2e', 'gold')}
            </mesh>
            <mesh castShadow receiveShadow position={[0, -0.1, 0]}>
              <sphereGeometry args={[0.045, 8, 8]} />
              {createMaterial('#d7a743', 'gold')}
            </mesh>
          </group>
        );
      })}

      {visualState === 'damaged' ? (
        <group rotation={[0.1, 0, -0.09]}>
          <mesh castShadow receiveShadow position={[-0.2, 0.56, 0.12]} rotation={[0.2, 0.4, 0.25]}>
            <boxGeometry args={[0.18, 0.08, 0.11]} />
            {createMaterial('#6f7480', 'iron')}
          </mesh>
          <mesh castShadow receiveShadow position={[0.15, 0.06, -0.1]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            {createMaterial('#8b4db8', 'goo')}
          </mesh>
        </group>
      ) : null}
    </group>
  );
};
