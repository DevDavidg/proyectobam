import type { ResourceType } from '../types/resources';

type ResourceCost = Record<ResourceType, number>;

export type CannonTowerLevelSpec = {
  level: number;
  requiredTownHallLevel: number;
  upgradeCost: ResourceCost;
  buildTimeMs: number;
  repairTimeMs: number;
  hp: number;
  rangeGrid: number;
  splashRadiusGrid: number;
  damagePerShot: number;
  damagePerSecond: number;
};

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const RANGE_SCALE = 10;
const SPLASH_SCALE = 100;

const toCost = (twigs: number, pebbles: number, putty: number): ResourceCost => ({
  twigs,
  pebbles,
  putty,
  goo: 0,
});

export const CANNON_TOWER_LEVELS: Record<number, CannonTowerLevelSpec> = {
  1: { level: 1, requiredTownHallLevel: 1, upgradeCost: toCost(2_000, 1_500, 500), buildTimeMs: 30_000, repairTimeMs: 6 * MINUTE_MS, hp: 6_000, rangeGrid: 30 / RANGE_SCALE, splashRadiusGrid: 160 / SPLASH_SCALE, damagePerShot: 20, damagePerSecond: 20 },
  2: { level: 2, requiredTownHallLevel: 2, upgradeCost: toCost(10_000, 7_500, 2_500), buildTimeMs: 15 * MINUTE_MS, repairTimeMs: 12 * MINUTE_MS, hp: 9_000, rangeGrid: 35 / RANGE_SCALE, splashRadiusGrid: 170 / SPLASH_SCALE, damagePerShot: 40, damagePerSecond: 40 },
  3: { level: 3, requiredTownHallLevel: 3, upgradeCost: toCost(50_000, 37_500, 12_500), buildTimeMs: 45 * MINUTE_MS, repairTimeMs: 24 * MINUTE_MS, hp: 12_600, rangeGrid: 40 / RANGE_SCALE, splashRadiusGrid: 180 / SPLASH_SCALE, damagePerShot: 60, damagePerSecond: 60 },
  4: { level: 4, requiredTownHallLevel: 4, upgradeCost: toCost(250_000, 187_500, 62_500), buildTimeMs: 2.25 * HOUR_MS, repairTimeMs: 48 * MINUTE_MS, hp: 17_640, rangeGrid: 45 / RANGE_SCALE, splashRadiusGrid: 190 / SPLASH_SCALE, damagePerShot: 80, damagePerSecond: 80 },
  5: { level: 5, requiredTownHallLevel: 4, upgradeCost: toCost(1_250_000, 937_500, 321_500), buildTimeMs: 6.75 * HOUR_MS, repairTimeMs: HOUR_MS, hp: 26_460, rangeGrid: 50 / RANGE_SCALE, splashRadiusGrid: 200 / SPLASH_SCALE, damagePerShot: 100, damagePerSecond: 100 },
  6: { level: 6, requiredTownHallLevel: 5, upgradeCost: toCost(6_250_000, 4_687_500, 1_562_500), buildTimeMs: 20.25 * HOUR_MS, repairTimeMs: HOUR_MS, hp: 34_400, rangeGrid: 55 / RANGE_SCALE, splashRadiusGrid: 210 / SPLASH_SCALE, damagePerShot: 120, damagePerSecond: 120 },
  7: { level: 7, requiredTownHallLevel: 6, upgradeCost: toCost(9_375_000, 7_000_000, 1_562_500), buildTimeMs: 2 * DAY_MS, repairTimeMs: HOUR_MS, hp: 45_000, rangeGrid: 60 / RANGE_SCALE, splashRadiusGrid: 220 / SPLASH_SCALE, damagePerShot: 140, damagePerSecond: 140 },
  8: { level: 8, requiredTownHallLevel: 7, upgradeCost: toCost(14_000_000, 10_500_000, 1_562_500), buildTimeMs: 3 * DAY_MS, repairTimeMs: HOUR_MS, hp: 58_000, rangeGrid: 65 / RANGE_SCALE, splashRadiusGrid: 230 / SPLASH_SCALE, damagePerShot: 160, damagePerSecond: 160 },
  9: { level: 9, requiredTownHallLevel: 8, upgradeCost: toCost(21_000_000, 15_800_000, 1_562_500), buildTimeMs: 4 * DAY_MS, repairTimeMs: HOUR_MS, hp: 75_500, rangeGrid: 70 / RANGE_SCALE, splashRadiusGrid: 240 / SPLASH_SCALE, damagePerShot: 180, damagePerSecond: 180 },
  10: { level: 10, requiredTownHallLevel: 8, upgradeCost: toCost(31_600_000, 23_700_000, 1_562_000), buildTimeMs: 5.5 * DAY_MS, repairTimeMs: HOUR_MS, hp: 98_200, rangeGrid: 75 / RANGE_SCALE, splashRadiusGrid: 250 / SPLASH_SCALE, damagePerShot: 200, damagePerSecond: 200 },
};

const CANNON_TOWER_MAX_LEVEL = 10;

export const getCannonTowerMaxLevel = (): number => CANNON_TOWER_MAX_LEVEL;

export const getCannonTowerLevelSpec = (level: number): CannonTowerLevelSpec => {
  const normalizedLevel = Math.max(1, Math.min(CANNON_TOWER_MAX_LEVEL, Math.floor(level)));
  return CANNON_TOWER_LEVELS[normalizedLevel];
};
