import { PALETTE } from '../palette';
import type { MaterialFactory, PebbleShinerDimensions } from '../types';

type WoodFrameProps = {
  dim: PebbleShinerDimensions;
  createMaterial: MaterialFactory;
};

export const WoodFrame = ({ dim, createMaterial }: WoodFrameProps) => (
  <group position={[0, dim.stoneTop + dim.woodFrameHeight / 2, 0]}>
    <mesh castShadow receiveShadow position={[0, 0, -dim.halfZ + dim.woodFrameThickness / 2]} material={createMaterial(PALETTE.woodTopLight, 'wood')}>
      <boxGeometry args={[dim.halfX * 2 + 0.04, dim.woodFrameHeight, dim.woodFrameThickness]} /></mesh>
    <mesh castShadow receiveShadow position={[0, 0, dim.halfZ - dim.woodFrameThickness / 2]} material={createMaterial(PALETTE.woodTopLight, 'wood')}>
      <boxGeometry args={[dim.halfX * 2 + 0.04, dim.woodFrameHeight, dim.woodFrameThickness]} /></mesh>
    <mesh castShadow receiveShadow position={[-dim.halfX + dim.woodFrameThickness / 2, 0, 0]} material={createMaterial(PALETTE.woodTopMid, 'wood')}>
      <boxGeometry args={[dim.woodFrameThickness, dim.woodFrameHeight, dim.halfZ * 2 - dim.woodFrameThickness]} /></mesh>
    <mesh castShadow receiveShadow position={[dim.halfX - dim.woodFrameThickness / 2, 0, 0]} material={createMaterial(PALETTE.woodTopMid, 'wood')}>
      <boxGeometry args={[dim.woodFrameThickness, dim.woodFrameHeight, dim.halfZ * 2 - dim.woodFrameThickness]} /></mesh>
  </group>
);
