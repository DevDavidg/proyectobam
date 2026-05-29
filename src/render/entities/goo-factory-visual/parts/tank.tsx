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
        <mesh castShadow receiveShadow position={[0, 0, 0]} rotation={[0, 0, 0.05]}>
          <boxGeometry args={[reach * 1.1, 0.12, 0.18]} />
          {createMaterial(PALETTE.woodLeg, 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[reach * 0.5, -0.04, 0]}>
          <boxGeometry args={[0.18, 0.16, 0.22]} />
          {createMaterial(PALETTE.woodLegDark, 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[-reach * 0.05, 0.06, 0]}>
          <boxGeometry args={[0.08, 0.04, 0.18]} />
          {createMaterial(PALETTE.metalBand, 'iron')}
        </mesh>
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
      >
        <boxGeometry args={[staveWidth, dim.tankHeight, 0.075]} />
        {createMaterial(staveColor, 'wood')}
      </mesh>
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
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.16, 0.07, 0.018]} />
          {createMaterial(PALETTE.ornamentDark, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0, 0.005]}>
          <boxGeometry args={[0.05, 0.05, 0.025]} />
          {createMaterial(PALETTE.ornamentMid, 'iron')}
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[0.055, 0, 0.005]}
          rotation={[0, 0, Math.PI / 4]}
        >
          <boxGeometry args={[0.026, 0.026, 0.025]} />
          {createMaterial(PALETTE.ornamentMid, 'iron')}
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[-0.055, 0, 0.005]}
          rotation={[0, 0, Math.PI / 4]}
        >
          <boxGeometry args={[0.026, 0.026, 0.025]} />
          {createMaterial(PALETTE.ornamentMid, 'iron')}
        </mesh>
      </group>
    );
  });

const renderBronzeBody = (dim: GooFactoryDimensions, createMaterial: CreateMaterial) => {
  const midY = dim.tankBottom + dim.tankHeight * 0.5;
  const upperBandY = dim.tankBottom + dim.tankHeight * 0.82;
  const lowerBandY = dim.tankBottom + dim.tankHeight * 0.18;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, midY, 0]}>
        <cylinderGeometry
          args={[dim.tankRadius, dim.tankRadius * 0.98, dim.tankHeight, 26]}
        />
        {createMaterial(PALETTE.bronzeBase, 'iron')}
      </mesh>
      <mesh receiveShadow position={[0, midY, 0]}>
        <cylinderGeometry
          args={[dim.tankRadius * 0.92, dim.tankRadius * 0.92, dim.tankHeight * 0.85, 22]}
        />
        {createMaterial(PALETTE.bronzeMid, 'iron')}
      </mesh>
      <mesh receiveShadow position={[0, dim.tankBottom + dim.tankHeight * 0.32, 0]}>
        <cylinderGeometry
          args={[dim.tankRadius + 0.005, dim.tankRadius + 0.005, dim.tankHeight * 0.08, 24]}
        />
        {createMaterial(PALETTE.bronzeShadow, 'iron')}
      </mesh>

      <mesh castShadow receiveShadow position={[0, lowerBandY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[dim.tankRadius + 0.018, 0.045, 10, 28]} />
        {createMaterial(PALETTE.metalBand, 'iron')}
      </mesh>
      <mesh castShadow receiveShadow position={[0, upperBandY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[dim.tankRadius + 0.018, 0.045, 10, 28]} />
        {createMaterial(PALETTE.metalBand, 'iron')}
      </mesh>

      <mesh receiveShadow position={[0, midY, 0]}>
        <cylinderGeometry
          args={[dim.tankRadius + 0.006, dim.tankRadius + 0.006, 0.16, 26]}
        />
        {createMaterial(PALETTE.bronzeShadow, 'iron')}
      </mesh>
      {renderOrnaments(dim, createMaterial, midY)}

      <mesh castShadow receiveShadow position={[0, dim.tankBottom - 0.05, 0]}>
        <cylinderGeometry args={[dim.tankRadius + 0.04, dim.tankRadius + 0.07, 0.1, 22]} />
        {createMaterial(PALETTE.bronzeShadow, 'iron')}
      </mesh>

      <mesh
        castShadow
        receiveShadow
        position={[0, dim.tankTop + 0.005, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[dim.tankRadius + 0.025, 0.055, 12, 30]} />
        {createMaterial(PALETTE.bronzeRim, 'iron')}
      </mesh>
      <mesh
        receiveShadow
        position={[0, dim.tankTop + 0.005, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[dim.tankRadius * 0.55, dim.tankRadius - 0.02, 26]} />
        {createMaterial(PALETTE.bronzeShadow, 'iron')}
      </mesh>

      <mesh receiveShadow position={[0, dim.tankBottom + 0.02, 0]}>
        <cylinderGeometry args={[dim.tankRadius - 0.04, dim.tankRadius - 0.04, 0.04, 22]} />
        {createMaterial(PALETTE.ornamentDark, 'iron')}
      </mesh>
    </group>
  );
};

const renderWoodBody = (dim: GooFactoryDimensions, createMaterial: CreateMaterial) => (
  <group>
    <mesh castShadow receiveShadow position={[0, dim.tankBottom - 0.04, 0]}>
      <cylinderGeometry args={[dim.tankRadius + 0.04, dim.tankRadius + 0.06, 0.08, 18]} />
      {createMaterial(PALETTE.woodBarrelDeep, 'wood')}
    </mesh>
    <mesh castShadow receiveShadow position={[0, dim.tankBottom + 0.04, 0]}>
      <cylinderGeometry args={[dim.tankRadius - 0.03, dim.tankRadius - 0.03, 0.06, 18]} />
      {createMaterial(PALETTE.woodBarrelDeep, 'wood')}
    </mesh>

    {renderStaves(dim, createMaterial)}

    <mesh
      castShadow
      receiveShadow
      position={[0, dim.tankBottom + 0.1, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <torusGeometry args={[dim.tankRadius + 0.05, 0.04, 8, 24]} />
      {createMaterial(PALETTE.metalBand, 'iron')}
    </mesh>
    <mesh
      castShadow
      receiveShadow
      position={[0, dim.tankTop - 0.06, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <torusGeometry args={[dim.tankRadius + 0.05, 0.045, 8, 24]} />
      {createMaterial(PALETTE.metalBand, 'iron')}
    </mesh>
  </group>
);

export const Tank = forwardRef<Group, TankProps>(
  ({ dim, fillRatio, createMaterial }, gooSurfaceRef) => {
    const tankPuddleScale = 0.35 + fillRatio * 0.9;
    const isBronze = dim.tankMaterial === 'bronze';
    return (
      <group>
        <mesh receiveShadow position={[0.12, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[dim.tankRadius * (1.05 + fillRatio * 0.35), 28]} />
          {createMaterial(PALETTE.gooDeep, 'goo')}
        </mesh>
        <mesh
          receiveShadow
          position={[0.18, 0.018, 0.05]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[tankPuddleScale, tankPuddleScale, tankPuddleScale]}
        >
          <circleGeometry args={[dim.tankRadius * 0.95, 24]} />
          {createMaterial(PALETTE.goo, 'goo')}
        </mesh>

        {renderLegs(dim, createMaterial)}

        {isBronze
          ? renderBronzeBody(dim, createMaterial)
          : renderWoodBody(dim, createMaterial)}

        <mesh receiveShadow position={[0, dim.tankBottom + 0.04, 0]}>
          <cylinderGeometry args={[dim.tankRadius - 0.06, dim.tankRadius - 0.06, 0.05, 18]} />
          {createMaterial(PALETTE.gooDeep, 'goo')}
        </mesh>

        <group ref={gooSurfaceRef} position={[0, dim.tankBottom + 0.08, 0]}>
          <mesh receiveShadow>
            <cylinderGeometry args={[dim.tankRadius - 0.06, dim.tankRadius - 0.06, 0.06, 18]} />
            {createMaterial(PALETTE.goo, 'goo')}
          </mesh>
          <mesh receiveShadow position={[0, 0.035, 0]}>
            <cylinderGeometry args={[dim.tankRadius - 0.08, dim.tankRadius - 0.08, 0.02, 18]} />
            {createMaterial(PALETTE.gooBright, 'goo')}
          </mesh>
        </group>
      </group>
    );
  },
);

Tank.displayName = 'Tank';
