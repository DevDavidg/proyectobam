import { Fragment } from 'react';
import { PALETTE } from '../palette';
import type { MaterialFactory, TownHallDimensions } from '../types';

type FunnelUpgradesProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
  weight: number;
  segments?: number;
};

const DEFAULT_SEGMENTS = 4;

export const FunnelUpgrades = ({
  dim,
  createMaterial,
  weight,
  segments = DEFAULT_SEGMENTS,
}: FunnelUpgradesProps) => {
  const SEGMENTS = segments;

  if (weight <= 0.001) {
    return null;
  }

  const stemTopY = dim.roofTop + dim.funnelStemHeight;
  const funnelTopY = stemTopY + dim.funnelHeight;

  const crownHeight = 0.12;
  const crownY = funnelTopY + 0.08 + crownHeight / 2;
  const crownTopRadius = dim.funnelTopRadius * 1.18;
  const crownBottomRadius = dim.funnelTopRadius * 1.1;

  const collarHeight = 0.045;
  const collarY = funnelTopY + 0.05;

  const wideBandRadius = dim.funnelTopRadius * 1.08;
  const wideBandY = stemTopY + dim.funnelHeight * 0.92;

  const supportLegLength = dim.funnelHeight * 0.65;
  const supportRadius = 0.024;
  const supportY = stemTopY + supportLegLength / 2 + 0.04;

  return (
    <group scale={[1, weight, 1]} position={[0, (funnelTopY + 0.4) * (1 - weight) * 0.05, 0]}>
      <mesh castShadow receiveShadow position={[0, collarY, 0]} material={createMaterial(PALETTE.reinforcementSteelDark, 'iron')}>
        <cylinderGeometry args={[dim.funnelTopRadius * 1.05, dim.funnelTopRadius * 1.0, collarHeight, SEGMENTS, 1, true]} /></mesh>

      <mesh castShadow receiveShadow position={[0, crownY, 0]} material={createMaterial(PALETTE.reinforcementSteel, 'iron')}>
        <cylinderGeometry args={[crownTopRadius, crownBottomRadius, crownHeight, SEGMENTS, 1, true]} /></mesh>
      <mesh position={[0, crownY + crownHeight / 2, 0]} material={createMaterial(PALETTE.reinforcementSteelLight, 'iron')}>
        <cylinderGeometry args={[crownTopRadius * 1.04, crownTopRadius * 1.04, 0.03, SEGMENTS, 1, true]} /></mesh>
      <mesh position={[0, crownY + crownHeight / 2 + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.reinforcementSteelDark, 'iron')}>
        <ringGeometry args={[dim.funnelTopRadius * 0.85, crownTopRadius * 1.04, SEGMENTS, 1]} /></mesh>

      <mesh position={[0, wideBandY, 0]} material={createMaterial(PALETTE.funnelBand, 'iron')}>
        <cylinderGeometry args={[wideBandRadius, wideBandRadius, 0.03, SEGMENTS, 1, true]} /></mesh>

      {Array.from({ length: SEGMENTS }).map((_, idx) => {
        const angle = (idx / SEGMENTS) * Math.PI * 2 + Math.PI / SEGMENTS;
        const x = Math.cos(angle) * crownTopRadius * 0.9;
        const z = Math.sin(angle) * crownTopRadius * 0.9;
        return (
          <Fragment key={`crown-bolt-${idx}`}>
            <mesh
              castShadow
              position={[x, crownY + crownHeight / 2 + 0.012, z]}
             material={createMaterial(PALETTE.boltDark, 'iron')}>
              <cylinderGeometry args={[0.024, 0.024, 0.04, 8]} /></mesh>
            <mesh
              position={[x - 0.005, crownY + crownHeight / 2 + 0.034, z]}
             material={createMaterial(PALETTE.boltShine, 'iron')}>
              <sphereGeometry args={[0.012, 6, 6]} /></mesh>
          </Fragment>
        );
      })}

      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => {
        const offset = dim.funnelBaseRadius * 0.9;
        const xBottom = Math.cos(angle) * offset;
        const zBottom = Math.sin(angle) * offset;
        const xTop = Math.cos(angle) * (offset + dim.funnelHeight * 0.18);
        const zTop = Math.sin(angle) * (offset + dim.funnelHeight * 0.18);
        const dx = xTop - xBottom;
        const dz = zTop - zBottom;
        const length = Math.hypot(dx, dz, supportLegLength);
        const rotY = Math.atan2(dz, dx);
        const tilt = Math.atan2(Math.hypot(dx, dz), supportLegLength);
        return (
          <group
            key={`funnel-support-${idx}`}
            position={[(xBottom + xTop) / 2, supportY, (zBottom + zTop) / 2]}
            rotation={[0, -rotY, tilt]}
          >
            <mesh castShadow receiveShadow material={createMaterial(PALETTE.reinforcementSteelDark, 'iron')}>
              <cylinderGeometry args={[supportRadius, supportRadius, length, 6]} /></mesh>
          </group>
        );
      })}
    </group>
  );
};
