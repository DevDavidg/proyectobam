import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

type LaserTowerVisualProps = {
  level: number;
  isActive: boolean;
  hp?: number;
  maxHp?: number;
};

type LaserState = 'normal' | 'damaged' | 'destroyed';

const resolveState = (hp?: number, maxHp?: number): LaserState => {
  const ratio = maxHp && maxHp > 0 ? (hp ?? maxHp) / maxHp : 1;
  if (ratio <= 0.12) return 'destroyed';
  if (ratio < 0.55) return 'damaged';
  return 'normal';
};

export const LaserTowerVisual = ({ level, isActive, hp, maxHp }: LaserTowerVisualProps) => {
  const coreRef = useRef<Group | null>(null);
  const ringRef = useRef<Group | null>(null);
  const state = resolveState(hp, maxHp);
  const levelScale = Math.min(1, Math.max(0, (level - 1) / 7));

  useFrame((clockState, delta) => {
    const elapsed = clockState.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * (isActive ? 1.6 : 0.2);
      const bob = isActive ? Math.sin(elapsed * 3.4) * 0.02 : Math.sin(elapsed * 1.2) * 0.006;
      coreRef.current.position.y = 0.66 + bob;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * (isActive ? 1.9 : 0.3);
    }
  });

  if (state === 'destroyed') {
    return (
      <group position={[0, 0.05, 0]} rotation={[0.2, 0.4, -0.22]}>
        <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.6, 0.7, 0.16, 12]} />
          <meshStandardMaterial color="#6e7078" roughness={0.74} metalness={0.18} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.12, 0.16, -0.08]} rotation={[0.2, 0.4, 0.3]}>
          <cylinderGeometry args={[0.12, 0.14, 0.45, 10]} />
          <meshStandardMaterial color="#95a6b8" roughness={0.46} metalness={0.5} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.64, 0.74, 0.32, 12]} />
        <meshStandardMaterial color="#7a7e86" roughness={0.78} metalness={0.14} />
      </mesh>

      {[[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].map((leg, index) => (
        <group key={`laser-leg-${index}`} position={[leg[0], 0.16, leg[1]]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.24, 8]} />
            <meshStandardMaterial color="#565c66" roughness={0.72} metalness={0.22} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, -0.14, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#474d57" roughness={0.8} metalness={0.1} />
          </mesh>
        </group>
      ))}

      <group ref={coreRef} position={[0, 0.66, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.28 + levelScale * 0.05, 0.34 + levelScale * 0.07, 0.7, 14]} />
          <meshStandardMaterial color="#a8b4c2" roughness={0.42} metalness={0.52} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.14, 0.18, 0.18, 12]} />
          <meshStandardMaterial color="#7e8da1" roughness={0.48} metalness={0.44} />
        </mesh>
      </group>

      <group ref={ringRef} position={[0, 0.9 + levelScale * 0.08, 0]}>
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3 + levelScale * 0.07, 0.04, 8, 20]} />
          <meshStandardMaterial color="#2f65d6" roughness={0.34} metalness={0.48} emissive={isActive ? '#1d3e8f' : '#0d1c41'} emissiveIntensity={isActive ? 0.7 : 0.25} />
        </mesh>
      </group>

      <mesh castShadow receiveShadow position={[0.24, 1.05 + levelScale * 0.08, 0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.16, 0.1, 0.26]} />
        <meshStandardMaterial color="#cfd8e3" roughness={0.36} metalness={0.56} />
      </mesh>

      {state === 'damaged' ? (
        <group rotation={[0.08, 0, -0.1]}>
          <mesh castShadow receiveShadow position={[-0.16, 0.7, 0.12]} rotation={[0.2, 0.5, 0.1]}>
            <boxGeometry args={[0.18, 0.08, 0.12]} />
            <meshStandardMaterial color="#616670" roughness={0.76} metalness={0.16} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.2, 0.16, -0.14]} rotation={[0.1, 0.3, 0.5]}>
            <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
            <meshStandardMaterial color="#d63a3a" roughness={0.64} metalness={0.08} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};
