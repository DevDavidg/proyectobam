import { useRef } from 'react';
import type { Group } from 'three';
import { getBoxGeometry, getCylinderGeometry, getTorusGeometry } from '../../building-visual/geometry-cache';
import { HATCHERY_PALETTE } from '../palette';

type GroundGearProps = {
  radius: number;
  toothCount: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  spinRef?: React.RefObject<Group | null>;
};

export const GroundGear = ({ radius, toothCount, position, rotation = [0, 0, 0], spinRef }: GroundGearProps) => {
  const localRef = useRef<Group | null>(null);
  const groupRef = spinRef ?? localRef;
  const toothLength = radius * 0.18;
  const toothWidth = radius * 0.12;
  const toothHeight = radius * 0.08;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <mesh castShadow receiveShadow position={[0, toothHeight * 0.45, 0]}>
        <primitive attach="geometry" object={getCylinderGeometry(radius * 0.7, radius * 0.7, toothHeight, 24)} />
        <meshStandardMaterial color={HATCHERY_PALETTE.groundGear} roughness={0.7} metalness={0.42} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, toothHeight * 0.5, 0]}>
        <primitive attach="geometry" object={getTorusGeometry(radius * 0.76, radius * 0.07, 10, toothCount * 2)} />
        <meshStandardMaterial color={HATCHERY_PALETTE.groundGearDark} roughness={0.68} metalness={0.4} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, toothHeight * 0.56, 0]}>
        <primitive attach="geometry" object={getCylinderGeometry(radius * 0.14, radius * 0.14, toothHeight * 0.55, 14)} />
        <meshStandardMaterial color={HATCHERY_PALETTE.groundGearHub} roughness={0.74} metalness={0.36} />
      </mesh>
      <mesh castShadow={false} receiveShadow={false} position={[0, toothHeight * 0.57, 0]}>
        <primitive attach="geometry" object={getCylinderGeometry(radius * 0.095, radius * 0.095, toothHeight * 0.72, 14)} />
        <meshStandardMaterial color={HATCHERY_PALETTE.visorVoid} roughness={1} metalness={0} />
      </mesh>
      {Array.from({ length: toothCount }).map((_, index) => {
        const angle = (index / toothCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius * 0.8;
        const z = Math.sin(angle) * radius * 0.8;
        return (
          <mesh
            key={`gear-tooth-${radius}-${index}`}
            castShadow
            receiveShadow
            position={[x, toothHeight * 0.56, z]}
            rotation={[0, angle, 0]}
          >
            <primitive attach="geometry" object={getBoxGeometry(toothLength, toothHeight, toothWidth)} />
            <meshStandardMaterial color={HATCHERY_PALETTE.groundGearDark} roughness={0.66} metalness={0.42} />
          </mesh>
        );
      })}
    </group>
  );
};
