import { Fragment } from 'react';
import { PALETTE } from '../palette';
import type { MaterialFactory, TownHallDimensions } from '../types';

type SidePatchProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
};

const boltCorners: ReadonlyArray<readonly [number, number]> = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];

export const SidePatch = ({ dim, createMaterial }: SidePatchProps) => {
  const plateX = dim.halfX + dim.patchDepth / 2 + 0.001;
  const innerWidth = dim.patchWidth - 0.05;
  const innerHeight = dim.patchHeight - 0.05;
  const boltOffsetX = innerWidth / 2 - 0.025;
  const boltOffsetY = innerHeight / 2 - 0.025;

  return (
    <group position={[plateX, dim.patchY, dim.patchOffsetZ]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[dim.patchWidth, dim.patchHeight, dim.patchDepth]} />
        {createMaterial(PALETTE.rustPlate, 'iron')}
      </mesh>

      <mesh position={[0, 0, dim.patchDepth / 2 + 0.001]}>
        <boxGeometry args={[dim.patchWidth - 0.02, dim.patchHeight - 0.02, 0.012]} />
        {createMaterial(PALETTE.rustPlateLight, 'iron')}
      </mesh>

      <mesh position={[-dim.patchWidth * 0.18, dim.patchHeight * 0.12, dim.patchDepth / 2 + 0.012]}>
        <boxGeometry args={[dim.patchWidth * 0.4, dim.patchHeight * 0.18, 0.008]} />
        {createMaterial(PALETTE.rustPlateShadow, 'iron')}
      </mesh>
      <mesh position={[dim.patchWidth * 0.22, -dim.patchHeight * 0.18, dim.patchDepth / 2 + 0.012]}>
        <boxGeometry args={[dim.patchWidth * 0.32, dim.patchHeight * 0.16, 0.008]} />
        {createMaterial(PALETTE.rustPlateShadow, 'iron')}
      </mesh>
      <mesh position={[-dim.patchWidth * 0.28, -dim.patchHeight * 0.05, dim.patchDepth / 2 + 0.012]}>
        <boxGeometry args={[dim.patchWidth * 0.18, dim.patchHeight * 0.1, 0.006]} />
        {createMaterial(PALETTE.rustPlateLight, 'iron')}
      </mesh>

      {boltCorners.map(([sx, sy], idx) => (
        <Fragment key={`patch-bolt-${idx}`}>
          <mesh castShadow position={[sx * boltOffsetX, sy * boltOffsetY, dim.patchDepth / 2 + 0.014]}>
            <cylinderGeometry args={[0.022, 0.022, 0.022, 8]} />
            {createMaterial(PALETTE.rustBolt, 'iron')}
          </mesh>
          <mesh position={[sx * boltOffsetX - 0.006, sy * boltOffsetY + 0.006, dim.patchDepth / 2 + 0.026]}>
            <sphereGeometry args={[0.008, 6, 6]} />
            {createMaterial(PALETTE.boltShine, 'iron')}
          </mesh>
        </Fragment>
      ))}
    </group>
  );
};
