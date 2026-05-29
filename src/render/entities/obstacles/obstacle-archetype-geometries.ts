import {
  DodecahedronGeometry,
  IcosahedronGeometry,
  RingGeometry,
} from 'three';
import {
  getCircleGeometry,
  getConeGeometry,
  getCylinderGeometry,
  getSphereGeometry,
  getTorusGeometry,
} from '../building-visual/geometry-cache';
import { mergeGeometryParts, type GeometryPart } from './merge-geometry-parts';

export type ObstacleArchetypeGeometry = {
  shadow: ReturnType<typeof mergeGeometryParts>;
  detail: ReturnType<typeof mergeGeometryParts>;
};

const GROUND_ROTATION: [number, number, number] = [-Math.PI / 2, 0, 0];

const pushGroundPatch = (parts: GeometryPart[], soilColor: string, grassColor: string): void => {
  parts.push({
    geometry: getCircleGeometry(0.95, 20),
    color: soilColor,
    position: [0, 0.02, 0],
    rotation: GROUND_ROTATION,
  });
  parts.push({
    geometry: new RingGeometry(0.58, 0.93, 20),
    color: grassColor,
    position: [0, 0.025, 0],
    rotation: GROUND_ROTATION,
  });
};

const pushRockGround = (parts: GeometryPart[]): void => {
  parts.push({
    geometry: getCircleGeometry(0.95, 20),
    color: '#4b3021',
    position: [0, 0.01, 0],
    rotation: GROUND_ROTATION,
  });
  parts.push({
    geometry: getCircleGeometry(0.74, 20),
    color: '#1a3010',
    position: [0.03, 0.014, 0.02],
    rotation: GROUND_ROTATION,
  });
};

const pushMushroomGround = (parts: GeometryPart[]): void => {
  parts.push({
    geometry: getCircleGeometry(0.88, 20),
    color: '#5b3a24',
    position: [0, 0.01, 0],
    rotation: GROUND_ROTATION,
  });
  parts.push({
    geometry: getCircleGeometry(0.66, 20),
    color: '#14240d',
    position: [0.02, 0.014, 0.03],
    rotation: GROUND_ROTATION,
  });
};

type TreeVariantSpec = {
  trunkHeight: number;
  trunkRadius: number;
  canopyLayers: number;
  rootTilt: number;
};

const TREE_VARIANTS: TreeVariantSpec[] = [
  { trunkHeight: 2, trunkRadius: 0.22, canopyLayers: 4, rootTilt: 0.18 },
  { trunkHeight: 1.85, trunkRadius: 0.2, canopyLayers: 3, rootTilt: 0.22 },
  { trunkHeight: 2.35, trunkRadius: 0.26, canopyLayers: 5, rootTilt: 0.14 },
];

const buildTreeArchetype = (variant: TreeVariantSpec): ObstacleArchetypeGeometry => {
  const shadowParts: GeometryPart[] = [];
  const detailParts: GeometryPart[] = [];

  shadowParts.push({
    geometry: getCylinderGeometry(variant.trunkRadius * 0.85, variant.trunkRadius * 1.18, variant.trunkHeight, 10),
    color: '#6f4524',
    position: [0, variant.trunkHeight * 0.5, 0],
  });

  for (let layerIndex = 0; layerIndex < variant.canopyLayers; layerIndex += 1) {
    const layerScale = 1 - layerIndex * 0.15;
    const layerHeight = variant.trunkHeight + 0.42 + layerIndex * 0.48;
    const canopyColor =
      layerIndex === 0 ? '#1f7a37' : layerIndex === variant.canopyLayers - 1 ? '#0f4f24' : '#166534';
    shadowParts.push({
      geometry: getConeGeometry(1.05 * layerScale, 1.18 * layerScale, 12),
      color: canopyColor,
      position: [0, layerHeight, 0],
    });
  }

  for (let rootIndex = 0; rootIndex < 6; rootIndex += 1) {
    const angle = (Math.PI * 2 * rootIndex) / 6;
    const rootX = Math.cos(angle) * (variant.trunkRadius + 0.14);
    const rootZ = Math.sin(angle) * (variant.trunkRadius + 0.14);
    detailParts.push({
      geometry: getCylinderGeometry(0.04, 0.07, 0.3, 6),
      color: '#5b3418',
      position: [rootX, 0.12, rootZ],
      rotation: [0, -angle, variant.rootTilt * (rootIndex % 2 === 0 ? 1 : -1)],
    });
  }

  const leafAngles = [0.2, 1.4, 2.8, 4.6];
  for (let leafIndex = 0; leafIndex < leafAngles.length; leafIndex += 1) {
    const leafAngle = leafAngles[leafIndex];
    detailParts.push({
      geometry: getSphereGeometry(0.34, 10, 10),
      color: '#22a041',
      position: [Math.cos(leafAngle) * 0.5, variant.trunkHeight + 0.85, Math.sin(leafAngle) * 0.5],
      scale: [0.6, 0.45, 0.6],
    });
  }

  pushGroundPatch(detailParts, '#4a2e18', '#356d2f');
  return {
    shadow: mergeGeometryParts(shadowParts),
    detail: mergeGeometryParts(detailParts),
  };
};

type RockShardSpec = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  sy: number;
  scale: number;
};

type RockVariantSpec = {
  shards: RockShardSpec[];
};

const ROCK_VARIANTS: RockVariantSpec[] = [
  {
    shards: [
      { x: 0.52, y: 0.18, z: 0.34, rx: 0.1, ry: 0.4, rz: -0.2, sy: 1.1, scale: 0.28 },
      { x: -0.44, y: 0.14, z: -0.28, rx: -0.3, ry: 0.2, rz: 0.15, sy: 0.8, scale: 0.22 },
      { x: 0.12, y: 0.1, z: -0.58, rx: 0.2, ry: -0.5, rz: 0.1, sy: 1.3, scale: 0.24 },
      { x: -0.28, y: 0.16, z: 0.48, rx: -0.1, ry: 0.6, rz: -0.15, sy: 0.9, scale: 0.2 },
      { x: 0.64, y: 0.12, z: -0.12, rx: 0.25, ry: 0.1, rz: 0.3, sy: 1.2, scale: 0.18 },
    ],
  },
  {
    shards: [
      { x: 0.48, y: 0.2, z: 0.22, rx: 0.15, ry: 0.35, rz: -0.1, sy: 1, scale: 0.3 },
      { x: -0.5, y: 0.15, z: 0.18, rx: -0.2, ry: -0.4, rz: 0.2, sy: 0.7, scale: 0.26 },
      { x: 0.08, y: 0.12, z: -0.62, rx: 0.3, ry: 0.5, rz: 0.05, sy: 1.4, scale: 0.22 },
      { x: -0.18, y: 0.22, z: -0.42, rx: -0.15, ry: 0.25, rz: -0.25, sy: 0.85, scale: 0.24 },
      { x: 0.62, y: 0.14, z: -0.28, rx: 0.1, ry: -0.3, rz: 0.15, sy: 1.15, scale: 0.2 },
      { x: -0.58, y: 0.18, z: -0.14, rx: -0.25, ry: 0.55, rz: 0.1, sy: 0.95, scale: 0.28 },
      { x: 0.24, y: 0.16, z: 0.58, rx: 0.2, ry: 0.15, rz: -0.2, sy: 1.25, scale: 0.19 },
    ],
  },
  {
    shards: [
      { x: 0.42, y: 0.14, z: 0.46, rx: 0.05, ry: 0.45, rz: -0.15, sy: 1.05, scale: 0.25 },
      { x: -0.46, y: 0.18, z: -0.22, rx: -0.25, ry: 0.15, rz: 0.2, sy: 0.75, scale: 0.27 },
      { x: 0.18, y: 0.11, z: -0.52, rx: 0.15, ry: -0.35, rz: 0.1, sy: 1.35, scale: 0.21 },
      { x: -0.22, y: 0.15, z: 0.54, rx: -0.1, ry: 0.5, rz: -0.1, sy: 0.9, scale: 0.23 },
    ],
  },
];

const buildRockArchetype = (variant: RockVariantSpec): ObstacleArchetypeGeometry => {
  const shadowParts: GeometryPart[] = [
    {
      geometry: new DodecahedronGeometry(0.88, 0),
      color: '#5f6673',
      position: [0, 0.48, 0],
    },
    {
      geometry: new IcosahedronGeometry(0.42, 0),
      color: '#7c8796',
      position: [0.18, 0.72, -0.08],
      rotation: [0.3, 0.5, 0.1],
    },
  ];

  const detailParts: GeometryPart[] = variant.shards.map((shard) => ({
    geometry: new DodecahedronGeometry(shard.scale, 0),
    color: '#8b97a7',
    position: [shard.x, shard.y, shard.z],
    rotation: [shard.rx, shard.ry, shard.rz],
    scale: [1, shard.sy, 1],
  }));

  pushRockGround(detailParts);
  return {
    shadow: mergeGeometryParts(shadowParts),
    detail: mergeGeometryParts(detailParts),
  };
};

type MushroomSpotSpec = {
  angle: number;
  radiusFactor: number;
  spotScale: number;
};

type MiniMushroomSpec = {
  angle: number;
  radius: number;
  scale: number;
};

type MushroomVariantSpec = {
  stemHeight: number;
  capRadius: number;
  spots: MushroomSpotSpec[];
  minis: MiniMushroomSpec[];
};

const MUSHROOM_VARIANTS: MushroomVariantSpec[] = [
  {
    stemHeight: 1.4,
    capRadius: 0.95,
    spots: [
      { angle: 0, radiusFactor: 0.28, spotScale: 0.12 },
      { angle: 0.9, radiusFactor: 0.34, spotScale: 0.1 },
      { angle: 1.8, radiusFactor: 0.22, spotScale: 0.14 },
      { angle: 2.7, radiusFactor: 0.38, spotScale: 0.09 },
      { angle: 4.1, radiusFactor: 0.3, spotScale: 0.11 },
    ],
    minis: [
      { angle: 0.6, radius: 0.72, scale: 0.52 },
      { angle: 3.5, radius: 0.64, scale: 0.44 },
    ],
  },
  {
    stemHeight: 1.15,
    capRadius: 1.05,
    spots: [
      { angle: 0, radiusFactor: 0.2, spotScale: 0.1 },
      { angle: 0.55, radiusFactor: 0.35, spotScale: 0.12 },
      { angle: 1.2, radiusFactor: 0.28, spotScale: 0.08 },
      { angle: 1.9, radiusFactor: 0.4, spotScale: 0.11 },
      { angle: 2.6, radiusFactor: 0.18, spotScale: 0.13 },
      { angle: 3.3, radiusFactor: 0.32, spotScale: 0.09 },
      { angle: 4.0, radiusFactor: 0.26, spotScale: 0.1 },
      { angle: 4.8, radiusFactor: 0.36, spotScale: 0.12 },
    ],
    minis: [
      { angle: 0.4, radius: 0.78, scale: 0.58 },
      { angle: 1.7, radius: 0.66, scale: 0.48 },
      { angle: 3.1, radius: 0.84, scale: 0.55 },
      { angle: 4.9, radius: 0.7, scale: 0.42 },
    ],
  },
  {
    stemHeight: 1.3,
    capRadius: 0.88,
    spots: [
      { angle: 0.3, radiusFactor: 0.24, spotScale: 0.11 },
      { angle: 1.1, radiusFactor: 0.36, spotScale: 0.09 },
      { angle: 2.0, radiusFactor: 0.2, spotScale: 0.13 },
      { angle: 2.9, radiusFactor: 0.32, spotScale: 0.1 },
      { angle: 3.8, radiusFactor: 0.28, spotScale: 0.12 },
      { angle: 4.7, radiusFactor: 0.38, spotScale: 0.08 },
    ],
    minis: [],
  },
];

const buildMushroomArchetype = (variant: MushroomVariantSpec): ObstacleArchetypeGeometry => {
  const shadowParts: GeometryPart[] = [
    {
      geometry: getCylinderGeometry(0.22, 0.3, variant.stemHeight, 12),
      color: '#f6d4a8',
      position: [0, variant.stemHeight * 0.5, 0],
    },
    {
      geometry: getSphereGeometry(variant.capRadius, 18, 14),
      color: '#be1f1f',
      position: [0, variant.stemHeight + 0.14, 0],
      scale: [1, 0.62, 1],
    },
  ];

  const detailParts: GeometryPart[] = [
    {
      geometry: getTorusGeometry(variant.capRadius * 0.62, 0.05, 8, 20),
      color: '#ffd7b5',
      position: [0, variant.stemHeight, 0],
    },
  ];

  for (const spot of variant.spots) {
    const spotRadius = variant.capRadius * spot.radiusFactor;
    detailParts.push({
      geometry: getSphereGeometry(spot.spotScale, 8, 8),
      color: '#fee2e2',
      position: [
        Math.cos(spot.angle) * spotRadius,
        variant.stemHeight + 0.5,
        Math.sin(spot.angle) * spotRadius,
      ],
    });
  }

  for (const mini of variant.minis) {
    const miniX = Math.cos(mini.angle) * mini.radius;
    const miniZ = Math.sin(mini.angle) * mini.radius;
    detailParts.push({
      geometry: getCylinderGeometry(0.12, 0.16, 0.58, 8),
      color: '#f7d9b0',
      position: [miniX, 0.36, miniZ],
      scale: [mini.scale, mini.scale, mini.scale],
    });
    detailParts.push({
      geometry: getSphereGeometry(0.38, 10, 8),
      color: '#ef4444',
      position: [miniX, 0.72 * mini.scale + 0.06, miniZ],
      scale: [mini.scale, 0.64 * mini.scale, mini.scale],
    });
  }

  pushMushroomGround(detailParts);
  return {
    shadow: mergeGeometryParts(shadowParts),
    detail: mergeGeometryParts(detailParts),
  };
};

export type ObstacleTypeKey = 'tree' | 'rock' | 'mushroom';

export type ObstacleArchetypeSet = {
  shadow: ReturnType<typeof mergeGeometryParts>;
  detail: ReturnType<typeof mergeGeometryParts>;
};

export type ObstacleArchetypeLibrary = Record<ObstacleTypeKey, ObstacleArchetypeSet[]>;

export const buildObstacleArchetypeLibrary = (): ObstacleArchetypeLibrary => ({
  tree: TREE_VARIANTS.map(buildTreeArchetype),
  rock: ROCK_VARIANTS.map(buildRockArchetype),
  mushroom: MUSHROOM_VARIANTS.map(buildMushroomArchetype),
});

export const OBSTACLE_ARCHETYPE_LIBRARY = buildObstacleArchetypeLibrary();

export const getObstacleArchetypeLibrary = (): ObstacleArchetypeLibrary =>
  OBSTACLE_ARCHETYPE_LIBRARY;

export const resolveObstacleTypeKey = (sourceType?: string): ObstacleTypeKey => {
  if (sourceType === 'OBSTACLE_ROCK') return 'rock';
  if (sourceType === 'OBSTACLE_MUSHROOM') return 'mushroom';
  return 'tree';
};
