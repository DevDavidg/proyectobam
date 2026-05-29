import { PALETTE } from '../palette';
import type { MaterialFactory, TwigSnapperDimensions } from '../types';

type UpgradeExtrasProps = {
  dim: TwigSnapperDimensions;
  level: number;
  createMaterial: MaterialFactory;
};

export const UpgradeExtras = ({ dim, level, createMaterial }: UpgradeExtrasProps) => (
  <group>
    {level >= 3 ? (
      <>
        <mesh
          castShadow
          receiveShadow
          position={[dim.postX, dim.platformTop + dim.postHeight * 0.55, dim.postZ + dim.postDepth / 2 + 0.005]}
         material={createMaterial(PALETTE.ironBand, 'iron')}>
          <boxGeometry args={[dim.postWidth + 0.02, 0.04, 0.012]} /></mesh>
        <mesh
          castShadow
          receiveShadow
          position={[dim.postX, dim.platformTop + dim.postHeight * 0.25, dim.postZ + dim.postDepth / 2 + 0.005]}
         material={createMaterial(PALETTE.ironBand, 'iron')}>
          <boxGeometry args={[dim.postWidth + 0.02, 0.04, 0.012]} /></mesh>
      </>
    ) : null}

    {level >= 6 ? (
      <group position={[dim.postX, dim.hammerPivotY, dim.postZ - dim.postDepth / 2 - 0.04]}>
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.ironBand, 'iron')}>
          <cylinderGeometry args={[0.09, 0.09, 0.05, 14]} /></mesh>
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.ironBandLight, 'iron')}>
          <torusGeometry args={[0.07, 0.014, 8, 14]} /></mesh>
      </group>
    ) : null}

    {level >= 10 ? (
      <>
        <mesh
          castShadow
          receiveShadow
          position={[dim.postX, dim.postTopY + 0.04, dim.postZ]}
         material={createMaterial(PALETTE.goldTrim, 'gold')}>
          <boxGeometry args={[dim.postWidth + 0.06, 0.04, dim.postDepth + 0.06]} /></mesh>
        <mesh
          castShadow
          receiveShadow
          position={[dim.postX, dim.postTopY + 0.1, dim.postZ]}
         material={createMaterial(PALETTE.goldTrim, 'gold')}>
          <coneGeometry args={[0.06, 0.12, 6]} /></mesh>
      </>
    ) : null}
  </group>
);
