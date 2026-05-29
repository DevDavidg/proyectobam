import { PALETTE } from '../palette';
import type { MaterialFactory, TownHallDimensions } from '../types';

type DamagedOverlayProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
};

export const DamagedOverlay = ({ dim, createMaterial }: DamagedOverlayProps) => (
  <group>
    <mesh position={[dim.halfX + 0.018, dim.bodyTop - dim.bodyHeight * 0.32, -dim.halfZ * 0.3]} rotation={[0, Math.PI / 2, 0.18]} material={createMaterial(PALETTE.scorch, 'iron')}>
      <boxGeometry args={[0.42, 0.06, 0.02]} /></mesh>
    <mesh position={[-dim.halfX - 0.018, dim.bodyTop - dim.bodyHeight * 0.5, dim.halfZ * 0.18]} rotation={[0, -Math.PI / 2, -0.22]} material={createMaterial(PALETTE.scorch, 'iron')}>
      <boxGeometry args={[0.36, 0.05, 0.02]} /></mesh>
    <mesh position={[dim.halfX * 0.2, dim.bodyTop + 0.005, dim.halfZ + 0.018]} rotation={[0, 0, 0.4]} material={createMaterial(PALETTE.scorch, 'iron')}>
      <boxGeometry args={[0.32, 0.04, 0.02]} /></mesh>
    <mesh castShadow position={[dim.halfX * 0.7, dim.baseLift + 0.06, dim.halfZ + 0.05]} rotation={[0.1, 0.3, 0.1]} material={createMaterial(PALETTE.bodyShellShadow, 'iron')}>
      <boxGeometry args={[0.18, 0.1, 0.14]} /></mesh>
  </group>
);
