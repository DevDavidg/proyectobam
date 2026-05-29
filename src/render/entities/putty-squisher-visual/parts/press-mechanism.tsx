import type { Ref } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { MaterialFactory, PuttySquisherDimensions } from '../types';

type PressMechanismProps = {
  dim: PuttySquisherDimensions;
  createMaterial: MaterialFactory;
  rootRef?: Ref<Group>;
  leverRef: Ref<Group>;
  bladeRef: Ref<Group>;
};

export const PressMechanism = ({
  dim,
  createMaterial,
  rootRef,
  leverRef,
  bladeRef,
}: PressMechanismProps) => {
  const {
    cubeSize,
    cubeTopY,
    mountWidth,
    mountDepth,
    mountHeight,
    mountCenterX,
    mountCenterZ,
    pivotY,
    leverLength,
  } = dim;

  return (
    <group ref={rootRef}>
      <group position={[mountCenterX, cubeTopY, mountCenterZ]}>
        <mesh castShadow receiveShadow position={[0, mountHeight * 0.5, 0]} material={createMaterial(PALETTE.mountBlock, 'iron')}>
          <boxGeometry args={[mountWidth, mountHeight, mountDepth]} /></mesh>
        <mesh castShadow receiveShadow position={[0, mountHeight - 0.005, 0]} material={createMaterial(PALETTE.mountHighlight, 'iron')}>
          <boxGeometry args={[mountWidth * 0.96, 0.02, mountDepth * 0.96]} /></mesh>
        <mesh castShadow receiveShadow position={[mountWidth * 0.5 - 0.005, mountHeight * 0.5, 0]} material={createMaterial(PALETTE.mountShadow, 'iron')}>
          <boxGeometry args={[0.02, mountHeight * 0.96, mountDepth * 0.96]} /></mesh>
        <mesh castShadow receiveShadow position={[0, mountHeight + 0.02, 0]} material={createMaterial(PALETTE.pivotShaft, 'iron')}>
          <cylinderGeometry args={[cubeSize * 0.05, cubeSize * 0.05, 0.04, 12]} /></mesh>
      </group>

      <group ref={bladeRef} position={[0, cubeTopY - cubeSize * 0.15, 0]}>
        <mesh castShadow receiveShadow material={createMaterial(PALETTE.bladeMetal, 'iron')}>
          <boxGeometry args={[cubeSize * 0.78, 0.02, cubeSize * 0.6]} /></mesh>
        <mesh castShadow receiveShadow position={[0, -0.012, 0]} material={createMaterial(PALETTE.bladeShadow, 'iron')}>
          <boxGeometry args={[cubeSize * 0.74, 0.008, cubeSize * 0.56]} /></mesh>
      </group>

      <group ref={leverRef} position={[mountCenterX, pivotY, mountCenterZ]}>
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.pivotShaft, 'iron')}>
          <cylinderGeometry args={[cubeSize * 0.06, cubeSize * 0.06, mountDepth + 0.02, 12]} /></mesh>
        <mesh castShadow receiveShadow position={[leverLength * 0.5, 0, 0]} material={createMaterial(PALETTE.leverArm, 'iron')}>
          <boxGeometry args={[leverLength, cubeSize * 0.08, cubeSize * 0.08]} /></mesh>
        <mesh castShadow receiveShadow position={[leverLength * 0.5, cubeSize * 0.045, 0]} material={createMaterial(PALETTE.leverArmShine, 'iron')}>
          <boxGeometry args={[leverLength * 0.96, 0.012, cubeSize * 0.018]} /></mesh>
        <mesh castShadow receiveShadow position={[leverLength * 0.18, 0, 0]} material={createMaterial(PALETTE.leverKnob, 'iron')}>
          <boxGeometry args={[cubeSize * 0.14, cubeSize * 0.13, cubeSize * 0.13]} /></mesh>
        <mesh castShadow receiveShadow position={[leverLength, 0, 0]} material={createMaterial(PALETTE.leverKnob, 'iron')}>
          <boxGeometry args={[cubeSize * 0.18, cubeSize * 0.16, cubeSize * 0.16]} /></mesh>
        <mesh castShadow receiveShadow position={[leverLength + cubeSize * 0.1, 0, 0]} material={createMaterial(PALETTE.leverGrip, 'iron')}>
          <boxGeometry args={[cubeSize * 0.08, cubeSize * 0.1, cubeSize * 0.1]} /></mesh>
      </group>
    </group>
  );
};
