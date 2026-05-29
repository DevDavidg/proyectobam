import { Fragment } from 'react';
import { PALETTE } from '../palette';
import type { MaterialFactory, TownHallDimensions } from '../types';

type RoofAntennaProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
  weight: number;
};

type AntennaPoleProps = {
  baseY: number;
  poleHeight: number;
  poleRadius: number;
  createMaterial: MaterialFactory;
  ringFractions?: number[];
};

const AntennaPole = ({
  baseY,
  poleHeight,
  poleRadius,
  createMaterial,
  ringFractions = [],
}: AntennaPoleProps) => {
  const poleY = baseY + poleHeight / 2;
  const poleTopY = baseY + poleHeight;

  return (
    <Fragment>
      <mesh castShadow receiveShadow position={[0, poleY, 0]} material={createMaterial(PALETTE.antennaPole, 'iron')}>
        <cylinderGeometry args={[poleRadius * 0.92, poleRadius * 1.08, poleHeight, 10]} /></mesh>
      <mesh position={[poleRadius * 0.55, poleY, 0]} material={createMaterial(PALETTE.antennaPoleLight, 'iron')}>
        <cylinderGeometry args={[poleRadius * 0.18, poleRadius * 0.18, poleHeight * 0.96, 4]} /></mesh>

      {ringFractions.map((tNorm, idx) => {
        const ringY = baseY + poleHeight * tNorm;
        return (
          <mesh key={`pole-ring-${idx}`} position={[0, ringY, 0]} material={createMaterial(PALETTE.reinforcementSteelDark, 'iron')}>
            <cylinderGeometry args={[poleRadius * 1.5, poleRadius * 1.5, 0.012, 12]} /></mesh>
        );
      })}

      <mesh castShadow position={[0, poleTopY + 0.015, 0]} material={createMaterial(PALETTE.antennaPoleLight, 'iron')}>
        <cylinderGeometry args={[poleRadius * 0.6, poleRadius * 0.85, 0.04, 8]} /></mesh>
      <mesh position={[0, poleTopY + 0.06, 0]} material={createMaterial(PALETTE.antennaTip, 'iron')}>
        <sphereGeometry args={[poleRadius * 0.7, 10, 10]} /></mesh>
    </Fragment>
  );
};

export const RoofAntenna = ({ dim, createMaterial, weight }: RoofAntennaProps) => {
  if (weight <= 0.001) {
    return null;
  }

  const baseY = dim.roofTop;

  const mountWidth = 0.22;
  const mountDepth = 0.16;
  const mountHeight = 0.07;
  const mountY = baseY + mountHeight / 2;

  const tallPoleHeight = dim.bodyHeight * 0.74;
  const shortPoleHeight = dim.bodyHeight * 0.5;
  const tallPoleRadius = 0.028;
  const shortPoleRadius = 0.024;

  const platformX = dim.halfX * 0.7;
  const platformZ = -dim.halfZ * 0.6;

  const poleSpacingX = 0.06;

  return (
    <group position={[platformX, 0, platformZ]} scale={[weight, weight, weight]}>
      <mesh castShadow receiveShadow position={[0, mountY, 0]} material={createMaterial(PALETTE.reinforcementSteelDark, 'iron')}>
        <boxGeometry args={[mountWidth, mountHeight, mountDepth]} /></mesh>
      <mesh position={[0, mountY + mountHeight / 2 - 0.004, 0]} material={createMaterial(PALETTE.reinforcementSteelLight, 'iron')}>
        <boxGeometry args={[mountWidth + 0.012, 0.012, mountDepth + 0.012]} /></mesh>
      <mesh position={[0, mountY - mountHeight / 2 + 0.004, 0]} material={createMaterial(PALETTE.reinforcementSteelDark, 'iron')}>
        <boxGeometry args={[mountWidth + 0.012, 0.01, mountDepth + 0.012]} /></mesh>

      {[
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].map(([sx, sz], idx) => (
        <mesh
          key={`antenna-mount-bolt-${idx}`}
          castShadow
          position={[
            sx * (mountWidth / 2 - 0.024),
            mountY + mountHeight / 2 + 0.001,
            sz * (mountDepth / 2 - 0.024),
          ]}
         material={createMaterial(PALETTE.boltDark, 'iron')}>
          <cylinderGeometry args={[0.012, 0.012, 0.02, 8]} /></mesh>
      ))}

      <group position={[-poleSpacingX, mountY + mountHeight / 2, 0]}>
        <AntennaPole
          baseY={0}
          poleHeight={tallPoleHeight}
          poleRadius={tallPoleRadius}
          createMaterial={createMaterial}
          ringFractions={[0.18, 0.5, 0.82]}
        />
      </group>

      <group position={[poleSpacingX + 0.04, mountY + mountHeight / 2, 0]}>
        <AntennaPole
          baseY={0}
          poleHeight={shortPoleHeight}
          poleRadius={shortPoleRadius}
          createMaterial={createMaterial}
          ringFractions={[0.32, 0.74]}
        />
      </group>
    </group>
  );
};
