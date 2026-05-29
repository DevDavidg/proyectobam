import { forwardRef } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { GooFactoryDimensions, PumpSlot } from '../geometry';
import type { CreateMaterial } from '../types';

type PumpAssemblyProps = {
  dim: GooFactoryDimensions;
  slot: PumpSlot;
  createMaterial: CreateMaterial;
  scaleFactor?: number;
};

const STANDARD_BODY = { bodyRadius: 0.13, capRadius: 0.155, capHeight: 0.05 };
const LARGE_BODY = { bodyRadius: 0.2, capRadius: 0.28, capHeight: 0.06 };

export const PumpAssembly = forwardRef<Group, PumpAssemblyProps>(
  ({ dim, slot, createMaterial, scaleFactor = 1 }, pistonRef) => {
    const pumpScale = slot.scale * scaleFactor;
    const sizes = slot.style === 'large' ? LARGE_BODY : STANDARD_BODY;
    return (
      <group position={[slot.x, 0, slot.z]} scale={[pumpScale, 1, pumpScale]}>
        <mesh
          castShadow
          receiveShadow
          position={[0, (dim.pumpShaftBaseY + dim.pumpShaftTopY) / 2, 0]}
        >
          <cylinderGeometry
            args={[
              dim.pumpShaftRadius,
              dim.pumpShaftRadius,
              dim.pumpShaftTopY - dim.pumpShaftBaseY,
              14,
            ]}
          />
          {createMaterial(PALETTE.pump, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, dim.pumpShaftBaseY + 0.02, 0]}>
          <cylinderGeometry
            args={[dim.pumpShaftRadius + 0.04, dim.pumpShaftRadius + 0.06, 0.05, 14]}
          />
          {createMaterial(PALETTE.pumpHighlight, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, dim.tankTop - 0.02, 0]}>
          <cylinderGeometry
            args={[dim.pumpShaftRadius + 0.05, dim.pumpShaftRadius + 0.05, 0.04, 14]}
          />
          {createMaterial(PALETTE.pumpHighlight, 'iron')}
        </mesh>

        <group position={[0, dim.pumpBodyBaseY, 0]}>
          <mesh castShadow receiveShadow position={[0, dim.pumpBodyHeight * 0.5, 0]}>
            <cylinderGeometry
              args={[sizes.bodyRadius, sizes.bodyRadius + 0.01, dim.pumpBodyHeight, 14]}
            />
            {createMaterial(PALETTE.pump, 'iron')}
          </mesh>
          <mesh
            castShadow
            receiveShadow
            position={[0, dim.pumpBodyHeight - sizes.capHeight / 2, 0]}
          >
            <cylinderGeometry
              args={[sizes.capRadius, sizes.bodyRadius, sizes.capHeight, 16]}
            />
            {createMaterial(PALETTE.pumpHighlight, 'iron')}
          </mesh>
        </group>

        <group ref={pistonRef} position={[0, dim.pistonRestY, 0]}>
          <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.14, 10]} />
            {createMaterial(PALETTE.pumpRod, 'iron')}
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.1, 0.085, 0.07, 12]} />
            {createMaterial(PALETTE.pumpHighlight, 'iron')}
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.21, 0]}>
            <sphereGeometry args={[0.07, 12, 10]} />
            {createMaterial(PALETTE.pump, 'iron')}
          </mesh>
        </group>
      </group>
    );
  },
);

PumpAssembly.displayName = 'PumpAssembly';

type WheelProps = {
  dim: GooFactoryDimensions;
  createMaterial: CreateMaterial;
};

export const Wheel = forwardRef<Group, WheelProps>(({ dim, createMaterial }, wheelRef) => (
  <group>
    <mesh
      castShadow
      receiveShadow
      position={[(0.14 + dim.driveCenterX) / 2, dim.driveCenterY, 0]}
    >
      <boxGeometry args={[dim.driveCenterX - 0.14, 0.06, 0.06]} />
      {createMaterial(PALETTE.pump, 'iron')}
    </mesh>
    <mesh castShadow receiveShadow position={[0.14, dim.driveCenterY, 0]}>
      <boxGeometry args={[0.08, 0.12, 0.12]} />
      {createMaterial(PALETTE.pumpHighlight, 'iron')}
    </mesh>

    <group position={[dim.driveCenterX, dim.driveCenterY, 0]}>
      <mesh
        castShadow
        receiveShadow
        position={[-0.05, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.025, 0.025, 0.1, 10]} />
        {createMaterial(PALETTE.pumpRod, 'iron')}
      </mesh>
      <group ref={wheelRef}>
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[dim.wheelRadius, dim.wheelRadius, 0.045, 24]} />
          {createMaterial(PALETTE.wheel, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[dim.wheelRadius - 0.018, 0.02, 8, 24]} />
          {createMaterial(PALETTE.wheelHub, 'iron')}
        </mesh>
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((spokeAngle) => (
          <mesh
            key={`goo-wheel-spoke-${spokeAngle.toFixed(3)}`}
            castShadow
            receiveShadow
            position={[0, 0, 0]}
            rotation={[spokeAngle, 0, 0]}
          >
            <boxGeometry args={[0.05, dim.wheelRadius * 1.7, 0.025]} />
            {createMaterial(PALETTE.wheelHub, 'iron')}
          </mesh>
        ))}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          {createMaterial(PALETTE.pumpHighlight, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, dim.pinRadius, 0]}>
          <cylinderGeometry args={[0.024, 0.024, 0.08, 10]} />
          {createMaterial(PALETTE.pumpRod, 'iron')}
        </mesh>
      </group>
    </group>
  </group>
));

Wheel.displayName = 'Wheel';
