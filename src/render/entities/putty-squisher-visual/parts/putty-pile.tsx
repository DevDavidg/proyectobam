import type { Ref } from 'react';
import type { Mesh } from 'three';
import { PUTTY_GRID_COLS } from '../geometry';
import { PALETTE } from '../palette';
import type { MaterialFactory, PuttySlot } from '../types';

type PuttyPileProps = {
  slots: PuttySlot[];
  visibleCount: number;
  newestIndex: number;
  newestRef: Ref<Mesh>;
  createMaterial: MaterialFactory;
};

export const PuttyPile = ({
  slots,
  visibleCount,
  newestIndex,
  newestRef,
  createMaterial,
}: PuttyPileProps) => (
  <group>
    {slots.map((slot, index) => {
      if (index >= visibleCount) return null;
      const isNewest = index === newestIndex;
      const isTopRim = index % PUTTY_GRID_COLS === PUTTY_GRID_COLS - 1;
      const cubeColor = isTopRim ? PALETTE.puttyCubeTop : PALETTE.puttyCubeMid;
      return (
        <group
          key={slot.id}
          position={[slot.x, slot.y, slot.z]}
          rotation={[0, slot.rotY, 0]}
        >
          <mesh ref={isNewest ? newestRef : undefined} castShadow receiveShadow material={createMaterial(cubeColor, 'goo')}>
            <boxGeometry args={[slot.size, slot.size, slot.size]} /></mesh>
          <mesh castShadow receiveShadow position={[0, slot.size * 0.5 + 0.001, 0]} material={createMaterial(PALETTE.puttyCubeTop, 'goo')}>
            <boxGeometry args={[slot.size * 0.94, 0.006, slot.size * 0.94]} /></mesh>
          <mesh
            receiveShadow
            position={[0, -slot.size * 0.5 + 0.001, 0]}
            rotation={[Math.PI / 2, 0, 0]}
           material={createMaterial(PALETTE.puttyCubeShadow, 'goo')}>
            <boxGeometry args={[slot.size * 0.94, slot.size * 0.94, 0.004]} /></mesh>
        </group>
      );
    })}
  </group>
);
