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
        <mesh castShadow receiveShadow position={[0, mountHeight * 0.5, 0]}>
          <boxGeometry args={[mountWidth, mountHeight, mountDepth]} />
          {createMaterial(PALETTE.mountBlock, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, mountHeight - 0.005, 0]}>
          <boxGeometry args={[mountWidth * 0.96, 0.02, mountDepth * 0.96]} />
          {createMaterial(PALETTE.mountHighlight, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[mountWidth * 0.5 - 0.005, mountHeight * 0.5, 0]}>
          <boxGeometry args={[0.02, mountHeight * 0.96, mountDepth * 0.96]} />
          {createMaterial(PALETTE.mountShadow, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, mountHeight + 0.02, 0]}>
          <cylinderGeometry args={[cubeSize * 0.05, cubeSize * 0.05, 0.04, 12]} />
          {createMaterial(PALETTE.pivotShaft, 'iron')}
        </mesh>
      </group>

      <group ref={bladeRef} position={[0, cubeTopY - cubeSize * 0.15, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[cubeSize * 0.78, 0.02, cubeSize * 0.6]} />
          {createMaterial(PALETTE.bladeMetal, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, -0.012, 0]}>
          <boxGeometry args={[cubeSize * 0.74, 0.008, cubeSize * 0.56]} />
          {createMaterial(PALETTE.bladeShadow, 'iron')}
        </mesh>
      </group>

      <group ref={leverRef} position={[mountCenterX, pivotY, mountCenterZ]}>
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[cubeSize * 0.06, cubeSize * 0.06, mountDepth + 0.02, 12]} />
          {createMaterial(PALETTE.pivotShaft, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[leverLength * 0.5, 0, 0]}>
          <boxGeometry args={[leverLength, cubeSize * 0.08, cubeSize * 0.08]} />
          {createMaterial(PALETTE.leverArm, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[leverLength * 0.5, cubeSize * 0.045, 0]}>
          <boxGeometry args={[leverLength * 0.96, 0.012, cubeSize * 0.018]} />
          {createMaterial(PALETTE.leverArmShine, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[leverLength * 0.18, 0, 0]}>
          <boxGeometry args={[cubeSize * 0.14, cubeSize * 0.13, cubeSize * 0.13]} />
          {createMaterial(PALETTE.leverKnob, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[leverLength, 0, 0]}>
          <boxGeometry args={[cubeSize * 0.18, cubeSize * 0.16, cubeSize * 0.16]} />
          {createMaterial(PALETTE.leverKnob, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[leverLength + cubeSize * 0.1, 0, 0]}>
          <boxGeometry args={[cubeSize * 0.08, cubeSize * 0.1, cubeSize * 0.1]} />
          {createMaterial(PALETTE.leverGrip, 'iron')}
        </mesh>
      </group>
    </group>
  );
};
