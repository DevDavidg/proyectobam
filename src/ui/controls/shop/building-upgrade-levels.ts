import { getCannonTowerMaxLevel } from '../../../core/constants/cannon-tower-catalog';
import { getGooFactoryMaxLevel } from '../../../core/constants/goo-factory-catalog';
import { getLaserTowerMaxLevel } from '../../../core/constants/laser-tower-catalog';
import { getMonsterAcademyMaxLevel } from '../../../core/constants/monster-academy-catalog';
import { getPebbleShinerMaxLevel } from '../../../core/constants/pebble-shiner-catalog';
import { getPuttySquisherMaxLevel } from '../../../core/constants/putty-squisher-catalog';
import { getStorageSiloMaxLevel } from '../../../core/constants/storage-silo-catalog';
import { getSniperTowerMaxLevel } from '../../../core/constants/sniper-tower-catalog';
import { getTwigSnapperMaxLevel } from '../../../core/constants/twig-snapper-catalog';
import { BUILDING_TYPES, type Building, type BuildingType } from '../../../core/types/building';

type BuildableType = Exclude<
  BuildingType,
  'TOWN_HALL' | 'PREVIEW' | 'OBSTACLE_TREE' | 'OBSTACLE_ROCK' | 'OBSTACLE_MUSHROOM'
>;

export const getBuildingMaxUpgradeLevel = (type: BuildableType): number | null => {
  switch (type) {
    case BUILDING_TYPES.RESOURCE_TWIG_COLLECTOR:
      return getTwigSnapperMaxLevel();
    case BUILDING_TYPES.RESOURCE_GOO_COLLECTOR:
      return getGooFactoryMaxLevel();
    case BUILDING_TYPES.RESOURCE_PEBBLE_COLLECTOR:
      return getPebbleShinerMaxLevel();
    case BUILDING_TYPES.RESOURCE_PUTTY_COLLECTOR:
      return getPuttySquisherMaxLevel();
    case BUILDING_TYPES.RESOURCE_STONE_SILO:
    case BUILDING_TYPES.RESOURCE_WOOD_SILO:
      return getStorageSiloMaxLevel();
    case BUILDING_TYPES.DEFENSE_TURRET_RAPID:
      return getSniperTowerMaxLevel();
    case BUILDING_TYPES.DEFENSE_LASER_TOWER:
      return getLaserTowerMaxLevel();
    case BUILDING_TYPES.DEFENSE_MORTAR:
      return getCannonTowerMaxLevel();
    case BUILDING_TYPES.ARMY_HATCHERY:
      return getMonsterAcademyMaxLevel();
    default:
      return null;
  }
};

export const getHighestTerrainLevel = (buildings: Building[], type: BuildableType): number => {
  const highestLevel = buildings
    .filter((building) => building.type === type && building.status !== 'PENDING')
    .reduce((maxLevel, building) => Math.max(maxLevel, building.level), 0);

  return highestLevel > 0 ? highestLevel : 1;
};

export const hasPlacedBuildingOfType = (buildings: Building[], type: BuildableType): boolean =>
  buildings.some((building) => building.type === type && building.status !== 'PENDING');

export const getLockedUpgradeLevels = (currentLevel: number, maxLevel: number): number[] =>
  Array.from({ length: Math.max(0, maxLevel - currentLevel) }, (_, index) => currentLevel + index + 1);
