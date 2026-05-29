import { PALETTE } from '../palette';
import { DamagedDebrisGroup, DestroyedRubbleGroup } from '../../shared/damage-debris-group';
import type { MaterialFactory, TwigSnapperDimensions } from '../types';

type DestroyedOverlayProps = {
  dim: TwigSnapperDimensions;
  createMaterial: MaterialFactory;
};

export const DestroyedOverlay = ({ dim, createMaterial }: DestroyedOverlayProps) => (
  <DestroyedRubbleGroup rotation={[0.18, 0.24, -0.28]}>
    <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
      <boxGeometry args={[dim.halfX * 1.6, 0.16, dim.halfZ * 1.4]} />
      {createMaterial(PALETTE.plankShadow, 'wood')}
    </mesh>
    <mesh castShadow receiveShadow position={[0.22, 0.14, -0.1]} rotation={[0.2, 0.4, 0.4]}>
      <boxGeometry args={[0.5, 0.1, 0.14]} />
      {createMaterial(PALETTE.plankDark, 'wood')}
    </mesh>
    <mesh castShadow receiveShadow position={[-0.2, 0.16, 0.16]} rotation={[0.1, 0.5, 0.6]}>
      <boxGeometry args={[0.38, 0.1, 0.12]} />
      {createMaterial(PALETTE.plankMid, 'wood')}
    </mesh>
    <mesh
      castShadow
      receiveShadow
      position={[0.16, 0.22, 0.08]}
      rotation={[0, 0.4, Math.PI / 2]}
    >
      <cylinderGeometry args={[0.06, 0.06, 0.36, 10]} />
      {createMaterial(PALETTE.twigDark, 'wood')}
    </mesh>
    <mesh
      castShadow
      receiveShadow
      position={[-0.18, 0.2, -0.06]}
      rotation={[0.1, 0.8, Math.PI / 2 + 0.2]}
    >
      <cylinderGeometry args={[0.022, 0.022, 0.32, 8]} />
      {createMaterial(PALETTE.twigMid, 'wood')}
    </mesh>
  </DestroyedRubbleGroup>
);

type DamagedOverlayProps = {
  dim: TwigSnapperDimensions;
  createMaterial: MaterialFactory;
};

export const DamagedOverlay = ({ dim, createMaterial }: DamagedOverlayProps) => (
  <DamagedDebrisGroup>
    <mesh
      castShadow
      receiveShadow
      position={[dim.anvilX - 0.06, dim.anvilTop - 0.02, dim.anvilZ + 0.14]}
      rotation={[0.2, 0.4, 0.6]}
    >
      <boxGeometry args={[0.16, 0.04, 0.06]} />
      {createMaterial(PALETTE.plankShadow, 'wood')}
    </mesh>
    <mesh
      castShadow
      receiveShadow
      position={[0.18, 0.06, -0.34]}
      rotation={[0, 0.5, Math.PI / 2 + 0.2]}
    >
      <cylinderGeometry args={[0.018, 0.018, 0.22, 8]} />
      {createMaterial(PALETTE.twigDark, 'wood')}
    </mesh>
    <mesh
      castShadow
      receiveShadow
      position={[dim.postX - 0.1, dim.postTopY - 0.06, dim.postZ + 0.06]}
      rotation={[0.3, 0, 0.3]}
    >
      <boxGeometry args={[0.04, 0.18, 0.04]} />
      {createMaterial(PALETTE.postShadow, 'wood')}
    </mesh>
  </DamagedDebrisGroup>
);
