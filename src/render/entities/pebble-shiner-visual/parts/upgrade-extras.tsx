import { PALETTE } from '../palette';
import type { MaterialFactory, PebbleShinerDimensions } from '../types';

type UpgradeExtrasProps = {
  dim: PebbleShinerDimensions;
  level: number;
  createMaterial: MaterialFactory;
};

export const UpgradeExtras = ({ dim, level, createMaterial }: UpgradeExtrasProps) => (
  <group>
    {level >= 3 ? (
      <mesh
        castShadow
        receiveShadow
        position={[0, dim.armY + 0.18, dim.postZ + 0.08]}
        rotation={[0.2, 0.4, 0.1]}
      >
        <boxGeometry args={[0.4, 0.05, 0.18]} />
        {createMaterial(PALETTE.woodTopShadow, 'wood')}
      </mesh>
    ) : null}

    {level >= 6 ? (
      <group position={[-dim.halfX - 0.18, dim.stoneTop - 0.04, dim.halfZ - 0.16]}>
        <mesh castShadow receiveShadow rotation={[0, 0.4, 0]}>
          <boxGeometry args={[0.16, 0.42, 0.06]} />
          {createMaterial(PALETTE.woodPost, 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.18, 0.06]} rotation={[0, 0.4, 0]}>
          <boxGeometry args={[0.18, 0.04, 0.16]} />
          {createMaterial(PALETTE.woodTopShadow, 'wood')}
        </mesh>
      </group>
    ) : null}
  </group>
);
