import type { MaterialFactory, MaterialToken } from './types';

type GrassTuftClusterProps = {
  position?: [number, number, number];
  color: string;
  createMaterial: MaterialFactory;
  token?: MaterialToken;
  primaryRadius?: number;
  primaryHeight?: number;
  secondaryRadius?: number;
  secondaryHeight?: number;
  secondaryOffset?: [number, number, number];
  primaryRotation?: [number, number, number];
  secondaryRotation?: [number, number, number];
  showSecondary?: boolean;
};

export const GrassTuftCluster = ({
  position = [0, 0.02, 0],
  color,
  createMaterial,
  token = 'wood',
  primaryRadius = 0.05,
  primaryHeight = 0.12,
  secondaryRadius = 0.04,
  secondaryHeight = 0.1,
  secondaryOffset = [0.04, 0.05, 0.02],
  primaryRotation = [0, 0.4, 0.1],
  secondaryRotation = [0, 1.1, -0.1],
  showSecondary = true,
}: GrassTuftClusterProps) => (
  <group position={position}>
    <mesh receiveShadow position={[0, 0.04, 0]} rotation={primaryRotation}>
      <coneGeometry args={[primaryRadius, primaryHeight, 6]} />
      {createMaterial(color, token)}
    </mesh>
    {showSecondary ? (
      <mesh receiveShadow position={secondaryOffset} rotation={secondaryRotation}>
        <coneGeometry args={[secondaryRadius, secondaryHeight, 6]} />
        {createMaterial(color, token)}
      </mesh>
    ) : null}
  </group>
);
