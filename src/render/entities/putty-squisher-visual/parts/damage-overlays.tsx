import { PALETTE } from '../palette';
import type { MaterialFactory, PuttySquisherDimensions } from '../types';

type DamageOverlayProps = {
  dim: PuttySquisherDimensions;
  createMaterial: MaterialFactory;
};

export const DamagedOverlay = ({ dim, createMaterial }: DamageOverlayProps) => {
  const { half, cubeSize, cubeCenterY, cubeBaseY } = dim;
  return (
    <group>
      <mesh
        castShadow
        receiveShadow
        position={[-half + 0.04, cubeCenterY + 0.1, half - 0.02]}
        rotation={[0.2, 0.3, 0.4]}
      >
        <boxGeometry args={[cubeSize * 0.18, cubeSize * 0.06, 0.04]} />
        {createMaterial(PALETTE.bodyShadow, 'goo')}
      </mesh>
      <mesh castShadow receiveShadow position={[half - 0.06, cubeBaseY + 0.05, -half + 0.04]}>
        <boxGeometry args={[0.13, 0.13, 0.13]} />
        {createMaterial(PALETTE.puttyCubeMid, 'goo')}
      </mesh>
    </group>
  );
};

export const DestroyedOverlay = ({ dim, createMaterial }: DamageOverlayProps) => {
  const { cubeSize } = dim;
  return (
    <group position={[0, 0.02, 0]} rotation={[0.18, 0.4, -0.22]}>
      <mesh castShadow receiveShadow position={[0, cubeSize * 0.2, 0]}>
        <boxGeometry args={[cubeSize, cubeSize * 0.42, cubeSize]} />
        {createMaterial(PALETTE.bodyShadow, 'goo')}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[cubeSize * 0.18, 0.04, cubeSize * 0.22]}
        rotation={[0.4, 0.6, 0.2]}
      >
        <boxGeometry args={[cubeSize * 0.4, 0.18, cubeSize * 0.36]} />
        {createMaterial(PALETTE.bodyEdge, 'goo')}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[-cubeSize * 0.34, 0.06, -cubeSize * 0.1]}
        rotation={[0, 0.3, 0.1]}
      >
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        {createMaterial(PALETTE.puttyCubeMid, 'goo')}
      </mesh>
      <mesh castShadow receiveShadow position={[cubeSize * 0.5, 0.05, -cubeSize * 0.18]}>
        <boxGeometry args={[0.13, 0.13, 0.13]} />
        {createMaterial(PALETTE.puttyCubeTop, 'goo')}
      </mesh>
    </group>
  );
};
