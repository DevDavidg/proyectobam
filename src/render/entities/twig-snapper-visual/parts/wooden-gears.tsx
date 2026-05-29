import type { Ref } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { GearTooth, MaterialFactory, TwigSnapperDimensions } from '../types';

type WoodenGearsProps = {
  dim: TwigSnapperDimensions;
  scale: number;
  createMaterial: MaterialFactory;
  bigGearRef: Ref<Group>;
  smallGearRef: Ref<Group>;
};

type SingleGearProps = {
  radius: number;
  thickness: number;
  teeth: GearTooth[];
  toothLength: number;
  toothWidth: number;
  createMaterial: MaterialFactory;
};

const Gear = ({ radius, thickness, teeth, toothLength, toothWidth, createMaterial }: SingleGearProps) => (
  <group rotation={[0, 0, Math.PI / 2]}>
    <mesh castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, thickness, 18]} />
      {createMaterial(PALETTE.gearWoodMid, 'wood')}
    </mesh>
    <mesh castShadow receiveShadow position={[0, thickness / 2 + 0.001, 0]}>
      <cylinderGeometry args={[radius * 0.92, radius * 0.92, 0.005, 18]} />
      {createMaterial(PALETTE.gearWoodLight, 'wood')}
    </mesh>
    <mesh castShadow receiveShadow position={[0, -thickness / 2 - 0.001, 0]}>
      <cylinderGeometry args={[radius * 0.92, radius * 0.92, 0.005, 18]} />
      {createMaterial(PALETTE.gearWoodDark, 'wood')}
    </mesh>
    {teeth.map((tooth) => {
      const toothCenter = radius + toothLength / 2 - 0.005;
      return (
        <mesh
          key={tooth.id}
          castShadow
          receiveShadow
          position={[Math.cos(tooth.angle) * toothCenter, 0, Math.sin(tooth.angle) * toothCenter]}
          rotation={[0, -tooth.angle, 0]}
        >
          <boxGeometry args={[toothLength, thickness * 0.85, toothWidth]} />
          {createMaterial(PALETTE.gearWoodMid, 'wood')}
        </mesh>
      );
    })}
    <mesh castShadow receiveShadow>
      <cylinderGeometry args={[radius * 0.18, radius * 0.18, thickness + 0.02, 12]} />
      {createMaterial(PALETTE.gearAxle, 'wood')}
    </mesh>
    <mesh castShadow receiveShadow rotation={[0, Math.PI / 6, 0]}>
      <boxGeometry args={[radius * 0.05, thickness * 0.92, radius * 1.6]} />
      {createMaterial(PALETTE.gearWoodDark, 'wood')}
    </mesh>
    <mesh castShadow receiveShadow rotation={[0, Math.PI / 6 + Math.PI / 3, 0]}>
      <boxGeometry args={[radius * 0.05, thickness * 0.92, radius * 1.6]} />
      {createMaterial(PALETTE.gearWoodDark, 'wood')}
    </mesh>
    <mesh castShadow receiveShadow rotation={[0, Math.PI / 6 + (2 * Math.PI) / 3, 0]}>
      <boxGeometry args={[radius * 0.05, thickness * 0.92, radius * 1.6]} />
      {createMaterial(PALETTE.gearWoodDark, 'wood')}
    </mesh>
  </group>
);

export const WoodenGears = ({
  dim,
  scale,
  createMaterial,
  bigGearRef,
  smallGearRef,
}: WoodenGearsProps) => {
  if (scale < 0.01) return null;
  const appliedScale = Math.max(0.0001, scale);
  return (
    <group>
      <mesh
        castShadow
        receiveShadow
        position={[0, dim.gearAxleY, dim.gearAxleZ]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[1, appliedScale, 1]}
      >
        <cylinderGeometry args={[dim.gearAxleRadius, dim.gearAxleRadius, dim.gearAxleLength, 12]} />
        {createMaterial(PALETTE.gearAxle, 'wood')}
      </mesh>

      <group
        ref={bigGearRef}
        position={[dim.bigGearX, dim.gearAxleY, dim.gearAxleZ]}
        scale={[appliedScale, appliedScale, appliedScale]}
      >
        <Gear
          radius={dim.bigGearRadius}
          thickness={dim.bigGearThickness}
          teeth={dim.bigGearTeeth}
          toothLength={0.045}
          toothWidth={0.05}
          createMaterial={createMaterial}
        />
      </group>

      <group
        ref={smallGearRef}
        position={[dim.smallGearX, dim.gearAxleY, dim.smallGearZ]}
        scale={[appliedScale, appliedScale, appliedScale]}
      >
        <Gear
          radius={dim.smallGearRadius}
          thickness={dim.smallGearThickness}
          teeth={dim.smallGearTeeth}
          toothLength={0.04}
          toothWidth={0.045}
          createMaterial={createMaterial}
        />
      </group>
    </group>
  );
};
