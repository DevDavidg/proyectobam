import { PALETTE } from '../palette';
import type { GooFactoryDimensions } from '../geometry';
import type { CreateMaterial } from '../types';

type DestroyedProps = {
  dim: GooFactoryDimensions;
  createMaterial: CreateMaterial;
};

export const Destroyed = ({ dim, createMaterial }: DestroyedProps) => (
  <group rotation={[0.12, 0, -0.25]} position={[0, 0.02, 0]}>
    <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
      <cylinderGeometry args={[dim.tankRadius + 0.18, dim.tankRadius + 0.24, 0.16, 16]} />
      {createMaterial(PALETTE.woodBarrelDeep, 'wood')}
    </mesh>
    <mesh
      castShadow
      receiveShadow
      position={[0.12, 0.12, -0.1]}
      rotation={[0.35, 0.7, 0.4]}
    >
      <torusGeometry args={[dim.tankRadius + 0.02, 0.06, 8, 18, Math.PI * 1.55]} />
      {createMaterial(PALETTE.pipe, 'gold')}
    </mesh>
    <mesh
      castShadow
      receiveShadow
      position={[-0.22, 0.08, 0.18]}
      rotation={[0, 0, 0.3]}
    >
      <sphereGeometry args={[0.26, 14, 10]} />
      {createMaterial(PALETTE.goo, 'goo')}
    </mesh>
    <mesh castShadow receiveShadow position={[0.24, 0.06, 0.08]}>
      <sphereGeometry args={[0.16, 12, 10]} />
      {createMaterial(PALETTE.gooBright, 'goo')}
    </mesh>
  </group>
);

type DamageDebrisProps = {
  dim: GooFactoryDimensions;
  createMaterial: CreateMaterial;
};

export const DamageDebris = ({ dim, createMaterial }: DamageDebrisProps) => (
  <group rotation={[0.06, 0, -0.08]}>
    <mesh
      castShadow
      receiveShadow
      position={[0.2, dim.tankTop + 0.1, -0.16]}
      rotation={[0.3, 0.2, 0.5]}
    >
      <boxGeometry args={[0.22, 0.08, 0.12]} />
      {createMaterial(PALETTE.pumpHighlight, 'iron')}
    </mesh>
    <mesh
      castShadow
      receiveShadow
      position={[-0.3, dim.tankBottom + 0.04, 0.18]}
      rotation={[0, 0.45, 0]}
    >
      <sphereGeometry args={[0.09, 8, 8]} />
      {createMaterial(PALETTE.gooDeep, 'goo')}
    </mesh>
    <mesh
      castShadow
      receiveShadow
      position={[0.18, dim.tankBottom + 0.32, 0.25]}
      rotation={[0.6, 0, 0.3]}
    >
      <boxGeometry args={[0.04, 0.18, 0.04]} />
      {createMaterial(PALETTE.woodLegDark, 'wood')}
    </mesh>
  </group>
);
