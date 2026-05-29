import type { Ref } from 'react';
import type { Group } from 'three';
import { OVERFLOW_TWIG_PILES } from '../geometry';
import { tonePaletteTwig } from '../helpers';
import type { MaterialFactory } from '../types';

type OverflowTwigsProps = {
  createMaterial: MaterialFactory;
  groupRef: Ref<Group>;
};

export const OverflowTwigs = ({ createMaterial, groupRef }: OverflowTwigsProps) => (
  <group ref={groupRef}>
    {OVERFLOW_TWIG_PILES.map((twig) => (
      <mesh
        key={twig.id}
        castShadow
        receiveShadow
        position={[twig.x, twig.y, twig.z]}
        rotation={[twig.tiltX, twig.rotationY, Math.PI / 2 + twig.tiltZ]}
        visible={false}
      >
        <cylinderGeometry args={[twig.thickness, twig.thickness * 0.7, twig.length, 8]} />
        {createMaterial(tonePaletteTwig(twig.tone), 'wood')}
      </mesh>
    ))}
  </group>
);
