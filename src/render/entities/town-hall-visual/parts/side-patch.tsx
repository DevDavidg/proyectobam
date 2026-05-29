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
      <mesh castShadow receiveShadow material={createMaterial(PALETTE.rustPlate, 'iron')}>
        <boxGeometry args={[dim.patchWidth, dim.patchHeight, dim.patchDepth]} /></mesh>

      <mesh position={[0, 0, dim.patchDepth / 2 + 0.001]} material={createMaterial(PALETTE.rustPlateLight, 'iron')}>
        <boxGeometry args={[dim.patchWidth - 0.02, dim.patchHeight - 0.02, 0.012]} /></mesh>

      <mesh position={[-dim.patchWidth * 0.18, dim.patchHeight * 0.12, dim.patchDepth / 2 + 0.012]} material={createMaterial(PALETTE.rustPlateShadow, 'iron')}>
        <boxGeometry args={[dim.patchWidth * 0.4, dim.patchHeight * 0.18, 0.008]} /></mesh>
      <mesh position={[dim.patchWidth * 0.22, -dim.patchHeight * 0.18, dim.patchDepth / 2 + 0.012]} material={createMaterial(PALETTE.rustPlateShadow, 'iron')}>
        <boxGeometry args={[dim.patchWidth * 0.32, dim.patchHeight * 0.16, 0.008]} /></mesh>
      <mesh position={[-dim.patchWidth * 0.28, -dim.patchHeight * 0.05, dim.patchDepth / 2 + 0.012]} material={createMaterial(PALETTE.rustPlateLight, 'iron')}>
        <boxGeometry args={[dim.patchWidth * 0.18, dim.patchHeight * 0.1, 0.006]} /></mesh>

      {boltCorners.map(([sx, sy], idx) => (
        <Fragment key={`patch-bolt-${idx}`}>
          <mesh castShadow position={[sx * boltOffsetX, sy * boltOffsetY, dim.patchDepth / 2 + 0.014]} material={createMaterial(PALETTE.rustBolt, 'iron')}>
            <cylinderGeometry args={[0.022, 0.022, 0.022, 8]} /></mesh>
          <mesh position={[sx * boltOffsetX - 0.006, sy * boltOffsetY + 0.006, dim.patchDepth / 2 + 0.026]} material={createMaterial(PALETTE.boltShine, 'iron')}>
            <sphereGeometry args={[0.008, 6, 6]} /></mesh>
        </Fragment>
      ))}
    </group>
  );
};
