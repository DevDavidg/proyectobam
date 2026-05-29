import { MeshStandardMaterial } from 'three';

export const OBSTACLE_INSTANCE_MATERIAL = new MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.88,
  metalness: 0.03,
  flatShading: true,
});

export const OBSTACLE_MAX_INSTANCES = 40;
