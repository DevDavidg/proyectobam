import { BUILDING_TYPES, type Building, type BuildingType } from '../../core/types/building';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';
import { CAMERA_DEFAULT_COLLIDER_HEIGHT } from './camera-config';

export type BuildingCollider = {
  id: string;
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
};

const OBSTACLE_TYPES = new Set<BuildingType>([
  BUILDING_TYPES.OBSTACLE_TREE,
  BUILDING_TYPES.OBSTACLE_ROCK,
  BUILDING_TYPES.OBSTACLE_MUSHROOM,
]);

const resolveColliderHeight = (type: Building['type']): number => {
  if (type === BUILDING_TYPES.DEFENSE_WALL_WOOD || type === BUILDING_TYPES.DEFENSE_WALL_STONE || type === BUILDING_TYPES.DEFENSE_WALL_IRON) {
    return 2.5;
  }
  if (type === BUILDING_TYPES.TOWN_HALL) {
    return 7;
  }
  if (
    type === BUILDING_TYPES.DEFENSE_TURRET_RAPID ||
    type === BUILDING_TYPES.DEFENSE_MORTAR ||
    type === BUILDING_TYPES.DEFENSE_LASER_TOWER
  ) {
    return 7;
  }
  if (type === BUILDING_TYPES.ARMY_HATCHERY || type === BUILDING_TYPES.ARMY_MONSTER_PEN) {
    return 5.5;
  }
  if (type === BUILDING_TYPES.RESOURCE_WOOD_SILO || type === BUILDING_TYPES.RESOURCE_STONE_SILO) {
    return 6;
  }
  return CAMERA_DEFAULT_COLLIDER_HEIGHT;
};

export const buildBuildingColliders = (buildings: Building[]): BuildingCollider[] => {
  const colliders: BuildingCollider[] = [];

  for (const building of buildings) {
    if (OBSTACLE_TYPES.has(building.type)) {
      continue;
    }

    const [centerX, , centerZ] = gridToWorldCenter(
      building.x,
      building.y,
      building.sizeX,
      building.sizeY,
      GRID_SIZE,
      CELL_SIZE,
    );
    const halfWidth = (building.sizeX * CELL_SIZE) / 2;
    const halfDepth = (building.sizeY * CELL_SIZE) / 2;
    const height = resolveColliderHeight(building.type);

    colliders.push({
      id: building.id,
      minX: centerX - halfWidth,
      minY: 0,
      minZ: centerZ - halfDepth,
      maxX: centerX + halfWidth,
      maxY: height,
      maxZ: centerZ + halfDepth,
    });
  }

  return colliders;
};

export const colliderContainsPoint = (collider: BuildingCollider, x: number, y: number, z: number): boolean => {
  return x >= collider.minX && x <= collider.maxX && y >= collider.minY && y <= collider.maxY && z >= collider.minZ && z <= collider.maxZ;
};
