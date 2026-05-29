import type { Material } from 'three';
import {
  getCylinderGeometry,
  getSphereGeometry,
  getTorusGeometry,
} from './geometry-cache';
import type { MaterialToken } from './types';

type CreateMaterial = (fallbackColor: string, token: MaterialToken) => Material;

type RivetClusterProps = {
  footprintX: number;
  footprintZ: number;
  height: number;
  count?: number;
  rivetRadius?: number;
  inset?: number;
  color?: string;
  token?: MaterialToken;
  createMaterial: CreateMaterial;
};

const buildPerimeterPositions = (
  footprintX: number,
  footprintZ: number,
  count: number,
  inset: number
): Array<[number, number]> => {
  const halfX = footprintX / 2 - inset;
  const halfZ = footprintZ / 2 - inset;
  const perimeter = (halfX + halfZ) * 2;
  if (perimeter <= 0 || count <= 0) {
    return [];
  }
  const spacing = perimeter / count;
  const positions: Array<[number, number]> = [];
  let traveled = spacing / 2;
  for (let index = 0; index < count; index += 1) {
    let remaining = traveled;
    let positionX = -halfX;
    let positionZ = -halfZ;
    const sideTop = halfX * 2;
    const sideRight = halfZ * 2;
    const sideBottom = halfX * 2;
    if (remaining <= sideTop) {
      positionX = -halfX + remaining;
      positionZ = -halfZ;
    } else if (remaining <= sideTop + sideRight) {
      remaining -= sideTop;
      positionX = halfX;
      positionZ = -halfZ + remaining;
    } else if (remaining <= sideTop + sideRight + sideBottom) {
      remaining -= sideTop + sideRight;
      positionX = halfX - remaining;
      positionZ = halfZ;
    } else {
      remaining -= sideTop + sideRight + sideBottom;
      positionX = -halfX;
      positionZ = halfZ - remaining;
    }
    positions.push([positionX, positionZ]);
    traveled += spacing;
  }
  return positions;
};

export const BuildingRivetCluster = ({
  footprintX,
  footprintZ,
  height,
  count = 12,
  rivetRadius = 0.06,
  inset = 0.08,
  color = '#5a4736',
  token = 'iron',
  createMaterial,
}: RivetClusterProps) => {
  const positions = buildPerimeterPositions(footprintX, footprintZ, count, inset);
  if (positions.length === 0) {
    return null;
  }
  return (
    <group>
      {positions.map(([px, pz], index) => (
        <mesh
          key={`rivet-${index}`}
          castShadow
          receiveShadow
          position={[px, height, pz]}
          scale={[1, 0.55, 1]}
         material={createMaterial(color, token)}>
          <primitive attach="geometry" object={getSphereGeometry(rivetRadius, 10, 10)} /></mesh>
      ))}
    </group>
  );
};

type GooPipeProps = {
  origin: [number, number, number];
  rotationY?: number;
  pipeColor?: string;
  pipeToken?: MaterialToken;
  ringColor?: string;
  arcRadius?: number;
  tubeRadius?: number;
  createMaterial: CreateMaterial;
};

export const BuildingGooPipe = ({
  origin,
  rotationY = 0,
  pipeColor = '#7a604a',
  pipeToken = 'iron',
  ringColor = '#caa15a',
  arcRadius = 0.22,
  tubeRadius = 0.05,
  createMaterial,
}: GooPipeProps) => {
  return (
    <group position={origin} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow position={[arcRadius, -arcRadius * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} material={createMaterial(pipeColor, pipeToken)}>
        <primitive
          attach="geometry"
          object={getTorusGeometry(arcRadius, tubeRadius, 8, 24, Math.PI / 2)}
        /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[arcRadius, -arcRadius - 0.05, 0]}
       material={createMaterial(pipeColor, pipeToken)}>
        <primitive
          attach="geometry"
          object={getCylinderGeometry(tubeRadius * 1.1, tubeRadius * 1.1, 0.18, 10)}
        /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[arcRadius, 0.02, 0]}
        rotation={[Math.PI / 2, 0, 0]}
       material={createMaterial(ringColor, 'gold')}>
        <primitive attach="geometry" object={getTorusGeometry(tubeRadius * 1.45, tubeRadius * 0.5, 8, 16)} /></mesh>
    </group>
  );
};

type PressureGaugeProps = {
  position: [number, number, number];
  rotationY?: number;
  radius?: number;
  thickness?: number;
  gaugeTexture: import('three').Texture;
};

export const BuildingPressureGauge = ({
  position,
  rotationY = 0,
  radius = 0.13,
  thickness = 0.06,
  gaugeTexture,
}: PressureGaugeProps) => {
  return (
    <mesh
      castShadow
      receiveShadow
      position={position}
      rotation={[0, rotationY, 0]}
    >
      <primitive attach="geometry" object={getCylinderGeometry(radius, radius, thickness, 24)} />
      <meshMatcapMaterial color="#f5f5f4" map={gaugeTexture} />
    </mesh>
  );
};

type CornerBoltsProps = {
  footprintX: number;
  footprintZ: number;
  height: number;
  inset?: number;
  boltRadius?: number;
  color?: string;
  token?: MaterialToken;
  createMaterial: CreateMaterial;
};

export const BuildingCornerBolts = ({
  footprintX,
  footprintZ,
  height,
  inset = 0.12,
  boltRadius = 0.08,
  color = '#3f3a33',
  token = 'iron',
  createMaterial,
}: CornerBoltsProps) => {
  const halfX = footprintX / 2 - inset;
  const halfZ = footprintZ / 2 - inset;
  const corners: Array<[number, number]> = [
    [halfX, halfZ],
    [-halfX, halfZ],
    [halfX, -halfZ],
    [-halfX, -halfZ],
  ];
  return (
    <group>
      {corners.map(([px, pz], index) => (
        <mesh
          key={`corner-bolt-${index}`}
          castShadow
          receiveShadow
          position={[px, height, pz]}
          scale={[1, 0.6, 1]}
        >
          <primitive attach="geometry" object={getSphereGeometry(boltRadius, 10, 10)} /></mesh>
      ))}
    </group>
  );
};
