import type { ResourceType } from '../types/resources';

type ResourceCost = Record<ResourceType, number>;

export type StorageSiloLevelSpec = {
  level: number;
  requiredTownHallLevel: number;
  upgradeCost: ResourceCost;
  buildTimeMs: number;
  hp: number;
  repairTimeMs: number;
  capacityPerResource: number;
};

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

const toCost = (twigs: number, pebbles: number): ResourceCost => ({
  twigs,
  pebbles,
  putty: 0,
  goo: 0,
});

const toStorage = (capacityPerResource: number): Partial<Record<ResourceType, number>> => ({
  twigs: capacityPerResource,
  pebbles: capacityPerResource,
  putty: capacityPerResource,
  goo: capacityPerResource,
});

export const STORAGE_SILO_LEVELS: Record<number, StorageSiloLevelSpec> = {
  1: { level: 1, requiredTownHallLevel: 1, upgradeCost: toCost(3_010, 1_855), buildTimeMs: 20 * MINUTE_MS, hp: 750, repairTimeMs: 30_000, capacityPerResource: 7_500 },
  2: { level: 2, requiredTownHallLevel: 1, upgradeCost: toCost(7_421, 3_710), buildTimeMs: 30 * MINUTE_MS, hp: 1_400, repairTimeMs: 60_000, capacityPerResource: 15_000 },
  3: { level: 3, requiredTownHallLevel: 1, upgradeCost: toCost(14_843, 7_421), buildTimeMs: 45 * MINUTE_MS, hp: 2_550, repairTimeMs: 2 * MINUTE_MS, capacityPerResource: 30_000 },
  4: { level: 4, requiredTownHallLevel: 2, upgradeCost: toCost(29_687, 14_843), buildTimeMs: 67.5 * MINUTE_MS, hp: 4_750, repairTimeMs: 4 * MINUTE_MS, capacityPerResource: 60_000 },
  5: { level: 5, requiredTownHallLevel: 2, upgradeCost: toCost(59_375, 29_687), buildTimeMs: 101.25 * MINUTE_MS, hp: 8_800, repairTimeMs: 8 * MINUTE_MS, capacityPerResource: 120_000 },
  6: { level: 6, requiredTownHallLevel: 3, upgradeCost: toCost(118_750, 59_375), buildTimeMs: 151.8667 * MINUTE_MS, hp: 16_250, repairTimeMs: 16 * MINUTE_MS, capacityPerResource: 240_000 },
  7: { level: 7, requiredTownHallLevel: 3, upgradeCost: toCost(237_500, 118_750), buildTimeMs: 227.8 * MINUTE_MS, hp: 30_000, repairTimeMs: 32 * MINUTE_MS, capacityPerResource: 480_000 },
  8: { level: 8, requiredTownHallLevel: 4, upgradeCost: toCost(475_000, 237_500), buildTimeMs: 341.7167 * MINUTE_MS, hp: 55_600, repairTimeMs: HOUR_MS, capacityPerResource: 960_000 },
  9: { level: 9, requiredTownHallLevel: 4, upgradeCost: toCost(950_000, 475_000), buildTimeMs: 512.5667 * MINUTE_MS, hp: 105_000, repairTimeMs: HOUR_MS, capacityPerResource: 1_920_000 },
  10: { level: 10, requiredTownHallLevel: 5, upgradeCost: toCost(1_900_000, 950_000), buildTimeMs: 768.8667 * MINUTE_MS, hp: 190_000, repairTimeMs: HOUR_MS, capacityPerResource: 3_840_000 },
};

const STORAGE_SILO_MAX_LEVEL = 10;

export const getStorageSiloMaxLevel = (): number => STORAGE_SILO_MAX_LEVEL;

export const getStorageSiloLevelSpec = (level: number): StorageSiloLevelSpec => {
  const normalizedLevel = Math.max(1, Math.min(STORAGE_SILO_MAX_LEVEL, Math.floor(level)));
  return STORAGE_SILO_LEVELS[normalizedLevel];
};

export const getStorageSiloCapacity = (level: number): Partial<Record<ResourceType, number>> =>
  toStorage(getStorageSiloLevelSpec(level).capacityPerResource);
