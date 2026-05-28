import type { ResourceType } from './resources';

export type BuildingCategory = 'RESOURCES' | 'DEFENSES' | 'ARMY' | 'DECORATION';
export type BuildingStatus = 'PENDING' | 'UNDER_CONSTRUCTION' | 'ACTIVE';

export const BUILDING_TYPES = {
  TOWN_HALL: 'TOWN_HALL',
  RESOURCE_TWIG_COLLECTOR: 'RESOURCE_TWIG_COLLECTOR',
  RESOURCE_PEBBLE_COLLECTOR: 'RESOURCE_PEBBLE_COLLECTOR',
  RESOURCE_PUTTY_COLLECTOR: 'RESOURCE_PUTTY_COLLECTOR',
  RESOURCE_GOO_COLLECTOR: 'RESOURCE_GOO_COLLECTOR',
  RESOURCE_WOOD_SILO: 'RESOURCE_WOOD_SILO',
  RESOURCE_STONE_SILO: 'RESOURCE_STONE_SILO',
  DEFENSE_WALL_WOOD: 'DEFENSE_WALL_WOOD',
  DEFENSE_WALL_STONE: 'DEFENSE_WALL_STONE',
  DEFENSE_WALL_IRON: 'DEFENSE_WALL_IRON',
  DEFENSE_TURRET_RAPID: 'DEFENSE_TURRET_RAPID',
  DEFENSE_MORTAR: 'DEFENSE_MORTAR',
  DEFENSE_LASER_TOWER: 'DEFENSE_LASER_TOWER',
  ARMY_HATCHERY: 'ARMY_HATCHERY',
  ARMY_MONSTER_PEN: 'ARMY_MONSTER_PEN',
  DECOR_MUSHROOM_TOTEM: 'DECOR_MUSHROOM_TOTEM',
  OBSTACLE_TREE: 'OBSTACLE_TREE',
  OBSTACLE_ROCK: 'OBSTACLE_ROCK',
  OBSTACLE_MUSHROOM: 'OBSTACLE_MUSHROOM',
  PREVIEW: 'PREVIEW',
} as const;

export type BuildingType = (typeof BUILDING_TYPES)[keyof typeof BUILDING_TYPES];

export type Building = {
  id: string;
  type: Exclude<BuildingType, 'PREVIEW'>;
  level: number;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
  hp: number;
  maxHp: number;
  status: BuildingStatus;
  buildStartedAt?: number;
  buildEndsAt?: number;
  assignedWorkerId?: string;
  range?: number;
  damage?: number;
  splashRadius?: number;
  productionPerMs?: number;
  productionType?: ResourceType;
  providesCapacity?: Partial<Record<ResourceType, number>>;
  lastHarvested?: number;
  tags?: string[];
  fortificationLevel?: number;
};
