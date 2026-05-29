import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group, Material } from 'three';
import type { BuildingStatus } from '../../core/types/building';

type MaterialToken = 'gold' | 'iron' | 'wood' | 'goo' | 'stone';

type StorageSiloVisualProps = {
  level: number;
  footprintX: number;
  footprintZ: number;
  status?: BuildingStatus;
  hp?: number;
  maxHp?: number;
  storageFillRatio?: number;
  createMaterial: (fallbackColor: string, token: MaterialToken) => Material;
};

type SiloState = 'filling' | 'normal' | 'damaged' | 'destroyed';

const resolveState = (status?: BuildingStatus, hp?: number, maxHp?: number, fillRatio = 0): SiloState => {
  const healthRatio = maxHp && maxHp > 0 ? (hp ?? maxHp) / maxHp : 1;
  if (healthRatio <= 0.12) return 'destroyed';
  if (healthRatio < 0.55) return 'damaged';
  if (fillRatio >= 0.85 || status === 'UNDER_CONSTRUCTION') return 'filling';
  return 'normal';
};

export const StorageSiloVisual = ({
  level,
  footprintX,
  footprintZ,
  status,
  hp,
  maxHp,
  storageFillRatio = 0,
  createMaterial,
}: StorageSiloVisualProps) => {
  const sackRef = useRef<Group | null>(null);
  const topRef = useRef<Group | null>(null);
  const visualState = resolveState(status, hp, maxHp, storageFillRatio);
  const baseRadius = Math.max(0.34, Math.min(0.52, Math.min(footprintX, footprintZ) * 0.2));
  const fillRatio = Math.max(0, Math.min(1, storageFillRatio));
  const bulgeFactor = 1 + fillRatio * 0.35;

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    if (topRef.current) {
      const wobble = visualState === 'filling' ? 0.03 : 0.01;
      topRef.current.rotation.y += delta * (visualState === 'filling' ? 0.7 : 0.12);
      topRef.current.rotation.z = Math.sin(elapsed * 2.1) * wobble;
    }
    if (sackRef.current) {
      const pulse = visualState === 'filling' ? 1 + Math.sin(elapsed * 3.6) * 0.04 : 1;
      sackRef.current.scale.set(bulgeFactor * pulse, 1 + fillRatio * 0.08, bulgeFactor * pulse);
    }
  });

  if (visualState === 'destroyed') {
    return (
      <group position={[0, 0.03, 0]} rotation={[0.1, 0.25, -0.2]}>
        <mesh castShadow receiveShadow position={[0, 0.08, 0]} material={createMaterial('#8a928f', 'stone')}>
          <boxGeometry args={[baseRadius * 2.2, 0.12, baseRadius * 1.3]} /></mesh>
        <mesh castShadow receiveShadow position={[0.04, 0.11, 0]} material={createMaterial('#c9bbb2', 'wood')}>
          <cylinderGeometry args={[0.15, 0.2, 0.18, 10]} /></mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.14, 0]} material={createMaterial('#6a726f', 'stone')}>
        <boxGeometry args={[baseRadius * 2.1, 0.14, baseRadius * 2.1]} /></mesh>

      <group ref={sackRef} position={[0, 0.48, 0]}>
        <mesh castShadow receiveShadow material={createMaterial('#cfc6bf', 'wood')}>
          <cylinderGeometry args={[0.23, 0.29, 0.72, 12]} /></mesh>
        <mesh castShadow receiveShadow position={[0, 0.34, 0]} material={createMaterial('#d9d1c8', 'wood')}>
          <sphereGeometry args={[0.2, 12, 10]} /></mesh>
      </group>

      <group ref={topRef} position={[0, 0.88, 0]}>
        <mesh castShadow receiveShadow material={createMaterial('#cc9a3e', 'gold')}>
          <cylinderGeometry args={[0.22, 0.25, 0.12, 12]} /></mesh>
        <mesh castShadow receiveShadow position={[0, 0.1, 0]} material={createMaterial('#e1b85a', 'gold')}>
          <sphereGeometry args={[0.06, 10, 10]} /></mesh>
      </group>

      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], index) => (
        <group key={`silo-post-${index}`} position={[sx * (baseRadius + 0.16), 0.36, sz * (baseRadius + 0.16)]}>
          <mesh castShadow receiveShadow material={createMaterial('#b88c3e', 'gold')}>
            <cylinderGeometry args={[0.04, 0.05, 0.78, 8]} /></mesh>
          <mesh castShadow receiveShadow position={[0, -0.42, 0]} material={createMaterial('#8b969d', 'stone')}>
            <sphereGeometry args={[0.05, 8, 8]} /></mesh>
        </group>
      ))}

      {visualState === 'damaged' ? (
        <group rotation={[0.08, 0, -0.1]}>
          <mesh castShadow receiveShadow position={[0.18, 0.58, -0.14]} rotation={[0.2, 0.4, 0.1]} material={createMaterial('#727a84', 'stone')}>
            <boxGeometry args={[0.14, 0.08, 0.12]} /></mesh>
          <mesh castShadow receiveShadow position={[-0.16, 0.28, 0.16]} rotation={[0.1, 0.2, 0.5]} material={createMaterial('#8d949d', 'iron')}>
            <cylinderGeometry args={[0.035, 0.035, 0.22, 8]} /></mesh>
        </group>
      ) : null}

      {visualState === 'filling' ? (
        <mesh castShadow receiveShadow position={[0.26, 0.86, 0.02]} material={createMaterial('#b5bcc7', 'iron')}>
          <torusGeometry args={[0.08 + fillRatio * 0.08, 0.015, 8, 14]} /></mesh>
      ) : null}

      {level >= 7 ? (
        <mesh castShadow receiveShadow position={[-0.24, 0.82, 0]} rotation={[0, Math.PI / 2, 0]} material={createMaterial('#9ea7b3', 'iron')}>
          <cylinderGeometry args={[0.02, 0.02, 0.28, 8]} /></mesh>
      ) : null}
    </group>
  );
};
