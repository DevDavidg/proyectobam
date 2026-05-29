import type { Building } from '../types/building';
import type { ResourceType } from '../types/resources';

type ResourceCost = Record<ResourceType, number>;

export type TwigSnapperLevelSpec = {
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

const toCost = (pebbles: number): ResourceCost => ({
  twigs: 0,
  pebbles,
  putty: 0,
  goo: 0,
});

export const TWIG_SNAPPER_LEVELS: Record<number, TwigSnapperLevelSpec> = {
  1: {
    level: 1,
    requiredTownHallLevel: 1,
    upgradeCost: toCost(750),
    buildTimeMs: 15_000,
    productionPerHour: 720,
    capacity: 720,
    hp: 500,
    repairTimeMs: 30_000,
  },
  2: {
    level: 2,
    requiredTownHallLevel: 1,
    upgradeCost: toCost(1_575),
    buildTimeMs: 5 * 60_000,
    productionPerHour: 1_440,
    capacity: 2_160,
    hp: 950,
    repairTimeMs: 60_000,
  },
  3: {
    level: 3,
    requiredTownHallLevel: 1,
    upgradeCost: toCost(3_300),
    buildTimeMs: 20 * 60_000,
    productionPerHour: 2_520,
    capacity: 5_670,
    hp: 1_800,
    repairTimeMs: 2 * 60_000,
  },
  4: {
    level: 4,
    requiredTownHallLevel: 2,
    upgradeCost: toCost(6_950),
    buildTimeMs: HOUR_MS,
    productionPerHour: 3_960,
    capacity: 13_365,
    hp: 3_400,
    repairTimeMs: 4 * 60_000,
  },
  5: {
    level: 5,
    requiredTownHallLevel: 2,
    upgradeCost: toCost(14_500),
    buildTimeMs: 2 * HOUR_MS,
    productionPerHour: 5_760,
    capacity: 29_160,
    hp: 6_500,
    repairTimeMs: 8 * 60_000,
  },
  6: {
    level: 6,
    requiredTownHallLevel: 3,
    upgradeCost: toCost(30_600),
    buildTimeMs: 5 * HOUR_MS,
    productionPerHour: 7_920,
    capacity: 60_142,
    hp: 12_000,
    repairTimeMs: 16 * 60_000,
  },
  7: {
    level: 7,
    requiredTownHallLevel: 3,
    upgradeCost: toCost(64_300),
    buildTimeMs: 12 * HOUR_MS,
    productionPerHour: 10_440,
    capacity: 118_918,
    hp: 24_000,
    repairTimeMs: 32 * 60_000,
  },
  8: {
    level: 8,
    requiredTownHallLevel: 4,
    upgradeCost: toCost(135_000),
    buildTimeMs: DAY_MS,
    productionPerHour: 13_320,
    capacity: 227_584,
    hp: 45_000,
    repairTimeMs: HOUR_MS,
  },
  9: {
    level: 9,
    requiredTownHallLevel: 4,
    upgradeCost: toCost(283_600),
    buildTimeMs: 2 * DAY_MS,
    productionPerHour: 16_560,
    capacity: 424_414,
    hp: 85_000,
    repairTimeMs: HOUR_MS,
  },
  10: {
    level: 10,
    requiredTownHallLevel: 5,
    upgradeCost: toCost(600_000),
    buildTimeMs: 3 * DAY_MS,
    productionPerHour: 20_160,
    capacity: 775_018,
    hp: 165_000,
    repairTimeMs: HOUR_MS,
  },
};

const TWIG_SNAPPER_MAX_LEVEL = 10;

export const getTwigSnapperMaxLevel = (): number => TWIG_SNAPPER_MAX_LEVEL;

export const getTwigSnapperLevelSpec = (level: number): TwigSnapperLevelSpec => {
  const normalizedLevel = Math.max(1, Math.min(TWIG_SNAPPER_MAX_LEVEL, Math.floor(level)));
  return TWIG_SNAPPER_LEVELS[normalizedLevel];
};

export const getTwigSnapperProductionPerMs = (level: number): number =>
  getTwigSnapperLevelSpec(level).productionPerHour / HOUR_MS;

export type TwigSnapperBuffer = {
  amount: number;
  capacity: number;
  ratio: number;
};

export const computeTwigSnapperBuffer = (
  building: Pick<Building, 'level' | 'lastHarvested' | 'productionPerMs'>,
  now: number,
): TwigSnapperBuffer => {
  const spec = getTwigSnapperLevelSpec(building.level);
  const capacity = spec.capacity;
  const lastHarvested = building.lastHarvested ?? now;
  const productionPerMs = building.productionPerMs ?? getTwigSnapperProductionPerMs(building.level);
  const elapsed = Math.max(0, now - lastHarvested);
  const amount = Math.min(capacity, elapsed * productionPerMs);
  const ratio = capacity > 0 ? Math.max(0, Math.min(1, amount / capacity)) : 0;
  return { amount, capacity, ratio };
};
