import {
  getBuildingCapForTownHallLevel,
  getBuildingCount,
  getBuildingRequiredTownHallLevel,
  getInstantFinishShinyCost,
  isBuildableType,
} from '../../core/constants/build-rules';
import { ENHANCED_BUILDING_CATALOG } from '../../core/constants/catalog';
import { BUILDING_TYPES } from '../../core/types/building';
import type { BuildingStatus } from '../../core/types/building';
import type { Enemy } from '../../core/types/enemy';
import { GRID_SIZE } from '../../utils/coordinates';
import {
  MAX_UNLOCKED_GRID_SIZE,
  MAX_WORKERS,
  createLandCellKey,
  generateLandExpansionPreview,
  getWorkerShinyCost,
  isWithinUnlockedArea,
  resolveWorkerHomeCells,
  spendResources,
} from './helpers';
import type { GameStore, GameStoreGet, GameStoreSet } from './types';

type EconomyActions = Pick<
  GameStore,
  | 'setSelectedBuildingType'
  | 'setActiveBuildTab'
  | 'buyWorker'
  | 'buyLandExpansion'
  | 'startLandExpansionMode'
  | 'cancelLandExpansionMode'
  | 'confirmLandExpansionAtActiveCell'
  | 'refreshLandExpansionPreview'
  | 'placeSelectedBuilding'
  | 'dismissWorkerBusyModal'
  | 'instantFinishBuildingWithShiny'
  | 'spawnEnemy'
  | 'collectFromCollector'
  | 'clearObstacle'
>;

const isValidExpansionCell = (x: number, y: number, unlockedLandCells: Record<string, true>): boolean => {
  if (unlockedLandCells[createLandCellKey(x, y)]) {
    return false;
  }
  return Boolean(
    unlockedLandCells[createLandCellKey(x + 1, y)] ||
      unlockedLandCells[createLandCellKey(x - 1, y)] ||
      unlockedLandCells[createLandCellKey(x, y + 1)] ||
      unlockedLandCells[createLandCellKey(x, y - 1)]
  );
};

const getLandExpansionCost = (nextLandLevel: number) => ({
  twigs: Math.round(260 * nextLandLevel),
  pebbles: Math.round(220 * nextLandLevel),
  putty: Math.round(140 * nextLandLevel),
  goo: Math.round(170 * nextLandLevel),
});

export const createEconomyActions = (set: GameStoreSet, get: GameStoreGet): EconomyActions => ({
  setSelectedBuildingType: (buildingType) => {
    const current = get();
    const definition = ENHANCED_BUILDING_CATALOG[buildingType];
    const nextPlacementSize = {
      sizeX: definition.size.x,
      sizeY: definition.size.y,
    };

    set({
      selectedBuildingType: buildingType,
      placementSize: nextPlacementSize,
      placementEnabled: true,
      shopOpen: false,
    });
    current.clearActiveCell();
  },
  setActiveBuildTab: (tab) => {
    set({ activeBuildTab: tab });
  },
  buyWorker: () => {
    const current = get();
    if (current.workersTotal >= MAX_WORKERS) {
      return;
    }
    const nextWorkerNumber = current.workersTotal + 1;
    const workerShinyCost = getWorkerShinyCost(nextWorkerNumber);
    const canAfford = current.freeBuildMode || current.developerModeEnabled || current.shiny >= workerShinyCost;
    if (!canAfford) {
      return;
    }
    const workerHome = resolveWorkerHomeCells(current.engine.getState().buildings, nextWorkerNumber)[nextWorkerNumber - 1] ?? {
      x: 7 + (nextWorkerNumber % 2),
      y: 12,
    };
    const nextWorkers = [
      ...current.workers,
      {
        id: `worker-${nextWorkerNumber}`,
        x: workerHome.x,
        y: workerHome.y,
        homeX: workerHome.x,
        homeY: workerHome.y,
        state: 'IDLE' as const,
        path: [],
      },
    ];
    set({
      workers: nextWorkers,
      workersTotal: nextWorkerNumber,
      shiny: current.freeBuildMode || current.developerModeEnabled ? current.shiny : Math.max(0, current.shiny - workerShinyCost),
    });
    current.refreshEcs();
  },
  buyLandExpansion: () => {
    get().startLandExpansionMode();
  },
  startLandExpansionMode: () => {
    const current = get();
    if (current.landLevel >= current.maxLandLevel) {
      return;
    }
    set({
      landExpansionMode: true,
      shopOpen: false,
      placementEnabled: false,
      activeCell: null,
      placementValid: false,
      selectedBuildingId: null,
      activePenMenuBuildingId: null,
    });
  },
  cancelLandExpansionMode: () => {
    set({
      landExpansionMode: false,
      activeCell: null,
      placementValid: false,
    });
  },
  confirmLandExpansionAtActiveCell: () => {
    const current = get();
    const targetCell = current.activeCell;
    if (!current.landExpansionMode || !targetCell) {
      return;
    }
    if (current.landLevel >= current.maxLandLevel) {
      return;
    }
    if (!isValidExpansionCell(targetCell.x, targetCell.y, current.unlockedLandCells)) {
      return;
    }
    const nextLandLevel = current.landLevel + 1;
    const expansionCost = getLandExpansionCost(nextLandLevel);
    const canAfford =
      current.freeBuildMode ||
      (current.resources.twigs.current >= expansionCost.twigs &&
        current.resources.pebbles.current >= expansionCost.pebbles &&
        current.resources.putty.current >= expansionCost.putty &&
        current.resources.goo.current >= expansionCost.goo);
    if (!canAfford) {
      return;
    }
    const nextResources = current.freeBuildMode ? current.resources : spendResources(current.resources, expansionCost);
    const nextUnlockedLandCells = { ...current.unlockedLandCells };
    nextUnlockedLandCells[createLandCellKey(targetCell.x, targetCell.y)] = true;
    const unlockedEntries = Object.keys(nextUnlockedLandCells).map((cellKey) => cellKey.split(',').map((part) => Number(part)));
    const minX = Math.min(...unlockedEntries.map(([x]) => x));
    const maxX = Math.max(...unlockedEntries.map(([x]) => x));
    const minY = Math.min(...unlockedEntries.map(([, y]) => y));
    const maxY = Math.max(...unlockedEntries.map(([, y]) => y));
    const nextUnlockedGridSize = Math.min(MAX_UNLOCKED_GRID_SIZE, Math.max(maxX - minX + 1, maxY - minY + 1));
    const nextPreviewSize = 10 + nextLandLevel * 2;
    const nextLandExpansionPreview = generateLandExpansionPreview(nextUnlockedLandCells, nextPreviewSize);
    current.engine.setResources(nextResources);
    set({
      resources: nextResources,
      landLevel: nextLandLevel,
      unlockedGridSize: nextUnlockedGridSize,
      unlockedLandCells: nextUnlockedLandCells,
      landExpansionPreview: nextLandExpansionPreview,
      landExpansionMode: false,
      activeCell: null,
      placementValid: false,
    });
    current.refreshEcs();
  },
  refreshLandExpansionPreview: () => {
    const current = get();
    const previewSize = 10 + current.landLevel * 2;
    const nextLandExpansionPreview = generateLandExpansionPreview(current.unlockedLandCells, previewSize);
    set({ landExpansionPreview: nextLandExpansionPreview });
  },
  placeSelectedBuilding: () => {
    const current = get();
    if (!current.activeCell || !current.placementValid) {
      return;
    }

    const selectedType = current.selectedBuildingType;
    if (!isBuildableType(selectedType)) {
      return;
    }
    const state = current.engine.getState();
    const townHall = state.buildings.find((building) => building.type === BUILDING_TYPES.TOWN_HALL);
    const townHallLevel = townHall?.level ?? 1;
    const requiredTownHallLevel = getBuildingRequiredTownHallLevel(selectedType);
    if (townHallLevel < requiredTownHallLevel) {
      return;
    }
    const currentCount = getBuildingCount(state.buildings, selectedType);
    const maxAllowed = getBuildingCapForTownHallLevel(selectedType, townHallLevel);
    if (currentCount >= maxAllowed) {
      return;
    }
    const definition = ENHANCED_BUILDING_CATALOG[selectedType];
    if (!isWithinUnlockedArea(current.activeCell.x, current.activeCell.y, definition.size.x, definition.size.y, current.unlockedGridSize, current.unlockedLandCells)) {
      return;
    }
    const cost = definition.cost;
    const canAfford =
      current.freeBuildMode ||
      (current.resources.twigs.current >= cost.twigs &&
        current.resources.pebbles.current >= cost.pebbles &&
        current.resources.putty.current >= cost.putty &&
        current.resources.goo.current >= cost.goo);
    if (!canAfford) {
      return;
    }

    const now = Date.now();
    const placed = current.engine.placeBuilding({
      type: selectedType,
      level: 1,
      x: current.activeCell.x,
      y: current.activeCell.y,
      sizeX: current.placementSize.sizeX,
      sizeY: current.placementSize.sizeY,
      hp: definition.baseHp,
      maxHp: definition.baseHp,
      status: 'PENDING',
      buildStartedAt: now,
      buildEndsAt: undefined,
      range: definition.range,
      damage: definition.damage,
      splashRadius: definition.splashRadius,
      productionPerMs: definition.production?.ratePerMs,
      productionType: definition.production?.type,
      providesCapacity: definition.storage,
      lastHarvested: now,
      tags: definition.tags,
    });
    if (!placed) {
      return;
    }

    const nextResources = current.freeBuildMode ? current.resources : spendResources(current.resources, cost);
    current.engine.setResources(nextResources);

    current.engine.clearPlacementPreview();
    set({
      activeCell: null,
      placementValid: false,
      placementEnabled: false,
      resources: nextResources,
      shopOpen: false,
    });
    current.recalculateMaxCapacities();
    current.tickConstruction();
    const refreshedState = current.engine.getState();
    const activeTasks = refreshedState.buildings
      .filter((building) => building.buildEndsAt && building.status === 'UNDER_CONSTRUCTION')
      .sort((left, right) => (left.buildEndsAt ?? 0) - (right.buildEndsAt ?? 0));
    const idleWorkers = current.workers.filter((worker) => worker.state === 'IDLE');
    if (!idleWorkers.length && activeTasks.length) {
      const activeTask = activeTasks[0];
      const remainingMs = Math.max(0, (activeTask.buildEndsAt ?? now) - now);
      set({
        workerBusyModal: {
          queuedBuildingType: selectedType,
          activeTaskBuildingId: activeTask.id,
          shinyCost: getInstantFinishShinyCost(remainingMs),
          remainingMs,
        },
      });
    }
    current.refreshEcs();
  },
  dismissWorkerBusyModal: () => {
    set({ workerBusyModal: null });
  },
  instantFinishBuildingWithShiny: (buildingId) => {
    const current = get();
    const now = Date.now();
    const state = current.engine.getState();
    const building = state.buildings.find((item) => item.id === buildingId);
    if (!building || !building.buildEndsAt) {
      return;
    }
    const remainingMs = Math.max(0, building.buildEndsAt - now);
    if (remainingMs <= 0) {
      return;
    }
    const shinyCost = getInstantFinishShinyCost(remainingMs);
    if (!current.developerModeEnabled && current.shiny < shinyCost) {
      return;
    }

    current.engine.updateBuilding(buildingId, (item) => ({
      ...item,
      status: 'ACTIVE',
      assignedWorkerId: undefined,
      buildEndsAt: undefined,
      buildStartedAt: undefined,
    }));

    const nextWorkers = current.workers.map((worker) => {
      if (worker.assignedBuildingId !== buildingId) {
        return worker;
      }
      return {
        ...worker,
        state: 'RETURNING' as const,
        taskType: undefined,
        taskEndsAt: undefined,
        assignedBuildingId: undefined,
        path: [],
      };
    });

    set({
      shiny: current.developerModeEnabled ? current.shiny : Math.max(0, current.shiny - shinyCost),
      workers: nextWorkers,
      workerBusyModal: null,
    });
    current.recalculateMaxCapacities();
    current.refreshEcs();
  },
  spawnEnemy: () => {
    const current = get();
    const edge = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;
    if (edge === 0) {
      x = Math.floor(Math.random() * GRID_SIZE);
      y = 0;
    } else if (edge === 1) {
      x = GRID_SIZE - 1;
      y = Math.floor(Math.random() * GRID_SIZE);
    } else if (edge === 2) {
      x = Math.floor(Math.random() * GRID_SIZE);
      y = GRID_SIZE - 1;
    } else {
      x = 0;
      y = Math.floor(Math.random() * GRID_SIZE);
    }

    const enemyId = current.enemyCount + 1;
    const enemy: Enemy = {
      id: `enemy-${enemyId}`,
      x,
      y,
      hp: 220,
      maxHp: 220,
      speed: 2.5,
      damage: 65,
    };
    const nextEnemies = [...current.enemies, enemy];
    current.engine.setEnemies(nextEnemies);
    set({
      enemies: nextEnemies,
      enemyCount: enemyId,
    });
    current.refreshEcs();
  },
  collectFromCollector: (collectorId) => {
    const current = get();
    const state = current.engine.getState();
    const collector = state.buildings.find((building) => building.id === collectorId);
    if (!collector || collector.productionType !== 'twigs') {
      return;
    }
    current.engine.updateBuildingLastHarvested(collectorId, Date.now());
  },
  clearObstacle: (obstacleId) => {
    const current = get();
    const state = current.engine.getState();
    const obstacle = state.buildings.find((building) => building.id === obstacleId);
    if (!obstacle || !obstacle.tags?.includes('obstacle')) {
      return;
    }
    if (obstacle.status !== 'ACTIVE') {
      return;
    }
    const definition = ENHANCED_BUILDING_CATALOG[obstacle.type];
    const cost = definition.obstacleClearCost ?? { twigs: 0, pebbles: 0, putty: 0, goo: 0 };
    const canAfford =
      current.freeBuildMode ||
      (current.resources.twigs.current >= cost.twigs &&
        current.resources.pebbles.current >= cost.pebbles &&
        current.resources.putty.current >= cost.putty &&
        current.resources.goo.current >= cost.goo);
    if (!canAfford) {
      return;
    }
    const nextResources = current.freeBuildMode ? current.resources : spendResources(current.resources, cost);
    current.engine.setResources(nextResources);
    current.engine.updateBuilding(obstacle.id, (building) => ({
      ...building,
      status: 'PENDING' as BuildingStatus,
      buildStartedAt: Date.now(),
      buildEndsAt: undefined,
    }));
    set({ resources: nextResources });
    current.tickConstruction();
    current.refreshEcs();
  },
});
