import { PALETTE } from '../palette';
import type { MaterialFactory, TwigSnapperDimensions } from '../types';

type AnvilBlockProps = {
  dim: TwigSnapperDimensions;
  createMaterial: MaterialFactory;
};

export const AnvilBlock = ({ dim, createMaterial }: AnvilBlockProps) => {
  const centerY = dim.platformTop + dim.anvilHeight / 2;
  return (
    <group position={[dim.anvilX, centerY, dim.anvilZ]}>
      <mesh castShadow receiveShadow material={createMaterial(PALETTE.anvilMid, 'wood')}>
        <boxGeometry args={[dim.anvilWidth, dim.anvilHeight, dim.anvilDepth]} /></mesh>
      <mesh castShadow receiveShadow position={[0, dim.anvilHeight / 2 - 0.005, 0]} material={createMaterial(PALETTE.anvilLight, 'wood')}>
        <boxGeometry args={[dim.anvilWidth - 0.02, 0.012, dim.anvilDepth - 0.02]} /></mesh>
      <mesh castShadow receiveShadow position={[0, -dim.anvilHeight / 2 + 0.01, 0]} material={createMaterial(PALETTE.anvilDark, 'wood')}>
        <boxGeometry args={[dim.anvilWidth + 0.005, 0.018, dim.anvilDepth + 0.005]} /></mesh>
      <mesh
        castShadow={false}
        receiveShadow
        position={[-dim.anvilWidth / 2 + 0.012, 0, 0]}
       material={createMaterial(PALETTE.anvilDark, 'wood')}>
        <boxGeometry args={[0.005, dim.anvilHeight - 0.02, dim.anvilDepth - 0.02]} /></mesh>
      <mesh
        castShadow={false}
        receiveShadow
        position={[dim.anvilWidth / 2 - 0.012, 0, 0]}
       material={createMaterial(PALETTE.anvilDark, 'wood')}>
        <boxGeometry args={[0.005, dim.anvilHeight - 0.02, dim.anvilDepth - 0.02]} /></mesh>
    </group>
  );
};
