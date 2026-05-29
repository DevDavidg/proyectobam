import { PALETTE } from '../palette';
import type { MaterialFactory, PuttySquisherDimensions } from '../types';

type SpigotProps = {
  dim: PuttySquisherDimensions;
  createMaterial: MaterialFactory;
};

export const Spigot = ({ dim, createMaterial }: SpigotProps) => {
  const { spigotX, spigotY, spigotZ, cubeSize } = dim;
  return (
    <group position={[spigotX, spigotY, spigotZ]}>
      <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[cubeSize * 0.07, cubeSize * 0.09, cubeSize * 0.16, 14]} />
        {createMaterial(PALETTE.spigot, 'iron')}
      </mesh>
      <mesh castShadow receiveShadow position={[cubeSize * 0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[cubeSize * 0.075, cubeSize * 0.075, 0.02, 14]} />
        {createMaterial(PALETTE.spigotMetal, 'iron')}
      </mesh>
      <mesh position={[cubeSize * 0.105, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[cubeSize * 0.05, 14]} />
        {createMaterial(PALETTE.spigotInside, 'goo')}
      </mesh>
      <mesh castShadow receiveShadow position={[-cubeSize * 0.04, cubeSize * 0.09, 0]}>
        <boxGeometry args={[cubeSize * 0.05, cubeSize * 0.18, cubeSize * 0.05]} />
        {createMaterial(PALETTE.spigot, 'iron')}
      </mesh>
      <mesh castShadow receiveShadow position={[-cubeSize * 0.04, cubeSize * 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[cubeSize * 0.06, cubeSize * 0.06, cubeSize * 0.04, 12]} />
        {createMaterial(PALETTE.spigotMetal, 'iron')}
      </mesh>
    </group>
  );
};
