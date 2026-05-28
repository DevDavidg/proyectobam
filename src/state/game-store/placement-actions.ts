import { isBuildableType } from "../../core/constants/build-rules";
import { ENHANCED_BUILDING_CATALOG } from "../../core/constants/catalog";
import {
  getCannonTowerLevelSpec,
  getCannonTowerMaxLevel,
} from "../../core/constants/cannon-tower-catalog";
import {
  getGooFactoryLevelSpec,
  getGooFactoryMaxLevel,
  getGooFactoryProductionPerMs,
} from "../../core/constants/goo-factory-catalog";
import {
  getLaserTowerLevelSpec,
  getLaserTowerMaxLevel,
} from "../../core/constants/laser-tower-catalog";
import {
  getPebbleShinerLevelSpec,
  getPebbleShinerMaxLevel,
  getPebbleShinerProductionPerMs,
} from "../../core/constants/pebble-shiner-catalog";
import {
  getPuttySquisherLevelSpec,
  getPuttySquisherMaxLevel,
  getPuttySquisherProductionPerMs,
} from "../../core/constants/putty-squisher-catalog";
import {
  getStorageSiloCapacity,
  getStorageSiloLevelSpec,
  getStorageSiloMaxLevel,
} from "../../core/constants/storage-silo-catalog";
import {
  getSniperTowerLevelSpec,
  getSniperTowerMaxLevel,
} from "../../core/constants/sniper-tower-catalog";
import {
  getTwigSnapperLevelSpec,
  getTwigSnapperMaxLevel,
  getTwigSnapperProductionPerMs,
} from "../../core/constants/twig-snapper-catalog";
import {
  getMonsterLevelSpec,
  type MonsterType,
} from "../../core/constants/monster-catalog";
import { BUILDING_TYPES, type Building } from "../../core/types/building";
import { runPreviewUpdateSystem } from "../../ecs/systems/preview-update-system";
import { clearPersistedGameData, savePersistedGameData } from "../persistence";
import { isWithinUnlockedArea, spendResources } from "./helpers";
import type {
  GameStore,
  GameStoreGet,
  GameStoreSet,
  PendingRaidSpawn,
} from "./types";

type PlacementActions = Pick<
  GameStore,
  | "setActiveCell"
  | "clearActiveCell"
  | "togglePlacementMode"
  | "cancelPlacementMode"
  | "toggleFreeBuildMode"
  | "toggleDeveloperMode"
  | "resetProgress"
  | "toggleBattleMode"
  | "startRaid"
  | "closeBattleResult"
  | "setShopOpen"
  | "openPenHousingMenu"
  | "closePenHousingMenu"
  | "openHousingDetailsModal"
  | "closeHousingDetailsModal"
  | "startMovingBuilding"
  | "confirmMovingBuilding"
  | "cancelMovingBuilding"
  | "setPenHousingSettings"
  | "openBuildingContextMenu"
  | "closeBuildingContextMenu"
  | "setHoveredBuildingId"
  | "upgradeSelectedBuilding"
  | "repairSelectedBuilding"
  | "fortifySelectedBuilding"
>;

const rectanglesOverlap = (
  left: { x: number; y: number; sizeX: number; sizeY: number },
  right: { x: number; y: number; sizeX: number; sizeY: number },
): boolean =>
  left.x < right.x + right.sizeX &&
  left.x + left.sizeX > right.x &&
  left.y < right.y + right.sizeY &&
  left.y + left.sizeY > right.y;

const canMoveBuildingToCell = (
  buildings: Building[],
  movingBuildingId: string,
  x: number,
  y: number,
  sizeX: number,
  sizeY: number,
  unlockedGridSize: number,
  unlockedLandCells: Record<string, true>,
): boolean => {
  if (
    !isWithinUnlockedArea(
      x,
      y,
      sizeX,
      sizeY,
      unlockedGridSize,
      unlockedLandCells,
    )
  ) {
    return false;
  }
  return !buildings.some((building) => {
    if (building.id === movingBuildingId) {
      return false;
    }
    return rectanglesOverlap({ x, y, sizeX, sizeY }, building);
  });
};

export const createPlacementActions = (
  set: GameStoreSet,
  get: GameStoreGet,
): PlacementActions => ({
  setActiveCell: (x, y) => {
    const current = get();
    if (
      !current.placementEnabled &&
      !current.battleMode &&
      !current.landExpansionMode
    ) {
      return;
    }
    if (current.landExpansionMode) {
      set({ activeCell: { x, y }, placementValid: false });
      return;
    }
    if (current.movingBuildingId) {
      const state = current.engine.getState();
      const movingBuilding = state.buildings.find(
        (building) => building.id === current.movingBuildingId,
      );
      if (!movingBuilding) {
        return;
      }
      current.engine.updatePlacementPreview(
        x,
        y,
        movingBuilding.sizeX,
        movingBuilding.sizeY,
      );
      const placementValid = canMoveBuildingToCell(
        state.buildings,
        movingBuilding.id,
        x,
        y,
        movingBuilding.sizeX,
        movingBuilding.sizeY,
        current.unlockedGridSize,
        current.unlockedLandCells,
      );
      set({
        activeCell: { x, y },
        placementValid,
      });
      current.refreshEcs();
      set({ placementValid });
      return;
    }
    if (current.battleMode) {
      const exclusion = current.battleExclusion;
      const insideEnemyZone =
        x >= exclusion.minX &&
        x <= exclusion.maxX &&
        y >= exclusion.minY &&
        y <= exclusion.maxY;
      const state = current.engine.getState();
      const occupied = state.buildings.some(
        (building) =>
          x >= building.x &&
          x < building.x + building.sizeX &&
          y >= building.y &&
          y < building.y + building.sizeY,
      );
      current.engine.updatePlacementPreview(x, y, 1, 1);
      set({
        activeCell: { x, y },
        placementValid: !insideEnemyZone && !occupied,
      });
      current.refreshEcs();
      return;
    }
    if (
      !isWithinUnlockedArea(
        x,
        y,
        current.placementSize.sizeX,
        current.placementSize.sizeY,
        current.unlockedGridSize,
        current.unlockedLandCells,
      )
    ) {
      current.engine.updatePlacementPreview(
        x,
        y,
        current.placementSize.sizeX,
        current.placementSize.sizeY,
      );
      set({ activeCell: { x, y }, placementValid: false });
      current.refreshEcs();
      return;
    }

    const preview = runPreviewUpdateSystem(
      {
        x,
        y,
        sizeX: current.placementSize.sizeX,
        sizeY: current.placementSize.sizeY,
      },
      (previewX, previewY, sizeX, sizeY) =>
        current.engine.canPlaceAt(previewX, previewY, sizeX, sizeY),
    );
    current.engine.updatePlacementPreview(
      preview.x,
      preview.y,
      preview.sizeX,
      preview.sizeY,
    );
    set({ activeCell: { x, y } });
    current.refreshEcs();
  },
  clearActiveCell: () => {
    const current = get();
    current.engine.clearPlacementPreview();
    set({ activeCell: null, placementValid: false });
    current.refreshEcs();
  },
  togglePlacementMode: () => {
    const current = get();
    const nextEnabled = !current.placementEnabled;
    if (!nextEnabled) {
      current.engine.clearPlacementPreview();
      set({
        placementEnabled: nextEnabled,
        activeCell: null,
        placementValid: false,
      });
      current.refreshEcs();
      return;
    }

    set({ placementEnabled: nextEnabled });
  },
  cancelPlacementMode: () => {
    const current = get();
    current.engine.clearPlacementPreview();
    set({
      placementEnabled: false,
      activeCell: null,
      placementValid: false,
    });
    current.refreshEcs();
  },
  toggleFreeBuildMode: () => {
    set((state) => ({ freeBuildMode: !state.freeBuildMode }));
  },
  toggleDeveloperMode: () => {
    set((state) => ({ developerModeEnabled: !state.developerModeEnabled }));
  },
  resetProgress: () => {
    clearPersistedGameData();
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  },
  toggleBattleMode: () => {
    set((state) => ({
      battleMode: !state.battleMode,
      placementEnabled: state.battleMode ? true : false,
      selectedArmyMonster: null,
      activeCell: null,
      placementValid: false,
      battleResult: null,
      battleHasStarted: state.battleMode ? state.battleHasStarted : false,
    }));
  },
  startRaid: () => {
    const current = get();
    const townHall = current.engine
      .getState()
      .buildings.find((building) => building.type === BUILDING_TYPES.TOWN_HALL);
    const townHallLevel = townHall?.level ?? 1;
    const wavePoints = townHallLevel * 6 + Math.floor(Math.random() * 5);
    const spawns: PendingRaidSpawn[] = [];
    let points = wavePoints;
    let nextEnemyId = current.enemyCount;
    const now = Date.now();
    const borderCandidates: Array<{ x: number; y: number }> = [];
    const seenBorder: Record<string, true> = {};
    Object.keys(current.unlockedLandCells).forEach((cellKey) => {
      const [x, y] = cellKey.split(",").map((part) => Number(part));
      const touchesOutside =
        !current.unlockedLandCells[`${x + 1},${y}`] ||
        !current.unlockedLandCells[`${x - 1},${y}`] ||
        !current.unlockedLandCells[`${x},${y + 1}`] ||
        !current.unlockedLandCells[`${x},${y - 1}`];
      if (!touchesOutside || seenBorder[cellKey]) {
        return;
      }
      seenBorder[cellKey] = true;
      borderCandidates.push({ x, y });
    });

    while (points > 0 && borderCandidates.length) {
      const heavy = points >= 5 && Math.random() > 0.45;
      const monsterType = heavy ? "Rambot" : "Pokey";
      const monsterLevel = current.monsterLevels[monsterType] || 1;
      const spec = getMonsterLevelSpec(monsterType, monsterLevel);
      const cost = heavy ? 5 : 1;
      points -= cost;
      const candidateIndex = Math.floor(
        Math.random() * borderCandidates.length,
      );
      const spawnPoint = borderCandidates.splice(candidateIndex, 1)[0];
      nextEnemyId += 1;
      spawns.push({
        spawnAt: now + spawns.length * 350,
        enemy: {
          id: `raid-${monsterType.toLowerCase()}-${nextEnemyId}`,
          x: spawnPoint.x,
          y: spawnPoint.y,
          hp: spec.hp,
          maxHp: spec.hp,
          speed: spec.speed,
          damage: spec.damage,
        },
      });
    }

    set({
      battleMode: true,
      placementEnabled: false,
      battleHasStarted: spawns.length > 0,
      pendingRaidSpawns: [...current.pendingRaidSpawns, ...spawns],
      enemyCount: nextEnemyId,
      battleResult: null,
    });
  },
  closeBattleResult: () => {
    set({ battleResult: null });
  },
  setShopOpen: (open) => {
    const current = get();
    if (open) {
      current.refreshLandExpansionPreview();
    }
    set({
      shopOpen: open,
      landExpansionMode: open ? false : current.landExpansionMode,
    });
  },
  openPenHousingMenu: (buildingId) => {
    set({ activePenMenuBuildingId: buildingId, selectedBuildingId: null });
  },
  closePenHousingMenu: () => {
    set({ activePenMenuBuildingId: null });
  },
  openHousingDetailsModal: (buildingId) => {
    set({
      housingDetailsPenId: buildingId,
      activePenMenuBuildingId: null,
      selectedBuildingId: null,
    });
  },
  closeHousingDetailsModal: () => {
    set({ housingDetailsPenId: null });
  },
  startMovingBuilding: (buildingId) => {
    const current = get();
    const state = current.engine.getState();
    const building = state.buildings.find((item) => item.id === buildingId);
    if (!building || building.status !== "ACTIVE") {
      return;
    }
    if (!isBuildableType(building.type)) {
      return;
    }
    current.engine.updatePlacementPreview(
      building.x,
      building.y,
      building.sizeX,
      building.sizeY,
    );
    set({
      movingBuildingId: buildingId,
      movingBuildingOrigin: { x: building.x, y: building.y },
      selectedBuildingType: building.type,
      placementSize: { sizeX: building.sizeX, sizeY: building.sizeY },
      activeCell: { x: building.x, y: building.y },
      placementEnabled: true,
      placementValid: true,
      housingDetailsPenId: null,
      activePenMenuBuildingId: null,
      selectedBuildingId: null,
    });
    current.refreshEcs();
  },
  confirmMovingBuilding: () => {
    const current = get();
    const movingBuildingId = current.movingBuildingId;
    const activeCell = current.activeCell;
    if (!movingBuildingId || !activeCell) {
      return;
    }
    const state = current.engine.getState();
    const movingBuilding = state.buildings.find(
      (building) => building.id === movingBuildingId,
    );
    if (!movingBuilding) {
      set({ movingBuildingId: null, movingBuildingOrigin: null });
      return;
    }
    const canMove = canMoveBuildingToCell(
      state.buildings,
      movingBuildingId,
      activeCell.x,
      activeCell.y,
      movingBuilding.sizeX,
      movingBuilding.sizeY,
      current.unlockedGridSize,
      current.unlockedLandCells,
    );
    if (!canMove) {
      return;
    }

    const removeOk = current.engine.removeBuilding(movingBuildingId);
    if (!removeOk) {
      return;
    }
    const placed = current.engine.placeBuilding({
      ...movingBuilding,
      id: movingBuildingId,
      x: activeCell.x,
      y: activeCell.y,
    });
    if (!placed) {
      current.engine.placeBuilding({ ...movingBuilding, id: movingBuildingId });
      return;
    }

    const now = Date.now();
    const nextResidents = current.penResidents.map((resident) => {
      if (resident.penId !== movingBuildingId) {
        return resident;
      }
      const spawnX =
        activeCell.x +
        0.5 +
        Math.random() * Math.max(0.1, movingBuilding.sizeX - 1);
      const spawnY =
        activeCell.y +
        0.5 +
        Math.random() * Math.max(0.1, movingBuilding.sizeY - 1);
      return {
        ...resident,
        x: spawnX,
        y: spawnY,
        targetX: spawnX,
        targetY: spawnY,
        path: [],
        moving: false,
        lifecycleState:
          resident.lifecycleState === "TRAINING"
            ? ("TRAINING" as const)
            : ("HOUSED" as const),
        nextWanderAt: now + 1200 + Math.random() * 2600,
      };
    });

    current.engine.clearPlacementPreview();
    set({
      penResidents: nextResidents,
      movingBuildingId: null,
      movingBuildingOrigin: null,
      activeCell: null,
      placementValid: false,
    });
    current.refreshEcs();
  },
  cancelMovingBuilding: () => {
    const current = get();
    current.engine.clearPlacementPreview();
    set({
      movingBuildingId: null,
      movingBuildingOrigin: null,
      activeCell: null,
      placementValid: false,
      placementEnabled: false,
    });
    current.refreshEcs();
  },
  setPenHousingSettings: (buildingId, settings) => {
    const current = get();
    const nextPenHousingSettings = {
      ...current.penHousingSettings,
      [buildingId]: settings,
    };
    set({
      penHousingSettings: {
        ...nextPenHousingSettings,
      },
    });
    const state = current.engine.getState();
    savePersistedGameData({
      resources: state.resources,
      buildings: state.buildings,
      shiny: current.shiny,
      monsterLevels: current.monsterLevels,
      penHousingSettings: nextPenHousingSettings,
      penResidents: current.penResidents,
      nextResidentId: current.nextResidentId,
      unlockedLandCells: current.unlockedLandCells,
      landExpansionPreview: current.landExpansionPreview,
    });
  },
  openBuildingContextMenu: (buildingId, position) => {
    const fallbackPosition =
      typeof window === "undefined"
        ? { x: 380, y: 240 }
        : {
            x: Math.round(window.innerWidth * 0.5),
            y: Math.round(window.innerHeight * 0.5),
          };
    set({
      selectedBuildingId: buildingId,
      activePenMenuBuildingId: null,
      buildingContextMenuPosition: position ?? fallbackPosition,
    });
  },
  closeBuildingContextMenu: () => {
    set({ selectedBuildingId: null, buildingContextMenuPosition: null });
  },
  setHoveredBuildingId: (buildingId) => {
    set({ hoveredBuildingId: buildingId });
  },
  upgradeSelectedBuilding: () => {
    const current = get();
    const selectedBuildingId = current.selectedBuildingId;
    if (!selectedBuildingId) {
      return;
    }
    const state = current.engine.getState();
    const building = state.buildings.find(
      (item) => item.id === selectedBuildingId,
    );
    const townHall = state.buildings.find(
      (item) => item.type === BUILDING_TYPES.TOWN_HALL,
    );
    if (!building || !townHall) {
      return;
    }
    const nextLevel = building.level + 1;
    if (
      building.type === BUILDING_TYPES.RESOURCE_TWIG_COLLECTOR &&
      building.level >= getTwigSnapperMaxLevel()
    ) {
      return;
    }
    if (
      building.type === BUILDING_TYPES.RESOURCE_GOO_COLLECTOR &&
      building.level >= getGooFactoryMaxLevel()
    ) {
      return;
    }
    if (
      building.type === BUILDING_TYPES.RESOURCE_PEBBLE_COLLECTOR &&
      building.level >= getPebbleShinerMaxLevel()
    ) {
      return;
    }
    if (
      building.type === BUILDING_TYPES.RESOURCE_PUTTY_COLLECTOR &&
      building.level >= getPuttySquisherMaxLevel()
    ) {
      return;
    }
    if (
      (building.type === BUILDING_TYPES.RESOURCE_WOOD_SILO || building.type === BUILDING_TYPES.RESOURCE_STONE_SILO) &&
      building.level >= getStorageSiloMaxLevel()
    ) {
      return;
    }
    if (
      building.type === BUILDING_TYPES.DEFENSE_TURRET_RAPID &&
      building.level >= getSniperTowerMaxLevel()
    ) {
      return;
    }
    if (
      building.type === BUILDING_TYPES.DEFENSE_LASER_TOWER &&
      building.level >= getLaserTowerMaxLevel()
    ) {
      return;
    }
    if (
      building.type === BUILDING_TYPES.DEFENSE_MORTAR &&
      building.level >= getCannonTowerMaxLevel()
    ) {
      return;
    }
    const nextTwigSnapperSpec =
      building.type === BUILDING_TYPES.RESOURCE_TWIG_COLLECTOR
        ? getTwigSnapperLevelSpec(nextLevel)
        : null;
    const nextGooFactorySpec =
      building.type === BUILDING_TYPES.RESOURCE_GOO_COLLECTOR
        ? getGooFactoryLevelSpec(nextLevel)
        : null;
    const nextPebbleShinerSpec =
      building.type === BUILDING_TYPES.RESOURCE_PEBBLE_COLLECTOR
        ? getPebbleShinerLevelSpec(nextLevel)
        : null;
    const nextPuttySquisherSpec =
      building.type === BUILDING_TYPES.RESOURCE_PUTTY_COLLECTOR
        ? getPuttySquisherLevelSpec(nextLevel)
        : null;
    const nextStorageSiloSpec =
      building.type === BUILDING_TYPES.RESOURCE_WOOD_SILO || building.type === BUILDING_TYPES.RESOURCE_STONE_SILO
        ? getStorageSiloLevelSpec(nextLevel)
        : null;
    const nextSniperTowerSpec =
      building.type === BUILDING_TYPES.DEFENSE_TURRET_RAPID
        ? getSniperTowerLevelSpec(nextLevel)
        : null;
    const nextLaserTowerSpec =
      building.type === BUILDING_TYPES.DEFENSE_LASER_TOWER
        ? getLaserTowerLevelSpec(nextLevel)
        : null;
    const nextCannonTowerSpec =
      building.type === BUILDING_TYPES.DEFENSE_MORTAR
        ? getCannonTowerLevelSpec(nextLevel)
        : null;
    const requiredTownHallLevel =
      building.type === BUILDING_TYPES.TOWN_HALL
        ? nextLevel - 1
        : nextTwigSnapperSpec?.requiredTownHallLevel ??
          nextGooFactorySpec?.requiredTownHallLevel ??
          nextPebbleShinerSpec?.requiredTownHallLevel ??
          nextPuttySquisherSpec?.requiredTownHallLevel ??
          nextStorageSiloSpec?.requiredTownHallLevel ??
          nextSniperTowerSpec?.requiredTownHallLevel ??
          nextLaserTowerSpec?.requiredTownHallLevel ??
          nextCannonTowerSpec?.requiredTownHallLevel ??
          nextLevel;
    if (townHall.level < requiredTownHallLevel) {
      return;
    }
    const baseCost = ENHANCED_BUILDING_CATALOG[building.type].cost;
    const upgradeCost = nextTwigSnapperSpec?.upgradeCost ??
      nextGooFactorySpec?.upgradeCost ??
      nextPebbleShinerSpec?.upgradeCost ??
      nextPuttySquisherSpec?.upgradeCost ??
      nextStorageSiloSpec?.upgradeCost ??
      nextSniperTowerSpec?.upgradeCost ??
      nextLaserTowerSpec?.upgradeCost ??
      nextCannonTowerSpec?.upgradeCost ?? {
      twigs: Math.round(baseCost.twigs * (1 + nextLevel * 0.55)),
      pebbles: Math.round(baseCost.pebbles * (1 + nextLevel * 0.55)),
      putty: Math.round(baseCost.putty * (1 + nextLevel * 0.55)),
      goo: Math.round(baseCost.goo * (1 + nextLevel * 0.55)),
    };
    const canAfford =
      current.freeBuildMode ||
      (current.resources.twigs.current >= upgradeCost.twigs &&
        current.resources.pebbles.current >= upgradeCost.pebbles &&
        current.resources.putty.current >= upgradeCost.putty &&
        current.resources.goo.current >= upgradeCost.goo);
    if (!canAfford) {
      return;
    }
    const nextResources = current.freeBuildMode
      ? current.resources
      : spendResources(current.resources, upgradeCost);
    current.engine.setResources(nextResources);
    const upgradeDurationMs = nextTwigSnapperSpec
      ? nextTwigSnapperSpec.buildTimeMs
      : nextGooFactorySpec
        ? nextGooFactorySpec.buildTimeMs
      : nextPebbleShinerSpec
        ? nextPebbleShinerSpec.buildTimeMs
      : nextPuttySquisherSpec
        ? nextPuttySquisherSpec.buildTimeMs
      : nextStorageSiloSpec
        ? nextStorageSiloSpec.buildTimeMs
      : nextSniperTowerSpec
        ? nextSniperTowerSpec.buildTimeMs
      : nextLaserTowerSpec
        ? nextLaserTowerSpec.buildTimeMs
      : nextCannonTowerSpec
        ? nextCannonTowerSpec.buildTimeMs
      : 12000 + nextLevel * 2500;
    const nextMaxHp = nextTwigSnapperSpec
      ? nextTwigSnapperSpec.hp
      : nextGooFactorySpec
        ? nextGooFactorySpec.hp
      : nextPebbleShinerSpec
        ? nextPebbleShinerSpec.hp
      : nextPuttySquisherSpec
        ? nextPuttySquisherSpec.hp
      : nextStorageSiloSpec
        ? nextStorageSiloSpec.hp
      : nextSniperTowerSpec
        ? nextSniperTowerSpec.hp
      : nextLaserTowerSpec
        ? nextLaserTowerSpec.hp
      : nextCannonTowerSpec
        ? nextCannonTowerSpec.hp
      : Math.round(building.maxHp * 1.35);
    const nextProductionPerMs = nextTwigSnapperSpec
      ? getTwigSnapperProductionPerMs(nextLevel)
      : nextGooFactorySpec
        ? getGooFactoryProductionPerMs(nextLevel)
      : nextPebbleShinerSpec
        ? getPebbleShinerProductionPerMs(nextLevel)
      : nextPuttySquisherSpec
        ? getPuttySquisherProductionPerMs(nextLevel)
      : building.productionPerMs
        ? building.productionPerMs * 1.2
        : building.productionPerMs;
    current.engine.updateBuilding(selectedBuildingId, (item) => ({
      ...item,
      level: nextLevel,
      maxHp: nextMaxHp,
      hp: nextMaxHp,
      productionPerMs: nextProductionPerMs,
      providesCapacity: nextStorageSiloSpec ? getStorageSiloCapacity(nextLevel) : item.providesCapacity,
      damage: nextSniperTowerSpec
        ? nextSniperTowerSpec.damagePerShot
        : nextLaserTowerSpec
          ? nextLaserTowerSpec.damagePerTick
        : nextCannonTowerSpec
          ? nextCannonTowerSpec.damagePerShot
          : item.damage
            ? Math.round(item.damage * 1.22)
            : item.damage,
      range: nextSniperTowerSpec
        ? nextSniperTowerSpec.rangeGrid
        : nextLaserTowerSpec
          ? nextLaserTowerSpec.rangeGrid
        : nextCannonTowerSpec
          ? nextCannonTowerSpec.rangeGrid
          : item.range
            ? item.range + 0.2
            : item.range,
      splashRadius: nextCannonTowerSpec ? nextCannonTowerSpec.splashRadiusGrid : item.splashRadius,
      buildStartedAt: Date.now(),
      buildEndsAt: Date.now() + upgradeDurationMs,
      status: "PENDING",
    }));
    set({ resources: nextResources });
    current.tickConstruction();
    current.refreshEcs();
  },
  repairSelectedBuilding: () => {
    const current = get();
    const selectedBuildingId = current.selectedBuildingId;
    if (!selectedBuildingId) {
      return;
    }
    const state = current.engine.getState();
    const building = state.buildings.find(
      (item) => item.id === selectedBuildingId,
    );
    if (!building || building.hp >= building.maxHp) {
      return;
    }
    const missingRatio = 1 - building.hp / building.maxHp;
    const baseCost = ENHANCED_BUILDING_CATALOG[building.type].cost;
    const twigSnapperSpec =
      building.type === BUILDING_TYPES.RESOURCE_TWIG_COLLECTOR
        ? getTwigSnapperLevelSpec(building.level)
        : null;
    const gooFactorySpec =
      building.type === BUILDING_TYPES.RESOURCE_GOO_COLLECTOR
        ? getGooFactoryLevelSpec(building.level)
        : null;
    const pebbleShinerSpec =
      building.type === BUILDING_TYPES.RESOURCE_PEBBLE_COLLECTOR
        ? getPebbleShinerLevelSpec(building.level)
        : null;
    const puttySquisherSpec =
      building.type === BUILDING_TYPES.RESOURCE_PUTTY_COLLECTOR
        ? getPuttySquisherLevelSpec(building.level)
        : null;
    const storageSiloSpec =
      building.type === BUILDING_TYPES.RESOURCE_WOOD_SILO || building.type === BUILDING_TYPES.RESOURCE_STONE_SILO
        ? getStorageSiloLevelSpec(building.level)
        : null;
    const sniperTowerSpec =
      building.type === BUILDING_TYPES.DEFENSE_TURRET_RAPID
        ? getSniperTowerLevelSpec(building.level)
        : null;
    const laserTowerSpec =
      building.type === BUILDING_TYPES.DEFENSE_LASER_TOWER
        ? getLaserTowerLevelSpec(building.level)
        : null;
    const cannonTowerSpec =
      building.type === BUILDING_TYPES.DEFENSE_MORTAR
        ? getCannonTowerLevelSpec(building.level)
        : null;
    const repairCost = {
      twigs: Math.round(baseCost.twigs * missingRatio * 0.45),
      pebbles: Math.round(baseCost.pebbles * missingRatio * 0.45),
      putty: Math.round(baseCost.putty * missingRatio * 0.45),
      goo: Math.round(baseCost.goo * missingRatio * 0.45),
    };
    const idleWorker = current.workers.find(
      (worker) => worker.state === "IDLE",
    );
    if (!idleWorker) {
      return;
    }
    const canAfford =
      current.freeBuildMode ||
      (current.resources.twigs.current >= repairCost.twigs &&
        current.resources.pebbles.current >= repairCost.pebbles &&
        current.resources.putty.current >= repairCost.putty &&
        current.resources.goo.current >= repairCost.goo);
    if (!canAfford) {
      return;
    }
    const nextResources = current.freeBuildMode
      ? current.resources
      : spendResources(current.resources, repairCost);
    current.engine.setResources(nextResources);
    current.engine.updateBuilding(selectedBuildingId, (item) => ({
      ...item,
      status: "PENDING",
      buildStartedAt: Date.now(),
      buildEndsAt: Date.now() + (twigSnapperSpec?.repairTimeMs ?? gooFactorySpec?.repairTimeMs ?? pebbleShinerSpec?.repairTimeMs ?? puttySquisherSpec?.repairTimeMs ?? storageSiloSpec?.repairTimeMs ?? sniperTowerSpec?.repairTimeMs ?? laserTowerSpec?.repairTimeMs ?? cannonTowerSpec?.repairTimeMs ?? 6000),
    }));
    set({ resources: nextResources });
    current.tickConstruction();
    current.refreshEcs();
  },
  fortifySelectedBuilding: () => {
    const current = get();
    const selectedBuildingId = current.selectedBuildingId;
    if (!selectedBuildingId) {
      return;
    }
    const state = current.engine.getState();
    const building = state.buildings.find(
      (item) => item.id === selectedBuildingId,
    );
    const townHall = state.buildings.find(
      (item) => item.type === BUILDING_TYPES.TOWN_HALL,
    );
    if (!building || !townHall) {
      return;
    }
    if (
      townHall.level < 5 ||
      building.type !== BUILDING_TYPES.TOWN_HALL ||
      building.status !== "ACTIVE"
    ) {
      return;
    }
    const fortificationLevel = building.fortificationLevel ?? 0;
    if (fortificationLevel >= 3) {
      return;
    }
    const nextFortificationLevel = fortificationLevel + 1;
    const baseCost = ENHANCED_BUILDING_CATALOG[building.type].cost;
    const fortifyCost = {
      twigs: Math.round(500 + baseCost.twigs * nextFortificationLevel * 4),
      pebbles: Math.round(500 + baseCost.pebbles * nextFortificationLevel * 4),
      putty: Math.round(220 + baseCost.putty * nextFortificationLevel * 3),
      goo: Math.round(180 + baseCost.goo * nextFortificationLevel * 3),
    };
    const canAfford =
      current.freeBuildMode ||
      (current.resources.twigs.current >= fortifyCost.twigs &&
        current.resources.pebbles.current >= fortifyCost.pebbles &&
        current.resources.putty.current >= fortifyCost.putty &&
        current.resources.goo.current >= fortifyCost.goo);
    if (!canAfford) {
      return;
    }
    const nextResources = current.freeBuildMode
      ? current.resources
      : spendResources(current.resources, fortifyCost);
    current.engine.setResources(nextResources);
    current.engine.updateBuilding(selectedBuildingId, (item) => {
      const hpRatio = item.maxHp > 0 ? item.hp / item.maxHp : 1;
      const nextMaxHp = Math.round(item.maxHp * 1.28);
      return {
        ...item,
        fortificationLevel: nextFortificationLevel,
        maxHp: nextMaxHp,
        hp: Math.max(1, Math.round(nextMaxHp * hpRatio)),
      };
    });
    set({ resources: nextResources });
    current.refreshEcs();
  },
});
