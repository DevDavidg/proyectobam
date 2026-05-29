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
      <mesh castShadow receiveShadow>
        <boxGeometry args={[dim.postWidth, dim.postHeight, dim.postDepth]} />
        {createMaterial(PALETTE.postMid, 'wood')}
      </mesh>
      <mesh castShadow receiveShadow position={[dim.postWidth / 2 - 0.006, 0, 0]}>
        <boxGeometry args={[0.012, dim.postHeight - 0.04, dim.postDepth - 0.02]} />
        {createMaterial(PALETTE.postLight, 'wood')}
      </mesh>
      <mesh castShadow receiveShadow position={[-dim.postWidth / 2 + 0.006, 0, 0]}>
        <boxGeometry args={[0.012, dim.postHeight - 0.04, dim.postDepth - 0.02]} />
        {createMaterial(PALETTE.postShadow, 'wood')}
      </mesh>
      <mesh castShadow receiveShadow position={[0, dim.postHeight / 2 - 0.025, 0]}>
        <boxGeometry args={[dim.postWidth + 0.02, 0.05, dim.postDepth + 0.02]} />
        {createMaterial(PALETTE.postShadow, 'wood')}
      </mesh>
      <mesh castShadow receiveShadow position={[0, -dim.postHeight / 2 + 0.04, 0]}>
        <boxGeometry args={[dim.postWidth + 0.04, 0.08, dim.postDepth + 0.04]} />
        {createMaterial(PALETTE.postShadow, 'wood')}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[0, dim.hammerPivotY - postCenterY, dim.postDepth / 2 + 0.005]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.024, 0.024, dim.postDepth + 0.04, 12]} />
        {createMaterial(PALETTE.ironPin, 'iron')}
      </mesh>
      <mesh
        castShadow={false}
        receiveShadow
        position={[0, dim.hammerPivotY - postCenterY, dim.postDepth / 2 + 0.022]}
      >
        <sphereGeometry args={[0.03, 12, 10]} />
        {createMaterial(PALETTE.ironPinHighlight, 'iron')}
      </mesh>
    </group>
  );
};
