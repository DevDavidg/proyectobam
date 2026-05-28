import type { ResourceType } from '../types/resources';

type ResourceCost = Record<ResourceType, number>;

export type PuttySquisherLevelSpec = {
  level: number;
  requiredTownHallLevel: number;
  upgradeCost: ResourceCost;
  buildTimeMs: number;
  productionPerHour: number;
  capacity: number;
  hp: number;
  repairTimeMs: number;
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const toCost = (twigs: number, pebbles: number): ResourceCost => ({
  twigs,
  pebbles,
  putty: 0,
  goo: 0,
});

export const PUTTY_SQUISHER_LEVELS: Record<number, PuttySquisherLevelSpec> = {
  1: { level: 1, requiredTownHallLevel: 1, upgradeCost: toCost(525, 224), buildTimeMs: 20_000, productionPerHour: 720, capacity: 720, hp: 750, repairTimeMs: 30_000 },
  2: { level: 2, requiredTownHallLevel: 1, upgradeCost: toCost(1_102, 470), buildTimeMs: 5 * 60_000, productionPerHour: 1_440, capacity: 2_160, hp: 1_500, repairTimeMs: 60_000 },
  3: { level: 3, requiredTownHallLevel: 1, upgradeCost: toCost(2_315, 992), buildTimeMs: 20 * 60_000, productionPerHour: 2_520, capacity: 5_670, hp: 2_400, repairTimeMs: 2 * 60_000 },
  4: { level: 4, requiredTownHallLevel: 2, upgradeCost: toCost(4_862, 2_086), buildTimeMs: HOUR_MS, productionPerHour: 3_960, capacity: 13_365, hp: 6_000, repairTimeMs: 4 * 60_000 },
  5: { level: 5, requiredTownHallLevel: 2, upgradeCost: toCost(10_210, 4_375), buildTimeMs: 2 * HOUR_MS, productionPerHour: 5_760, capacity: 29_160, hp: 12_000, repairTimeMs: 8 * 60_000 },
  6: { level: 6, requiredTownHallLevel: 3, upgradeCost: toCost(21_441, 9_160), buildTimeMs: 5 * HOUR_MS, productionPerHour: 7_920, capacity: 60_142, hp: 24_000, repairTimeMs: 16 * 60_000 },
  7: { level: 7, requiredTownHallLevel: 3, upgradeCost: toCost(45_027, 19_298), buildTimeMs: 12 * HOUR_MS, productionPerHour: 10_440, capacity: 118_918, hp: 45_000, repairTimeMs: 32 * 60_000 },
  8: { level: 8, requiredTownHallLevel: 4, upgradeCost: toCost(94_557, 40_524), buildTimeMs: DAY_MS, productionPerHour: 13_320, capacity: 227_584, hp: 65_000, repairTimeMs: HOUR_MS },
  9: { level: 9, requiredTownHallLevel: 4, upgradeCost: toCost(198_570, 85_102), buildTimeMs: 2 * DAY_MS, productionPerHour: 16_560, capacity: 424_414, hp: 105_000, repairTimeMs: HOUR_MS },
  10: { level: 10, requiredTownHallLevel: 5, upgradeCost: toCost(416_997, 178_716), buildTimeMs: 3 * DAY_MS, productionPerHour: 20_160, capacity: 775_018, hp: 165_000, repairTimeMs: HOUR_MS },
};

const PUTTY_SQUISHER_MAX_LEVEL = 10;

export const getPuttySquisherMaxLevel = (): number => PUTTY_SQUISHER_MAX_LEVEL;

export const getPuttySquisherLevelSpec = (level: number): PuttySquisherLevelSpec => {
  const normalizedLevel = Math.max(1, Math.min(PUTTY_SQUISHER_MAX_LEVEL, Math.floor(level)));
  return PUTTY_SQUISHER_LEVELS[normalizedLevel];
};

export const getPuttySquisherProductionPerMs = (level: number): number =>
  getPuttySquisherLevelSpec(level).productionPerHour / HOUR_MS;
