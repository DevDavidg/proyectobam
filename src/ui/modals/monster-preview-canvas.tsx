import { PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import type { Group } from 'three';
import { PerfCanvas } from '../../app/perf-canvas';
import type { MonsterType } from '../../core/constants/monster-catalog';

type PreviewProps = {
  monsterType: MonsterType;
  animationState: 'idle' | 'attack';
};

const MonsterMeshSelector = ({ type, animation }: { type: MonsterType; animation: 'idle' | 'attack' }) => {
  const groupRef = useRef<Group | null>(null);
  const bodyRef = useRef<Group | null>(null);
  const rotatorRef = useRef<Group | null>(null);
  const phase = useMemo(() => (type === 'Pokey' ? 0.35 : 1.1), [type]);
  const invalidate = useThree((state) => state.invalidate);

  useFrame((state, delta) => {
    if (!groupRef.current || !rotatorRef.current) {
      return;
    }
    const t = state.clock.getElapsedTime() + phase;
    const attackBoost = animation === 'attack' ? 1.75 : 1;
    const bounce = Math.sin(t * 2.7 * attackBoost);
    groupRef.current.position.y = Math.abs(bounce) * (animation === 'attack' ? 0.18 : 0.08);
    groupRef.current.rotation.y = Math.sin(t * (animation === 'attack' ? 2.8 : 1.1)) * (animation === 'attack' ? 0.35 : 0.12);
    rotatorRef.current.rotation.y += delta * 0.55;
    if (bodyRef.current) {
      bodyRef.current.rotation.z = Math.sin(t * 3.2 * attackBoost) * 0.08;
      bodyRef.current.scale.setScalar(1 + Math.max(0, bounce) * (animation === 'attack' ? 0.12 : 0.05));
    }
    invalidate();
  });

  const bodyColor = type === 'Pokey' ? '#f43f5e' : '#fb923c';
  const hornColor = type === 'Pokey' ? '#7f1d1d' : '#78350f';
  const bodyScale = type === 'Pokey' ? 1 : 1.16;

  return (
    <group ref={rotatorRef}>
      <group ref={groupRef} position={[0, 0.15, 0]}>
        <group ref={bodyRef}>
          <mesh position={[0, 0.42, 0]} scale={[bodyScale, bodyScale, bodyScale]}>
            <sphereGeometry args={[0.45, 14, 14]} />
            <meshStandardMaterial color={bodyColor} roughness={0.54} metalness={0.12} emissive={bodyColor} emissiveIntensity={0.16} />
          </mesh>
          <mesh position={[0, 1.02, 0]}>
            <coneGeometry args={[0.3, 0.5, 8]} />
            <meshStandardMaterial color={hornColor} roughness={0.48} metalness={0.14} />
          </mesh>
          {type === 'Rambot' ? (
            <mesh position={[0, 0.33, -0.32]}>
              <boxGeometry args={[0.34, 0.18, 0.26]} />
              <meshStandardMaterial color="#7c2d12" roughness={0.64} />
            </mesh>
          ) : (
            <mesh position={[0, 0.28, -0.28]}>
              <sphereGeometry args={[0.16, 8, 8]} />
              <meshStandardMaterial color="#9f1239" roughness={0.72} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
};

export const MonsterPreviewCanvas = ({ monsterType, animationState }: PreviewProps) => {
  return (
    <div className="h-[220px] w-[280px] overflow-hidden rounded-lg border-4 border-stone-600 bg-stone-300 shadow-md">
      <PerfCanvas
        shadows={false}
        dpr={[1, 1.25]}
        frameloop="demand"
        gl={{ antialias: false, powerPreference: 'low-power' }}
      >
        <PerspectiveCamera makeDefault position={[0, 2, 4]} fov={45} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 10, 5]} intensity={1.4} />
        <Suspense fallback={null}>
          <MonsterMeshSelector type={monsterType} animation={animationState} />
        </Suspense>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <circleGeometry args={[2.6, 24]} />
          <meshStandardMaterial color="#1f1a14" roughness={0.95} metalness={0} />
        </mesh>
      </PerfCanvas>
    </div>
  );
};
