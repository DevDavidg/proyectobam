import { forwardRef } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { GooFactoryDimensions } from '../geometry';
import type { CreateMaterial } from '../types';

type OverflowProps = {
  dim: GooFactoryDimensions;
  createMaterial: CreateMaterial;
};

const OVERFLOW_SLOTS = [
  { id: 'a', angle: 0.25, drop: 0.18 },
  { id: 'b', angle: 1.1, drop: 0.22 },
  { id: 'c', angle: 2, drop: 0.16 },
  { id: 'd', angle: 2.85, drop: 0.24 },
  { id: 'e', angle: 3.85, drop: 0.18 },
  { id: 'f', angle: 4.65, drop: 0.2 },
  { id: 'g', angle: 5.55, drop: 0.14 },
];

export const Overflow = forwardRef<Group, OverflowProps>(({ dim, createMaterial }, ref) => (
  <group
    ref={ref}
    position={[0, dim.tankTop - 0.05, 0]}
    scale={[0.0001, 0.0001, 0.0001]}
  >
    {OVERFLOW_SLOTS.map((slot) => {
      const cosA = Math.cos(slot.angle);
      const sinA = Math.sin(slot.angle);
      const ringX = cosA * (dim.tankRadius + 0.02);
      const ringZ = sinA * (dim.tankRadius + 0.02);
      return (
        <group key={`goo-overflow-${slot.id}`} position={[ringX, 0, ringZ]}>
          <mesh
            castShadow
            receiveShadow
            position={[0, -slot.drop * 0.5, 0]}
            rotation={[0, -slot.angle, 0]}
           material={createMaterial(PALETTE.goo, 'goo')}>
            <boxGeometry args={[0.12, slot.drop, 0.08]} /></mesh>
          <mesh castShadow receiveShadow position={[0, -slot.drop, 0]} material={createMaterial(PALETTE.gooBright, 'goo')}>
            <sphereGeometry args={[0.07, 10, 8]} /></mesh>
        </group>
      );
    })}
  </group>
));

Overflow.displayName = 'Overflow';
