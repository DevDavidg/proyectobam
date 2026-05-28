import { useMemo, type ReactElement } from 'react';
import {
  getBoxGeometry,
  getCylinderGeometry,
  getSphereGeometry,
  getTorusGeometry,
} from './geometry-cache';
import { getRoundedBoxGeometry } from './geometries';
import type { MaterialToken } from './types';

type CreateMaterial = (fallbackColor: string, token: MaterialToken) => ReactElement;

const STRAP_THICKNESS = 0.04;

const hashSeed = (input: string | number): number => {
  const text = String(input);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
};

const createSeededRandom = (seedInput: string | number) => {
  let state = (hashSeed(seedInput) % 2147483647) + 1;
  return (): number => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
};

type ScrapStrapsProps = {
  width: number;
  height: number;
  depth: number;
  seed: string | number;
  color?: string;
  token?: MaterialToken;
  createMaterial: CreateMaterial;
  pivotY?: number;
};

export const ScrapStraps = ({
  width,
  height,
  depth,
  seed,
  color = '#6b614f',
  token = 'iron',
  createMaterial,
  pivotY = 0,
}: ScrapStrapsProps) => {
  const straps = useMemo(() => {
    const random = createSeededRandom(seed);
    const items: Array<{
      side: 'pos-x' | 'neg-x' | 'pos-z' | 'neg-z';
      strapHeight: number;
      strapWidth: number;
      offsetU: number;
      offsetY: number;
      rotation: number;
    }> = [];
    const strapCount = 2 + Math.floor(random() * 2);
    const sides: Array<ScrapStrap['side']> = ['pos-x', 'neg-x', 'pos-z', 'neg-z'];
    const occupiedSides = new Set<ScrapStrap['side']>();
    for (let index = 0; index < strapCount; index += 1) {
      const sideIndex = Math.floor(random() * sides.length);
      const side = sides[sideIndex];
      if (occupiedSides.has(side)) {
        continue;
      }
      occupiedSides.add(side);
      const isHorizontalFace = side === 'pos-z' || side === 'neg-z';
      const faceSpan = isHorizontalFace ? width : depth;
      const strapWidth = faceSpan * (0.18 + random() * 0.16);
      const strapHeight = height * (0.55 + random() * 0.25);
      const offsetU = (random() - 0.5) * (faceSpan * 0.45);
      const offsetY = (random() - 0.5) * (height * 0.12);
      const rotation = (random() - 0.5) * 0.08;
      items.push({ side, strapHeight, strapWidth, offsetU, offsetY, rotation });
    }
    return items;
  }, [width, height, depth, seed]);

  if (straps.length === 0) {
    return null;
  }

  return (
    <group position={[0, pivotY, 0]}>
      {straps.map((strap, index) => {
        const positionY = strap.offsetY;
        if (strap.side === 'pos-x') {
          return (
            <mesh
              key={`scrap-strap-${index}`}
              castShadow
              receiveShadow
              position={[width / 2 - STRAP_THICKNESS / 2 + 0.002, positionY, strap.offsetU]}
              rotation={[0, 0, strap.rotation]}
            >
              <primitive
                attach='geometry'
                object={getBoxGeometry(STRAP_THICKNESS, strap.strapHeight, strap.strapWidth)}
              />
              {createMaterial(color, token)}
            </mesh>
          );
        }
        if (strap.side === 'neg-x') {
          return (
            <mesh
              key={`scrap-strap-${index}`}
              castShadow
              receiveShadow
              position={[-width / 2 + STRAP_THICKNESS / 2 - 0.002, positionY, strap.offsetU]}
              rotation={[0, 0, strap.rotation]}
            >
              <primitive
                attach='geometry'
                object={getBoxGeometry(STRAP_THICKNESS, strap.strapHeight, strap.strapWidth)}
              />
              {createMaterial(color, token)}
            </mesh>
          );
        }
        if (strap.side === 'pos-z') {
          return (
            <mesh
              key={`scrap-strap-${index}`}
              castShadow
              receiveShadow
              position={[strap.offsetU, positionY, depth / 2 - STRAP_THICKNESS / 2 + 0.002]}
              rotation={[0, 0, strap.rotation]}
            >
              <primitive
                attach='geometry'
                object={getBoxGeometry(strap.strapWidth, strap.strapHeight, STRAP_THICKNESS)}
              />
              {createMaterial(color, token)}
            </mesh>
          );
        }
        return (
          <mesh
            key={`scrap-strap-${index}`}
            castShadow
            receiveShadow
            position={[strap.offsetU, positionY, -depth / 2 + STRAP_THICKNESS / 2 - 0.002]}
            rotation={[0, 0, strap.rotation]}
          >
            <primitive
              attach='geometry'
              object={getBoxGeometry(strap.strapWidth, strap.strapHeight, STRAP_THICKNESS)}
            />
            {createMaterial(color, token)}
          </mesh>
        );
      })}
    </group>
  );
};

type ScrapStrap = {
  side: 'pos-x' | 'neg-x' | 'pos-z' | 'neg-z';
  strapHeight: number;
  strapWidth: number;
  offsetU: number;
  offsetY: number;
  rotation: number;
};

const buildPerimeterPositionsFixedSpacing = (
  width: number,
  depth: number,
  spacing: number
): Array<{ position: [number, number]; rotationY: number }> => {
  const halfW = width / 2;
  const halfD = depth / 2;
  const segments: Array<{
    start: [number, number];
    direction: [number, number];
    length: number;
    rotationY: number;
  }> = [
    { start: [-halfW, -halfD], direction: [1, 0], length: width, rotationY: 0 },
    { start: [halfW, -halfD], direction: [0, 1], length: depth, rotationY: Math.PI / 2 },
    { start: [halfW, halfD], direction: [-1, 0], length: width, rotationY: Math.PI },
    { start: [-halfW, halfD], direction: [0, -1], length: depth, rotationY: -Math.PI / 2 },
  ];
  const positions: Array<{ position: [number, number]; rotationY: number }> = [];
  for (const segment of segments) {
    const count = Math.max(1, Math.floor(segment.length / spacing));
    const actualSpacing = segment.length / count;
    for (let index = 0; index < count; index += 1) {
      const traveled = actualSpacing * (index + 0.5);
      const x = segment.start[0] + segment.direction[0] * traveled;
      const z = segment.start[1] + segment.direction[1] * traveled;
      positions.push({ position: [x, z], rotationY: segment.rotationY });
    }
  }
  return positions;
};

type PerimeterRivetTrackProps = {
  width: number;
  depth: number;
  height: number;
  spacing?: number;
  inset?: number;
  rivetRadius?: number;
  color?: string;
  token?: MaterialToken;
  createMaterial: CreateMaterial;
};

export const PerimeterRivetTrack = ({
  width,
  depth,
  height,
  spacing = 0.25,
  inset = 0.04,
  rivetRadius = 0.035,
  color = '#2a221b',
  token = 'iron',
  createMaterial,
}: PerimeterRivetTrackProps) => {
  const positions = useMemo(() => {
    const insetWidth = Math.max(0.1, width - inset * 2);
    const insetDepth = Math.max(0.1, depth - inset * 2);
    return buildPerimeterPositionsFixedSpacing(insetWidth, insetDepth, spacing);
  }, [width, depth, spacing, inset]);

  if (positions.length === 0) {
    return null;
  }

  return (
    <group>
      {positions.map((entry, index) => (
        <mesh
          key={`perim-rivet-${index}`}
          castShadow
          receiveShadow
          position={[entry.position[0], height, entry.position[1]]}
          rotation={[0, entry.rotationY, 0]}
          scale={[1, 0.4, 1]}
        >
          <primitive attach='geometry' object={getSphereGeometry(rivetRadius, 8, 8)} />
          {createMaterial(color, token)}
        </mesh>
      ))}
    </group>
  );
};

type CylinderRivetRingProps = {
  radius: number;
  height: number;
  spacing?: number;
  rivetRadius?: number;
  color?: string;
  token?: MaterialToken;
  createMaterial: CreateMaterial;
};

export const CylinderRivetRing = ({
  radius,
  height,
  spacing = 0.25,
  rivetRadius = 0.035,
  color = '#2a221b',
  token = 'iron',
  createMaterial,
}: CylinderRivetRingProps) => {
  const positions = useMemo(() => {
    const circumference = Math.PI * 2 * radius;
    const count = Math.max(6, Math.floor(circumference / spacing));
    const result: Array<{ position: [number, number, number]; rotationY: number }> = [];
    for (let index = 0; index < count; index += 1) {
      const angle = (Math.PI * 2 * index) / count;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      result.push({ position: [x, height, z], rotationY: -angle });
    }
    return result;
  }, [radius, height, spacing]);

  return (
    <group>
      {positions.map((entry, index) => (
        <mesh
          key={`cyl-rivet-${index}`}
          castShadow
          receiveShadow
          position={entry.position}
          rotation={[0, entry.rotationY, 0]}
          scale={[1, 0.4, 1]}
        >
          <primitive attach='geometry' object={getSphereGeometry(rivetRadius, 8, 8)} />
          {createMaterial(color, token)}
        </mesh>
      ))}
    </group>
  );
};

type MechanicalGaugeProps = {
  position: [number, number, number];
  rotationY?: number;
  dialRadius?: number;
  needleLength?: number;
  needleAngle?: number;
  dialColor?: string;
  bodyColor?: string;
  createMaterial: CreateMaterial;
};

export const MechanicalGauge = ({
  position,
  rotationY = 0,
  dialRadius = 0.11,
  needleLength = 0.16,
  needleAngle = -Math.PI / 4,
  dialColor = '#f1ece3',
  bodyColor = '#2a261f',
  createMaterial,
}: MechanicalGaugeProps) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow position={[0, 0, -0.018]}>
        <primitive
          attach='geometry'
          object={getCylinderGeometry(dialRadius * 1.18, dialRadius * 1.18, 0.035, 18)}
        />
        {createMaterial(bodyColor, 'iron')}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, 0.005]}>
        <primitive
          attach='geometry'
          object={getCylinderGeometry(dialRadius, dialRadius, 0.018, 22)}
        />
        {createMaterial(dialColor, 'stone')}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[
          Math.cos(needleAngle) * needleLength * 0.5,
          Math.sin(needleAngle) * needleLength * 0.5,
          0.018,
        ]}
        rotation={[0, 0, needleAngle]}
      >
        <primitive
          attach='geometry'
          object={getBoxGeometry(needleLength, 0.012, 0.008)}
        />
        {createMaterial(bodyColor, 'iron')}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, 0.022]}>
        <primitive attach='geometry' object={getSphereGeometry(0.018, 8, 8)} />
        {createMaterial(bodyColor, 'iron')}
      </mesh>
    </group>
  );
};

type OrganicElbowPipeProps = {
  origin: [number, number, number];
  rotationY?: number;
  arcRadius?: number;
  tubeRadius?: number;
  flangeRadius?: number;
  flangeThickness?: number;
  pipeColor?: string;
  flangeColor?: string;
  pipeToken?: MaterialToken;
  createMaterial: CreateMaterial;
};

export const OrganicElbowPipe = ({
  origin,
  rotationY = 0,
  arcRadius = 0.3,
  tubeRadius = 0.06,
  flangeRadius = 0.11,
  flangeThickness = 0.05,
  pipeColor = '#8d6a44',
  flangeColor = '#d2a04a',
  pipeToken = 'iron',
  createMaterial,
}: OrganicElbowPipeProps) => {
  return (
    <group position={origin} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <primitive
          attach='geometry'
          object={getCylinderGeometry(flangeRadius, flangeRadius, flangeThickness, 18)}
        />
        {createMaterial(flangeColor, 'gold')}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[flangeThickness * 0.6 + tubeRadius * 0.1, -arcRadius * 0.5, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <primitive
          attach='geometry'
          object={getTorusGeometry(arcRadius, tubeRadius, 8, 18, Math.PI / 2)}
        />
        {createMaterial(pipeColor, pipeToken)}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[arcRadius + flangeThickness * 0.6, -arcRadius - 0.04, 0]}
      >
        <primitive
          attach='geometry'
          object={getCylinderGeometry(tubeRadius * 1.05, tubeRadius * 1.05, 0.18, 12)}
        />
        {createMaterial(pipeColor, pipeToken)}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[arcRadius + flangeThickness * 0.6, -arcRadius + 0.04, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <primitive
          attach='geometry'
          object={getTorusGeometry(tubeRadius * 1.35, tubeRadius * 0.45, 8, 14)}
        />
        {createMaterial(flangeColor, 'gold')}
      </mesh>
    </group>
  );
};

type BeveledShellProps = {
  width: number;
  height: number;
  depth: number;
  pivotY?: number;
  color: string;
  token: MaterialToken;
  cornerRadius?: number;
  createMaterial: CreateMaterial;
};

export const BeveledShell = ({
  width,
  height,
  depth,
  pivotY = 0,
  color,
  token,
  cornerRadius,
  createMaterial,
}: BeveledShellProps) => {
  return (
    <mesh castShadow receiveShadow position={[0, pivotY, 0]}>
      <primitive
        attach='geometry'
        object={getRoundedBoxGeometry(width, height, depth, cornerRadius ? { cornerRadius } : undefined)}
      />
      {createMaterial(color, token)}
    </mesh>
  );
};
