import { getInstantFinishShinyCost } from '../../core/constants/build-rules';
import {
  MONSTER_CATALOG,
  getMonsterHousingSpace,
  getMonsterLevelSpec,
  getMonsterMaxLevel,
} from '../../core/constants/monster-catalog';
import { BUILDING_TYPES } from '../../core/types/building';
import type { Enemy } from '../../core/types/enemy';
import { isUnrestrictedMode } from './helpers';
import type { GameStore, GameStoreGet, GameStoreSet } from './types';

type MonsterActions = Pick<
  GameStore,
  | 'setSelectedArmyMonster'
  | 'openHatcheryModal'
  | 'closeHatcheryModal'
  | 'queueMonsterTraining'
  | 'startMonsterUpgrade'
  | 'startMonsterResearch'
  | 'instantFinishMonsterResearch'
  | 'deploySelectedMonster'
>;

export const createMonsterActions = (set: GameStoreSet, get: GameStoreGet): MonsterActions => ({
  setSelectedArmyMonster: (monsterType) => {
    set({ selectedArmyMonster: monsterType });
  },
  openHatcheryModal: (buildingId) => {
    const current = get();
    const hatchery = current.engine.getState().buildings.find((building) => building.id === buildingId);
    if (!hatchery || hatchery.type !== BUILDING_TYPES.ARMY_HATCHERY || hatchery.status !== 'ACTIVE' || hatchery.hp <= 0) {
      return;
    }
    set({ hatcheryModalBuildingId: buildingId });
  },
  closeHatcheryModal: () => {
    set({ hatcheryModalBuildingId: null });
  },
  queueMonsterTraining: (monsterType) => {
    const current = get();
    const hatcheryId = current.hatcheryModalBuildingId;
    if (!hatcheryId) {
      return;
    }
    const hatchery = current.engine.getState().buildings.find((building) => building.id === hatcheryId);
    if (!hatchery || hatchery.type !== BUILDING_TYPES.ARMY_HATCHERY || hatchery.status !== 'ACTIVE' || hatchery.hp <= 0) {
      return;
    }
    const monsterLevel = current.monsterLevels[monsterType] ?? 0;
    if (monsterLevel < 1) {
      return;
    }
    const levelSpec = getMonsterLevelSpec(monsterType, monsterLevel);
    if (!levelSpec) {
      return;
    }
    const trainingUnrestricted = isUnrestrictedMode(current);
    if (!trainingUnrestricted && current.resources.goo.current < levelSpec.gooCost) {
      return;
    }

    const nextResources = trainingUnrestricted
      ? current.resources
      : {
          ...current.resources,
          goo: {
            ...current.resources.goo,
            current: Math.max(0, current.resources.goo.current - levelSpec.gooCost),
          },
        };
    const nextQueue = [
      ...(current.hatcheryTrainingQueues[hatcheryId] ?? []),
      { monsterType, timeRemainingMs: levelSpec.trainingTimeMs, totalTimeMs: levelSpec.trainingTimeMs },
    ];
    current.engine.setResources(nextResources);
    set({
      resources: nextResources,
      hatcheryTrainingQueues: {
        ...current.hatcheryTrainingQueues,
        [hatcheryId]: nextQueue,
      },
    });
    current.refreshEcs();
  },
  startMonsterUpgrade: (monsterType) => {
    const current = get();
    const state = current.engine.getState();
    const lab = state.buildings.find(
      (building) => building.id === current.hatcheryModalBuildingId && building.type === BUILDING_TYPES.ARMY_HATCHERY
    );
    const townHall = state.buildings.find((building) => building.type === BUILDING_TYPES.TOWN_HALL);
    if (!lab || lab.status !== 'ACTIVE' || lab.hp <= 0 || !townHall) {
      return false;
    }
    if (current.activeResearch.monsterType) {
      return false;
    }

    const upgradeUnrestricted = isUnrestrictedMode(current);
    const currentLevel = current.monsterLevels[monsterType] ?? 0;
    const nextLevel = currentLevel + 1;
    const maxLevel = getMonsterMaxLevel(monsterType);
    if (!upgradeUnrestricted && nextLevel > maxLevel) {
      return false;
    }

    const nextLevelDef = MONSTER_CATALOG[monsterType].levels[nextLevel];
    if (!nextLevelDef) {
      return false;
    }
    if (
      !upgradeUnrestricted &&
      (lab.level < nextLevelDef.requiredLaboratoryLevel || townHall.level < nextLevelDef.requiredTownHallLevel)
    ) {
      return false;
    }
    if (
      !upgradeUnrestricted &&
      (current.resources.putty.current < nextLevelDef.researchCost.putty ||
        current.resources.pebbles.current < nextLevelDef.researchCost.pebbles)
    ) {
      return false;
    }

    const nextResources = upgradeUnrestricted
      ? current.resources
      : {
          ...current.resources,
          putty: {
            ...current.resources.putty,
            current: Math.max(0, current.resources.putty.current - nextLevelDef.researchCost.putty),
          },
          pebbles: {
            ...current.resources.pebbles,
            current: Math.max(0, current.resources.pebbles.current - nextLevelDef.researchCost.pebbles),
          },
        };
    const now = Date.now();
    current.engine.setResources(nextResources);
    set({
      resources: nextResources,
      activeResearch: {
        monsterType,
        endTime: now + nextLevelDef.researchTimeMs,
        durationTotal: nextLevelDef.researchTimeMs,
        startedAt: now,
        targetLevel: nextLevel,
        labId: lab.id,
      },
    });
    return true;
  },
  startMonsterResearch: (labId, monsterType) => {
    const current = get();
    if (current.hatcheryModalBuildingId !== labId) {
      set({ hatcheryModalBuildingId: labId });
    }
    const started = current.startMonsterUpgrade(monsterType);
    if (!started) {
      return;
    }
  },
  instantFinishMonsterResearch: () => {
    const current = get();
    if (!current.activeResearch.monsterType || !current.activeResearch.endTime) {
      return;
    }
    const remainingMs = Math.max(0, current.activeResearch.endTime - Date.now());
    if (remainingMs <= 0) {
      current.tickMonsterResearch();
      return;
    }
    const shinyCost = getInstantFinishShinyCost(remainingMs);
    const finishUnrestricted = isUnrestrictedMode(current);
    if (!finishUnrestricted && current.shiny < shinyCost) {
      return;
    }
    set({
      shiny: finishUnrestricted ? current.shiny : Math.max(0, current.shiny - shinyCost),
      activeResearch: {
        ...current.activeResearch,
        endTime: Date.now(),
      },
    });
    get().tickMonsterResearch();
  },
  deploySelectedMonster: () => {
    const current = get();
    if (!current.battleMode || !current.selectedArmyMonster || !current.activeCell) {
      return;
    }

    const selected = current.selectedArmyMonster;
    if (current.armyInventory[selected] <= 0) {
      return;
    }
    const residentIndex = current.penResidents.findIndex(
      (resident) => resident.monsterType === selected && resident.lifecycleState === 'HOUSED'
    );
    if (residentIndex === -1) {
      return;
    }
    const { x, y } = current.activeCell;
    const exclusion = current.battleExclusion;
    const insideEnemyZone = x >= exclusion.minX && x <= exclusion.maxX && y >= exclusion.minY && y <= exclusion.maxY;
    if (insideEnemyZone) {
      return;
    }
    const state = current.engine.getState();
    const occupied = state.buildings.some(
      (building) =>
        x >= building.x &&
        x < building.x + building.sizeX &&
        y >= building.y &&
        y < building.y + building.sizeY
    );
    if (occupied) {
      return;
    }
    const monsterLevel = current.monsterLevels[selected] || 1;
    const spec = getMonsterLevelSpec(selected, monsterLevel);
    const enemyId = current.enemyCount + 1;
    const spawned: Enemy = {
      id: `enemy-${selected.toLowerCase()}-${enemyId}`,
      x,
      y,
      hp: spec.hp,
      maxHp: spec.hp,
      speed: spec.speed,
      damage: spec.damage,
    };
    const nextEnemies = [...current.enemies, spawned];
    const nextArmyInventory = {
      ...current.armyInventory,
      [selected]: Math.max(0, current.armyInventory[selected] - 1),
    };
    const nextArmySpaceUsed = Math.max(
      0,
      current.armySpaceUsed - getMonsterHousingSpace(selected, current.monsterLevels[selected] || monsterLevel || 1)
    );
    const nextPenResidents = [...current.penResidents];
    nextPenResidents.splice(residentIndex, 1);
    current.engine.setEnemies(nextEnemies);
    set({
      enemies: nextEnemies,
      enemyCount: enemyId,
      armyInventory: nextArmyInventory,
      armySpaceUsed: nextArmySpaceUsed,
      penResidents: nextPenResidents,
      battleHasStarted: true,
    });
    current.refreshEcs();
  },
});
