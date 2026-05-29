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
    <mesh castShadow receiveShadow material={createMaterial(PALETTE.gearWoodMid, 'wood')}>
      <cylinderGeometry args={[radius, radius, thickness, 18]} /></mesh>
    <mesh castShadow receiveShadow position={[0, thickness / 2 + 0.001, 0]} material={createMaterial(PALETTE.gearWoodLight, 'wood')}>
      <cylinderGeometry args={[radius * 0.92, radius * 0.92, 0.005, 18]} /></mesh>
    <mesh castShadow receiveShadow position={[0, -thickness / 2 - 0.001, 0]} material={createMaterial(PALETTE.gearWoodDark, 'wood')}>
      <cylinderGeometry args={[radius * 0.92, radius * 0.92, 0.005, 18]} /></mesh>
    {teeth.map((tooth) => {
      const toothCenter = radius + toothLength / 2 - 0.005;
      return (
        <mesh
          key={tooth.id}
          castShadow
          receiveShadow
          position={[Math.cos(tooth.angle) * toothCenter, 0, Math.sin(tooth.angle) * toothCenter]}
          rotation={[0, -tooth.angle, 0]}
         material={createMaterial(PALETTE.gearWoodMid, 'wood')}>
          <boxGeometry args={[toothLength, thickness * 0.85, toothWidth]} /></mesh>
      );
    })}
    <mesh castShadow receiveShadow material={createMaterial(PALETTE.gearAxle, 'wood')}>
      <cylinderGeometry args={[radius * 0.18, radius * 0.18, thickness + 0.02, 12]} /></mesh>
    <mesh castShadow receiveShadow rotation={[0, Math.PI / 6, 0]} material={createMaterial(PALETTE.gearWoodDark, 'wood')}>
      <boxGeometry args={[radius * 0.05, thickness * 0.92, radius * 1.6]} /></mesh>
    <mesh castShadow receiveShadow rotation={[0, Math.PI / 6 + Math.PI / 3, 0]} material={createMaterial(PALETTE.gearWoodDark, 'wood')}>
      <boxGeometry args={[radius * 0.05, thickness * 0.92, radius * 1.6]} /></mesh>
    <mesh castShadow receiveShadow rotation={[0, Math.PI / 6 + (2 * Math.PI) / 3, 0]} material={createMaterial(PALETTE.gearWoodDark, 'wood')}>
      <boxGeometry args={[radius * 0.05, thickness * 0.92, radius * 1.6]} /></mesh>
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
       material={createMaterial(PALETTE.gearAxle, 'wood')}>
        <cylinderGeometry args={[dim.gearAxleRadius, dim.gearAxleRadius, dim.gearAxleLength, 12]} /></mesh>

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
