import { forwardRef } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { MaterialFactory, TownHallDimensions } from '../types';
import { FrontDoorReinforcement } from './front-door-reinforcement';

type FrontDoorProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
  tier2Weight?: number;
  tier3Weight?: number;
};

const FRAME_THICKNESS = 0.045;
const TOP_FRAME_THICKNESS = 0.058;
const SILL_THICKNESS = 0.05;

export const FrontDoor = forwardRef<Group, FrontDoorProps>(({ dim, createMaterial, tier2Weight = 0, tier3Weight = 0 }, doorHingeRef) => {
  const frameZ = dim.halfZ + 0.062;
  const doorBodyDepth = dim.doorDepth * 0.7;
  const doorBodyZRelative = 0;
  const plankCount = 3;
  const plankHeight = dim.doorHeight / plankCount;

  const hingeX = -dim.doorWidth / 2;
  const doorCenterRelativeX = dim.doorWidth / 2;

  return (
    <group position={[dim.doorOffsetX, 0, 0]}>
      <mesh
        castShadow
        receiveShadow
        position={[
          0,
          dim.doorY + dim.doorHeight / 2 + TOP_FRAME_THICKNESS / 2,
          frameZ,
        ]}
       material={createMaterial(PALETTE.doorFrame, 'iron')}>
        <boxGeometry
          args={[
            dim.doorWidth + FRAME_THICKNESS * 2,
            TOP_FRAME_THICKNESS,
            dim.doorDepth,
          ]}
        /></mesh>
      <mesh
        position={[
          0,
          dim.doorY + dim.doorHeight / 2 + TOP_FRAME_THICKNESS - 0.005,
          frameZ + dim.doorDepth / 2 + 0.001,
        ]}
       material={createMaterial(PALETTE.trimDark, 'iron')}>
        <boxGeometry
          args={[
            dim.doorWidth + FRAME_THICKNESS * 2 + 0.005,
            0.014,
            0.005,
          ]}
        /></mesh>

      <mesh
        castShadow
        receiveShadow
        position={[
          -dim.doorWidth / 2 - FRAME_THICKNESS / 2,
          dim.doorY,
          frameZ,
        ]}
       material={createMaterial(PALETTE.doorFrame, 'iron')}>
        <boxGeometry args={[FRAME_THICKNESS, dim.doorHeight, dim.doorDepth]} /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[
          dim.doorWidth / 2 + FRAME_THICKNESS / 2,
          dim.doorY,
          frameZ,
        ]}
       material={createMaterial(PALETTE.doorFrame, 'iron')}>
        <boxGeometry args={[FRAME_THICKNESS, dim.doorHeight, dim.doorDepth]} /></mesh>

      <mesh
        castShadow
        position={[-dim.doorWidth / 2 - FRAME_THICKNESS / 2, dim.doorY + dim.doorHeight * 0.32, frameZ + dim.doorDepth / 2 + 0.005]}
       material={createMaterial(PALETTE.boltDark, 'iron')}>
        <cylinderGeometry args={[0.024, 0.024, 0.026, 10]} /></mesh>
      <mesh
        castShadow
        position={[-dim.doorWidth / 2 - FRAME_THICKNESS / 2, dim.doorY - dim.doorHeight * 0.34, frameZ + dim.doorDepth / 2 + 0.005]}
       material={createMaterial(PALETTE.boltDark, 'iron')}>
        <cylinderGeometry args={[0.024, 0.024, 0.026, 10]} /></mesh>

      <mesh
        castShadow
        receiveShadow
        position={[0, dim.baseLift + SILL_THICKNESS / 2, frameZ + dim.doorDepth * 0.5]}
       material={createMaterial(PALETTE.doorFrame, 'iron')}>
        <boxGeometry
          args={[
            dim.doorWidth + FRAME_THICKNESS * 2 + 0.06,
            SILL_THICKNESS,
            dim.doorDepth + 0.16,
          ]}
        /></mesh>
      <mesh
        position={[0, dim.baseLift + SILL_THICKNESS - 0.005, frameZ + dim.doorDepth * 0.5 + 0.04]}
       material={createMaterial(PALETTE.trimDark, 'iron')}>
        <boxGeometry args={[dim.doorWidth + 0.04, 0.012, 0.05]} /></mesh>

      <group
        ref={doorHingeRef}
        position={[hingeX, dim.doorY, frameZ + doorBodyZRelative]}
      >
        <group position={[doorCenterRelativeX, 0, 0]}>
          <mesh castShadow receiveShadow material={createMaterial(PALETTE.doorWood, 'wood')}>
            <boxGeometry args={[dim.doorWidth, dim.doorHeight, doorBodyDepth]} /></mesh>

          {Array.from({ length: plankCount - 1 }).map((_, idx) => {
            const localY = -dim.doorHeight / 2 + plankHeight * (idx + 1);
            return (
              <mesh
                key={`door-plank-line-${idx}`}
                position={[0, localY, doorBodyDepth / 2 + 0.002]}
               material={createMaterial(PALETTE.doorPlanks, 'wood')}>
                <boxGeometry args={[dim.doorWidth - 0.04, 0.012, 0.005]} /></mesh>
            );
          })}

          <mesh position={[-dim.doorWidth / 2 + 0.06, 0, doorBodyDepth / 2 + 0.002]} material={createMaterial(PALETTE.doorPlanks, 'wood')}>
            <boxGeometry args={[0.018, dim.doorHeight - 0.06, 0.006]} /></mesh>
          <mesh position={[dim.doorWidth / 2 - 0.06, 0, doorBodyDepth / 2 + 0.002]} material={createMaterial(PALETTE.doorPlanks, 'wood')}>
            <boxGeometry args={[0.018, dim.doorHeight - 0.06, 0.006]} /></mesh>

          <mesh
            castShadow
            position={[0, dim.doorHeight / 2 - 0.05, doorBodyDepth / 2 + 0.001]}
           material={createMaterial(PALETTE.doorWoodLight, 'wood')}>
            <boxGeometry args={[dim.doorWidth - 0.02, 0.04, 0.012]} /></mesh>
          <mesh
            castShadow
            position={[0, -dim.doorHeight / 2 + 0.05, doorBodyDepth / 2 + 0.001]}
           material={createMaterial(PALETTE.doorWoodLight, 'wood')}>
            <boxGeometry args={[dim.doorWidth - 0.02, 0.04, 0.012]} /></mesh>

          <mesh position={[0, -0.04, doorBodyDepth / 2 + 0.001]} material={createMaterial(PALETTE.doorShadow, 'wood')}>
            <boxGeometry args={[dim.doorWidth * 0.85, 0.085, 0.006]} /></mesh>

          <mesh
            castShadow
            position={[dim.doorWidth / 2 - 0.1, -0.05, doorBodyDepth / 2 + 0.018]}
           material={createMaterial(PALETTE.doorHandle, 'gold')}>
            <sphereGeometry args={[0.024, 12, 12]} /></mesh>
          <mesh
            position={[dim.doorWidth / 2 - 0.1, -0.05, doorBodyDepth / 2 + 0.011]}
           material={createMaterial(PALETTE.doorShadow, 'iron')}>
            <cylinderGeometry args={[0.014, 0.014, 0.018, 10]} /></mesh>

          <mesh
            castShadow
            position={[dim.doorWidth / 2 - 0.18, dim.doorHeight / 2 - 0.18, doorBodyDepth / 2 + 0.005]}
           material={createMaterial(PALETTE.boltShine, 'iron')}>
            <boxGeometry args={[0.04, 0.04, 0.012]} /></mesh>
          <mesh
            castShadow
            position={[dim.doorWidth / 2 - 0.18, -dim.doorHeight / 2 + 0.18, doorBodyDepth / 2 + 0.005]}
           material={createMaterial(PALETTE.boltShine, 'iron')}>
            <boxGeometry args={[0.04, 0.04, 0.012]} /></mesh>

          <FrontDoorReinforcement
            dim={dim}
            createMaterial={createMaterial}
            weight={tier2Weight}
            doorBodyDepth={doorBodyDepth}
          />

          {tier3Weight > 0.001 ? (
            <group scale={[tier3Weight, tier3Weight, 1]}>
              <mesh
                castShadow
                position={[0, dim.doorHeight * 0.32, doorBodyDepth / 2 + 0.006]}
               material={createMaterial(PALETTE.windowFrame, 'iron')}>
                <boxGeometry args={[dim.doorWidth * 0.6, dim.doorHeight * 0.16, 0.014]} /></mesh>
              <mesh position={[0, dim.doorHeight * 0.32, doorBodyDepth / 2 + 0.014]} material={createMaterial(PALETTE.windowFrameShadow, 'iron')}>
                <boxGeometry args={[dim.doorWidth * 0.5, dim.doorHeight * 0.1, 0.012]} />
                <meshBasicMaterial color={PALETTE.windowGlassGlow} toneMapped={false} />
              </mesh>
              <mesh position={[0, dim.doorHeight * 0.32, doorBodyDepth / 2 + 0.018]}>
                <boxGeometry args={[dim.doorWidth * 0.5, 0.008, 0.012]} /></mesh>
              <mesh
                position={[0, dim.doorHeight * 0.32 + dim.doorHeight * 0.08, doorBodyDepth / 2 + 0.008]}
               material={createMaterial(PALETTE.windowFrameLight, 'iron')}>
                <boxGeometry args={[dim.doorWidth * 0.62, 0.012, 0.012]} /></mesh>
            </group>
          ) : null}
        </group>
      </group>
    </group>
  );
});

FrontDoor.displayName = 'FrontDoor';
