import { GROUND_PEBBLES } from '../geometry';
import { tonePaletteGround } from '../helpers';
import { PALETTE } from '../palette';
import { GrassTuftCluster } from '../../shared/grass-tuft-cluster';
import { GroundDecal } from '../../shared/ground-decal';
import type { MaterialFactory, PebbleShinerDimensions } from '../types';

type GroundDecorProps = {
  dim: PebbleShinerDimensions;
  createMaterial: MaterialFactory;
};

export const GroundDecor = ({ dim, createMaterial }: GroundDecorProps) => (
  <group>
    <GroundDecal
      radius={Math.max(dim.halfX, dim.halfZ) + 0.55}
      color={PALETTE.groundDecal}
      createMaterial={createMaterial}
    />

    {GROUND_PEBBLES.map((pebble) => (
      <mesh
        key={pebble.id}
        castShadow
        receiveShadow
        position={[pebble.x, 0.025 + pebble.size * 0.3, pebble.z]}
        rotation={[0.1, pebble.rotation, 0.15]}
       material={createMaterial(tonePaletteGround(pebble.tone), 'stone')}>
        <sphereGeometry args={[pebble.size, 10, 8]} /></mesh>
    ))}

    <GrassTuftCluster
      position={[-0.08, 0.02, 0.78]}
      color={PALETTE.grassTuft}
      createMaterial={createMaterial}
    />
  </group>
);
