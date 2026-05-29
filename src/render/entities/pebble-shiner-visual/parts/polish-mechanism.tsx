import type { Ref } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { MaterialFactory, PebbleShinerDimensions } from '../types';

type PolishMechanismProps = {
  dim: PebbleShinerDimensions;
  createMaterial: MaterialFactory;
  handleRef: Ref<Group>;
  polishRodRef: Ref<Group>;
  rootRef?: Ref<Group>;
};

export const PolishMechanism = ({
  dim,
  createMaterial,
  handleRef,
  polishRodRef,
  rootRef,
}: PolishMechanismProps) => {
  const armLength = Math.abs(dim.postX - dim.polishRodCenterX) + 0.06;
  const rodLength = dim.polishRodTopY - dim.polishRodBottomY;
  return (
    <group ref={rootRef}>
      <group position={[dim.postX, dim.postBaseY + dim.postHeight / 2, dim.postZ]}>
        <mesh castShadow receiveShadow material={createMaterial(PALETTE.woodPost, 'wood')}>
          <boxGeometry args={[0.16, dim.postHeight, 0.16]} /></mesh>
        <mesh castShadow receiveShadow position={[-0.085, 0, 0]} material={createMaterial(PALETTE.woodPostShadow, 'wood')}>
          <boxGeometry args={[0.005, dim.postHeight - 0.04, 0.13]} /></mesh>
        <mesh castShadow receiveShadow position={[0, dim.postHeight / 2 - 0.04, 0]} material={createMaterial(PALETTE.woodPostShadow, 'wood')}>
          <boxGeometry args={[0.18, 0.04, 0.18]} /></mesh>
        <mesh castShadow receiveShadow position={[0, -dim.postHeight / 2 + 0.04, 0]} material={createMaterial(PALETTE.woodPostShadow, 'wood')}>
          <boxGeometry args={[0.18, 0.04, 0.18]} /></mesh>
      </group>

      <group position={[(dim.postX + dim.polishRodCenterX) / 2, dim.armY, dim.postZ]}>
        <mesh castShadow receiveShadow material={createMaterial(PALETTE.woodArm, 'wood')}>
          <boxGeometry args={[armLength, 0.12, 0.14]} /></mesh>
        <mesh castShadow receiveShadow position={[0, -0.06, 0.07]} material={createMaterial(PALETTE.woodPostShadow, 'wood')}>
          <boxGeometry args={[armLength, 0.02, 0.005]} /></mesh>
        <mesh castShadow receiveShadow position={[0, 0.06, -0.07]} material={createMaterial(PALETTE.woodTopLight, 'wood')}>
          <boxGeometry args={[armLength, 0.02, 0.005]} /></mesh>
      </group>

      <mesh castShadow receiveShadow position={[dim.polishRodCenterX, dim.armY - 0.02, dim.postZ]} material={createMaterial(PALETTE.ironMount, 'iron')}>
        <boxGeometry args={[0.16, 0.2, 0.16]} /></mesh>
      <mesh castShadow receiveShadow position={[dim.polishRodCenterX, dim.armY + 0.08, dim.postZ]} material={createMaterial(PALETTE.ironHandle, 'iron')}>
        <boxGeometry args={[0.18, 0.04, 0.18]} /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[dim.polishRodCenterX, dim.armY - 0.04, dim.postZ]}
        rotation={[Math.PI / 2, 0, 0]}
       material={createMaterial(PALETTE.ironHandleHighlight, 'iron')}>
        <torusGeometry args={[0.075, 0.014, 8, 16]} /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[dim.polishRodCenterX + 0.09, dim.armY + 0.02, dim.postZ]}
        rotation={[0, 0, Math.PI / 2]}
       material={createMaterial(PALETTE.ironHandleHighlight, 'iron')}>
        <cylinderGeometry args={[0.018, 0.018, 0.18, 10]} /></mesh>

      <group
        ref={polishRodRef}
        position={[
          dim.polishRodCenterX,
          (dim.polishRodTopY + dim.polishRodBottomY) / 2,
          dim.postZ,
        ]}
      >
        <mesh castShadow receiveShadow material={createMaterial(PALETTE.woodPolishRod, 'wood')}>
          <cylinderGeometry args={[0.052, 0.058, rodLength, 14]} /></mesh>
        <mesh castShadow receiveShadow position={[0, -rodLength / 2 + 0.04, 0]} material={createMaterial(PALETTE.woodPolishRodTip, 'wood')}>
          <cylinderGeometry args={[0.075, 0.052, 0.12, 14]} /></mesh>
        <mesh castShadow receiveShadow position={[0.06, -rodLength / 2 + 0.16, 0]} material={createMaterial(PALETTE.woodPolishRodTip, 'wood')}>
          <boxGeometry args={[0.05, 0.025, 0.07]} /></mesh>
        <mesh castShadow receiveShadow position={[-0.06, -rodLength / 2 + 0.24, 0]} material={createMaterial(PALETTE.woodPolishRodTip, 'wood')}>
          <boxGeometry args={[0.05, 0.025, 0.07]} /></mesh>
        <mesh castShadow receiveShadow position={[0, rodLength / 2 - 0.02, 0]} material={createMaterial(PALETTE.ironMount, 'iron')}>
          <cylinderGeometry args={[0.062, 0.062, 0.05, 12]} /></mesh>
      </group>

      <mesh
        castShadow
        receiveShadow
        position={[dim.postX + 0.08, dim.handleAxisY, dim.postZ]}
        rotation={[0, 0, Math.PI / 2]}
       material={createMaterial(PALETTE.ironMount, 'iron')}>
        <cylinderGeometry args={[0.03, 0.03, 0.04, 14]} /></mesh>

      <group ref={handleRef} position={[dim.postX + 0.1, dim.handleAxisY, dim.postZ]}>
        <mesh castShadow receiveShadow position={[0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.ironHandleHighlight, 'iron')}>
          <cylinderGeometry args={[0.022, 0.022, 0.14, 14]} /></mesh>
        <mesh castShadow receiveShadow position={[0.14, 0, 0]} material={createMaterial(PALETTE.ironHandleHighlight, 'iron')}>
          <sphereGeometry args={[0.028, 12, 10]} /></mesh>
        <mesh
          castShadow
          receiveShadow
          position={[0.14, 0, 0.05]}
          rotation={[Math.PI / 2, 0, 0]}
         material={createMaterial(PALETTE.ironHandle, 'iron')}>
          <cylinderGeometry args={[0.018, 0.018, 0.1, 12]} /></mesh>
        <mesh castShadow receiveShadow position={[0.14, 0, 0.1]} material={createMaterial(PALETTE.ironHandle, 'iron')}>
          <sphereGeometry args={[0.022, 12, 10]} /></mesh>
        <mesh
          castShadow
          receiveShadow
          position={[0.18, 0, 0.1]}
          rotation={[0, 0, Math.PI / 2]}
         material={createMaterial(PALETTE.woodArm, 'wood')}>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 14]} /></mesh>
        <mesh castShadow receiveShadow position={[0.235, 0, 0.1]} material={createMaterial(PALETTE.ironKnob, 'iron')}>
          <sphereGeometry args={[0.028, 14, 12]} /></mesh>
      </group>

      <mesh
        castShadow
        receiveShadow
        position={[dim.postX - 0.085, dim.handleAxisY, dim.postZ]}
        rotation={[0, 0, Math.PI / 2]}
       material={createMaterial(PALETTE.ironKnob, 'iron')}>
        <cylinderGeometry args={[0.022, 0.022, 0.04, 12]} /></mesh>
    </group>
  );
};
