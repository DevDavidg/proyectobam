import { PALETTE } from '../palette';
import { DamagedDebrisGroup, DestroyedRubbleGroup } from '../../shared/damage-debris-group';
import type { MaterialFactory, PebbleShinerDimensions } from '../types';

type DestroyedOverlayProps = {
  dim: PebbleShinerDimensions;
  createMaterial: MaterialFactory;
};

export const DestroyedOverlay = ({ dim, createMaterial }: DestroyedOverlayProps) => (
  <DestroyedRubbleGroup rotation={[0.16, 0.2, -0.32]}>
    <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
      <boxGeometry args={[dim.halfX * 1.7, 0.22, dim.halfZ * 1.4]} />
      {createMaterial(PALETTE.stoneCornerShadow, 'stone')}
    </mesh>
    <mesh castShadow receiveShadow position={[0.18, 0.18, -0.1]} rotation={[0.3, 0, 0.3]}>
      <boxGeometry args={[0.5, 0.14, 0.16]} />
      {createMaterial(PALETTE.woodPost, 'wood')}
    </mesh>
    <mesh castShadow receiveShadow position={[-0.22, 0.14, 0.18]} rotation={[0, 0.4, 0]}>
      <sphereGeometry args={[0.16, 10, 8]} />
      {createMaterial(PALETTE.pebbleMid, 'stone')}
    </mesh>
    <mesh castShadow receiveShadow position={[0.28, 0.1, 0.12]}>
      <sphereGeometry args={[0.1, 10, 8]} />
      {createMaterial(PALETTE.pebbleWarm, 'stone')}
    </mesh>
  </DestroyedRubbleGroup>
);

type DamagedOverlayProps = {
  dim: PebbleShinerDimensions;
  createMaterial: MaterialFactory;
};

export const DamagedOverlay = ({ dim, createMaterial }: DamagedOverlayProps) => (
  <DamagedDebrisGroup>
    <mesh
      castShadow
      receiveShadow
      position={[-0.18, dim.stoneTop + 0.06, 0.18]}
      rotation={[0.3, 0.4, 0.2]}
    >
      <boxGeometry args={[0.18, 0.06, 0.12]} />
      {createMaterial(PALETTE.stoneCornerShadow, 'stone')}
    </mesh>
    <mesh
      castShadow
      receiveShadow
      position={[0.16, 0.04, -0.32]}
      rotation={[0, 0.5, 0]}
    >
      <sphereGeometry args={[0.07, 8, 6]} />
      {createMaterial(PALETTE.pebbleDark, 'stone')}
    </mesh>
    <mesh
      castShadow
      receiveShadow
      position={[0.34, dim.armY - 0.02, dim.postZ + 0.08]}
      rotation={[0.3, 0, 0.5]}
    >
      <boxGeometry args={[0.04, 0.18, 0.04]} />
      {createMaterial(PALETTE.woodPostShadow, 'wood')}
    </mesh>
  </DamagedDebrisGroup>
);
