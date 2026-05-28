export const MONSTER_TYPES = {
  Pokey: 'Pokey',
  Rambot: 'Rambot',
} as const;

export type MonsterType = (typeof MONSTER_TYPES)[keyof typeof MONSTER_TYPES];

export type MonsterLifecycleState = 'LOCKED' | 'TRAINING' | 'HOUSED' | 'ARMY_DECK' | 'COMBAT';

export interface MonsterStatTier {
  speed: number;
  hp: number;
  damage: number;
  gooCost: number;
  housingSpace: number;
  trainingTimeMs: number;
  researchTimeMs: number;
  researchCost: { putty: number; pebbles: number };
  requiredLaboratoryLevel: number;
  requiredTownHallLevel: number;
}

export interface MonsterDefinition {
  id: string;
  name: string;
  description: string;
  favoriteTarget: string;
  levels: Record<number, MonsterStatTier>;
}

export type MonsterLevelSpec = MonsterStatTier;
export type MonsterCatalogEntry = MonsterDefinition;

export type MonsterRuntimeState = {
  unlockState: 'LOCKED' | 'UNLOCKED';
  level: number;
};

export const MONSTER_CATALOG: Record<MonsterType, MonsterCatalogEntry> = {
  Pokey: {
    id: 'pokey',
    name: 'Pokey',
    description: 'Criatura veloz con buen dano sostenido y entrenamiento rapido.',
    favoriteTarget: 'Defensas ligeras',
    levels: {
      1: {
        gooCost: 80,
        housingSpace: 2,
        trainingTimeMs: 8500,
        researchTimeMs: 10000,
        researchCost: { putty: 40, pebbles: 55 },
        requiredLaboratoryLevel: 1,
        requiredTownHallLevel: 1,
        hp: 170,
        speed: 2.7,
        damage: 52,
      },
      2: {
        gooCost: 95,
        housingSpace: 2,
        trainingTimeMs: 8200,
        researchTimeMs: 28000,
        researchCost: { putty: 70, pebbles: 95 },
        requiredLaboratoryLevel: 2,
        requiredTownHallLevel: 2,
        hp: 198,
        speed: 2.85,
        damage: 64,
      },
      3: {
        gooCost: 110,
        housingSpace: 2,
        trainingTimeMs: 7800,
        researchTimeMs: 52000,
        researchCost: { putty: 110, pebbles: 135 },
        requiredLaboratoryLevel: 3,
        requiredTownHallLevel: 3,
        hp: 228,
        speed: 3,
        damage: 76,
      },
    },
  },
  Rambot: {
    id: 'rambot',
    name: 'Rambot',
    description: 'Unidad pesada con gran vida y dano de impacto frontal.',
    favoriteTarget: 'Murallas y estructuras de alto HP',
    levels: {
      1: {
        gooCost: 160,
        housingSpace: 4,
        trainingTimeMs: 12000,
        researchTimeMs: 32000,
        researchCost: { putty: 120, pebbles: 140 },
        requiredLaboratoryLevel: 1,
        requiredTownHallLevel: 2,
        hp: 290,
        speed: 2.1,
        damage: 86,
      },
      2: {
        gooCost: 190,
        housingSpace: 4,
        trainingTimeMs: 11400,
        researchTimeMs: 62000,
        researchCost: { putty: 170, pebbles: 200 },
        requiredLaboratoryLevel: 2,
        requiredTownHallLevel: 3,
        hp: 335,
        speed: 2.22,
        damage: 102,
      },
      3: {
        gooCost: 220,
        housingSpace: 4,
        trainingTimeMs: 10800,
        researchTimeMs: 98000,
        researchCost: { putty: 230, pebbles: 280 },
        requiredLaboratoryLevel: 3,
        requiredTownHallLevel: 4,
        hp: 388,
        speed: 2.35,
        damage: 122,
      },
    },
  },
};

const getDefinedLevels = (monsterType: MonsterType): number[] =>
  Object.keys(MONSTER_CATALOG[monsterType].levels)
    .map((rawLevel) => Number(rawLevel))
    .filter((level) => Number.isFinite(level))
    .sort((left, right) => left - right);

export const getMonsterMaxLevel = (monsterType: MonsterType): number => {
  const levels = getDefinedLevels(monsterType);
  if (!levels.length) {
    return 1;
  }
  return levels[levels.length - 1];
};

export const getMonsterLevelSpec = (monsterType: MonsterType, level: number): MonsterLevelSpec => {
  const entry = MONSTER_CATALOG[monsterType];
  const maxLevel = getMonsterMaxLevel(monsterType);
  const normalizedLevel = Math.min(maxLevel, Math.max(1, Math.floor(level)));
  return entry.levels[normalizedLevel];
};

export const getMonsterHousingSpace = (monsterType: MonsterType, level: number): number =>
  getMonsterLevelSpec(monsterType, level).housingSpace;

export const getMonsterStatCap = (
  stat: keyof Pick<MonsterStatTier, 'hp' | 'speed' | 'damage' | 'gooCost' | 'housingSpace'>
): number => {
  let maxValue = 1;
  for (const monsterType of Object.keys(MONSTER_CATALOG) as MonsterType[]) {
    const levels = getDefinedLevels(monsterType);
    for (const level of levels) {
      maxValue = Math.max(maxValue, MONSTER_CATALOG[monsterType].levels[level][stat]);
    }
  }
  return maxValue;
};
