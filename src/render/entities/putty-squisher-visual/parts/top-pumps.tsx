import type { RefObject } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { MaterialFactory, PuttySquisherDimensions } from '../types';

type TopPumpsProps = {
  dim: PuttySquisherDimensions;
  createMaterial: MaterialFactory;
  rootRef: RefObject<Group | null>;
  leftPistonRef: RefObject<Group | null>;
  rightPistonRef: RefObject<Group | null>;
};

type SinglePumpProps = {
  dim: PuttySquisherDimensions;
  createMaterial: MaterialFactory;
  pistonRef: RefObject<Group | null>;
  positionX: number;
  positionZ: number;
};

const SinglePump = ({ dim, createMaterial, pistonRef, positionX, positionZ }: SinglePumpProps) => {
  const shaftLength = dim.pumpShaftTopY - dim.pumpShaftBaseY;
  const shaftCenterY = (dim.pumpShaftBaseY + dim.pumpShaftTopY) / 2;
  const socketY = dim.cubeTopY + 0.001;

  return (
    <group position={[positionX, 0, positionZ]}>
      <mesh receiveShadow position={[0, socketY - dim.pumpSocketDepth * 0.5, 0]} material={createMaterial(PALETTE.pumpSocket, 'iron')}>
        <cylinderGeometry
          args={[
            dim.pumpSocketRadius,
            dim.pumpSocketRadius * 0.92,
            dim.pumpSocketDepth,
            18,
          ]}
        /></mesh>

      <mesh receiveShadow position={[0, socketY + 0.002, 0]} material={createMaterial(PALETTE.pumpSocketRim, 'iron')}>
        <torusGeometry args={[dim.pumpSocketRadius * 0.96, 0.012, 8, 24]} /></mesh>

      <group position={[0, socketY, 0]}>
        <mesh castShadow receiveShadow position={[0, dim.pumpBodyHeight * 0.5, 0]} material={createMaterial(PALETTE.pumpBody, 'iron')}>
          <cylinderGeometry
            args={[dim.pumpBodyRadius, dim.pumpBodyRadius * 1.04, dim.pumpBodyHeight, 18]}
          /></mesh>
        <mesh castShadow receiveShadow position={[0, dim.pumpBodyHeight - 0.012, 0]} material={createMaterial(PALETTE.pumpBodyShine, 'iron')}>
          <cylinderGeometry
            args={[dim.pumpBodyRadius * 1.06, dim.pumpBodyRadius, 0.04, 18]}
          /></mesh>
        <mesh castShadow receiveShadow position={[0, 0.018, 0]} material={createMaterial(PALETTE.pumpBodyDark, 'iron')}>
          <cylinderGeometry
            args={[dim.pumpBodyRadius * 1.05, dim.pumpBodyRadius * 1.08, 0.03, 18]}
          /></mesh>
      </group>

      <mesh castShadow receiveShadow position={[0, shaftCenterY, 0]} material={createMaterial(PALETTE.pumpShaft, 'iron')}>
        <cylinderGeometry args={[dim.pumpShaftRadius, dim.pumpShaftRadius, shaftLength, 14]} /></mesh>
      <mesh castShadow receiveShadow position={[dim.pumpShaftRadius * 0.4, shaftCenterY, 0]} material={createMaterial(PALETTE.pumpShaftShine, 'iron')}>
        <boxGeometry args={[dim.pumpShaftRadius * 0.18, shaftLength * 0.94, dim.pumpShaftRadius * 1.8]} /></mesh>

      <group ref={pistonRef} position={[0, dim.pumpShaftTopY, 0]}>
        <mesh castShadow receiveShadow position={[0, -dim.pumpHeadThickness * 0.45, 0]} material={createMaterial(PALETTE.pumpRod, 'iron')}>
          <cylinderGeometry
            args={[dim.pumpShaftRadius * 1.6, dim.pumpShaftRadius * 1.4, 0.05, 14]}
          /></mesh>

        <mesh castShadow receiveShadow position={[0, dim.pumpHeadThickness * 0.5, 0]} material={createMaterial(PALETTE.pumpHead, 'iron')}>
          <cylinderGeometry
            args={[dim.pumpHeadRadius, dim.pumpHeadRadius * 0.96, dim.pumpHeadThickness, 24]}
          /></mesh>
        <mesh castShadow receiveShadow position={[0, dim.pumpHeadThickness - 0.005, 0]} material={createMaterial(PALETTE.pumpHeadShine, 'iron')}>
          <cylinderGeometry
            args={[dim.pumpHeadRadius * 1.02, dim.pumpHeadRadius * 0.98, 0.018, 24]}
          /></mesh>
        <mesh receiveShadow position={[0, 0.005, 0]} material={createMaterial(PALETTE.pumpHeadEdge, 'iron')}>
          <cylinderGeometry
            args={[dim.pumpHeadRadius * 1.04, dim.pumpHeadRadius, 0.018, 24]}
          /></mesh>
        <mesh
          receiveShadow
          position={[dim.pumpHeadRadius * 0.42, dim.pumpHeadThickness * 0.5, 0]}
         material={createMaterial(PALETTE.pumpHeadShine, 'iron')}>
          <boxGeometry
            args={[dim.pumpHeadRadius * 0.18, dim.pumpHeadThickness * 0.7, dim.pumpHeadRadius * 1.4]}
          /></mesh>
      </group>
    </group>
  );
};

export const TopPumps = ({
  dim,
  createMaterial,
  rootRef,
  leftPistonRef,
  rightPistonRef,
}: TopPumpsProps) => (
  <group ref={rootRef}>
    <SinglePump
      dim={dim}
      createMaterial={createMaterial}
      pistonRef={leftPistonRef}
      positionX={dim.pumpLeftX}
      positionZ={dim.pumpZ}
    />
    <SinglePump
      dim={dim}
      createMaterial={createMaterial}
      pistonRef={rightPistonRef}
      positionX={dim.pumpRightX}
      positionZ={dim.pumpZ}
    />
  </group>
);
