import type { Building, BuildingType } from '../types/building';
import { BUILDING_TYPES } from '../types/building';

type BuildableType = Exclude<
  BuildingType,
  'TOWN_HALL' | 'PREVIEW' | 'OBSTACLE_TREE' | 'OBSTACLE_ROCK' | 'OBSTACLE_MUSHROOM'
>;

type ResourceCost = Record<'twigs' | 'pebbles' | 'putty' | 'goo', number>;

const BUILDING_REQUIREMENTS: Record<BuildableType, { requiredTownHallLevel: number }> = {
  RESOURCE_TWIG_COLLECTOR: { requiredTownHallLevel: 1 },
  RESOURCE_PEBBLE_COLLECTOR: { requiredTownHallLevel: 1 },
  RESOURCE_PUTTY_COLLECTOR: { requiredTownHallLevel: 1 },
  RESOURCE_GOO_COLLECTOR: { requiredTownHallLevel: 1 },
  RESOURCE_WOOD_SILO: { requiredTownHallLevel: 1 },
  RESOURCE_STONE_SILO: { requiredTownHallLevel: 1 },
  DEFENSE_WALL_WOOD: { requiredTownHallLevel: 1 },
  DEFENSE_WALL_STONE: { requiredTownHallLevel: 2 },
  DEFENSE_WALL_IRON: { requiredTownHallLevel: 4 },
  DEFENSE_TURRET_RAPID: { requiredTownHallLevel: 1 },
  DEFENSE_MORTAR: { requiredTownHallLevel: 1 },
  DEFENSE_LASER_TOWER: { requiredTownHallLevel: 4 },
  ARMY_HATCHERY: { requiredTownHallLevel: 2 },
  ARMY_MONSTER_PEN: { requiredTownHallLevel: 2 },
  DECOR_MUSHROOM_TOTEM: { requiredTownHallLevel: 1 },
};

const BUILDING_CAPS_BY_TOWN_HALL: Record<BuildableType, Partial<Record<number, number>>> = {
  RESOURCE_TWIG_COLLECTOR: { 1: 1, 2: 2, 4: 3, 6: 4 },
  RESOURCE_PEBBLE_COLLECTOR: { 1: 1, 2: 2, 3: 3, 5: 4, 7: 5, 9: 6 },
  RESOURCE_PUTTY_COLLECTOR: { 1: 1, 2: 2, 3: 3, 5: 4, 7: 5, 9: 6 },
  RESOURCE_GOO_COLLECTOR: { 1: 1, 2: 2, 3: 3, 5: 4, 7: 5, 9: 6 },
  RESOURCE_WOOD_SILO: { 1: 1, 2: 2, 3: 3, 5: 4, 7: 5, 9: 6 },
  RESOURCE_STONE_SILO: { 1: 1, 2: 2, 3: 3, 5: 4, 7: 5, 9: 6 },
  DEFENSE_WALL_WOOD: { 1: 30, 2: 45, 4: 70, 6: 100 },
  DEFENSE_WALL_STONE: { 2: 20, 4: 35, 6: 50, 8: 80 },
  DEFENSE_WALL_IRON: { 4: 10, 6: 20, 8: 30, 10: 45 },
  DEFENSE_TURRET_RAPID: { 2: 1, 3: 2, 5: 3, 7: 4, 9: 5 },
  DEFENSE_MORTAR: { 1: 1, 2: 2, 3: 3, 5: 4, 7: 5, 9: 6 },
  DEFENSE_LASER_TOWER: { 4: 1, 5: 2, 7: 3, 9: 4 },
  ARMY_HATCHERY: { 2: 1, 5: 2, 8: 3 },
  ARMY_MONSTER_PEN: { 2: 1, 3: 2, 5: 3, 7: 4, 9: 5 },
  DECOR_MUSHROOM_TOTEM: { 1: 10, 4: 20, 7: 35, 10: 50 },
};

const resolveMaxByLevel = (capsByLevel: Partial<Record<number, number>>, townHallLevel: number): number => {
  let resolved = 0;
  for (const [levelText, value] of Object.entries(capsByLevel)) {
    const level = Number(levelText);
    if (townHallLevel >= level) {
      resolved = Math.max(resolved, value ?? 0);
    }
  }
  return resolved;
};

export const getBuildingRequiredTownHallLevel = (buildingType: BuildableType): number =>
  BUILDING_REQUIREMENTS[buildingType]?.requiredTownHallLevel ?? 1;

export const getBuildingCapForTownHallLevel = (buildingType: BuildableType, townHallLevel: number): number =>
  resolveMaxByLevel(BUILDING_CAPS_BY_TOWN_HALL[buildingType] ?? {}, townHallLevel);

export const getBuildingCount = (buildings: Building[], buildingType: BuildableType): number =>
  buildings.filter((building) => building.type === buildingType && !building.tags?.includes('obstacle')).length;

export const hasMetResourceCost = (
  resources: ResourceCost,
  cost: ResourceCost,
  freeBuildMode: boolean
): boolean => {
  if (freeBuildMode) {
    return true;
  }
  return (
    resources.twigs >= cost.twigs &&
    resources.pebbles >= cost.pebbles &&
    resources.putty >= cost.putty &&
    resources.goo >= cost.goo
  );
};

export const getInstantFinishShinyCost = (remainingMs: number, factor = 0.15): number =>
  Math.max(1, Math.ceil(Math.max(0, remainingMs) / 1000 * factor));

export const toResourceCostRecord = (cost: ResourceCost): ResourceCost => ({
  twigs: cost.twigs,
  pebbles: cost.pebbles,
  putty: cost.putty,
  goo: cost.goo,
});

export const formatDurationMs = (durationMs: number): string => {
  if (durationMs <= 0) {
    return 'Instantaneo';
  }
  const totalSeconds = Math.ceil(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) {
    return `${seconds}s`;
  }
  if (minutes < 60) {
    return `${minutes}m ${seconds}s`;
  }
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  return `${hours}h ${restMinutes}m`;
};

export const isBuildableType = (buildingType: BuildingType): buildingType is BuildableType =>
  buildingType !== BUILDING_TYPES.TOWN_HALL &&
  buildingType !== BUILDING_TYPES.PREVIEW &&
  buildingType !== BUILDING_TYPES.OBSTACLE_TREE &&
  buildingType !== BUILDING_TYPES.OBSTACLE_ROCK &&
  buildingType !== BUILDING_TYPES.OBSTACLE_MUSHROOM;
