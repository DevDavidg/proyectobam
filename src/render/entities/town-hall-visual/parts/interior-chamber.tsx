import { PALETTE } from '../palette';
import type { MaterialFactory, TownHallDimensions } from '../types';

type InteriorChamberProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
};

export const InteriorChamber = ({ dim, createMaterial }: InteriorChamberProps) => {
  const doorCenterX = dim.doorOffsetX;
  const doorBottomY = dim.baseLift;
  const wallFrontZ = dim.halfZ;

  const interiorWidth = dim.doorWidth * 0.86;
  const interiorHeight = dim.doorHeight * 0.92;
  const interiorFrontZ = wallFrontZ + 0.018;
  const interiorBackZ = wallFrontZ + 0.005;

  const sideWallThickness = 0.025;
  const sideWallDepth = interiorFrontZ - interiorBackZ + 0.008;
  const leftWallX = doorCenterX - interiorWidth / 2 - sideWallThickness / 2;
  const rightWallX = doorCenterX + interiorWidth / 2 + sideWallThickness / 2;

  const lintelHeight = 0.06;
  const lintelY = doorBottomY + interiorHeight + lintelHeight / 2;

  const thresholdHeight = 0.04;
  const thresholdY = doorBottomY + thresholdHeight / 2;

  const glowWidth = interiorWidth * 0.78;
  const glowHeight = interiorHeight * 0.42;
  const glowY = doorBottomY + interiorHeight * 0.32;
  const glowZ = interiorBackZ + 0.018;

  const anvilWidth = 0.18;
  const anvilHeight = 0.07;
  const anvilDepth = 0.06;
  const anvilX = doorCenterX + interiorWidth * 0.18;
  const anvilY = doorBottomY + 0.06;
  const anvilZ = interiorBackZ + 0.022;

  const benchWidth = 0.22;
  const benchHeight = 0.05;
  const benchX = doorCenterX - interiorWidth * 0.22;
  const benchY = doorBottomY + 0.05;
  const benchZ = interiorBackZ + 0.024;

  return (
    <group>
      <mesh receiveShadow position={[doorCenterX, doorBottomY + interiorHeight / 2, interiorBackZ]} material={createMaterial(PALETTE.interiorWall, 'iron')}>
        <boxGeometry args={[interiorWidth, interiorHeight, 0.012]} /></mesh>

      <mesh
        receiveShadow
        position={[leftWallX, doorBottomY + interiorHeight / 2, (interiorBackZ + interiorFrontZ) / 2]}
       material={createMaterial(PALETTE.interiorWallLight, 'iron')}>
        <boxGeometry args={[sideWallThickness, interiorHeight, sideWallDepth]} /></mesh>
      <mesh
        receiveShadow
        position={[rightWallX, doorBottomY + interiorHeight / 2, (interiorBackZ + interiorFrontZ) / 2]}
       material={createMaterial(PALETTE.interiorWallLight, 'iron')}>
        <boxGeometry args={[sideWallThickness, interiorHeight, sideWallDepth]} /></mesh>

      <mesh receiveShadow position={[doorCenterX, lintelY, (interiorBackZ + interiorFrontZ) / 2]} material={createMaterial(PALETTE.interiorWall, 'iron')}>
        <boxGeometry args={[interiorWidth + sideWallThickness * 2, lintelHeight, sideWallDepth]} /></mesh>

      <mesh receiveShadow position={[doorCenterX, thresholdY, (interiorBackZ + interiorFrontZ) / 2]} material={createMaterial(PALETTE.interiorFloor, 'stone')}>
        <boxGeometry args={[interiorWidth, thresholdHeight, sideWallDepth]} /></mesh>

      <mesh position={[doorCenterX, glowY, glowZ]} material={createMaterial(PALETTE.anvilBase, 'iron')}>
        <planeGeometry args={[glowWidth, glowHeight]} />
        <meshBasicMaterial color={PALETTE.forgeEmber} toneMapped={false} />
      </mesh>
      <mesh position={[doorCenterX, glowY, glowZ + 0.001]}>
        <planeGeometry args={[glowWidth * 0.55, glowHeight * 0.55]} />
        <meshBasicMaterial color={PALETTE.forgeEmberHot} toneMapped={false} />
      </mesh>
      <mesh position={[doorCenterX, glowY - glowHeight * 0.18, glowZ + 0.002]}>
        <planeGeometry args={[glowWidth * 0.32, glowHeight * 0.22]} />
        <meshBasicMaterial color="#ffe7a8" toneMapped={false} />
      </mesh>

      <mesh
        castShadow
        receiveShadow
        position={[anvilX, anvilY, anvilZ]}
      >
        <boxGeometry args={[anvilWidth, anvilHeight * 0.35, anvilDepth]} /></mesh>
      <mesh
        castShadow
        position={[anvilX, anvilY + anvilHeight * 0.5, anvilZ]}
       material={createMaterial(PALETTE.anvilBase, 'iron')}>
        <boxGeometry args={[anvilWidth * 0.85, anvilHeight * 0.4, anvilDepth * 0.7]} /></mesh>
      <mesh
        castShadow
        position={[anvilX, anvilY + anvilHeight * 0.95, anvilZ]}
       material={createMaterial(PALETTE.anvilTop, 'iron')}>
        <boxGeometry args={[anvilWidth * 1.15, anvilHeight * 0.35, anvilDepth]} /></mesh>
      <mesh
        position={[anvilX - anvilWidth * 0.6, anvilY + anvilHeight * 0.95, anvilZ]}
       material={createMaterial(PALETTE.anvilHorn, 'iron')}>
        <boxGeometry args={[anvilWidth * 0.42, anvilHeight * 0.22, anvilDepth * 0.85]} /></mesh>

      <mesh castShadow receiveShadow position={[benchX, benchY, benchZ]} material={createMaterial(PALETTE.workbenchWood, 'wood')}>
        <boxGeometry args={[benchWidth, benchHeight, 0.06]} /></mesh>
      <mesh position={[benchX, benchY + benchHeight * 0.6, benchZ + 0.001]} material={createMaterial(PALETTE.workbenchWoodLight, 'wood')}>
        <boxGeometry args={[benchWidth * 0.95, benchHeight * 0.18, 0.05]} /></mesh>
      <mesh
        position={[benchX + benchWidth * 0.3, benchY + benchHeight * 1.1, benchZ + 0.001]}
       material={createMaterial(PALETTE.workbenchWoodLight, 'wood')}>
        <boxGeometry args={[0.025, 0.08, 0.025]} /></mesh>
      <mesh
        position={[benchX - benchWidth * 0.18, benchY + benchHeight * 1.05, benchZ + 0.001]}
       material={createMaterial(PALETTE.boltShine, 'iron')}>
        <boxGeometry args={[0.05, 0.07, 0.02]} /></mesh>

      <pointLight
        position={[doorCenterX, glowY + 0.1, glowZ + 0.04]}
        intensity={1.6}
        distance={1.6}
        decay={2.4}
        color={PALETTE.forgeEmberHot}
      />
    </group>
  );
};
