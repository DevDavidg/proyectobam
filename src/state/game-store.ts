import { create } from 'zustand';
import { BUILDING_TYPES } from '../core/types/building';
import { getMonsterHousingSpace } from '../core/constants/monster-catalog';
import {
  createInitialUnlockedLandCells,
  generateLandExpansionPreview,
  DEFAULT_MONSTER_CATALOG_STATE,
  DEFAULT_MONSTER_LEVELS,
  INITIAL_UNLOCKED_GRID_SIZE,
  MAX_UNLOCKED_GRID_SIZE,
  resolveWorkerHomeCells,
  engine,
  persistedState,
  persistedShiny,
  world,
} from './game-store/helpers';
import { createCombatActions } from './game-store/combat-actions';
import { createEconomyActions } from './game-store/economy-actions';
import { createLifecycleActions } from './game-store/lifecycle-actions';
import { createMonsterActions } from './game-store/monster-actions';
import { createPlacementActions } from './game-store/placement-actions';
import type { GameStore } from './game-store/types';

const persistedResidents = persistedState?.penResidents ?? [];
const persistedArmyInventory = persistedResidents.reduce(
  (acc, resident) => {
    if (resident.lifecycleState === 'HOUSED') {
      acc[resident.monsterType] += 1;
    }
    return acc;
  },
  { Pokey: 0, Rambot: 0 }
);
const persistedMonsterLevels = {
  ...DEFAULT_MONSTER_LEVELS,
  ...(persistedState?.monsterLevels ?? {}),
};
const persistedArmySpaceUsed = (Object.keys(persistedArmyInventory) as Array<keyof typeof persistedArmyInventory>).reduce(
  (total, monsterType) => total + persistedArmyInventory[monsterType] * getMonsterHousingSpace(monsterType, persistedMonsterLevels[monsterType] || 1),
  0
);
const initialWorkerHomes = resolveWorkerHomeCells(engine.getState().buildings, 2);
const initialUnlockedLandCells = persistedState?.unlockedLandCells ?? createInitialUnlockedLandCells(INITIAL_UNLOCKED_GRID_SIZE);
const initialLandExpansionPreview =
  persistedState?.landExpansionPreview ?? generateLandExpansionPreview(initialUnlockedLandCells, 10);

export const useGameStore = create<GameStore>((set, get) => ({
  engine,
  world,
  entities: [],
  enemies: [],
  projectiles: [],
  impacts: [],
  floatingTexts: [],
  resources: engine.getState().resources,
  shiny: persistedShiny,
  workers: [
    {
      id: 'worker-1',
      x: initialWorkerHomes[0]?.x ?? 7,
      y: initialWorkerHomes[0]?.y ?? 12,
      homeX: initialWorkerHomes[0]?.x ?? 7,
      homeY: initialWorkerHomes[0]?.y ?? 12,
      state: 'IDLE',
      path: [],
    },
    {
      id: 'worker-2',
      x: initialWorkerHomes[1]?.x ?? 8,
      y: initialWorkerHomes[1]?.y ?? 12,
      homeX: initialWorkerHomes[1]?.x ?? 8,
      homeY: initialWorkerHomes[1]?.y ?? 12,
      state: 'IDLE',
      path: [],
    },
  ],
  workersTotal: 2,
  landLevel: 0,
  maxLandLevel: Math.floor((MAX_UNLOCKED_GRID_SIZE - INITIAL_UNLOCKED_GRID_SIZE) / 2),
  unlockedGridSize: INITIAL_UNLOCKED_GRID_SIZE,
  unlockedLandCells: initialUnlockedLandCells,
  landExpansionPreview: initialLandExpansionPreview,
  landExpansionMode: false,
  damageTimestamps: {},
  turretCooldownById: {},
  freeBuildMode: false,
  developerModeEnabled: false,
  battleMode: false,
  selectedArmyMonster: null,
  hatcheryModalBuildingId: null,
  hatcheryTrainingQueues: {},
  armyInventory: persistedArmyInventory,
  monsterCatalogState: {
    Pokey: {
      ...DEFAULT_MONSTER_CATALOG_STATE.Pokey,
      unlockState: persistedMonsterLevels.Pokey > 0 ? 'UNLOCKED' : 'LOCKED',
      level: persistedMonsterLevels.Pokey,
    },
    Rambot: {
      ...DEFAULT_MONSTER_CATALOG_STATE.Rambot,
      unlockState: persistedMonsterLevels.Rambot > 0 ? 'UNLOCKED' : 'LOCKED',
      level: persistedMonsterLevels.Rambot,
    },
  },
  monsterLevels: persistedMonsterLevels,
  activeResearch: {
    monsterType: null,
    endTime: null,
    durationTotal: 0,
    startedAt: null,
    targetLevel: null,
    labId: null,
  },
  armySpaceUsed: persistedArmySpaceUsed,
  maxArmySpace: 0,
  penResidents: persistedResidents,
  nextResidentId: persistedState?.nextResidentId ?? 1,
  battleExclusion: { minX: 6, minY: 6, maxX: 13, maxY: 13 },
  pendingRaidSpawns: [],
  battleHasStarted: false,
  battleResult: null,
  selectedBuildingId: null,
  buildingContextMenuPosition: null,
  activePenMenuBuildingId: null,
  housingDetailsPenId: null,
  movingBuildingId: null,
  movingBuildingOrigin: null,
  penHousingSettings: persistedState?.penHousingSettings ?? {},
  hoveredBuildingId: null,
  selectedBuildingType: BUILDING_TYPES.DEFENSE_WALL_WOOD,
  activeBuildTab: 'RESOURCES',
  shopOpen: false,
  workerBusyModal: null,
  queuedMonsters: [],
  enemyCount: 0,
  projectileCount: 0,
  activeCell: null,
  placementValid: false,
  placementEnabled: false,
  placementSize: { sizeX: 1, sizeY: 1 },
  lastResourceTick: Date.now(),
  lastCombatTick: Date.now(),
  lastConstructionTick: Date.now(),
  lastHatcheryTick: Date.now(),
  ...createLifecycleActions(set, get),
  ...createCombatActions(set, get),
  ...createPlacementActions(set, get),
  ...createMonsterActions(set, get),
  ...createEconomyActions(set, get),
}));

useGameStore.getState().recalculateMaxCapacities();
useGameStore.getState().refreshEcs();
