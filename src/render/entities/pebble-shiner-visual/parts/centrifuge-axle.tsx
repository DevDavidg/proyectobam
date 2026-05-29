import { useMemo } from 'react';
import { PALETTE } from '../palette';
import type { MaterialFactory, PebbleShinerDimensions } from '../types';

type CentrifugeAxleProps = {
  dim: PebbleShinerDimensions;
  createMaterial: MaterialFactory;
};

export const CentrifugeAxle = ({
  dim,
  createMaterial,
}: CentrifugeAxleProps) => {
  const axleLeftX = dim.drum1CenterX - dim.drumLength / 2 - 0.18;
  const axleRightX = dim.drum2CenterX + dim.drumLength / 2 + 0.22;
  const axleLength = axleRightX - axleLeftX;
  const axleCenterX = (axleLeftX + axleRightX) / 2;
  const axleY = dim.drumCenterY;
  const axleRadius = dim.drumRadius * 0.16;

  // Bearing mounts (pillow blocks) sit on the top beam under the axle
  const bearingXs = useMemo(
    () => [
      dim.drum1CenterX - dim.drumLength / 2 - 0.1,
      (dim.drum1CenterX + dim.drum2CenterX) / 2,
      dim.drum2CenterX + dim.drumLength / 2 + 0.1,
    ],
    [dim.drum1CenterX, dim.drum2CenterX, dim.drumLength],
  );

  const mountHeight = axleY - dim.frameTopY + axleRadius;

  return (
    <group>
      {/* Continuous metal axle through both drums */}
      <mesh castShadow receiveShadow position={[axleCenterX, axleY, 0]} rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.drumAxle, 'iron')}>
        <cylinderGeometry args={[axleRadius, axleRadius, axleLength, 16]} /></mesh>
      {/* Axle highlight strip */}
      <mesh position={[axleCenterX, axleY + axleRadius * 0.55, 0]} rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.drumEndCapHighlight, 'iron')}>
        <cylinderGeometry args={[axleRadius * 0.45, axleRadius * 0.45, axleLength, 12]} /></mesh>
      {/* End nut on the drive side */}
      <mesh castShadow receiveShadow position={[axleRightX - 0.02, axleY, 0]} rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.drumEndCapShadow, 'iron')}>
        <cylinderGeometry args={[axleRadius * 1.6, axleRadius * 1.6, 0.05, 6]} /></mesh>

      {bearingXs.map((x, index) => (
        <group key={`bearing-${index}`} position={[x, dim.frameTopY, 0]}>
          {/* Gray pillow-block body */}
          <mesh castShadow receiveShadow position={[0, mountHeight / 2, 0]} material={createMaterial(PALETTE.hopperStone, 'stone')}>
            <boxGeometry args={[0.13, mountHeight, dim.drumRadius * 0.7]} /></mesh>
          {/* Cap collar where the axle passes */}
          <mesh castShadow receiveShadow position={[0, mountHeight - axleRadius * 0.4, 0]} rotation={[Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.hopperRim, 'iron')}>
            <cylinderGeometry args={[axleRadius * 1.7, axleRadius * 1.7, 0.14, 14]} /></mesh>
          {/* Bolt foot */}
          <mesh castShadow receiveShadow position={[0, 0.02, 0]} material={createMaterial(PALETTE.hopperStoneDark, 'stone')}>
            <boxGeometry args={[0.17, 0.04, dim.drumRadius * 0.85]} /></mesh>
        </group>
      ))}
    </group>
  );
};
