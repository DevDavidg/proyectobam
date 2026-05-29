import { PALETTE } from '../palette';
import type { GooFactoryDimensions } from '../geometry';
import type { CreateMaterial } from '../types';

type ConnectingPipeProps = {
  dim: GooFactoryDimensions;
  createMaterial: CreateMaterial;
};

export const ConnectingPipe = ({ dim, createMaterial }: ConnectingPipeProps) => {
  const startX = 0;
  const startY = dim.pumpBodyTopY + 0.04;
  const startZ = 0;
  const motorTopY = dim.motorTopY + 0.04;
  const motorAttachX = dim.driveCenterX + 0.06;
  const motorAttachZ = dim.driveCenterZ;
  const archHeight = startY + 0.22;
  const radius = 0.038;
  const horizontalLengthSq =
    (motorAttachX - startX) ** 2 + (motorAttachZ - startZ) ** 2;
  const horizontalLength = Math.sqrt(horizontalLengthSq);
  const horizontalAngle = Math.atan2(motorAttachZ - startZ, motorAttachX - startX);

  return (
    <group>
      <mesh
        castShadow
        receiveShadow
        position={[startX, (startY + archHeight) / 2, startZ]}
      >
        <cylinderGeometry args={[radius, radius, archHeight - startY, 14]} />
        {createMaterial(PALETTE.pipe, 'gold')}
      </mesh>
      <mesh castShadow receiveShadow position={[startX, archHeight, startZ]}>
        <sphereGeometry args={[radius + 0.012, 14, 12]} />
        {createMaterial(PALETTE.pipe, 'gold')}
      </mesh>

      <mesh
        castShadow
        receiveShadow
        position={[
          (startX + motorAttachX) / 2,
          archHeight,
          (startZ + motorAttachZ) / 2,
        ]}
        rotation={[0, -horizontalAngle, Math.PI / 2]}
      >
        <cylinderGeometry args={[radius, radius, horizontalLength, 14]} />
        {createMaterial(PALETTE.pipe, 'gold')}
      </mesh>
      <mesh castShadow receiveShadow position={[motorAttachX, archHeight, motorAttachZ]}>
        <sphereGeometry args={[radius + 0.012, 14, 12]} />
        {createMaterial(PALETTE.pipe, 'gold')}
      </mesh>

      <mesh
        castShadow
        receiveShadow
        position={[motorAttachX, (archHeight + motorTopY) / 2, motorAttachZ]}
      >
        <cylinderGeometry args={[radius, radius, archHeight - motorTopY, 14]} />
        {createMaterial(PALETTE.pipe, 'gold')}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[motorAttachX, motorTopY, motorAttachZ]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[radius + 0.018, radius + 0.022, 0.04, 14]} />
        {createMaterial(PALETTE.pipeShadow, 'gold')}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[motorAttachX, motorTopY + 0.015, motorAttachZ]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[radius + 0.018, 0.012, 8, 16]} />
        {createMaterial(PALETTE.pipeRing, 'gold')}
      </mesh>
    </group>
  );
};
