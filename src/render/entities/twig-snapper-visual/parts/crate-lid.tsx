import { PALETTE } from '../palette';
import type { MaterialFactory, TwigSnapperDimensions } from '../types';

type CrateLidProps = {
  dim: TwigSnapperDimensions;
  openProgress: number;
  createMaterial: MaterialFactory;
};

export const CrateLid = ({ dim, openProgress, createMaterial }: CrateLidProps) => {
  if (openProgress < 0.01) return null;
  const applied = Math.max(0.0001, Math.min(1, openProgress));
  const targetAngle = dim.lidOpenAngle * applied;
  const plankCount = 4;
  const plankWidth = dim.lidWidthX / plankCount;
  const tones = [PALETTE.lidMid, PALETTE.lidLight, PALETTE.lidMid, PALETTE.lidDark];

  return (
    <group position={[0, dim.lidHingeY, dim.lidHingeZ]} rotation={[targetAngle, 0, 0]}>
      <group position={[0, 0, dim.lidDepthZ / 2]}>
        <mesh castShadow receiveShadow material={createMaterial(PALETTE.lidMid, 'wood')}>
          <boxGeometry args={[dim.lidWidthX, dim.lidThickness, dim.lidDepthZ]} /></mesh>

        {Array.from({ length: plankCount }).map((_, index) => {
          const offsetX = -dim.lidWidthX / 2 + plankWidth / 2 + index * plankWidth;
          return (
            <mesh
              key={`lid-plank-${index}`}
              castShadow
              receiveShadow
              position={[offsetX, dim.lidThickness / 2 + 0.002, 0]}
             material={createMaterial(tones[index] ?? PALETTE.lidMid, 'wood')}>
              <boxGeometry args={[plankWidth - 0.012, 0.005, dim.lidDepthZ - 0.02]} /></mesh>
          );
        })}

        <mesh
          castShadow
          receiveShadow
          position={[0, dim.lidThickness / 2 + 0.006, -dim.lidDepthZ / 2 + 0.06]}
         material={createMaterial(PALETTE.lidStrap, 'iron')}>
          <boxGeometry args={[dim.lidWidthX - 0.06, 0.012, 0.022]} /></mesh>
        <mesh
          castShadow
          receiveShadow
          position={[0, dim.lidThickness / 2 + 0.006, dim.lidDepthZ / 2 - 0.06]}
         material={createMaterial(PALETTE.lidStrap, 'iron')}>
          <boxGeometry args={[dim.lidWidthX - 0.06, 0.012, 0.022]} /></mesh>

        <mesh
          castShadow
          receiveShadow
          position={[-dim.lidWidthX / 2 + 0.04, dim.lidThickness / 2 + 0.012, -dim.lidDepthZ / 2 + 0.05]}
          rotation={[Math.PI / 2, 0, 0]}
         material={createMaterial(PALETTE.lidStrap, 'iron')}>
          <cylinderGeometry args={[0.018, 0.018, 0.05, 10]} /></mesh>
        <mesh
          castShadow
          receiveShadow
          position={[dim.lidWidthX / 2 - 0.04, dim.lidThickness / 2 + 0.012, -dim.lidDepthZ / 2 + 0.05]}
          rotation={[Math.PI / 2, 0, 0]}
         material={createMaterial(PALETTE.lidStrap, 'iron')}>
          <cylinderGeometry args={[0.018, 0.018, 0.05, 10]} /></mesh>

        <mesh
          castShadow
          receiveShadow
          position={[0, -dim.lidThickness / 2 - 0.005, 0]}
         material={createMaterial(PALETTE.lidDark, 'wood')}>
          <boxGeometry args={[dim.lidWidthX - 0.02, 0.005, dim.lidDepthZ - 0.04]} /></mesh>
      </group>
    </group>
  );
};
