import { ConeGeometry, MeshStandardMaterial, SphereGeometry } from 'three';

export const TERRAIN_BOUNDARY_MOUND_GEOMETRY = new SphereGeometry(0.9, 12, 10);
export const TERRAIN_BOUNDARY_CANOPY_GEOMETRY = new ConeGeometry(0.52, 1.5, 10);

export const TERRAIN_BOUNDARY_MOUND_MATERIAL = new MeshStandardMaterial({
  color: '#4f8b1f',
  roughness: 1,
  metalness: 0,
});

export const TERRAIN_BOUNDARY_CANOPY_MATERIAL = new MeshStandardMaterial({
  color: '#2f6c11',
  roughness: 1,
  metalness: 0,
});

export const TERRAIN_BOUNDARY_INSTANCE_COUNT = 34;
