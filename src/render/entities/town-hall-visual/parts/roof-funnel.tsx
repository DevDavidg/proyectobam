import { Fragment } from 'react';
import { PALETTE } from '../palette';
import type { MaterialFactory, TownHallDimensions } from '../types';

type RoofFunnelProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
  segments?: number;
};

const DEFAULT_FUNNEL_SEGMENTS = 4;

export const RoofFunnel = ({ dim, createMaterial, segments = DEFAULT_FUNNEL_SEGMENTS }: RoofFunnelProps) => {
  const funnelSegments = segments;

  const stemY = dim.roofTop + dim.funnelStemHeight / 2;
  const stemTopY = dim.roofTop + dim.funnelStemHeight;
  const funnelCenterY = stemTopY + dim.funnelHeight / 2;
  const funnelTopY = stemTopY + dim.funnelHeight;
  const funnelBottomY = stemTopY;

  const lowerBandRadius = dim.funnelBaseRadius + (dim.funnelTopRadius - dim.funnelBaseRadius) * 0.32;
  const middleBandRadius = dim.funnelBaseRadius + (dim.funnelTopRadius - dim.funnelBaseRadius) * 0.55;
  const upperBandRadius = dim.funnelBaseRadius + (dim.funnelTopRadius - dim.funnelBaseRadius) * 0.78;
  const lowerBandY = funnelBottomY + dim.funnelHeight * 0.32;
  const middleBandY = funnelBottomY + dim.funnelHeight * 0.55;
  const upperBandY = funnelBottomY + dim.funnelHeight * 0.78;

  const collarSize = dim.funnelStemRadius * 2.4;
  const collarHeight = dim.funnelStemHeight * 0.6;
  const collarY = dim.roofTop + collarHeight / 2;

  const bracketLength = dim.funnelStemRadius * 1.45;
  const bracketHeight = 0.05;
  const bracketDepth = 0.05;
  const bracketY = dim.roofTop + bracketHeight / 2 + 0.005;

  const rimRingThickness = 0.04;

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, collarY, 0]} material={createMaterial(PALETTE.funnelMetalShadow, 'iron')}>
        <boxGeometry args={[collarSize, collarHeight, collarSize]} /></mesh>

      {[
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].map(([dx, dz], idx) => (
        <mesh
          key={`bracket-${idx}`}
          castShadow
          receiveShadow
          position={[
            dx * (collarSize / 2 + bracketLength / 2 - 0.01),
            bracketY,
            dz * (collarSize / 2 + bracketLength / 2 - 0.01),
          ]}
          rotation={[0, dz === 0 ? 0 : Math.PI / 2, 0]}
         material={createMaterial(PALETTE.funnelBracket, 'iron')}>
          <boxGeometry args={[bracketLength, bracketHeight, bracketDepth]} /></mesh>
      ))}

      {[
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].map(([dx, dz], idx) => (
        <mesh
          key={`bracket-bolt-${idx}`}
          castShadow
          position={[
            dx * (collarSize / 2 + bracketLength - 0.04),
            bracketY + 0.001,
            dz * (collarSize / 2 + bracketLength - 0.04),
          ]}
         material={createMaterial(PALETTE.boltDark, 'iron')}>
          <cylinderGeometry args={[0.022, 0.022, bracketHeight + 0.012, 8]} /></mesh>
      ))}

      <mesh castShadow receiveShadow position={[0, stemY, 0]} material={createMaterial(PALETTE.funnelMetal, 'iron')}>
        <cylinderGeometry
          args={[
            dim.funnelStemRadius,
            dim.funnelStemRadius * 1.1,
            dim.funnelStemHeight,
            funnelSegments,
            1,
            false,
          ]}
        /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[0, stemY, 0]}
       material={createMaterial(PALETTE.funnelBand, 'iron')}>
        <cylinderGeometry
          args={[
            dim.funnelStemRadius * 1.06,
            dim.funnelStemRadius * 1.06,
            0.025,
            funnelSegments,
            1,
            true,
          ]}
        /></mesh>

      <mesh castShadow receiveShadow position={[0, funnelCenterY, 0]} material={createMaterial(PALETTE.funnelMetal, 'iron')}>
        <cylinderGeometry
          args={[
            dim.funnelTopRadius,
            dim.funnelBaseRadius,
            dim.funnelHeight,
            funnelSegments,
            1,
            true,
          ]}
        /></mesh>

      <mesh
        castShadow
        position={[0, funnelCenterY, 0]}
        scale={[-1, 1, 1]}
       material={createMaterial(PALETTE.funnelInside, 'iron')}>
        <cylinderGeometry
          args={[
            dim.funnelTopRadius * 0.93,
            dim.funnelBaseRadius * 0.93,
            dim.funnelHeight * 0.97,
            funnelSegments,
            1,
            true,
          ]}
        /></mesh>

      <mesh
        castShadow
        position={[0, funnelCenterY * 0.98, 0]}
        scale={[-1, 1, 1]}
       material={createMaterial(PALETTE.funnelMetalShadow, 'iron')}>
        <cylinderGeometry
          args={[
            dim.funnelTopRadius * 0.78,
            dim.funnelBaseRadius * 0.82,
            dim.funnelHeight * 0.85,
            funnelSegments,
            1,
            true,
          ]}
        /></mesh>

      <mesh receiveShadow position={[0, funnelBottomY + 0.04, 0]} material={createMaterial(PALETTE.funnelInside, 'iron')}>
        <cylinderGeometry
          args={[
            dim.funnelBaseRadius * 0.86,
            dim.funnelBaseRadius * 0.92,
            0.06,
            funnelSegments,
            1,
            false,
          ]}
        /></mesh>

      {[lowerBandY, middleBandY, upperBandY].map((bandY, idx) => {
        const radius = idx === 0 ? lowerBandRadius : idx === 1 ? middleBandRadius : upperBandRadius;
        return (
          <mesh key={`band-${idx}`} position={[0, bandY, 0]} material={createMaterial(PALETTE.funnelBand, 'iron')}>
            <cylinderGeometry
              args={[
                radius * 1.04,
                radius * 1.04,
                0.022,
                funnelSegments,
                1,
                true,
              ]}
            /></mesh>
        );
      })}

      <mesh position={[0, funnelTopY + rimRingThickness / 2, 0]} material={createMaterial(PALETTE.funnelRim, 'iron')}>
        <cylinderGeometry
          args={[
            dim.funnelTopRadius * 1.06,
            dim.funnelTopRadius * 0.98,
            rimRingThickness,
            funnelSegments,
            1,
            true,
          ]}
        /></mesh>
      <mesh position={[0, funnelTopY + rimRingThickness, 0]} rotation={[-Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.funnelMetalLight, 'iron')}>
        <ringGeometry
          args={[
            dim.funnelTopRadius * 0.78,
            dim.funnelTopRadius * 1.06,
            funnelSegments,
            1,
          ]}
        /></mesh>

      {Array.from({ length: funnelSegments }).map((_, idx) => {
        const angle = (idx / funnelSegments) * Math.PI * 2 + Math.PI / funnelSegments;
        const x = Math.cos(angle) * dim.funnelTopRadius * 0.92;
        const z = Math.sin(angle) * dim.funnelTopRadius * 0.92;
        return (
          <Fragment key={`rim-bolt-${idx}`}>
            <mesh
              castShadow
              position={[x, funnelTopY + rimRingThickness / 2, z]}
             material={createMaterial(PALETTE.boltDark, 'iron')}>
              <cylinderGeometry args={[0.028, 0.028, rimRingThickness * 1.2, 8]} /></mesh>
            <mesh
              position={[x - 0.006, funnelTopY + rimRingThickness * 1.05, z]}
             material={createMaterial(PALETTE.boltShine, 'iron')}>
              <sphereGeometry args={[0.012, 6, 6]} /></mesh>
          </Fragment>
        );
      })}

      <mesh position={[0, funnelBottomY + 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.funnelInside, 'iron')}>
        <ringGeometry
          args={[0, dim.funnelBaseRadius * 0.9, funnelSegments, 1]}
        /></mesh>
    </group>
  );
};
