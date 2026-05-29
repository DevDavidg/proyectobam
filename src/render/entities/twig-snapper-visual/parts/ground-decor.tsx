import {
  GROUND_TWIG_BUNDLE_LEFT,
  GROUND_TWIG_BUNDLE_RIGHT,
  STRAY_GROUND_TWIGS,
} from '../geometry';
import { tonePaletteTwig } from '../helpers';
import { PALETTE } from '../palette';
import { GrassTuftCluster } from '../../shared/grass-tuft-cluster';
import { GroundDecal } from '../../shared/ground-decal';
import type { GroundTwig, MaterialFactory, TwigSnapperDimensions } from '../types';

type GroundDecorProps = {
  dim: TwigSnapperDimensions;
  createMaterial: MaterialFactory;
};

const renderTwig = (twig: GroundTwig, createMaterial: MaterialFactory) => (
  <mesh
    key={twig.id}
    castShadow
    receiveShadow
    position={[twig.x, twig.y, twig.z]}
    rotation={[twig.tiltX, twig.rotationY, Math.PI / 2 + twig.tiltZ]}
  >
    <cylinderGeometry args={[twig.thickness, twig.thickness * 0.7, twig.length, 8]} />
    {createMaterial(tonePaletteTwig(twig.tone), 'wood')}
  </mesh>
);

export const GroundDecor = ({ dim, createMaterial }: GroundDecorProps) => (
  <group>
    <GroundDecal
      radius={Math.max(dim.halfX, dim.halfZ) + 0.7}
      color={PALETTE.ground}
      createMaterial={createMaterial}
    />
    <GroundDecal
      radius={0.36}
      color={PALETTE.groundDecal}
      createMaterial={createMaterial}
      y={0.014}
      segments={20}
      position={[0, 0.014, 0.4]}
    />

    {GROUND_TWIG_BUNDLE_LEFT.map((twig) => renderTwig(twig, createMaterial))}
    {GROUND_TWIG_BUNDLE_RIGHT.map((twig) => renderTwig(twig, createMaterial))}
    {STRAY_GROUND_TWIGS.map((twig) => renderTwig(twig, createMaterial))}

    <GrassTuftCluster
      position={[-0.42, 0.02, -0.86]}
      color={PALETTE.grassTuft}
      createMaterial={createMaterial}
      primaryRotation={[0, 0.4, 0.05]}
      secondaryRotation={[0, 1.1, -0.08]}
    />
    <GrassTuftCluster
      position={[0.46, 0.02, -0.9]}
      color={PALETTE.grassTuft}
      createMaterial={createMaterial}
      primaryRadius={0.045}
      primaryHeight={0.1}
      showSecondary={false}
      primaryRotation={[0, 0.4, 0.05]}
    />
  </group>
);
