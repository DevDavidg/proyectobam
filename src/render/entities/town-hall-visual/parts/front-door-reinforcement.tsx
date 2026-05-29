import { Fragment } from 'react';
import { PALETTE } from '../palette';
import type { MaterialFactory, TownHallDimensions } from '../types';

type FrontDoorReinforcementProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
  weight: number;
  doorBodyDepth: number;
};

const BRACE_THICKNESS = 0.025;
const BRACE_DEPTH = 0.018;

export const FrontDoorReinforcement = ({
  dim,
  createMaterial,
  weight,
  doorBodyDepth,
}: FrontDoorReinforcementProps) => {
  if (weight <= 0.001) {
    return null;
  }

  const surfaceZ = doorBodyDepth / 2 + 0.004;
  const handleSurfaceZ = doorBodyDepth / 2 + 0.022;

  const midBandY = -dim.doorHeight * 0.05;
  const midBandWidth = dim.doorWidth - 0.04;

  const diag = Math.hypot(dim.doorWidth, dim.doorHeight);
  const diagAngle = Math.atan2(dim.doorHeight, dim.doorWidth);
  const braceLength = diag * 0.92;

  const viewportRadius = dim.doorWidth * 0.13;
  const viewportY = dim.doorHeight * 0.28;

  const handleX = dim.doorWidth / 2 - 0.1;
  const handleY = -0.05;
  const backplateWidth = 0.12;
  const backplateHeight = 0.18;

  return (
    <group scale={[weight, weight, 1]} position={[0, dim.doorHeight * 0.5 * (1 - weight) * 0.3, 0]}>
      <mesh castShadow receiveShadow position={[0, midBandY, surfaceZ]} material={createMaterial(PALETTE.doorBrace, 'iron')}>
        <boxGeometry args={[midBandWidth, 0.07, 0.018]} /></mesh>
      <mesh position={[0, midBandY + 0.025, surfaceZ + 0.001]} material={createMaterial(PALETTE.doorBraceLight, 'iron')}>
        <boxGeometry args={[midBandWidth + 0.004, 0.012, 0.005]} /></mesh>
      <mesh position={[0, midBandY - 0.025, surfaceZ + 0.001]} material={createMaterial(PALETTE.doorBraceShadow, 'iron')}>
        <boxGeometry args={[midBandWidth + 0.004, 0.01, 0.005]} /></mesh>
      {[-0.4, -0.15, 0.15, 0.4].map((nx, idx) => (
        <mesh
          key={`mid-band-bolt-${idx}`}
          castShadow
          position={[nx * midBandWidth, midBandY, surfaceZ + 0.012]}
         material={createMaterial(PALETTE.boltDark, 'iron')}>
          <cylinderGeometry args={[0.018, 0.018, 0.018, 8]} /></mesh>
      ))}

      <mesh
        castShadow
        receiveShadow
        position={[0, 0, surfaceZ - 0.001]}
        rotation={[0, 0, diagAngle]}
       material={createMaterial(PALETTE.doorBrace, 'iron')}>
        <boxGeometry args={[braceLength, BRACE_THICKNESS, BRACE_DEPTH]} /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[0, 0, surfaceZ - 0.0012]}
        rotation={[0, 0, -diagAngle]}
       material={createMaterial(PALETTE.doorBrace, 'iron')}>
        <boxGeometry args={[braceLength, BRACE_THICKNESS, BRACE_DEPTH]} /></mesh>
      <mesh castShadow position={[0, 0, surfaceZ + 0.012]} material={createMaterial(PALETTE.reinforcementSteel, 'iron')}>
        <cylinderGeometry args={[0.04, 0.04, 0.022, 12]} /></mesh>
      <mesh position={[0, 0, surfaceZ + 0.024]} material={createMaterial(PALETTE.boltShine, 'iron')}>
        <cylinderGeometry args={[0.02, 0.02, 0.012, 10]} /></mesh>

      <Fragment>
        {[
          [-1, 1],
          [1, 1],
          [-1, -1],
          [1, -1],
        ].map(([sx, sy], idx) => (
          <mesh
            key={`corner-brace-bolt-${idx}`}
            castShadow
            position={[
              sx * (dim.doorWidth / 2 - 0.05),
              sy * (dim.doorHeight / 2 - 0.05),
              surfaceZ + 0.012,
            ]}
           material={createMaterial(PALETTE.boltDark, 'iron')}>
            <cylinderGeometry args={[0.022, 0.022, 0.02, 8]} /></mesh>
        ))}
      </Fragment>

      <group position={[0, viewportY, surfaceZ]}>
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.doorViewportRing, 'iron')}>
          <cylinderGeometry args={[viewportRadius * 1.18, viewportRadius * 1.18, 0.022, 18]} /></mesh>
        <mesh position={[0, 0, 0.003]} rotation={[Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.viewportFrame, 'iron')}>
          <cylinderGeometry args={[viewportRadius, viewportRadius, 0.012, 18]} /></mesh>
        <mesh position={[0, 0, 0.011]} material={createMaterial(PALETTE.boltDark, 'iron')}>
          <circleGeometry args={[viewportRadius * 0.86, 18]} />
          <meshBasicMaterial color={PALETTE.viewportGlassDark} toneMapped={false} />
        </mesh>
        <mesh position={[viewportRadius * 0.18, viewportRadius * 0.22, 0.012]}>
          <circleGeometry args={[viewportRadius * 0.32, 14]} />
          <meshBasicMaterial color={PALETTE.viewportGlassGlow} toneMapped={false} transparent opacity={0.85} />
        </mesh>
        <mesh position={[-viewportRadius * 0.4, -viewportRadius * 0.4, 0.012]}>
          <circleGeometry args={[viewportRadius * 0.16, 12]} />
          <meshBasicMaterial color="#dceaf5" toneMapped={false} transparent opacity={0.6} />
        </mesh>
        {Array.from({ length: 6 }).map((_, idx) => {
          const angle = (idx / 6) * Math.PI * 2;
          const x = Math.cos(angle) * viewportRadius * 1.05;
          const y = Math.sin(angle) * viewportRadius * 1.05;
          return (
            <mesh key={`viewport-bolt-${idx}`} castShadow position={[x, y, 0.013]}>
              <cylinderGeometry args={[0.012, 0.012, 0.014, 6]} /></mesh>
          );
        })}
      </group>

      <mesh
        castShadow
        receiveShadow
        position={[handleX, handleY, surfaceZ + 0.004]}
       material={createMaterial(PALETTE.reinforcementSteel, 'iron')}>
        <boxGeometry args={[backplateWidth, backplateHeight, 0.012]} /></mesh>
      <mesh position={[handleX, handleY, surfaceZ + 0.011]} material={createMaterial(PALETTE.reinforcementSteelDark, 'iron')}>
        <boxGeometry args={[backplateWidth - 0.018, backplateHeight - 0.018, 0.005]} /></mesh>
      {[
        [-1, 1],
        [1, 1],
        [-1, -1],
        [1, -1],
      ].map(([sx, sy], idx) => (
        <mesh
          key={`backplate-bolt-${idx}`}
          castShadow
          position={[
            handleX + sx * (backplateWidth / 2 - 0.014),
            handleY + sy * (backplateHeight / 2 - 0.014),
            handleSurfaceZ - 0.008,
          ]}
         material={createMaterial(PALETTE.boltDark, 'iron')}>
          <cylinderGeometry args={[0.012, 0.012, 0.012, 6]} /></mesh>
      ))}
    </group>
  );
};
