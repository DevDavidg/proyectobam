import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

type SniperTowerVisualProps = {
  level: number;
  isActive: boolean;
  hp?: number;
  maxHp?: number;
};

type SniperState = 'normal' | 'damaged' | 'destroyed';

const resolveState = (hp?: number, maxHp?: number): SniperState => {
  const ratio = maxHp && maxHp > 0 ? (hp ?? maxHp) / maxHp : 1;
  if (ratio <= 0.12) return 'destroyed';
  if (ratio < 0.55) return 'damaged';
  return 'normal';
};

export const SniperTowerVisual = ({ level, isActive, hp, maxHp }: SniperTowerVisualProps) => {
  const scopeRef = useRef<Group | null>(null);
  const barrelRef = useRef<Group | null>(null);
  const state = resolveState(hp, maxHp);
  const levelScale = Math.min(1, Math.max(0, (level - 1) / 9));

  useFrame((clockState, delta) => {
    if (scopeRef.current) {
      scopeRef.current.rotation.y += delta * (isActive ? 0.5 : 0.08);
    }
    if (barrelRef.current) {
      const t = clockState.clock.getElapsedTime();
      const recoil = isActive ? Math.sin(t * 2.2) * 0.015 : Math.sin(t * 0.7) * 0.004;
      barrelRef.current.position.z = recoil;
    }
  });

  if (state === 'destroyed') {
    return (
      <group position={[0, 0.05, 0]} rotation={[0.2, 0.4, -0.25]}>
        <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[0.95, 0.18, 0.95]} />
          <meshStandardMaterial color="#7d6248" roughness={0.8} metalness={0.1} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.2, 0.2, -0.1]} rotation={[0.3, 0.2, 0.5]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 10]} />
          <meshStandardMaterial color="#9aa6b5" roughness={0.5} metalness={0.45} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[1.05, 0.32, 1.05]} />
        <meshStandardMaterial color="#8d6f52" roughness={0.84} metalness={0.05} />
      </mesh>

      {[[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]].map((leg, index) => (
        <group key={`sniper-leg-${index}`} position={[leg[0], 0.16, leg[1]]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.26, 8]} />
            <meshStandardMaterial color="#8b9098" roughness={0.6} metalness={0.25} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, -0.15, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#5a5f66" roughness={0.75} metalness={0.12} />
          </mesh>
        </group>
      ))}

      <mesh castShadow receiveShadow position={[0, 0.52, 0]}>
        <boxGeometry args={[0.74, 0.52 + levelScale * 0.18, 0.74]} />
        <meshStandardMaterial color="#b1916e" roughness={0.78} metalness={0.06} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.82, 0.38]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.62, 8]} />
        <meshStandardMaterial color="#d22f2f" roughness={0.7} metalness={0.08} />
      </mesh>

      <group ref={barrelRef} position={[0, 0.93 + levelScale * 0.1, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.14, 0.17, 0.42, 10]} />
          <meshStandardMaterial color="#909eaf" roughness={0.45} metalness={0.44} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.02, 0.45]}>
          <cylinderGeometry args={[0.05, 0.05, 0.82 + levelScale * 0.24, 10]} />
          <meshStandardMaterial color="#d2d9e3" roughness={0.36} metalness={0.55} />
        </mesh>
      </group>

      <group ref={scopeRef} position={[0.22, 1.12 + levelScale * 0.08, 0.02]}>
        <mesh castShadow receiveShadow rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.13 + levelScale * 0.07, 0.03, 8, 14]} />
          <meshStandardMaterial color="#a6b2c1" roughness={0.42} metalness={0.48} />
        </mesh>
      </group>

      {state === 'damaged' ? (
        <group rotation={[0.06, 0, -0.08]}>
          <mesh castShadow receiveShadow position={[-0.18, 0.62, 0.1]} rotation={[0.2, 0.5, 0.18]}>
            <boxGeometry args={[0.2, 0.08, 0.14]} />
            <meshStandardMaterial color="#646a73" roughness={0.72} metalness={0.16} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.2, 0.14, -0.15]} rotation={[0.1, 0.2, 0.5]}>
            <cylinderGeometry args={[0.03, 0.03, 0.22, 8]} />
            <meshStandardMaterial color="#b33030" roughness={0.6} metalness={0.1} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};
