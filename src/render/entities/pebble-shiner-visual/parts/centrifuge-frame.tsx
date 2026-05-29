import { useMemo } from 'react';
import { PALETTE } from '../palette';
import type { MaterialFactory, PebbleShinerDimensions } from '../types';

type CentrifugeFrameProps = {
  dim: PebbleShinerDimensions;
  createMaterial: MaterialFactory;
};

const LEG_THICKNESS = 0.12;
const BEAM_THICKNESS = 0.09;
const BRACE_THICKNESS = 0.05;

export const CentrifugeFrame = ({
  dim,
  createMaterial,
}: CentrifugeFrameProps) => {
  const halfW = dim.frameWidth / 2;
  const halfD = dim.frameDepth / 2;
  const innerZ = halfD - LEG_THICKNESS / 2;
  const beamY = dim.frameTopY - BEAM_THICKNESS / 2;
  const lowBeamY = dim.frameBottomY + BEAM_THICKNESS / 2 + 0.03;

  // Four pillar columns → three bays (sections) along the length
  const pillarXs = useMemo(() => {
    const left = -halfW + LEG_THICKNESS / 2;
    const right = halfW - LEG_THICKNESS / 2;
    const span = right - left;
    return [left, left + span / 3, left + (span * 2) / 3, right];
  }, [halfW]);

  const bayCenters = useMemo(
    () =>
      pillarXs.slice(0, -1).map((x, index) => ({
        center: (x + pillarXs[index + 1]) / 2,
        width: pillarXs[index + 1] - x,
      })),
    [pillarXs],
  );

  return (
    <group>
      {/* Gray stone/metal vertical pillars (front + back per column) */}
      {pillarXs.map((x) =>
        [-innerZ, innerZ].map((z, zIndex) => (
          <group key={`leg-${x.toFixed(3)}-${zIndex}`} position={[x, dim.frameBottomY + dim.frameHeight / 2, z]}>
            <mesh castShadow receiveShadow material={createMaterial(PALETTE.hopperStone, 'stone')}>
              <boxGeometry args={[LEG_THICKNESS, dim.frameHeight, LEG_THICKNESS]} /></mesh>
            <mesh receiveShadow position={[LEG_THICKNESS / 2 + 0.0005, 0, 0]} material={createMaterial(PALETTE.hopperStoneLight, 'stone')}>
              <boxGeometry args={[0.001, dim.frameHeight - 0.04, LEG_THICKNESS - 0.01]} /></mesh>
            <mesh receiveShadow position={[-LEG_THICKNESS / 2 - 0.0005, 0, 0]} material={createMaterial(PALETTE.hopperStoneDark, 'stone')}>
              <boxGeometry args={[0.001, dim.frameHeight - 0.04, LEG_THICKNESS - 0.01]} /></mesh>
            {/* Cap + foot blocks */}
            <mesh castShadow receiveShadow position={[0, dim.frameHeight / 2 + 0.035, 0]} material={createMaterial(PALETTE.hopperRim, 'stone')}>
              <boxGeometry args={[LEG_THICKNESS + 0.05, 0.06, LEG_THICKNESS + 0.05]} /></mesh>
            <mesh castShadow receiveShadow position={[0, -dim.frameHeight / 2 + 0.025, 0]} material={createMaterial(PALETTE.hopperStoneDark, 'stone')}>
              <boxGeometry args={[LEG_THICKNESS + 0.05, 0.05, LEG_THICKNESS + 0.05]} /></mesh>
          </group>
        )),
      )}

      {/* Gray top rails (front + back) that the bearings + drums rest on */}
      {[-innerZ, innerZ].map((z, index) => (
        <mesh key={`top-rail-${index}`} castShadow receiveShadow position={[0, beamY, z]} material={createMaterial(PALETTE.hopperStoneLight, 'stone')}>
          <boxGeometry args={[dim.frameWidth, BEAM_THICKNESS, LEG_THICKNESS]} /></mesh>
      ))}
      {/* Cross top rails at the ends to tie front/back */}
      {[pillarXs[0], pillarXs[pillarXs.length - 1]].map((x, index) => (
        <mesh key={`top-cross-${index}`} castShadow receiveShadow position={[x, beamY, 0]} material={createMaterial(PALETTE.hopperStone, 'stone')}>
          <boxGeometry args={[LEG_THICKNESS, BEAM_THICKNESS, dim.frameDepth]} /></mesh>
      ))}

      {/* Lower gray stringers (front + back) */}
      {[-innerZ, innerZ].map((z, index) => (
        <mesh key={`low-rail-${index}`} castShadow receiveShadow position={[0, lowBeamY, z]} material={createMaterial(PALETTE.hopperStone, 'stone')}>
          <boxGeometry args={[dim.frameWidth - LEG_THICKNESS, BEAM_THICKNESS * 0.85, LEG_THICKNESS * 0.85]} /></mesh>
      ))}

      {/* WOOD X-braces — one per bay, on front and back faces */}
      {bayCenters.map((bay, bayIndex) =>
        [-innerZ - 0.005, innerZ + 0.005].map((z, zIndex) => {
          const diagLength = Math.sqrt(
            bay.width * bay.width + dim.frameHeight * dim.frameHeight,
          ) - LEG_THICKNESS;
          const diagAngle = Math.atan2(dim.frameHeight - 0.08, bay.width - LEG_THICKNESS);
          return (
            <group
              key={`xbrace-${bayIndex}-${zIndex}`}
              position={[bay.center, dim.frameBottomY + dim.frameHeight / 2, z]}
            >
              <mesh castShadow receiveShadow rotation={[0, 0, diagAngle]} material={createMaterial(PALETTE.frameWoodLight, 'wood')}>
                <boxGeometry args={[diagLength, BRACE_THICKNESS, BRACE_THICKNESS]} /></mesh>
              <mesh castShadow receiveShadow rotation={[0, 0, -diagAngle]} material={createMaterial(PALETTE.frameWoodMid, 'wood')}>
                <boxGeometry args={[diagLength, BRACE_THICKNESS, BRACE_THICKNESS]} /></mesh>
              <mesh castShadow receiveShadow material={createMaterial(PALETTE.frameWoodEdge, 'wood')}>
                <boxGeometry args={[BRACE_THICKNESS * 1.4, BRACE_THICKNESS * 1.4, BRACE_THICKNESS * 0.7]} /></mesh>
            </group>
          );
        }),
      )}
    </group>
  );
};
