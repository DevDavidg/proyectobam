import type { RefObject } from 'react';
import { getBoxGeometry } from '../../building-visual/geometry-cache';
import { HATCHERY_PALETTE } from '../palette';
import { INTERNAL_GEAR_CUBES } from '../constants';

type InternalGearsProps = {
  openingY: number;
  gearsRef: RefObject<import('three').Group | null>;
};

export const InternalGears = ({ openingY, gearsRef }: InternalGearsProps) => (
  <group ref={gearsRef} position={[0, openingY + 0.03, 0]}>
    {INTERNAL_GEAR_CUBES.map((cube, index) => (
      <group key={`internal-gear-cube-${index}`} position={cube.pos} rotation={[0, cube.rot, 0]}>
        <mesh castShadow receiveShadow>
          <primitive attach="geometry" object={getBoxGeometry(cube.size, cube.size * 0.92, cube.size)} />
          <meshStandardMaterial
            color={HATCHERY_PALETTE.internalGear}
            roughness={0.48}
            metalness={0.28}
            emissive={HATCHERY_PALETTE.internalGearShadow}
            emissiveIntensity={0.08}
          />
        </mesh>
        {[0, Math.PI / 2].map((angle) => (
          <mesh key={`cube-tooth-${index}-${angle}`} castShadow position={[0, 0.02, 0]} rotation={[0, angle, 0]}>
            <primitive attach="geometry" object={getBoxGeometry(cube.size * 1.18, cube.size * 0.22, cube.size * 0.34)} />
            <meshStandardMaterial color={HATCHERY_PALETTE.internalGearHighlight} roughness={0.42} metalness={0.22} flatShading />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);
