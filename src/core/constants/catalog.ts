import { BUILDING_TYPES } from '../types/building';
import type { BuildingCategory, BuildingType } from '../types/building';
import type { ResourceType } from '../types/resources';
import { getCannonTowerLevelSpec } from './cannon-tower-catalog';
import { getGooFactoryLevelSpec, getGooFactoryProductionPerMs } from './goo-factory-catalog';
import { getLaserTowerLevelSpec } from './laser-tower-catalog';
import { getMonsterAcademyLevelSpec } from './monster-academy-catalog';
import { getPebbleShinerLevelSpec, getPebbleShinerProductionPerMs } from './pebble-shiner-catalog';
import { getPuttySquisherLevelSpec, getPuttySquisherProductionPerMs } from './putty-squisher-catalog';
import { getSniperTowerLevelSpec } from './sniper-tower-catalog';
import { getStorageSiloCapacity, getStorageSiloLevelSpec } from './storage-silo-catalog';
import { getTwigSnapperLevelSpec, getTwigSnapperProductionPerMs } from './twig-snapper-catalog';

export type BuildingDefinition = {
  type: Exclude<BuildingType, 'PREVIEW'>;
  name: string;
  category: BuildingCategory;
  cost: Record<ResourceType, number>;
  size: { x: number; y: number };
  baseHp: number;
  constructionMs: number;
  tags?: string[];
  production?: { type: ResourceType; ratePerMs: number };
  storage?: Partial<Record<ResourceType, number>>;
  damageType?: 'SINGLE' | 'AOE';
  range?: number;
  damage?: number;
  splashRadius?: number;
  obstacleClearCost?: Record<ResourceType, number>;
};

const z = { twigs: 0, pebbles: 0, putty: 0, goo: 0 } as const;
const twigSnapperLevelOne = getTwigSnapperLevelSpec(1);
const gooFactoryLevelOne = getGooFactoryLevelSpec(1);
const pebbleShinerLevelOne = getPebbleShinerLevelSpec(1);
const puttySquisherLevelOne = getPuttySquisherLevelSpec(1);
const storageSiloLevelOne = getStorageSiloLevelSpec(1);
const sniperTowerLevelOne = getSniperTowerLevelSpec(1);
const cannonTowerLevelOne = getCannonTowerLevelSpec(1);
const laserTowerLevelOne = getLaserTowerLevelSpec(1);
const monsterAcademyLevelOne = getMonsterAcademyLevelSpec(1);

export const ENHANCED_BUILDING_CATALOG: Record<Exclude<BuildingType, 'PREVIEW'>, BuildingDefinition> = {
  TOWN_HALL: {
    type: BUILDING_TYPES.TOWN_HALL,
    name: 'Ayuntamiento',
    category: 'RESOURCES',
    cost: z,
    size: { x: 4, y: 4 },
    baseHp: 5000,
    constructionMs: 0,
    tags: ['core'],
    storage: { twigs: 1000, pebbles: 1000, putty: 1000, goo: 1000 },
  },
  RESOURCE_TWIG_COLLECTOR: {
    type: BUILDING_TYPES.RESOURCE_TWIG_COLLECTOR,
    name: 'Twig Snapper',
    category: 'RESOURCES',
    cost: twigSnapperLevelOne.upgradeCost,
    size: { x: 2, y: 2 },
    baseHp: twigSnapperLevelOne.hp,
    constructionMs: twigSnapperLevelOne.buildTimeMs,
    production: { type: 'twigs', ratePerMs: getTwigSnapperProductionPerMs(1) },
  },
  RESOURCE_PEBBLE_COLLECTOR: {
    type: BUILDING_TYPES.RESOURCE_PEBBLE_COLLECTOR,
    name: 'Pebble Shiner',
    category: 'RESOURCES',
    cost: pebbleShinerLevelOne.upgradeCost,
    size: { x: 2, y: 2 },
    baseHp: pebbleShinerLevelOne.hp,
    constructionMs: pebbleShinerLevelOne.buildTimeMs,
    production: { type: 'pebbles', ratePerMs: getPebbleShinerProductionPerMs(1) },
  },
  RESOURCE_PUTTY_COLLECTOR: {
    type: BUILDING_TYPES.RESOURCE_PUTTY_COLLECTOR,
    name: 'Putty Squisher',
    category: 'RESOURCES',
    cost: puttySquisherLevelOne.upgradeCost,
    size: { x: 2, y: 2 },
    baseHp: puttySquisherLevelOne.hp,
    constructionMs: puttySquisherLevelOne.buildTimeMs,
    production: { type: 'putty', ratePerMs: getPuttySquisherProductionPerMs(1) },
  },
  RESOURCE_GOO_COLLECTOR: {
    type: BUILDING_TYPES.RESOURCE_GOO_COLLECTOR,
    name: 'Goo Factory',
    category: 'RESOURCES',
    cost: gooFactoryLevelOne.upgradeCost,
    size: { x: 2, y: 2 },
    baseHp: gooFactoryLevelOne.hp,
    constructionMs: gooFactoryLevelOne.buildTimeMs,
    production: { type: 'goo', ratePerMs: getGooFactoryProductionPerMs(1) },
  },
  RESOURCE_WOOD_SILO: {
    type: BUILDING_TYPES.RESOURCE_WOOD_SILO,
    name: 'Storage Silo (legacy)',
    category: 'RESOURCES',
    cost: storageSiloLevelOne.upgradeCost,
    size: { x: 4, y: 4 },
    baseHp: storageSiloLevelOne.hp,
    constructionMs: storageSiloLevelOne.buildTimeMs,
    storage: getStorageSiloCapacity(1),
    tags: ['legacy'],
  },
  RESOURCE_STONE_SILO: {
    type: BUILDING_TYPES.RESOURCE_STONE_SILO,
    name: 'Storage Silo',
    category: 'RESOURCES',
    cost: storageSiloLevelOne.upgradeCost,
    size: { x: 4, y: 4 },
    baseHp: storageSiloLevelOne.hp,
    constructionMs: storageSiloLevelOne.buildTimeMs,
    storage: getStorageSiloCapacity(1),
  },
  DEFENSE_WALL_WOOD: {
    type: BUILDING_TYPES.DEFENSE_WALL_WOOD,
    name: 'Muro de Madera',
    category: 'DEFENSES',
    cost: { twigs: 50, pebbles: 0, putty: 0, goo: 0 },
    size: { x: 1, y: 1 },
    baseHp: 650,
    constructionMs: 8000,
    tags: ['wall'],
  },
  DEFENSE_WALL_STONE: {
    type: BUILDING_TYPES.DEFENSE_WALL_STONE,
    name: 'Muro de Piedra',
    category: 'DEFENSES',
    cost: { twigs: 40, pebbles: 100, putty: 0, goo: 0 },
    size: { x: 1, y: 1 },
    baseHp: 1100,
    constructionMs: 10000,
    tags: ['wall'],
  },
  DEFENSE_WALL_IRON: {
    type: BUILDING_TYPES.DEFENSE_WALL_IRON,
    name: 'Muro de Hierro',
    category: 'DEFENSES',
    cost: { twigs: 30, pebbles: 140, putty: 120, goo: 0 },
    size: { x: 1, y: 1 },
    baseHp: 1700,
    constructionMs: 14000,
    tags: ['wall'],
  },
  DEFENSE_TURRET_RAPID: {
    type: BUILDING_TYPES.DEFENSE_TURRET_RAPID,
    name: 'Sniper Tower',
    category: 'DEFENSES',
    cost: sniperTowerLevelOne.upgradeCost,
    size: { x: 3, y: 3 },
    baseHp: sniperTowerLevelOne.hp,
    constructionMs: sniperTowerLevelOne.buildTimeMs,
    range: sniperTowerLevelOne.rangeGrid,
    damage: sniperTowerLevelOne.damagePerShot,
    damageType: 'SINGLE',
    tags: ['turret', 'sniper'],
  },
  DEFENSE_MORTAR: {
    type: BUILDING_TYPES.DEFENSE_MORTAR,
    name: 'Cannon Tower',
    category: 'DEFENSES',
    cost: cannonTowerLevelOne.upgradeCost,
    size: { x: 3, y: 3 },
    baseHp: cannonTowerLevelOne.hp,
    constructionMs: cannonTowerLevelOne.buildTimeMs,
    range: cannonTowerLevelOne.rangeGrid,
    damage: cannonTowerLevelOne.damagePerShot,
    splashRadius: cannonTowerLevelOne.splashRadiusGrid,
    damageType: 'AOE',
    tags: ['turret', 'mortar', 'cannon'],
  },
  DEFENSE_LASER_TOWER: {
    type: BUILDING_TYPES.DEFENSE_LASER_TOWER,
    name: 'Laser Tower',
    category: 'DEFENSES',
    cost: laserTowerLevelOne.upgradeCost,
    size: { x: 3, y: 3 },
    baseHp: laserTowerLevelOne.hp,
    constructionMs: laserTowerLevelOne.buildTimeMs,
    range: laserTowerLevelOne.rangeGrid,
    damage: laserTowerLevelOne.damagePerTick,
    damageType: 'AOE',
    tags: ['turret', 'laser'],
  },
  ARMY_HATCHERY: {
    type: BUILDING_TYPES.ARMY_HATCHERY,
    name: 'Monster Academy',
    category: 'ARMY',
    cost: monsterAcademyLevelOne.upgradeCost,
    size: { x: 5, y: 5 },
    baseHp: monsterAcademyLevelOne.hp,
    constructionMs: monsterAcademyLevelOne.buildTimeMs,
  },
  ARMY_MONSTER_PEN: {
    type: BUILDING_TYPES.ARMY_MONSTER_PEN,
    name: 'Corral de Monstruos',
    category: 'ARMY',
    cost: { twigs: 220, pebbles: 180, putty: 100, goo: 120 },
    size: { x: 3, y: 2 },
    baseHp: 1200,
    constructionMs: 22000,
  },
  DECOR_MUSHROOM_TOTEM: {
    type: BUILDING_TYPES.DECOR_MUSHROOM_TOTEM,
    name: 'Totem de Hongo',
    category: 'DECORATION',
    cost: { twigs: 30, pebbles: 30, putty: 20, goo: 20 },
    size: { x: 1, y: 1 },
    baseHp: 250,
    constructionMs: 5000,
  },
  OBSTACLE_TREE: {
    type: BUILDING_TYPES.OBSTACLE_TREE,
    name: 'Arbol',
    category: 'DECORATION',
    cost: z,
    size: { x: 1, y: 1 },
    baseHp: 1,
    constructionMs: 0,
    tags: ['obstacle'],
    obstacleClearCost: { twigs: 20, pebbles: 10, putty: 0, goo: 0 },
  },
  OBSTACLE_ROCK: {
    type: BUILDING_TYPES.OBSTACLE_ROCK,
    name: 'Roca',
    category: 'DECORATION',
    cost: z,
    size: { x: 1, y: 1 },
    baseHp: 1,
    constructionMs: 0,
    tags: ['obstacle'],
    obstacleClearCost: { twigs: 0, pebbles: 20, putty: 10, goo: 0 },
  },
  OBSTACLE_MUSHROOM: {
    type: BUILDING_TYPES.OBSTACLE_MUSHROOM,
    name: 'Hongo Gigante',
    category: 'DECORATION',
    cost: z,
    size: { x: 1, y: 1 },
    baseHp: 1,
    constructionMs: 0,
    tags: ['obstacle'],
    obstacleClearCost: { twigs: 10, pebbles: 0, putty: 0, goo: 20 },
  },
};

export const BUILD_MENU_TABS: BuildingCategory[] = ['RESOURCES', 'DEFENSES', 'ARMY', 'DECORATION'];
