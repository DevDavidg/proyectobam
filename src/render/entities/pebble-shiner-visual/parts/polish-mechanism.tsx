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
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.16, dim.postHeight, 0.16]} />
          {createMaterial(PALETTE.woodPost, 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[-0.085, 0, 0]}>
          <boxGeometry args={[0.005, dim.postHeight - 0.04, 0.13]} />
          {createMaterial(PALETTE.woodPostShadow, 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, dim.postHeight / 2 - 0.04, 0]}>
          <boxGeometry args={[0.18, 0.04, 0.18]} />
          {createMaterial(PALETTE.woodPostShadow, 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, -dim.postHeight / 2 + 0.04, 0]}>
          <boxGeometry args={[0.18, 0.04, 0.18]} />
          {createMaterial(PALETTE.woodPostShadow, 'wood')}
        </mesh>
      </group>

      <group position={[(dim.postX + dim.polishRodCenterX) / 2, dim.armY, dim.postZ]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[armLength, 0.12, 0.14]} />
          {createMaterial(PALETTE.woodArm, 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, -0.06, 0.07]}>
          <boxGeometry args={[armLength, 0.02, 0.005]} />
          {createMaterial(PALETTE.woodPostShadow, 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.06, -0.07]}>
          <boxGeometry args={[armLength, 0.02, 0.005]} />
          {createMaterial(PALETTE.woodTopLight, 'wood')}
        </mesh>
      </group>

      <mesh castShadow receiveShadow position={[dim.polishRodCenterX, dim.armY - 0.02, dim.postZ]}>
        <boxGeometry args={[0.16, 0.2, 0.16]} />
        {createMaterial(PALETTE.ironMount, 'iron')}
      </mesh>
      <mesh castShadow receiveShadow position={[dim.polishRodCenterX, dim.armY + 0.08, dim.postZ]}>
        <boxGeometry args={[0.18, 0.04, 0.18]} />
        {createMaterial(PALETTE.ironHandle, 'iron')}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[dim.polishRodCenterX, dim.armY - 0.04, dim.postZ]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.075, 0.014, 8, 16]} />
        {createMaterial(PALETTE.ironHandleHighlight, 'iron')}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[dim.polishRodCenterX + 0.09, dim.armY + 0.02, dim.postZ]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.018, 0.018, 0.18, 10]} />
        {createMaterial(PALETTE.ironHandleHighlight, 'iron')}
      </mesh>

      <group
        ref={polishRodRef}
        position={[
          dim.polishRodCenterX,
          (dim.polishRodTopY + dim.polishRodBottomY) / 2,
          dim.postZ,
        ]}
      >
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.052, 0.058, rodLength, 14]} />
          {createMaterial(PALETTE.woodPolishRod, 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, -rodLength / 2 + 0.04, 0]}>
          <cylinderGeometry args={[0.075, 0.052, 0.12, 14]} />
          {createMaterial(PALETTE.woodPolishRodTip, 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[0.06, -rodLength / 2 + 0.16, 0]}>
          <boxGeometry args={[0.05, 0.025, 0.07]} />
          {createMaterial(PALETTE.woodPolishRodTip, 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[-0.06, -rodLength / 2 + 0.24, 0]}>
          <boxGeometry args={[0.05, 0.025, 0.07]} />
          {createMaterial(PALETTE.woodPolishRodTip, 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, rodLength / 2 - 0.02, 0]}>
          <cylinderGeometry args={[0.062, 0.062, 0.05, 12]} />
          {createMaterial(PALETTE.ironMount, 'iron')}
        </mesh>
      </group>

      <mesh
        castShadow
        receiveShadow
        position={[dim.postX + 0.08, dim.handleAxisY, dim.postZ]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.03, 0.03, 0.04, 14]} />
        {createMaterial(PALETTE.ironMount, 'iron')}
      </mesh>

      <group ref={handleRef} position={[dim.postX + 0.1, dim.handleAxisY, dim.postZ]}>
        <mesh castShadow receiveShadow position={[0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.14, 14]} />
          {createMaterial(PALETTE.ironHandleHighlight, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0.14, 0, 0]}>
          <sphereGeometry args={[0.028, 12, 10]} />
          {createMaterial(PALETTE.ironHandleHighlight, 'iron')}
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[0.14, 0, 0.05]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.018, 0.018, 0.1, 12]} />
          {createMaterial(PALETTE.ironHandle, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0.14, 0, 0.1]}>
          <sphereGeometry args={[0.022, 12, 10]} />
          {createMaterial(PALETTE.ironHandle, 'iron')}
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[0.18, 0, 0.1]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.03, 0.03, 0.08, 14]} />
          {createMaterial(PALETTE.woodArm, 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[0.235, 0, 0.1]}>
          <sphereGeometry args={[0.028, 14, 12]} />
          {createMaterial(PALETTE.ironKnob, 'iron')}
        </mesh>
      </group>

      <mesh
        castShadow
        receiveShadow
        position={[dim.postX - 0.085, dim.handleAxisY, dim.postZ]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.022, 0.022, 0.04, 12]} />
        {createMaterial(PALETTE.ironKnob, 'iron')}
      </mesh>
    </group>
  );
};
