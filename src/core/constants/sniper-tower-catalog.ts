import type { ResourceType } from '../types/resources';

type ResourceCost = Record<ResourceType, number>;

export type SniperTowerLevelSpec = {
  level: number;
  requiredTownHallLevel: number;
  upgradeCost: ResourceCost;
  buildTimeMs: number;
  repairTimeMs: number;
  hp: number;
  rangeGrid: number;
  damagePerShot: number;
  damagePerSecond: number;
};

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const RANGE_SCALE = 60;

const toCost = (twigs: number, pebbles: number, putty: number): ResourceCost => ({
  twigs,
  pebbles,
  putty,
  goo: 0,
});

export const SNIPER_TOWER_LEVELS: Record<number, SniperTowerLevelSpec> = {
  1: { level: 1, requiredTownHallLevel: 1, upgradeCost: toCost(1_500, 2_000, 500), buildTimeMs: 30_000, repairTimeMs: 6 * MINUTE_MS, hp: 6_000, rangeGrid: 300 / RANGE_SCALE, damagePerShot: 100, damagePerSecond: 50 },
  2: { level: 2, requiredTownHallLevel: 2, upgradeCost: toCost(7_500, 10_000, 2_500), buildTimeMs: 15 * MINUTE_MS, repairTimeMs: 12 * MINUTE_MS, hp: 9_000, rangeGrid: 308 / RANGE_SCALE, damagePerShot: 210, damagePerSecond: 105 },
  3: { level: 3, requiredTownHallLevel: 3, upgradeCost: toCost(37_500, 50_000, 12_500), buildTimeMs: 45 * MINUTE_MS, repairTimeMs: 24 * MINUTE_MS, hp: 12_600, rangeGrid: 316 / RANGE_SCALE, damagePerShot: 320, damagePerSecond: 160 },
  4: { level: 4, requiredTownHallLevel: 4, upgradeCost: toCost(187_500, 250_000, 62_500), buildTimeMs: 5 * HOUR_MS, repairTimeMs: 48 * MINUTE_MS, hp: 17_640, rangeGrid: 324 / RANGE_SCALE, damagePerShot: 430, damagePerSecond: 215 },
  5: { level: 5, requiredTownHallLevel: 5, upgradeCost: toCost(937_500, 1_250_000, 312_500), buildTimeMs: 12 * HOUR_MS, repairTimeMs: HOUR_MS, hp: 26_460, rangeGrid: 332 / RANGE_SCALE, damagePerShot: 540, damagePerSecond: 270 },
  6: { level: 6, requiredTownHallLevel: 6, upgradeCost: toCost(4_687_500, 6_250_000, 1_562_500), buildTimeMs: DAY_MS, repairTimeMs: HOUR_MS, hp: 34_400, rangeGrid: 340 / RANGE_SCALE, damagePerShot: 650, damagePerSecond: 325 },
  7: { level: 7, requiredTownHallLevel: 7, upgradeCost: toCost(7_031_250, 9_375_000, 2_343_750), buildTimeMs: 2 * DAY_MS, repairTimeMs: HOUR_MS, hp: 45_000, rangeGrid: 348 / RANGE_SCALE, damagePerShot: 760, damagePerSecond: 380 },
  8: { level: 8, requiredTownHallLevel: 8, upgradeCost: toCost(10_547_000, 14_062_000, 3_515_000), buildTimeMs: 3 * DAY_MS, repairTimeMs: HOUR_MS, hp: 58_000, rangeGrid: 356 / RANGE_SCALE, damagePerShot: 870, damagePerSecond: 435 },
  9: { level: 9, requiredTownHallLevel: 8, upgradeCost: toCost(15_820_000, 21_095_000, 5_275_000), buildTimeMs: 4 * DAY_MS, repairTimeMs: HOUR_MS, hp: 75_500, rangeGrid: 364 / RANGE_SCALE, damagePerShot: 980, damagePerSecond: 490 },
  10: { level: 10, requiredTownHallLevel: 8, upgradeCost: toCost(32_730_000, 31_650_000, 7_900_000), buildTimeMs: 5.5 * DAY_MS, repairTimeMs: HOUR_MS, hp: 96_800, rangeGrid: 372 / RANGE_SCALE, damagePerShot: 1_100, damagePerSecond: 550 },
};

const SNIPER_TOWER_MAX_LEVEL = 10;

export const getSniperTowerMaxLevel = (): number => SNIPER_TOWER_MAX_LEVEL;

export const getSniperTowerLevelSpec = (level: number): SniperTowerLevelSpec => {
  const normalizedLevel = Math.max(1, Math.min(SNIPER_TOWER_MAX_LEVEL, Math.floor(level)));
  return SNIPER_TOWER_LEVELS[normalizedLevel];
};
