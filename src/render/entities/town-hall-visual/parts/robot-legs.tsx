import { PALETTE } from '../palette';
import type { MaterialFactory, TownHallDimensions } from '../types';

type RobotLegsProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
  weight: number;
};

const CORNERS: Array<{ sx: 1 | -1; sz: 1 | -1 }> = [
  { sx: 1, sz: 1 },
  { sx: 1, sz: -1 },
  { sx: -1, sz: 1 },
  { sx: -1, sz: -1 },
];

type LegProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
  signX: 1 | -1;
  signZ: 1 | -1;
};

const SingleLeg = ({ dim, createMaterial, signX, signZ }: LegProps) => {
  const legHeight = dim.baseLift;

  const hipSize = 0.16;
  const hipHeight = legHeight * 0.32;
  const hipY = legHeight - hipHeight * 0.5;

  const pistonRadius = 0.05;
  const pistonHeight = legHeight * 0.62;
  const pistonY = legHeight * 0.42;

  const innerPistonRadius = 0.034;
  const innerPistonHeight = pistonHeight * 0.65;
  const innerPistonY = pistonY + pistonHeight * 0.18;

  const ankleRadius = 0.07;
  const ankleHeight = 0.05;
  const ankleY = 0.04;

  const footWidth = 0.22;
  const footDepth = 0.18;
  const footHeight = 0.05;
  const footY = footHeight * 0.5;

  const footPadWidth = 0.18;
  const footPadDepth = 0.14;
  const footPadHeight = 0.022;
  const footPadY = footHeight + footPadHeight * 0.5 - 0.001;

  const insetX = footWidth / 2 - 0.018;
  const insetZ = footDepth / 2 - 0.018;

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, hipY, 0]} material={createMaterial(PALETTE.legPiston, 'iron')}>
        <boxGeometry args={[hipSize, hipHeight, hipSize]} /></mesh>
      <mesh position={[signX * (hipSize / 2 + 0.002), hipY, 0]} material={createMaterial(PALETTE.legPistonShadow, 'iron')}>
        <boxGeometry args={[0.005, hipHeight * 0.92, hipSize * 0.94]} /></mesh>
      <mesh position={[0, hipY, signZ * (hipSize / 2 + 0.002)]} material={createMaterial(PALETTE.legPistonShadow, 'iron')}>
        <boxGeometry args={[hipSize * 0.94, hipHeight * 0.92, 0.005]} /></mesh>
      <mesh position={[0, hipY + hipHeight / 2 + 0.002, 0]} material={createMaterial(PALETTE.legPistonLight, 'iron')}>
        <boxGeometry args={[hipSize + 0.012, 0.012, hipSize + 0.012]} /></mesh>

      <mesh castShadow position={[0, hipY - hipHeight / 2 + 0.005, 0]} material={createMaterial(PALETTE.legJoint, 'iron')}>
        <cylinderGeometry args={[pistonRadius * 1.2, pistonRadius * 1.05, 0.04, 12]} /></mesh>

      <mesh castShadow receiveShadow position={[0, pistonY, 0]} material={createMaterial(PALETTE.legHydraulic, 'iron')}>
        <cylinderGeometry args={[pistonRadius, pistonRadius, pistonHeight, 14]} /></mesh>

      <mesh castShadow position={[0, innerPistonY, 0]} material={createMaterial(PALETTE.legPistonLight, 'iron')}>
        <cylinderGeometry args={[innerPistonRadius, innerPistonRadius, innerPistonHeight, 14]} /></mesh>

      <mesh position={[0, innerPistonY + innerPistonHeight / 2 - 0.002, 0]} material={createMaterial(PALETTE.legPiston, 'iron')}>
        <cylinderGeometry args={[innerPistonRadius + 0.006, innerPistonRadius + 0.006, 0.012, 14]} /></mesh>

      <mesh castShadow position={[0, ankleY + ankleHeight / 2, 0]} material={createMaterial(PALETTE.legJoint, 'iron')}>
        <cylinderGeometry args={[ankleRadius, ankleRadius * 0.85, ankleHeight, 12]} /></mesh>

      <mesh castShadow position={[0.04, ankleY + ankleHeight * 0.4, 0]} rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.legBoltDark, 'iron')}>
        <cylinderGeometry args={[0.014, 0.014, 0.025, 8]} /></mesh>
      <mesh castShadow position={[-0.04, ankleY + ankleHeight * 0.4, 0]} rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.legBoltDark, 'iron')}>
        <cylinderGeometry args={[0.014, 0.014, 0.025, 8]} /></mesh>

      <mesh castShadow receiveShadow position={[0, footY, 0]} material={createMaterial(PALETTE.legFootPad, 'iron')}>
        <boxGeometry args={[footWidth, footHeight, footDepth]} /></mesh>
      <mesh position={[0, footY + footHeight / 2 + 0.001, 0]} material={createMaterial(PALETTE.legFootPadEdge, 'iron')}>
        <boxGeometry args={[footWidth + 0.006, 0.008, footDepth + 0.006]} /></mesh>

      <mesh receiveShadow position={[0, footPadY, 0]} material={createMaterial(PALETTE.legPiston, 'iron')}>
        <boxGeometry args={[footPadWidth, footPadHeight, footPadDepth]} /></mesh>

      <mesh position={[insetX, footY + footHeight / 2 + 0.0005, insetZ]} material={createMaterial(PALETTE.legBoltDark, 'iron')}>
        <cylinderGeometry args={[0.012, 0.012, 0.014, 8]} /></mesh>
      <mesh position={[-insetX, footY + footHeight / 2 + 0.0005, insetZ]} material={createMaterial(PALETTE.legBoltDark, 'iron')}>
        <cylinderGeometry args={[0.012, 0.012, 0.014, 8]} /></mesh>
      <mesh position={[insetX, footY + footHeight / 2 + 0.0005, -insetZ]} material={createMaterial(PALETTE.legBoltDark, 'iron')}>
        <cylinderGeometry args={[0.012, 0.012, 0.014, 8]} /></mesh>
      <mesh position={[-insetX, footY + footHeight / 2 + 0.0005, -insetZ]} material={createMaterial(PALETTE.legBoltDark, 'iron')}>
        <cylinderGeometry args={[0.012, 0.012, 0.014, 8]} /></mesh>
    </group>
  );
};

export const RobotLegs = ({ dim, createMaterial, weight }: RobotLegsProps) => {
  if (weight <= 0.001) {
    return null;
  }

  const insetX = dim.halfX * 0.78;
  const insetZ = dim.halfZ * 0.78;
  const lateralScale = Math.min(1, Math.max(0.05, weight));

  return (
    <group>
      {CORNERS.map(({ sx, sz }, idx) => (
        <group
          key={`robot-leg-${idx}`}
          position={[sx * insetX, 0, sz * insetZ]}
          scale={[lateralScale, 1, lateralScale]}
        >
          <SingleLeg dim={dim} createMaterial={createMaterial} signX={sx} signZ={sz} />
        </group>
      ))}
    </group>
  );
};
