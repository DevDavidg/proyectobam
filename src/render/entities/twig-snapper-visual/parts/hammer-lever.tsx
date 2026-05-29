import type { Ref } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { MaterialFactory, TwigSnapperDimensions } from '../types';

type HammerLeverProps = {
  dim: TwigSnapperDimensions;
  level: number;
  createMaterial: MaterialFactory;
  hammerRef: Ref<Group>;
};

export const HammerLever = ({ dim, level, createMaterial, hammerRef }: HammerLeverProps) => {
  const armCenterX = -dim.hammerArmLength / 2 + 0.04;
  const tailLength = 0.18;
  const showIronBand = level >= 3;
  const showGoldTrim = level >= 10;

  return (
    <group ref={hammerRef} position={[dim.hammerPivotX, dim.hammerPivotY, dim.hammerPivotZ]}>
      <mesh castShadow receiveShadow position={[armCenterX, 0, 0]} material={createMaterial(PALETTE.hammerWoodMid, 'wood')}>
        <boxGeometry args={[dim.hammerArmLength, dim.hammerArmHeight, dim.hammerArmThickness]} /></mesh>
      <mesh castShadow receiveShadow position={[armCenterX, dim.hammerArmHeight / 2 - 0.006, 0]} material={createMaterial(PALETTE.hammerWoodLight, 'wood')}>
        <boxGeometry args={[dim.hammerArmLength - 0.04, 0.012, dim.hammerArmThickness - 0.02]} /></mesh>
      <mesh
        castShadow={false}
        receiveShadow
        position={[armCenterX, -dim.hammerArmHeight / 2 + 0.006, 0]}
       material={createMaterial(PALETTE.hammerWoodDark, 'wood')}>
        <boxGeometry args={[dim.hammerArmLength - 0.06, 0.012, dim.hammerArmThickness - 0.02]} /></mesh>

      <mesh
        castShadow
        receiveShadow
        position={[tailLength / 2 + 0.04, 0.02, 0]}
       material={createMaterial(PALETTE.hammerWoodMid, 'wood')}>
        <boxGeometry args={[tailLength, dim.hammerArmHeight * 0.7, dim.hammerArmThickness * 0.78]} /></mesh>
      <mesh
        castShadow={false}
        receiveShadow
        position={[tailLength + 0.04, 0.02, 0]}
       material={createMaterial(PALETTE.hammerWoodDark, 'wood')}>
        <sphereGeometry args={[dim.hammerArmHeight * 0.4, 12, 10]} /></mesh>

      <mesh
        castShadow={false}
        receiveShadow
        position={[0, 0, dim.hammerArmThickness / 2 + 0.002]}
        rotation={[Math.PI / 2, 0, 0]}
       material={createMaterial(PALETTE.ironPin, 'iron')}>
        <cylinderGeometry args={[0.022, 0.022, dim.hammerArmThickness + 0.04, 12]} /></mesh>

      <group position={[dim.hammerHeadX, -dim.hammerHeadHeight / 2 - dim.hammerArmHeight / 2 + 0.04, 0]}>
        <mesh castShadow receiveShadow material={createMaterial(PALETTE.hammerWoodMid, 'wood')}>
          <boxGeometry args={[dim.hammerHeadSize, dim.hammerHeadHeight, dim.hammerHeadSize]} /></mesh>
        <mesh castShadow receiveShadow position={[0, -dim.hammerHeadHeight / 2 + 0.014, 0]} material={createMaterial(PALETTE.hammerWoodDark, 'wood')}>
          <boxGeometry args={[dim.hammerHeadSize + 0.008, 0.028, dim.hammerHeadSize + 0.008]} /></mesh>
        <mesh castShadow receiveShadow position={[0, dim.hammerHeadHeight / 2 - 0.01, 0]} material={createMaterial(PALETTE.hammerWoodLight, 'wood')}>
          <boxGeometry args={[dim.hammerHeadSize - 0.02, 0.02, dim.hammerHeadSize - 0.02]} /></mesh>
        <mesh
          castShadow={false}
          receiveShadow
          position={[0, 0, dim.hammerHeadSize / 2 - 0.005]}
         material={createMaterial(PALETTE.hammerWoodDark, 'wood')}>
          <boxGeometry args={[dim.hammerHeadSize - 0.02, dim.hammerHeadHeight - 0.04, 0.005]} /></mesh>

        {showIronBand ? (
          <mesh castShadow receiveShadow material={createMaterial(PALETTE.ironBand, 'iron')}>
            <boxGeometry args={[dim.hammerHeadSize + 0.014, 0.032, dim.hammerHeadSize + 0.014]} /></mesh>
        ) : null}

        {showGoldTrim ? (
          <mesh castShadow receiveShadow position={[0, dim.hammerHeadHeight / 2 + 0.018, 0]} rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.goldTrim, 'gold')}>
            <torusGeometry args={[dim.hammerHeadSize * 0.55, 0.018, 8, 18]} /></mesh>
        ) : null}
      </group>
    </group>
  );
};
