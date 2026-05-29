import type { ReactNode } from 'react';

type DamageDebrisGroupProps = {
  children: ReactNode;
  rotation?: [number, number, number];
  position?: [number, number, number];
};

export const DAMAGED_DEBRIS_ROTATION: [number, number, number] = [0.04, 0, -0.06];

export const DamagedDebrisGroup = ({
  children,
  rotation = DAMAGED_DEBRIS_ROTATION,
  position,
}: DamageDebrisGroupProps) => (
  <group rotation={rotation} position={position}>
    {children}
  </group>
);

type DestroyedRubbleGroupProps = {
  children: ReactNode;
  rotation?: [number, number, number];
  position?: [number, number, number];
};

export const DestroyedRubbleGroup = ({
  children,
  rotation,
  position = [0, 0.04, 0],
}: DestroyedRubbleGroupProps) => (
  <group rotation={rotation} position={position}>
    {children}
  </group>
);
