import type { Building } from '../types/building';
import type { ResourceType } from '../types/resources';

type ResourceCost = Record<ResourceType, number>;

export type GooFactoryLevelSpec = {
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

export const GOO_FACTORY_LEVELS: Record<number, GooFactoryLevelSpec> = {
  1: {
    level: 1,
    requiredTownHallLevel: 1,
    upgradeCost: toCost(247, 577),
    buildTimeMs: 20_000,
    productionPerHour: 720,
    capacity: 720,
    hp: 750,
    repairTimeMs: 30_000,
  },
  2: {
    level: 2,
    requiredTownHallLevel: 1,
    upgradeCost: toCost(520, 1_212),
    buildTimeMs: 5 * 60_000,
    productionPerHour: 1_440,
    capacity: 2_160,
    hp: 1_500,
    repairTimeMs: 60_000,
  },
  3: {
    level: 3,
    requiredTownHallLevel: 1,
    upgradeCost: toCost(1_090, 2_546),
    buildTimeMs: 20 * 60_000,
    productionPerHour: 2_520,
    capacity: 5_670,
    hp: 2_400,
    repairTimeMs: 2 * 60_000,
  },
  4: {
    level: 4,
    requiredTownHallLevel: 2,
    upgradeCost: toCost(2_290, 5_348),
    buildTimeMs: HOUR_MS,
    productionPerHour: 3_960,
    capacity: 13_365,
    hp: 6_000,
    repairTimeMs: 4 * 60_000,
  },
  5: {
    level: 5,
    requiredTownHallLevel: 2,
    upgradeCost: toCost(4_810, 11_231),
    buildTimeMs: 2 * HOUR_MS,
    productionPerHour: 5_760,
    capacity: 29_160,
    hp: 12_000,
    repairTimeMs: 8 * 60_000,
  },
  6: {
    level: 6,
    requiredTownHallLevel: 3,
    upgradeCost: toCost(10_108, 23_585),
    buildTimeMs: 5 * HOUR_MS,
    productionPerHour: 7_920,
    capacity: 60_142,
    hp: 24_000,
    repairTimeMs: 16 * 60_000,
  },
  7: {
    level: 7,
    requiredTownHallLevel: 3,
    upgradeCost: toCost(21_227, 49_529),
    buildTimeMs: 12 * HOUR_MS,
    productionPerHour: 10_440,
    capacity: 118_918,
    hp: 45_000,
    repairTimeMs: 32 * 60_000,
  },
  8: {
    level: 8,
    requiredTownHallLevel: 4,
    upgradeCost: toCost(44_580, 104_012),
    buildTimeMs: DAY_MS,
    productionPerHour: 13_320,
    capacity: 227_584,
    hp: 65_000,
    repairTimeMs: HOUR_MS,
  },
  9: {
    level: 9,
    requiredTownHallLevel: 4,
    upgradeCost: toCost(93_600, 218_427),
    buildTimeMs: 2 * DAY_MS,
    productionPerHour: 16_560,
    capacity: 424_414,
    hp: 105_000,
    repairTimeMs: HOUR_MS,
  },
  10: {
    level: 10,
    requiredTownHallLevel: 5,
    upgradeCost: toCost(196_584, 458_696),
    buildTimeMs: 3 * DAY_MS,
    productionPerHour: 20_160,
    capacity: 775_018,
    hp: 165_000,
    repairTimeMs: HOUR_MS,
  },
};

const GOO_FACTORY_MAX_LEVEL = 10;

export const getGooFactoryMaxLevel = (): number => GOO_FACTORY_MAX_LEVEL;

export const getGooFactoryLevelSpec = (level: number): GooFactoryLevelSpec => {
  const normalizedLevel = Math.max(1, Math.min(GOO_FACTORY_MAX_LEVEL, Math.floor(level)));
  return GOO_FACTORY_LEVELS[normalizedLevel];
};

export const getGooFactoryProductionPerMs = (level: number): number =>
  getGooFactoryLevelSpec(level).productionPerHour / HOUR_MS;

export type GooCollectorBuffer = {
  amount: number;
  capacity: number;
  ratio: number;
};

export const computeGooCollectorBuffer = (
  building: Pick<Building, 'level' | 'lastHarvested' | 'productionPerMs'>,
  now: number,
): GooCollectorBuffer => {
  const spec = getGooFactoryLevelSpec(building.level);
  const capacity = spec.capacity;
  const lastHarvested = building.lastHarvested ?? now;
  const productionPerMs = building.productionPerMs ?? getGooFactoryProductionPerMs(building.level);
  const elapsed = Math.max(0, now - lastHarvested);
  const amount = Math.min(capacity, elapsed * productionPerMs);
  const ratio = capacity > 0 ? Math.max(0, Math.min(1, amount / capacity)) : 0;
  return { amount, capacity, ratio };
};
