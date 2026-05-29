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
      <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.spigot, 'iron')}>
        <cylinderGeometry args={[cubeSize * 0.07, cubeSize * 0.09, cubeSize * 0.16, 14]} /></mesh>
      <mesh castShadow receiveShadow position={[cubeSize * 0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.spigotMetal, 'iron')}>
        <cylinderGeometry args={[cubeSize * 0.075, cubeSize * 0.075, 0.02, 14]} /></mesh>
      <mesh position={[cubeSize * 0.105, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={createMaterial(PALETTE.spigotInside, 'goo')}>
        <circleGeometry args={[cubeSize * 0.05, 14]} /></mesh>
      <mesh castShadow receiveShadow position={[-cubeSize * 0.04, cubeSize * 0.09, 0]} material={createMaterial(PALETTE.spigot, 'iron')}>
        <boxGeometry args={[cubeSize * 0.05, cubeSize * 0.18, cubeSize * 0.05]} /></mesh>
      <mesh castShadow receiveShadow position={[-cubeSize * 0.04, cubeSize * 0.18, 0]} rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.spigotMetal, 'iron')}>
        <cylinderGeometry args={[cubeSize * 0.06, cubeSize * 0.06, cubeSize * 0.04, 12]} /></mesh>
    </group>
  );
};
