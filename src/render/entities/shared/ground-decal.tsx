import type { MaterialFactory, MaterialToken } from './types';

type GroundDecalProps = {
  radius: number;
  color: string;
  createMaterial: MaterialFactory;
  token?: MaterialToken;
  y?: number;
  segments?: number;
  position?: [number, number, number];
};

export const GroundDecal = ({
  radius,
  color,
  createMaterial,
  token = 'wood',
  y = 0.012,
  segments = 28,
  position,
}: GroundDecalProps) => {
  const meshPosition = position ?? [0, y, 0];

  return (
    <mesh receiveShadow position={meshPosition} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, segments]} />
      {createMaterial(color, token)}
    </mesh>
  );
};
