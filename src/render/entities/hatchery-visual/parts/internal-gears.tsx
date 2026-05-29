import type { RefObject } from 'react';
import { getBoxGeometry } from '../../building-visual/geometry-cache';
import { INTERNAL_WOOD_BLOCKS } from '../constants';
import { HATCHERY_PALETTE } from '../palette';

type InternalWoodBlocksProps = {
  openingY: number;
  blocksRef: RefObject<import('three').Group | null>;
};

const WOOD_COLORS = {
  light: HATCHERY_PALETTE.woodLight,
  mid: HATCHERY_PALETTE.woodMid,
  dark: HATCHERY_PALETTE.woodDark,
} as const;

export const InternalWoodBlocks = ({ openingY, blocksRef }: InternalWoodBlocksProps) => (
  <group ref={blocksRef} position={[0, openingY - 0.08, 0]}>
    {INTERNAL_WOOD_BLOCKS.map((block, index) => (
      <group key={`wood-block-${index}`} position={block.pos} rotation={[0, block.rot, 0]}>
        <mesh castShadow={false} receiveShadow>
          <primitive
            attach="geometry"
            object={getBoxGeometry(block.size[0], block.size[1], block.size[2])}
          />
          <meshStandardMaterial
            color={WOOD_COLORS[block.color]}
            roughness={1}
            metalness={0}
            flatShading
          />
        </mesh>
        <mesh position={[block.size[0] * 0.15, 0, block.size[2] * 0.1]} rotation={[0, 0.4, 0]}>
          <primitive attach="geometry" object={getBoxGeometry(block.size[0] * 0.08, block.size[1] * 0.9, 0.02)} />
          <meshStandardMaterial color={HATCHERY_PALETTE.woodGrain} roughness={0.95} metalness={0} />
        </mesh>
      </group>
    ))}
  </group>
);
