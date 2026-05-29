import type { Ref } from 'react';
import type { Group } from 'three';
import { DEBRIS_TWIGS } from '../geometry';
import { tonePaletteTwig } from '../helpers';
import type { MaterialFactory, TwigSnapperDimensions } from '../types';

type TwigDebrisProps = {
  dim: TwigSnapperDimensions;
  createMaterial: MaterialFactory;
  debrisRef: Ref<Group>;
};

export const TwigDebris = ({ dim, createMaterial, debrisRef }: TwigDebrisProps) => (
  <group
    ref={debrisRef}
    position={[dim.anvilX, dim.anvilTop + 0.02, dim.anvilZ]}
  >
    {DEBRIS_TWIGS.map((twig) => (
      <mesh
        key={twig.id}
        castShadow={false}
        receiveShadow
        position={[twig.offsetX, 0, twig.offsetZ]}
        rotation={[0, twig.spinAxisY, Math.PI / 2]}
        visible={false}
       material={createMaterial(tonePaletteTwig(twig.tone), 'wood')}>
        <cylinderGeometry args={[twig.thickness, twig.thickness * 0.8, twig.length, 8]} /></mesh>
    ))}
  </group>
);
