import { useRef } from 'react';
import type { Group } from 'three';
import { getBoxGeometry, getCylinderGeometry, getTorusGeometry } from '../../building-visual/geometry-cache';
import { HATCHERY_PALETTE } from '../palette';

type GroundGearProps = {
  radius: number;
  toothCount: number;
  position: [number, number, number];
  spinRef?: React.RefObject<Group | null>;
};

export const GroundGear = ({ radius, toothCount, position, spinRef }: GroundGearProps) => {
  const localRef = useRef<Group | null>(null);
  const groupRef = spinRef ?? localRef;
  const toothWidth = radius * 0.22;
  const toothHeight = radius * 0.18;
  const toothDepth = radius * 0.14;

  return (
    <group ref={groupRef} position={position}>
      <mesh castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <primitive attach="geometry" object={getCylinderGeometry(radius * 0.72, radius * 0.72, toothDepth, 24)} />
        <meshStandardMaterial color={HATCHERY_PALETTE.groundGearHub} roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, toothDepth * 0.52, 0]}>
        <primitive attach="geometry" object={getTorusGeometry(radius * 0.78, radius * 0.11, 12, toothCount * 2)} />
        <meshStandardMaterial color={HATCHERY_PALETTE.groundGear} roughness={0.62} metalness={0.42} />
      </mesh>
      {Array.from({ length: toothCount }).map((_, index) => {
        const angle = (index / toothCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <mesh
            key={`gear-tooth-${radius}-${index}`}
            castShadow
            receiveShadow
            position={[x, toothDepth * 0.55, z]}
            rotation={[0, -angle, 0]}
          >
            <primitive attach="geometry" object={getBoxGeometry(toothWidth, toothHeight, toothDepth)} />
            <meshStandardMaterial color={HATCHERY_PALETTE.groundGearDark} roughness={0.58} metalness={0.4} flatShading />
          </mesh>
        );
      })}
    </group>
  );
};
