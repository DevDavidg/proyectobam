import { PALETTE } from '../palette';
import type { MaterialFactory, TownHallDimensions } from '../types';

type DestroyedProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
};

export const Destroyed = ({ dim, createMaterial }: DestroyedProps) => (
  <group>
    <mesh receiveShadow position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[Math.max(dim.halfX, dim.halfZ) + 0.95, 24]} />
      {createMaterial(PALETTE.scorch, 'stone')}
    </mesh>

    <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
      <boxGeometry args={[dim.halfX * 1.7, 0.32, dim.halfZ * 1.7]} />
      {createMaterial(PALETTE.rubbleDark, 'iron')}
    </mesh>

    <mesh castShadow receiveShadow position={[-dim.halfX * 0.4, 0.12, dim.halfZ * 0.5]} rotation={[0.2, 0.4, 0.1]}>
      <boxGeometry args={[0.42, 0.22, 0.36]} />
      {createMaterial(PALETTE.rubbleMid, 'iron')}
    </mesh>
    <mesh castShadow receiveShadow position={[dim.halfX * 0.55, 0.18, -dim.halfZ * 0.2]} rotation={[0.1, -0.6, 0.18]}>
      <boxGeometry args={[0.5, 0.28, 0.3]} />
      {createMaterial(PALETTE.bodyShellShadow, 'iron')}
    </mesh>
    <mesh castShadow receiveShadow position={[dim.halfX * 0.2, 0.1, dim.halfZ * 0.7]} rotation={[0.2, 0.9, -0.1]}>
      <boxGeometry args={[0.32, 0.14, 0.24]} />
      {createMaterial(PALETTE.rockMid, 'stone')}
    </mesh>
    <mesh castShadow receiveShadow position={[-dim.halfX * 0.7, 0.08, -dim.halfZ * 0.5]} rotation={[0.1, 1.2, 0.05]}>
      <boxGeometry args={[0.36, 0.12, 0.28]} />
      {createMaterial(PALETTE.rubbleMid, 'stone')}
    </mesh>
  </group>
);
