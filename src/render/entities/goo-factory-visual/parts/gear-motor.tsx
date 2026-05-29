import { forwardRef } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { GooFactoryDimensions } from '../geometry';
import type { CreateMaterial } from '../types';

type GearMotorProps = {
  dim: GooFactoryDimensions;
  createMaterial: CreateMaterial;
};

const GEAR_TEETH = 14;
const BASE_BOLT_OFFSETS: ReadonlyArray<[number, number]> = [
  [-0.18, -0.13],
  [0.18, -0.13],
  [-0.18, 0.13],
  [0.18, 0.13],
];

export const GearMotor = forwardRef<Group, GearMotorProps>(({ dim, createMaterial }, gearRef) => {
  const baseY = dim.motorBaseY;
  const motorOffsetX = 0.06;
  const motorBodyY = dim.motorBodyY;
  const motorRadius = dim.motorRadius;
  const motorLength = 0.36;
  const gearRadius = 0.22;
  const gearThickness = 0.06;
  const gearX = motorOffsetX - motorLength / 2 - 0.05;
  const pedestalTopY = motorBodyY - motorRadius;
  const pedestalHeight = Math.max(0.08, pedestalTopY - (baseY + 0.07));
  const pedestalCenterY = (baseY + 0.07 + pedestalTopY) / 2;
  return (
    <group position={[dim.driveCenterX, 0, dim.driveCenterZ]}>
      <mesh castShadow receiveShadow position={[0, baseY, 0]} material={createMaterial(PALETTE.motorBase, 'iron')}>
        <boxGeometry args={[0.46, 0.14, 0.34]} /></mesh>
      <mesh castShadow receiveShadow position={[0, baseY + 0.075, 0]} material={createMaterial(PALETTE.motorBaseTop, 'iron')}>
        <boxGeometry args={[0.42, 0.02, 0.3]} /></mesh>
      {BASE_BOLT_OFFSETS.map(([bx, bz]) => (
        <mesh
          key={`gear-base-bolt-${bx}-${bz}`}
          castShadow
          receiveShadow
          position={[bx, baseY + 0.087, bz]}
         material={createMaterial(PALETTE.pumpRod, 'iron')}>
          <cylinderGeometry args={[0.018, 0.018, 0.012, 8]} /></mesh>
      ))}

      <mesh castShadow receiveShadow position={[motorOffsetX, pedestalCenterY, 0]} material={createMaterial(PALETTE.motorBase, 'iron')}>
        <boxGeometry args={[0.22, pedestalHeight, 0.24]} /></mesh>
      <mesh castShadow receiveShadow position={[motorOffsetX, pedestalTopY, 0]} material={createMaterial(PALETTE.motorBaseTop, 'iron')}>
        <boxGeometry args={[0.26, 0.04, 0.28]} /></mesh>

      <mesh
        castShadow
        receiveShadow
        position={[motorOffsetX, motorBodyY, 0]}
        rotation={[0, 0, Math.PI / 2]}
       material={createMaterial(PALETTE.pump, 'iron')}>
        <cylinderGeometry args={[motorRadius, motorRadius, motorLength, 20]} /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[motorOffsetX + motorLength / 2, motorBodyY, 0]}
        rotation={[0, 0, Math.PI / 2]}
       material={createMaterial(PALETTE.pumpHighlight, 'iron')}>
        <cylinderGeometry args={[motorRadius + 0.01, motorRadius + 0.01, 0.04, 20]} /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[motorOffsetX - motorLength / 2, motorBodyY, 0]}
        rotation={[0, 0, Math.PI / 2]}
       material={createMaterial(PALETTE.pumpHighlight, 'iron')}>
        <cylinderGeometry args={[motorRadius + 0.01, motorRadius + 0.01, 0.04, 20]} /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[motorOffsetX, motorBodyY, motorRadius + 0.001]}
        rotation={[0, 0, Math.PI / 2]}
       material={createMaterial(PALETTE.pumpHighlight, 'iron')}>
        <torusGeometry args={[motorRadius * 0.6, 0.01, 6, 18]} /></mesh>

      <mesh
        castShadow
        receiveShadow
        position={[motorOffsetX + 0.02, motorBodyY + 0.16, 0]}
       material={createMaterial(PALETTE.pumpHighlight, 'iron')}>
        <boxGeometry args={[0.1, 0.08, 0.16]} /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[motorOffsetX + 0.02, motorBodyY + 0.2, 0.08]}
       material={createMaterial(PALETTE.pumpRod, 'iron')}>
        <cylinderGeometry args={[0.012, 0.012, 0.04, 8]} /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[motorOffsetX + 0.02, motorBodyY + 0.2, -0.08]}
       material={createMaterial(PALETTE.pumpRod, 'iron')}>
        <cylinderGeometry args={[0.012, 0.012, 0.04, 8]} /></mesh>

      <mesh
        castShadow
        receiveShadow
        position={[gearX + 0.045, motorBodyY, 0]}
        rotation={[0, 0, Math.PI / 2]}
       material={createMaterial(PALETTE.pumpRod, 'iron')}>
        <cylinderGeometry args={[0.022, 0.022, 0.1, 10]} /></mesh>

      <group ref={gearRef} position={[gearX, motorBodyY, 0]}>
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.gearTeeth, 'iron')}>
          <cylinderGeometry args={[gearRadius * 0.8, gearRadius * 0.8, gearThickness, 24]} /></mesh>
        {Array.from({ length: GEAR_TEETH }, (_, index) => {
          const angle = (index / GEAR_TEETH) * Math.PI * 2;
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);
          return (
            <mesh
              key={`gear-tooth-${index}`}
              castShadow
              receiveShadow
              position={[0, cosA * gearRadius * 0.9, sinA * gearRadius * 0.9]}
              rotation={[angle, 0, 0]}
             material={createMaterial(PALETTE.gearTeeth, 'iron')}>
              <boxGeometry args={[gearThickness, 0.075, 0.06]} /></mesh>
          );
        })}
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.gearRim, 'iron')}>
          <torusGeometry args={[gearRadius * 0.8, 0.012, 8, 26]} /></mesh>
        <mesh castShadow receiveShadow position={[0.005, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.gearHub, 'iron')}>
          <cylinderGeometry args={[0.055, 0.055, 0.08, 14]} /></mesh>
        <mesh castShadow receiveShadow position={[-0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.pumpRod, 'iron')}>
          <cylinderGeometry args={[0.02, 0.02, 0.02, 10]} /></mesh>
      </group>
    </group>
  );
});

GearMotor.displayName = 'GearMotor';
