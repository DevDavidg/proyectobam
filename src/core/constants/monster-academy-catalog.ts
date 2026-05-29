type ResourceCost = {
  twigs: number;
  pebbles: number;
  putty: number;
  goo: number;
};

export type MonsterAcademyLevelSpec = {
  level: number;
  upgradeCost: ResourceCost;
  buildTimeMs: number;
  hp: number;
  repairTimeMs: number;
  requiredTownHallLevel: number;
  requiredMonsterPenLevel: number;
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const MONSTER_ACADEMY_LEVELS: Record<number, MonsterAcademyLevelSpec> = {
  1: {
    level: 1,
    upgradeCost: { twigs: 100000, pebbles: 100000, putty: 0, goo: 0 },
    buildTimeMs: 3 * HOUR_MS,
    hp: 6000,
    repairTimeMs: 30 * 60 * 1000,
    requiredTownHallLevel: 3,
    requiredMonsterPenLevel: 2,
  },
  2: {
    level: 2,
    upgradeCost: { twigs: 250000, pebbles: 250000, putty: 0, goo: 0 },
    buildTimeMs: 6 * HOUR_MS,
    hp: 10000,
    repairTimeMs: 1 * HOUR_MS,
    requiredTownHallLevel: 4,
    requiredMonsterPenLevel: 3,
  },
  3: {
    level: 3,
    upgradeCost: { twigs: 400000, pebbles: 400000, putty: 0, goo: 0 },
    buildTimeMs: 12 * HOUR_MS,
    hp: 14000,
    repairTimeMs: 1 * HOUR_MS,
    requiredTownHallLevel: 5,
    requiredMonsterPenLevel: 3,
  },
  4: {
    level: 4,
    upgradeCost: { twigs: 600000, pebbles: 600000, putty: 0, goo: 0 },
    buildTimeMs: 1 * DAY_MS,
    hp: 20000,
    repairTimeMs: 1 * HOUR_MS,
    requiredTownHallLevel: 6,
    requiredMonsterPenLevel: 4,
  },
  5: {
    level: 5,
    upgradeCost: { twigs: 900000, pebbles: 900000, putty: 0, goo: 0 },
    buildTimeMs: 1 * DAY_MS,
    hp: 30000,
    repairTimeMs: 1 * HOUR_MS,
    requiredTownHallLevel: 7,
    requiredMonsterPenLevel: 4,
  },
};

export const getMonsterAcademyMaxLevel = (): number => 5;

export const getMonsterAcademyLevelSpec = (level: number): MonsterAcademyLevelSpec => {
  const clampedLevel = Math.max(1, Math.min(getMonsterAcademyMaxLevel(), Math.floor(level)));
  return MONSTER_ACADEMY_LEVELS[clampedLevel];
};
