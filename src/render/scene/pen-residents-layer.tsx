import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import { useGameStore } from '../../state/game-store';
import type { MonsterLifecycleState, MonsterType } from '../../core/constants/monster-catalog';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';

const ResidentMesh = ({
  x,
  y,
  moving,
  monsterType,
  lifecycleState,
}: {
  x: number;
  y: number;
  moving: boolean;
  monsterType: MonsterType;
  lifecycleState: MonsterLifecycleState;
}) => {
  const groupRef = useRef<Group | null>(null);
  const bodyRef = useRef<Group | null>(null);
  const phase = useMemo(() => ((x * 31 + y * 17) % 12) * 0.41, [x, y]);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }
    const t = state.clock.getElapsedTime() + phase;
    const bounceSpeed = moving ? 5.6 : lifecycleState === 'TRAINING' ? 2.4 : 1.4;
    const bounce = Math.sin(t * bounceSpeed);
    const bounceHeight = moving ? 0.1 : lifecycleState === 'TRAINING' ? 0.055 : 0.03;
    groupRef.current.position.y = Math.abs(bounce) * bounceHeight;
    const stretchFactor = moving ? 0.075 : lifecycleState === 'TRAINING' ? 0.042 : 0.024;
    groupRef.current.scale.y = 1 + bounce * stretchFactor;
    groupRef.current.scale.x = 1 - bounce * stretchFactor * 0.5;
    groupRef.current.scale.z = 1 - bounce * stretchFactor * 0.5;
    groupRef.current.rotation.y = Math.sin(t * (moving ? 4.8 : 1.7)) * (moving ? 0.24 : 0.08);
    if (bodyRef.current) {
      bodyRef.current.rotation.z = Math.sin(t * 3.2) * 0.06;
    }
  });

  const [worldX, , worldZ] = gridToWorldCenter(x, y, 1, 1, GRID_SIZE, CELL_SIZE);
  const bodyColor = monsterType === 'Pokey' ? '#f43f5e' : '#fb923c';
  const hornColor = lifecycleState === 'TRAINING' ? '#0ea5e9' : monsterType === 'Pokey' ? '#7f1d1d' : '#78350f';
  const bodyScale = monsterType === 'Pokey' ? 1 : 1.15;
  const auraIntensity = lifecycleState === 'TRAINING' ? 0.46 : 0.2;

  return (
    <group position={[worldX, 0, worldZ]} ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#0f172a" transparent={true} opacity={0.24} depthWrite={false} />
      </mesh>
      <group ref={bodyRef}>
        <mesh castShadow receiveShadow position={[0, 0.35, 0]} scale={[bodyScale, bodyScale, bodyScale]}>
          <sphereGeometry args={[0.34, 14, 14]} />
          <meshStandardMaterial color={bodyColor} roughness={0.58} metalness={0.12} emissive={bodyColor} emissiveIntensity={0.12} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
          <coneGeometry args={[0.24, 0.35, 8]} />
          <meshStandardMaterial color={hornColor} roughness={0.5} metalness={0.15} emissive={hornColor} emissiveIntensity={auraIntensity} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.1, 0.4, 0.24]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#f8fafc" emissive="#e2e8f0" emissiveIntensity={0.35} />
        </mesh>
        <mesh castShadow receiveShadow position={[-0.1, 0.4, 0.24]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#f8fafc" emissive="#e2e8f0" emissiveIntensity={0.35} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.11, 0.4, 0.28]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh castShadow receiveShadow position={[-0.11, 0.4, 0.28]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {monsterType === 'Rambot' ? (
          <mesh castShadow receiveShadow position={[0, 0.28, -0.25]}>
            <boxGeometry args={[0.24, 0.14, 0.2]} />
            <meshStandardMaterial color="#7c2d12" roughness={0.62} />
          </mesh>
        ) : (
          <mesh castShadow receiveShadow position={[0, 0.22, -0.24]}>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial color="#9f1239" roughness={0.72} />
          </mesh>
        )}
      </group>
    </group>
  );
};

export const PenResidentsLayer = () => {
  const penResidents = useGameStore((state) => state.penResidents);

  return (
    <>
      {penResidents.map((resident) => (
        <ResidentMesh
          key={resident.id}
          x={resident.x}
          y={resident.y}
          moving={resident.moving}
          monsterType={resident.monsterType}
          lifecycleState={resident.lifecycleState}
        />
      ))}
    </>
  );
};
