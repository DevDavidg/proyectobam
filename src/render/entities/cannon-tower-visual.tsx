import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

type CannonTowerVisualProps = {
  level: number;
  isActive: boolean;
  hp?: number;
  maxHp?: number;
};

type CannonState = 'normal' | 'damaged' | 'destroyed';

const resolveState = (hp?: number, maxHp?: number): CannonState => {
  const ratio = maxHp && maxHp > 0 ? (hp ?? maxHp) / maxHp : 1;
  if (ratio <= 0.12) return 'destroyed';
  if (ratio < 0.55) return 'damaged';
  return 'normal';
};

export const CannonTowerVisual = ({ level, isActive, hp, maxHp }: CannonTowerVisualProps) => {
  const barrelRef = useRef<Group | null>(null);
  const frameRef = useRef<Group | null>(null);
  const state = resolveState(hp, maxHp);
  const levelScale = Math.min(1, Math.max(0, (level - 1) / 9));

  useFrame((clockState, delta) => {
    if (frameRef.current) {
      frameRef.current.rotation.y += delta * (isActive ? 0.28 : 0.06);
    }
    if (barrelRef.current) {
      const elapsed = clockState.clock.getElapsedTime();
      const recoil = isActive ? Math.sin(elapsed * 2.6) * 0.045 : Math.sin(elapsed * 0.8) * 0.01;
      barrelRef.current.position.z = recoil;
    }
  });

  if (state === 'destroyed') {
    return (
      <group position={[0, 0.05, 0]} rotation={[0.15, 0.3, -0.2]}>
        <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
          <boxGeometry args={[1.2, 0.18, 1.2]} />
          <meshStandardMaterial color="#8c6547" roughness={0.82} metalness={0.1} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.22, 0.14, 0.02]} rotation={[0.2, 0.2, 0.6]}>
          <cylinderGeometry args={[0.12, 0.13, 0.62, 12]} />
          <meshStandardMaterial color="#9aa7b4" roughness={0.42} metalness={0.45} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.72, 0.82, 0.36, 14]} />
        <meshStandardMaterial color="#8c6446" roughness={0.8} metalness={0.08} />
      </mesh>

      <group ref={frameRef} position={[0, 0.54, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.62 + levelScale * 0.06, 0.7 + levelScale * 0.08, 0.5, 14]} />
          <meshStandardMaterial color="#a07452" roughness={0.76} metalness={0.08} />
        </mesh>

        <mesh castShadow receiveShadow position={[0, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.42 + levelScale * 0.08, 0.06, 8, 16]} />
          <meshStandardMaterial color="#d03030" roughness={0.64} metalness={0.1} />
        </mesh>

        <group ref={barrelRef} position={[0, 0.32, 0]}>
          <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.2, 0.88 + levelScale * 0.14, 14]} />
            <meshStandardMaterial color="#b2bcc8" roughness={0.4} metalness={0.48} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0, 0.5 + levelScale * 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.11, 0.34, 12]} />
            <meshStandardMaterial color="#8f9aa8" roughness={0.44} metalness={0.44} />
          </mesh>
        </group>
      </group>

      {[[-0.58, -0.58], [0.58, -0.58], [-0.58, 0.58], [0.58, 0.58]].map((leg, index) => (
        <group key={`cannon-leg-${index}`} position={[leg[0], 0.14, leg[1]]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.045, 0.06, 0.26, 8]} />
            <meshStandardMaterial color="#5d646d" roughness={0.72} metalness={0.18} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, -0.15, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#4d535b" roughness={0.78} metalness={0.12} />
          </mesh>
        </group>
      ))}

      {state === 'damaged' ? (
        <group rotation={[0.06, 0, -0.1]}>
          <mesh castShadow receiveShadow position={[-0.22, 0.52, -0.04]} rotation={[0.2, 0.6, 0.15]}>
            <boxGeometry args={[0.2, 0.08, 0.12]} />
            <meshStandardMaterial color="#6d737c" roughness={0.7} metalness={0.14} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.22, 0.16, 0.18]} rotation={[0.2, 0.4, 0.6]}>
            <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
            <meshStandardMaterial color="#d63a3a" roughness={0.62} metalness={0.08} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};
