import { forwardRef } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { GooFactoryDimensions } from '../geometry';
import type { CreateMaterial } from '../types';

type TankProps = {
  dim: GooFactoryDimensions;
  fillRatio: number;
  createMaterial: CreateMaterial;
};

const LEG_ANGLES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
const ORNAMENT_COUNT = 8;

const renderLegs = (dim: GooFactoryDimensions, createMaterial: CreateMaterial) =>
  LEG_ANGLES.map((angle) => {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const reach = dim.legSpan;
    return (
      <group
        key={`goo-leg-${angle.toFixed(3)}`}
        position={[cosA * reach * 0.55, dim.baseLift - 0.04, sinA * reach * 0.55]}
        rotation={[0, -angle, 0]}
      >
        <mesh castShadow receiveShadow position={[0, 0, 0]} rotation={[0, 0, 0.05]} material={createMaterial(PALETTE.woodLeg, 'wood')}>
          <boxGeometry args={[reach * 1.1, 0.12, 0.18]} /></mesh>
        <mesh castShadow receiveShadow position={[reach * 0.5, -0.04, 0]} material={createMaterial(PALETTE.woodLegDark, 'wood')}>
          <boxGeometry args={[0.18, 0.16, 0.22]} /></mesh>
        <mesh castShadow receiveShadow position={[-reach * 0.05, 0.06, 0]} material={createMaterial(PALETTE.metalBand, 'iron')}>
          <boxGeometry args={[0.08, 0.04, 0.18]} /></mesh>
      </group>
    );
  });

const renderStaves = (dim: GooFactoryDimensions, createMaterial: CreateMaterial) =>
  Array.from({ length: dim.staveCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / dim.staveCount;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const staveWidth = (Math.PI * 2 * dim.tankRadius) / dim.staveCount + 0.02;
    const staveColor = index % 2 === 0 ? PALETTE.woodBarrel : PALETTE.woodBarrelDeep;
    return (
      <mesh
        key={`goo-stave-${angle.toFixed(4)}`}
        castShadow
        receiveShadow
        position={[
          cosA * (dim.tankRadius - 0.02),
          dim.tankBottom + dim.tankHeight / 2,
          sinA * (dim.tankRadius - 0.02),
        ]}
        rotation={[0, -angle + Math.PI / 2, 0]}
       material={createMaterial(staveColor, 'wood')}>
        <boxGeometry args={[staveWidth, dim.tankHeight, 0.075]} /></mesh>
    );
  });

const renderOrnaments = (
  dim: GooFactoryDimensions,
  createMaterial: CreateMaterial,
  bandY: number,
) =>
  Array.from({ length: ORNAMENT_COUNT }, (_, index) => {
    const angle = (Math.PI * 2 * index) / ORNAMENT_COUNT;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const ornamentX = cosA * (dim.tankRadius + 0.012);
    const ornamentZ = sinA * (dim.tankRadius + 0.012);
    return (
      <group
        key={`goo-ornament-${index}`}
        position={[ornamentX, bandY, ornamentZ]}
        rotation={[0, -angle + Math.PI / 2, 0]}
      >
        <mesh castShadow receiveShadow material={createMaterial(PALETTE.ornamentDark, 'iron')}>
          <boxGeometry args={[0.16, 0.07, 0.018]} /></mesh>
        <mesh castShadow receiveShadow position={[0, 0, 0.005]} material={createMaterial(PALETTE.ornamentMid, 'iron')}>
          <boxGeometry args={[0.05, 0.05, 0.025]} /></mesh>
        <mesh
          castShadow
          receiveShadow
          position={[0.055, 0, 0.005]}
          rotation={[0, 0, Math.PI / 4]}
         material={createMaterial(PALETTE.ornamentMid, 'iron')}>
          <boxGeometry args={[0.026, 0.026, 0.025]} /></mesh>
        <mesh
          castShadow
          receiveShadow
          position={[-0.055, 0, 0.005]}
          rotation={[0, 0, Math.PI / 4]}
         material={createMaterial(PALETTE.ornamentMid, 'iron')}>
          <boxGeometry args={[0.026, 0.026, 0.025]} /></mesh>
      </group>
    );
  });

const renderBronzeBody = (dim: GooFactoryDimensions, createMaterial: CreateMaterial) => {
  const midY = dim.tankBottom + dim.tankHeight * 0.5;
  const upperBandY = dim.tankBottom + dim.tankHeight * 0.82;
  const lowerBandY = dim.tankBottom + dim.tankHeight * 0.18;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, midY, 0]} material={createMaterial(PALETTE.bronzeBase, 'iron')}>
        <cylinderGeometry
          args={[dim.tankRadius, dim.tankRadius * 0.98, dim.tankHeight, 26]}
        /></mesh>
      <mesh receiveShadow position={[0, midY, 0]} material={createMaterial(PALETTE.bronzeMid, 'iron')}>
        <cylinderGeometry
          args={[dim.tankRadius * 0.92, dim.tankRadius * 0.92, dim.tankHeight * 0.85, 22]}
        /></mesh>
      <mesh receiveShadow position={[0, dim.tankBottom + dim.tankHeight * 0.32, 0]} material={createMaterial(PALETTE.bronzeShadow, 'iron')}>
        <cylinderGeometry
          args={[dim.tankRadius + 0.005, dim.tankRadius + 0.005, dim.tankHeight * 0.08, 24]}
        /></mesh>

      <mesh castShadow receiveShadow position={[0, lowerBandY, 0]} rotation={[Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.metalBand, 'iron')}>
        <torusGeometry args={[dim.tankRadius + 0.018, 0.045, 10, 28]} /></mesh>
      <mesh castShadow receiveShadow position={[0, upperBandY, 0]} rotation={[Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.metalBand, 'iron')}>
        <torusGeometry args={[dim.tankRadius + 0.018, 0.045, 10, 28]} /></mesh>

      <mesh receiveShadow position={[0, midY, 0]} material={createMaterial(PALETTE.bronzeShadow, 'iron')}>
        <cylinderGeometry
          args={[dim.tankRadius + 0.006, dim.tankRadius + 0.006, 0.16, 26]}
        /></mesh>
      {renderOrnaments(dim, createMaterial, midY)}

      <mesh castShadow receiveShadow position={[0, dim.tankBottom - 0.05, 0]} material={createMaterial(PALETTE.bronzeShadow, 'iron')}>
        <cylinderGeometry args={[dim.tankRadius + 0.04, dim.tankRadius + 0.07, 0.1, 22]} /></mesh>

      <mesh
        castShadow
        receiveShadow
        position={[0, dim.tankTop + 0.005, 0]}
        rotation={[Math.PI / 2, 0, 0]}
       material={createMaterial(PALETTE.bronzeRim, 'iron')}>
        <torusGeometry args={[dim.tankRadius + 0.025, 0.055, 12, 30]} /></mesh>
      <mesh
        receiveShadow
        position={[0, dim.tankTop + 0.005, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
       material={createMaterial(PALETTE.bronzeShadow, 'iron')}>
        <ringGeometry args={[dim.tankRadius * 0.55, dim.tankRadius - 0.02, 26]} /></mesh>

      <mesh receiveShadow position={[0, dim.tankBottom + 0.02, 0]} material={createMaterial(PALETTE.ornamentDark, 'iron')}>
        <cylinderGeometry args={[dim.tankRadius - 0.04, dim.tankRadius - 0.04, 0.04, 22]} /></mesh>
    </group>
  );
};

const renderWoodBody = (dim: GooFactoryDimensions, createMaterial: CreateMaterial) => (
  <group>
    <mesh castShadow receiveShadow position={[0, dim.tankBottom - 0.04, 0]} material={createMaterial(PALETTE.woodBarrelDeep, 'wood')}>
      <cylinderGeometry args={[dim.tankRadius + 0.04, dim.tankRadius + 0.06, 0.08, 18]} /></mesh>
    <mesh castShadow receiveShadow position={[0, dim.tankBottom + 0.04, 0]} material={createMaterial(PALETTE.woodBarrelDeep, 'wood')}>
      <cylinderGeometry args={[dim.tankRadius - 0.03, dim.tankRadius - 0.03, 0.06, 18]} /></mesh>

    {renderStaves(dim, createMaterial)}

    <mesh
      castShadow
      receiveShadow
      position={[0, dim.tankBottom + 0.1, 0]}
      rotation={[Math.PI / 2, 0, 0]}
     material={createMaterial(PALETTE.metalBand, 'iron')}>
      <torusGeometry args={[dim.tankRadius + 0.05, 0.04, 8, 24]} /></mesh>
    <mesh
      castShadow
      receiveShadow
      position={[0, dim.tankTop - 0.06, 0]}
      rotation={[Math.PI / 2, 0, 0]}
     material={createMaterial(PALETTE.metalBand, 'iron')}>
      <torusGeometry args={[dim.tankRadius + 0.05, 0.045, 8, 24]} /></mesh>
  </group>
);

export const Tank = forwardRef<Group, TankProps>(
  ({ dim, fillRatio, createMaterial }, gooSurfaceRef) => {
    const tankPuddleScale = 0.35 + fillRatio * 0.9;
    const isBronze = dim.tankMaterial === 'bronze';
    return (
      <group>
        <mesh receiveShadow position={[0.12, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.gooDeep, 'goo')}>
          <circleGeometry args={[dim.tankRadius * (1.05 + fillRatio * 0.35), 28]} /></mesh>
        <mesh
          receiveShadow
          position={[0.18, 0.018, 0.05]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[tankPuddleScale, tankPuddleScale, tankPuddleScale]}
         material={createMaterial(PALETTE.goo, 'goo')}>
          <circleGeometry args={[dim.tankRadius * 0.95, 24]} /></mesh>

        {renderLegs(dim, createMaterial)}

        {isBronze
          ? renderBronzeBody(dim, createMaterial)
          : renderWoodBody(dim, createMaterial)}

        <mesh receiveShadow position={[0, dim.tankBottom + 0.04, 0]} material={createMaterial(PALETTE.gooDeep, 'goo')}>
          <cylinderGeometry args={[dim.tankRadius - 0.06, dim.tankRadius - 0.06, 0.05, 18]} /></mesh>

        <group ref={gooSurfaceRef} position={[0, dim.tankBottom + 0.08, 0]}>
          <mesh receiveShadow material={createMaterial(PALETTE.goo, 'goo')}>
            <cylinderGeometry args={[dim.tankRadius - 0.06, dim.tankRadius - 0.06, 0.06, 18]} /></mesh>
          <mesh receiveShadow position={[0, 0.035, 0]} material={createMaterial(PALETTE.gooBright, 'goo')}>
            <cylinderGeometry args={[dim.tankRadius - 0.08, dim.tankRadius - 0.08, 0.02, 18]} /></mesh>
        </group>
      </group>
    );
  },
);

Tank.displayName = 'Tank';
