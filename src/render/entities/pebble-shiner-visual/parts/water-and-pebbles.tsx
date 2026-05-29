import type { Ref } from 'react';
import type { Group, Mesh } from 'three';
import { PALETTE } from '../palette';
import { tonePalette } from '../helpers';
import type { InteriorPebble, MaterialFactory, PebbleShinerDimensions } from '../types';

type WaterAndPebblesProps = {
  dim: PebbleShinerDimensions;
  interiorPebbles: InteriorPebble[];
  createMaterial: MaterialFactory;
  waterRef: Ref<Mesh>;
  pebblesRef: Ref<Group>;
  sparkleRef: Ref<Group>;
};

const SPARKLE_POSITIONS = [
  { id: 'sp-1', x: 0.05, z: 0.02 },
  { id: 'sp-2', x: -0.18, z: 0.12 },
  { id: 'sp-3', x: 0.16, z: -0.12 },
  { id: 'sp-4', x: -0.04, z: -0.18 },
];

export const WaterAndPebbles = ({
  dim,
  interiorPebbles,
  createMaterial,
  waterRef,
  pebblesRef,
  sparkleRef,
}: WaterAndPebblesProps) => (
  <group>
    <mesh receiveShadow position={[0, dim.baseLift + 0.04, 0]} material={createMaterial(PALETTE.waterDeep, 'goo')}>
      <boxGeometry args={[dim.innerHalfX * 2, 0.02, dim.innerHalfZ * 2]} /></mesh>
    <mesh ref={waterRef} receiveShadow position={[0, dim.waterY, 0]} material={createMaterial(PALETTE.waterSurface, 'goo')}>
      <boxGeometry args={[dim.innerHalfX * 2 - 0.02, 0.04, dim.innerHalfZ * 2 - 0.02]} /></mesh>
    <mesh receiveShadow position={[0, dim.waterY + 0.024, 0]} material={createMaterial(PALETTE.waterSurfaceHighlight, 'goo')}>
      <boxGeometry args={[dim.innerHalfX * 2 - 0.18, 0.005, dim.innerHalfZ * 2 - 0.16]} /></mesh>

    <group ref={pebblesRef} position={[0, dim.waterY - 0.02, 0]}>
      {interiorPebbles.map((shape) => (
        <mesh
          key={shape.id}
          castShadow
          receiveShadow
          position={[shape.x, 0, shape.z]}
          rotation={[shape.rotation * 0.4, shape.rotation, shape.rotation * 0.2]}
         material={createMaterial(tonePalette(shape.tone), 'stone')}>
          <boxGeometry args={[shape.size, shape.size * 0.7, shape.size]} /></mesh>
      ))}
    </group>

    <group ref={sparkleRef}>
      {SPARKLE_POSITIONS.map((p, idx) => (
        <mesh
          key={p.id}
          position={[p.x, dim.waterY + 0.06, p.z]}
          rotation={[Math.PI / 4, idx, idx * 0.5]}
          visible={false}
         material={createMaterial(PALETTE.sparkle, 'gold')}>
          <boxGeometry args={[0.022, 0.022, 0.022]} /></mesh>
      ))}
    </group>
  </group>
);
