import { PALETTE } from '../palette';
import type { MaterialFactory, TwigSnapperDimensions } from '../types';

type PivotPostProps = {
  dim: TwigSnapperDimensions;
  createMaterial: MaterialFactory;
};

export const PivotPost = ({ dim, createMaterial }: PivotPostProps) => {
  const postCenterY = dim.platformTop + dim.postHeight / 2;
  return (
    <group position={[dim.postX, postCenterY, dim.postZ]}>
      <mesh castShadow receiveShadow material={createMaterial(PALETTE.postMid, 'wood')}>
        <boxGeometry args={[dim.postWidth, dim.postHeight, dim.postDepth]} /></mesh>
      <mesh castShadow receiveShadow position={[dim.postWidth / 2 - 0.006, 0, 0]} material={createMaterial(PALETTE.postLight, 'wood')}>
        <boxGeometry args={[0.012, dim.postHeight - 0.04, dim.postDepth - 0.02]} /></mesh>
      <mesh castShadow receiveShadow position={[-dim.postWidth / 2 + 0.006, 0, 0]} material={createMaterial(PALETTE.postShadow, 'wood')}>
        <boxGeometry args={[0.012, dim.postHeight - 0.04, dim.postDepth - 0.02]} /></mesh>
      <mesh castShadow receiveShadow position={[0, dim.postHeight / 2 - 0.025, 0]} material={createMaterial(PALETTE.postShadow, 'wood')}>
        <boxGeometry args={[dim.postWidth + 0.02, 0.05, dim.postDepth + 0.02]} /></mesh>
      <mesh castShadow receiveShadow position={[0, -dim.postHeight / 2 + 0.04, 0]} material={createMaterial(PALETTE.postShadow, 'wood')}>
        <boxGeometry args={[dim.postWidth + 0.04, 0.08, dim.postDepth + 0.04]} /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[0, dim.hammerPivotY - postCenterY, dim.postDepth / 2 + 0.005]}
        rotation={[Math.PI / 2, 0, 0]}
       material={createMaterial(PALETTE.ironPin, 'iron')}>
        <cylinderGeometry args={[0.024, 0.024, dim.postDepth + 0.04, 12]} /></mesh>
      <mesh
        castShadow={false}
        receiveShadow
        position={[0, dim.hammerPivotY - postCenterY, dim.postDepth / 2 + 0.022]}
       material={createMaterial(PALETTE.ironPinHighlight, 'iron')}>
        <sphereGeometry args={[0.03, 12, 10]} /></mesh>
    </group>
  );
};
