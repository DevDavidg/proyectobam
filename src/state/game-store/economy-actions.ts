import {
  getBuildingCapForTownHallLevel,
  getBuildingCount,
  getBuildingRequiredTownHallLevel,
  getInstantFinishShinyCost,
  isBuildableType,
} from "../../core/constants/build-rules";
import { ENHANCED_BUILDING_CATALOG } from "../../core/constants/catalog";
import { computeGooCollectorBuffer } from "../../core/constants/goo-factory-catalog";
import { computePebbleShinerBuffer } from "../../core/constants/pebble-shiner-catalog";
import { computePuttySquisherBuffer } from "../../core/constants/putty-squisher-catalog";
import { computeTwigSnapperBuffer } from "../../core/constants/twig-snapper-catalog";
import {
  BUILDING_TYPES,
  type Building,
  type BuildingStatus,
  type BuildingType,
} from "../../core/types/building";
import type { Enemy } from "../../core/types/enemy";
import type { GameResources } from "../../core/types/resources";
import { computeTownHallFunnelWorld } from "../../render/entities/town-hall-visual/world-anchors";
import {
  CELL_SIZE,
  GRID_SIZE,
  gridToWorldCenter,
} from "../../utils/coordinates";
import { findPathAStar } from "../../utils/pathfinding";
import {
  MAX_UNLOCKED_GRID_SIZE,
  MAX_WORKERS,
  createLandCellKey,
  generateLandExpansionPreview,
  getWalkableGridFromState,
  getWorkerShinyCost,
  isUnrestrictedMode,
  isWithinUnlockedArea,
  resolveWorkerHomeCells,
  rollObstacleClearShinyReward,
  spendResources,
} from "./helpers";
import type {
  GameStore,
  GameStoreGet,
  GameStoreSet,
  ResourceOrb,
  ResourceOrbResourceType,
} from "./types";

type EconomyActions = Pick<
  GameStore,
  | "setSelectedBuildingType"
  | "setActiveBuildTab"
  | "buyWorker"
  | "buyLandExpansion"
  | "startLandExpansionMode"
  | "cancelLandExpansionMode"
  | "confirmLandExpansionAtActiveCell"
  | "refreshLandExpansionPreview"
  | "placeSelectedBuilding"
  | "dismissWorkerBusyModal"
  | "instantFinishBuildingWithShiny"
  | "spawnEnemy"
  | "collectFromCollector"
  | "collectAllCollectors"
  | "pruneExpiredResourceOrbs"
  | "clearObstacle"
>;

const ORB_DURATION_MS = 850;
const ORB_GROUP_STAGGER_MS = 110;
const ORB_INTRA_STAGGER_MS = 55;
const ORB_COUNT_MIN = 1;
const ORB_COUNT_MAX = 20;
const ORB_COUNT_BASE = 80;

type CollectorBufferResult = {
  resourceType: ResourceOrbResourceType;
  amount: number;
} | null;

const computeOrbCount = (amount: number): number => {
  if (amount <= 0) {
    return 0;
  }
  const raw = Math.round(Math.sqrt(amount / ORB_COUNT_BASE));
  return Math.max(ORB_COUNT_MIN, Math.min(ORB_COUNT_MAX, raw));
};

const pickJitter = (range: number): number => (Math.random() - 0.5) * range;

const computeCollectorBuffer = (
  collector: Building,
  now: number,
): CollectorBufferResult => {
  if (collector.type === BUILDING_TYPES.RESOURCE_GOO_COLLECTOR) {
    return {
      resourceType: "goo",
      amount: computeGooCollectorBuffer(collector, now).amount,
    };
  }
  if (collector.type === BUILDING_TYPES.RESOURCE_PEBBLE_COLLECTOR) {
    return {
      resourceType: "pebbles",
      amount: computePebbleShinerBuffer(collector, now).amount,
    };
  }
  if (collector.type === BUILDING_TYPES.RESOURCE_PUTTY_COLLECTOR) {
    return {
      resourceType: "putty",
      amount: computePuttySquisherBuffer(collector, now).amount,
    };
  }
  if (collector.type === BUILDING_TYPES.RESOURCE_TWIG_COLLECTOR) {
    return {
      resourceType: "twigs",
      amount: computeTwigSnapperBuffer(collector, now).amount,
    };
  }
  return null;
};

const creditResource = (
  resources: GameResources,
  resourceType: ResourceOrbResourceType,
  amount: number,
): GameResources => {
  const bucket = resources[resourceType];
  return {
    ...resources,
    [resourceType]: {
      ...bucket,
      current: Math.min(bucket.max, bucket.current + amount),
    },
  };
};

const buildCollectionOrbs = (
  collector: Building,
  townHall: Building,
  result: NonNullable<CollectorBufferResult>,
  startedAt: number,
  groupDelayMs: number,
  orbBaseIndex: number,
): ResourceOrb[] => {
  const [collectorWorldX, , collectorWorldZ] = gridToWorldCenter(
    collector.x,
    collector.y,
    collector.sizeX,
    collector.sizeY,
    GRID_SIZE,
    CELL_SIZE,
  );
  const funnel = computeTownHallFunnelWorld({
    x: townHall.x,
    y: townHall.y,
    sizeX: townHall.sizeX,
    sizeY: townHall.sizeY,
    level: townHall.level,
  });
  const orbCount = computeOrbCount(result.amount);
  if (orbCount === 0) {
    return [];
  }
  const perOrbAmount = result.amount / orbCount;
  const swarmShrink = 1 / Math.sqrt(1 + (orbCount - 1) * 0.18);
  const sizeFactor = Math.max(0.55, Math.min(1.15, swarmShrink));
  const orbs: ResourceOrb[] = [];
  for (let i = 0; i < orbCount; i += 1) {
    const angle = (i / orbCount) * Math.PI * 2 + Math.random() * 0.6;
    const radius = 0.25 + Math.random() * 0.55;
    const offsetX = Math.cos(angle) * radius;
    const offsetZ = Math.sin(angle) * radius;
    const targetAngle = Math.random() * Math.PI * 2;
    const targetRadius = Math.random() * 0.18;
    orbs.push({
      id: `orb-${startedAt}-${orbBaseIndex + i}-${collector.id}-${i}`,
      resourceType: result.resourceType,
      amount: perOrbAmount,
      sizeFactor,
      startX: collectorWorldX + offsetX,
      startY: 0.95 + Math.random() * 0.55,
      startZ: collectorWorldZ + offsetZ,
      targetX: funnel.x + Math.cos(targetAngle) * targetRadius,
      targetY: funnel.y,
      targetZ: funnel.z + Math.sin(targetAngle) * targetRadius,
      startedAt,
      durationMs: ORB_DURATION_MS + (i % 5) * 70 + pickJitter(60),
      delayMs: groupDelayMs + i * ORB_INTRA_STAGGER_MS,
    });
  }
  return orbs;
};

const isValidExpansionCell = (
  x: number,
  y: number,
  unlockedLandCells: Record<string, true>,
): boolean => {
  if (unlockedLandCells[createLandCellKey(x, y)]) {
    return false;
  }
  return Boolean(
    unlockedLandCells[createLandCellKey(x + 1, y)] ||
    unlockedLandCells[createLandCellKey(x - 1, y)] ||
    unlockedLandCells[createLandCellKey(x, y + 1)] ||
    unlockedLandCells[createLandCellKey(x, y - 1)],
  );
};

const getLandExpansionCost = (nextLandLevel: number) => ({
  twigs: Math.round(260 * nextLandLevel),
  pebbles: Math.round(220 * nextLandLevel),
  putty: Math.round(140 * nextLandLevel),
  goo: Math.round(170 * nextLandLevel),
});

export const createEconomyActions = (
  set: GameStoreSet,
  get: GameStoreGet,
): EconomyActions => ({
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
    const unrestricted = isUnrestrictedMode(current);
    if (!unrestricted && current.workersTotal >= MAX_WORKERS) {
      return;
    }
    const nextWorkerNumber = current.workersTotal + 1;
    const workerShinyCost = getWorkerShinyCost(nextWorkerNumber);
    const canAfford = unrestricted || current.shiny >= workerShinyCost;
    if (!canAfford) {
      return;
    }
    const workerHome = resolveWorkerHomeCells(
      current.engine.getState().buildings,
      nextWorkerNumber,
    )[nextWorkerNumber - 1] ?? {
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
        state: "IDLE" as const,
        path: [],
      },
    ];
    set({
      workers: nextWorkers,
      workersTotal: nextWorkerNumber,
      shiny: unrestricted
        ? current.shiny
        : Math.max(0, current.shiny - workerShinyCost),
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
    if (
      !isValidExpansionCell(
        targetCell.x,
        targetCell.y,
        current.unlockedLandCells,
      )
    ) {
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
    const nextResources = current.freeBuildMode
      ? current.resources
      : spendResources(current.resources, expansionCost);
    const nextUnlockedLandCells = { ...current.unlockedLandCells };
    nextUnlockedLandCells[createLandCellKey(targetCell.x, targetCell.y)] = true;
    const unlockedEntries = Object.keys(nextUnlockedLandCells).map((cellKey) =>
      cellKey.split(",").map((part) => Number(part)),
    );
    const minX = Math.min(...unlockedEntries.map(([x]) => x));
    const maxX = Math.max(...unlockedEntries.map(([x]) => x));
    const minY = Math.min(...unlockedEntries.map(([, y]) => y));
    const maxY = Math.max(...unlockedEntries.map(([, y]) => y));
    const nextUnlockedGridSize = Math.min(
      MAX_UNLOCKED_GRID_SIZE,
      Math.max(maxX - minX + 1, maxY - minY + 1),
    );
    const nextPreviewSize = 10 + nextLandLevel * 2;
    const nextLandExpansionPreview = generateLandExpansionPreview(
      nextUnlockedLandCells,
      nextPreviewSize,
    );
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
    const nextLandExpansionPreview = generateLandExpansionPreview(
      current.unlockedLandCells,
      previewSize,
    );
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
    const unrestricted = isUnrestrictedMode(current);
    const state = current.engine.getState();
    const townHall = state.buildings.find(
      (building) => building.type === BUILDING_TYPES.TOWN_HALL,
    );
    const townHallLevel = townHall?.level ?? 1;
    const requiredTownHallLevel =
      getBuildingRequiredTownHallLevel(selectedType);
    if (!unrestricted && townHallLevel < requiredTownHallLevel) {
      return;
    }
    const currentCount = getBuildingCount(state.buildings, selectedType);
    const maxAllowed = getBuildingCapForTownHallLevel(
      selectedType,
      townHallLevel,
    );
    if (!unrestricted && currentCount >= maxAllowed) {
      return;
    }
    const definition = ENHANCED_BUILDING_CATALOG[selectedType];
    if (
      !unrestricted &&
      !isWithinUnlockedArea(
        current.activeCell.x,
        current.activeCell.y,
        definition.size.x,
        definition.size.y,
        current.unlockedGridSize,
        current.unlockedLandCells,
      )
    ) {
      return;
    }
    const cost = definition.cost;
    const canAfford =
      unrestricted ||
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
      status: "PENDING",
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

    const nextResources = unrestricted
      ? current.resources
      : spendResources(current.resources, cost);
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
      .filter(
        (building) =>
          building.buildEndsAt && building.status === "UNDER_CONSTRUCTION",
      )
      .sort(
        (left, right) => (left.buildEndsAt ?? 0) - (right.buildEndsAt ?? 0),
      );
    const idleWorkers = current.workers.filter(
      (worker) => worker.state === "IDLE",
    );
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
    const unrestricted = isUnrestrictedMode(current);
    if (!unrestricted && current.shiny < shinyCost) {
      return;
    }

    const isObstacleTask = building.tags?.includes("obstacle") ?? false;

    if (isObstacleTask) {
      current.engine.removeBuilding(buildingId);
      const nextWorkers = current.workers.map((worker) => {
        if (worker.assignedBuildingId !== buildingId) {
          return worker;
        }
        const homePath =
          findPathAStar(
            getWalkableGridFromState(current.engine.getState().buildings, state.gridSize),
            { x: Math.round(worker.x), y: Math.round(worker.y) },
            [{ x: worker.homeX, y: worker.homeY }],
          ) ?? [];
        return {
          ...worker,
          state: "RETURNING" as const,
          taskType: undefined,
          taskEndsAt: undefined,
          assignedBuildingId: undefined,
          taskTargetX: undefined,
          taskTargetY: undefined,
          path: homePath.slice(1),
        };
      });
      set({
        shiny: unrestricted
          ? current.shiny + rollObstacleClearShinyReward()
          : Math.max(0, current.shiny - shinyCost) + rollObstacleClearShinyReward(),
        workers: nextWorkers,
        workerBusyModal: null,
      });
    } else {
      current.engine.updateBuilding(buildingId, (item) => ({
        ...item,
        status: "ACTIVE",
        assignedWorkerId: undefined,
        buildEndsAt: undefined,
        buildStartedAt: undefined,
        lastHarvested:
          item.type === BUILDING_TYPES.RESOURCE_GOO_COLLECTOR ||
          item.type === BUILDING_TYPES.RESOURCE_PEBBLE_COLLECTOR ||
          item.type === BUILDING_TYPES.RESOURCE_PUTTY_COLLECTOR
            ? now
            : item.lastHarvested,
      }));

      current.requestCameraCelebration(building);

      const nextWorkers = current.workers.map((worker) => {
        if (worker.assignedBuildingId !== buildingId) {
          return worker;
        }
        const homePath =
          findPathAStar(
            getWalkableGridFromState(current.engine.getState().buildings, state.gridSize),
            { x: Math.round(worker.x), y: Math.round(worker.y) },
            [{ x: worker.homeX, y: worker.homeY }],
          ) ?? [];
        return {
          ...worker,
          state: "RETURNING" as const,
          taskType: undefined,
          taskEndsAt: undefined,
          assignedBuildingId: undefined,
          taskTargetX: undefined,
          taskTargetY: undefined,
          path: homePath.slice(1),
        };
      });

      set({
        shiny: unrestricted
          ? current.shiny
          : Math.max(0, current.shiny - shinyCost),
        workers: nextWorkers,
        workerBusyModal: null,
      });
    }
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
    const collector = state.buildings.find(
      (building) => building.id === collectorId,
    );
    if (!collector || collector.status !== "ACTIVE") {
      return;
    }
    const townHall = state.buildings.find(
      (building) => building.type === BUILDING_TYPES.TOWN_HALL,
    );
    if (!townHall) {
      return;
    }
    const now = Date.now();
    const buffer = computeCollectorBuffer(collector, now);
    if (!buffer || buffer.amount <= 0) {
      return;
    }
    const nextResources = creditResource(
      current.resources,
      buffer.resourceType,
      buffer.amount,
    );
    current.engine.setResources(nextResources);
    current.engine.updateBuildingLastHarvested(collectorId, now);
    const orbs = buildCollectionOrbs(collector, townHall, buffer, now, 0, 0);
    set({
      resources: nextResources,
      resourceOrbs: [...current.resourceOrbs, ...orbs],
      selectedBuildingId: null,
      buildingContextMenuPosition: null,
    });
    current.refreshEcs();
  },
  collectAllCollectors: () => {
    const current = get();
    const state = current.engine.getState();
    const townHall = state.buildings.find(
      (building) => building.type === BUILDING_TYPES.TOWN_HALL,
    );
    if (!townHall) {
      return;
    }
    const now = Date.now();
    const collectorTypes = new Set<BuildingType>([
      BUILDING_TYPES.RESOURCE_TWIG_COLLECTOR,
      BUILDING_TYPES.RESOURCE_PEBBLE_COLLECTOR,
      BUILDING_TYPES.RESOURCE_PUTTY_COLLECTOR,
      BUILDING_TYPES.RESOURCE_GOO_COLLECTOR,
    ]);
    const collectors = state.buildings.filter(
      (building) =>
        collectorTypes.has(building.type) && building.status === "ACTIVE",
    );
    let nextResources = current.resources;
    const newOrbs: ResourceOrb[] = [];
    let collectedAny = false;
    let groupIndex = 0;
    let orbBaseIndex = 0;
    for (const collector of collectors) {
      const buffer = computeCollectorBuffer(collector, now);
      if (!buffer || buffer.amount <= 0) {
        continue;
      }
      nextResources = creditResource(
        nextResources,
        buffer.resourceType,
        buffer.amount,
      );
      current.engine.updateBuildingLastHarvested(collector.id, now);
      const groupDelayMs = groupIndex * ORB_GROUP_STAGGER_MS;
      const orbs = buildCollectionOrbs(
        collector,
        townHall,
        buffer,
        now,
        groupDelayMs,
        orbBaseIndex,
      );
      newOrbs.push(...orbs);
      orbBaseIndex += orbs.length;
      groupIndex += 1;
      collectedAny = true;
    }
    if (!collectedAny) {
      return;
    }
    current.engine.setResources(nextResources);
    set({
      resources: nextResources,
      resourceOrbs: [...current.resourceOrbs, ...newOrbs],
      selectedBuildingId: null,
      buildingContextMenuPosition: null,
    });
    current.refreshEcs();
  },
  pruneExpiredResourceOrbs: () => {
    const current = get();
    if (current.resourceOrbs.length === 0) {
      return;
    }
    const now = Date.now();
    const nextOrbs = current.resourceOrbs.filter(
      (orb) => now - orb.startedAt < orb.durationMs + orb.delayMs + 80,
    );
    if (nextOrbs.length === current.resourceOrbs.length) {
      return;
    }
    set({ resourceOrbs: nextOrbs });
  },
  clearObstacle: (obstacleId) => {
    const current = get();
    const state = current.engine.getState();
    const obstacle = state.buildings.find(
      (building) => building.id === obstacleId,
    );
    if (!obstacle || !obstacle.tags?.includes("obstacle")) {
      return;
    }
    if (obstacle.status !== "ACTIVE") {
      return;
    }
    current.engine.updateBuilding(obstacle.id, (building) => ({
      ...building,
      status: "PENDING" as BuildingStatus,
      buildStartedAt: Date.now(),
      buildEndsAt: undefined,
    }));
    set({
      selectedBuildingId: null,
      buildingContextMenuPosition: null,
    });
    current.tickConstruction();
    current.refreshEcs();
  },
});
