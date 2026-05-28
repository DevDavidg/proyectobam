import type { ResourceType } from '../types/resources';

type ResourceCost = Record<ResourceType, number>;

export type LaserTowerLevelSpec = {
  level: number;
  requiredTownHallLevel: number;
  upgradeCost: ResourceCost;
  buildTimeMs: number;
  repairTimeMs: number;
  hp: number;
  rangeGrid: number;
  damagePerTick: number;
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MINUTE_MS = 60 * 1000;
const RANGE_SCALE = 100;

const toCost = (twigs: number, pebbles: number, putty: number): ResourceCost => ({
  twigs,
  pebbles,
  putty,
  goo: 0,
});

export const LASER_TOWER_LEVELS: Record<number, LaserTowerLevelSpec> = {
  1: { level: 1, requiredTownHallLevel: 4, upgradeCost: toCost(500_000, 250_000, 100_000), buildTimeMs: 5 * HOUR_MS, repairTimeMs: 24 * MINUTE_MS, hp: 9_000, rangeGrid: 160 / RANGE_SCALE, damagePerTick: 60 },
  2: { level: 2, requiredTownHallLevel: 5, upgradeCost: toCost(1_000_000, 500_000, 200_000), buildTimeMs: DAY_MS, repairTimeMs: 48 * MINUTE_MS, hp: 12_600, rangeGrid: 162 / RANGE_SCALE, damagePerTick: 75 },
  3: { level: 3, requiredTownHallLevel: 6, upgradeCost: toCost(2_000_000, 1_000_000, 400_000), buildTimeMs: 2 * DAY_MS, repairTimeMs: HOUR_MS, hp: 17_640, rangeGrid: 164 / RANGE_SCALE, damagePerTick: 90 },
  4: { level: 4, requiredTownHallLevel: 7, upgradeCost: toCost(4_000_000, 2_000_000, 800_000), buildTimeMs: 3 * DAY_MS, repairTimeMs: HOUR_MS, hp: 26_460, rangeGrid: 168 / RANGE_SCALE, damagePerTick: 100 },
  5: { level: 5, requiredTownHallLevel: 8, upgradeCost: toCost(8_000_000, 4_000_000, 1_600_000), buildTimeMs: 4.5 * DAY_MS, repairTimeMs: HOUR_MS, hp: 34_400, rangeGrid: 170 / RANGE_SCALE, damagePerTick: 110 },
  6: { level: 6, requiredTownHallLevel: 9, upgradeCost: toCost(16_000_000, 8_000_000, 3_200_000), buildTimeMs: 9 * DAY_MS, repairTimeMs: HOUR_MS, hp: 42_000, rangeGrid: 175 / RANGE_SCALE, damagePerTick: 120 },
  7: { level: 7, requiredTownHallLevel: 10, upgradeCost: toCost(24_000_000, 16_000_000, 6_400_000), buildTimeMs: 12 * DAY_MS, repairTimeMs: HOUR_MS, hp: 50_000, rangeGrid: 178 / RANGE_SCALE, damagePerTick: 130 },
  8: { level: 8, requiredTownHallLevel: 10, upgradeCost: toCost(27_000_000, 25_000_000, 12_800_000), buildTimeMs: 14 * DAY_MS, repairTimeMs: HOUR_MS, hp: 58_000, rangeGrid: 178 / RANGE_SCALE, damagePerTick: 145 },
};

const LASER_TOWER_MAX_LEVEL = 8;

export const getLaserTowerMaxLevel = (): number => LASER_TOWER_MAX_LEVEL;

export const getLaserTowerLevelSpec = (level: number): LaserTowerLevelSpec => {
  const normalizedLevel = Math.max(1, Math.min(LASER_TOWER_MAX_LEVEL, Math.floor(level)));
  return LASER_TOWER_LEVELS[normalizedLevel];
};
