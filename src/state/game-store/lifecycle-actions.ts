import { BUILDING_TYPES } from '../../core/types/building';
import type { GameResources } from '../../core/types/resources';
import { ENHANCED_BUILDING_CATALOG } from '../../core/constants/catalog';
import { getMonsterHousingSpace, type MonsterType } from '../../core/constants/monster-catalog';
import { findPathAStar, getRectangleBorderCells } from '../../utils/pathfinding';
import { syncGridSystem } from '../../ecs/systems/sync-grid-system';
import { savePersistedGameData } from '../persistence';
import {
  ensureStarterResources,
  getRandomObstacleRespawnDelayMs,
  getPenInteriorCells,
  getResidentWalkableGrid,
  OBSTACLE_RESPAWN_TARGET_COUNT,
  trySpawnRandomObstacle,
  getWalkableGridFromState,
  resolveResidentSpeed,
  toCellCenter,
} from './helpers';
import type {
  GameStore,
  GameStoreGet,
  GameStoreSet,
  GridPoint,
  PenResident,
  TrainingQueueItem,
} from './types';

type LifecycleActions = Pick<
  GameStore,
  'refreshEcs' | 'recalculateMaxCapacities' | 'tickMonsterResearch' | 'tickHatcheries' | 'tickPenResidents' | 'tickResources'
>;

export const createLifecycleActions = (set: GameStoreSet, get: GameStoreGet): LifecycleActions => ({
  refreshEcs: () => {
    const current = get();
    const state = current.engine.getState();
    const preview = current.engine.getPlacementPreview();
    const synced = syncGridSystem(current.world, state.buildings, preview, current.enemies);
    set({
      entities: synced,
      resources: state.resources,
      placementValid: preview?.valid ?? false,
    });

    savePersistedGameData({
      resources: state.resources,
      buildings: state.buildings,
      shiny: current.shiny,
      monsterLevels: current.monsterLevels,
      penHousingSettings: current.penHousingSettings,
      penResidents: current.penResidents,
      nextResidentId: current.nextResidentId,
      unlockedLandCells: current.unlockedLandCells,
      landExpansionPreview: current.landExpansionPreview,
    });
  },
  recalculateMaxCapacities: () => {
    const current = get();
    const state = current.engine.getState();
    const nextMax = {
      twigs: 0,
      pebbles: 0,
      putty: 0,
      goo: 0,
    };

    for (const building of state.buildings) {
      if (building.status !== 'ACTIVE' && building.type !== BUILDING_TYPES.TOWN_HALL) {
        continue;
      }
      const definition = ENHANCED_BUILDING_CATALOG[building.type];
      const storage = building.providesCapacity ?? definition.storage;
      if (!storage) {
        continue;
      }
      nextMax.twigs += storage.twigs ?? 0;
      nextMax.pebbles += storage.pebbles ?? 0;
      nextMax.putty += storage.putty ?? 0;
      nextMax.goo += storage.goo ?? 0;
    }

    const fallback = 1000;
    const capped: GameResources = {
      twigs: {
        current: Math.min(current.resources.twigs.current, Math.max(fallback, nextMax.twigs)),
        max: Math.max(fallback, nextMax.twigs),
      },
      pebbles: {
        current: Math.min(current.resources.pebbles.current, Math.max(fallback, nextMax.pebbles)),
        max: Math.max(fallback, nextMax.pebbles),
      },
      putty: {
        current: Math.min(current.resources.putty.current, Math.max(fallback, nextMax.putty)),
        max: Math.max(fallback, nextMax.putty),
      },
      goo: {
        current: Math.min(current.resources.goo.current, Math.max(fallback, nextMax.goo)),
        max: Math.max(fallback, nextMax.goo),
      },
    };
    const starterAdjusted = ensureStarterResources(capped);
    current.engine.setResources(starterAdjusted);
    set({ resources: starterAdjusted });
  },
  tickMonsterResearch: () => {
    const current = get();
    if (!current.activeResearch.monsterType || !current.activeResearch.endTime || !current.activeResearch.targetLevel) {
      return;
    }
    const now = Date.now();
    if (now < current.activeResearch.endTime) {
      return;
    }

    const { monsterType, targetLevel } = current.activeResearch;
    const nextCatalogState = {
      ...current.monsterCatalogState,
      [monsterType]: {
        unlockState: 'UNLOCKED' as const,
        level: targetLevel,
      },
    };
    set({
      monsterCatalogState: nextCatalogState,
      monsterLevels: {
        ...current.monsterLevels,
        [monsterType]: targetLevel,
      },
      activeResearch: {
        monsterType: null,
        endTime: null,
        durationTotal: 0,
        startedAt: null,
        targetLevel: null,
        labId: null,
      },
    });
  },
  tickHatcheries: () => {
    const current = get();
    const state = current.engine.getState();
    const hatcheries = state.buildings.filter(
      (building) => building.type === BUILDING_TYPES.ARMY_HATCHERY && building.status === 'ACTIVE' && building.hp > 0
    );
    if (!hatcheries.length) {
      return;
    }
    const pens = state.buildings.filter((building) => building.type === BUILDING_TYPES.ARMY_MONSTER_PEN && building.status === 'ACTIVE');
    const maxArmySpace = pens.length * 20;
    const deckSpaceUsed = (Object.keys(current.armyInventory) as MonsterType[]).reduce((total, monsterType) => {
      const amount = current.armyInventory[monsterType] ?? 0;
      const level = current.monsterLevels[monsterType] || 1;
      return total + amount * getMonsterHousingSpace(monsterType, level);
    }, 0);
    const transitSpaceUsed = current.penResidents
      .filter((resident) => resident.lifecycleState === 'TRAINING')
      .reduce((total, resident) => {
        const level = current.monsterLevels[resident.monsterType] || 1;
        return total + getMonsterHousingSpace(resident.monsterType, level);
      }, 0);
    const armySpaceUsed = deckSpaceUsed + transitSpaceUsed;
    const now = Date.now();
    const deltaMs = Math.max(0, now - current.lastHatcheryTick);
    if (deltaMs <= 0) {
      set({ maxArmySpace, armySpaceUsed });
      return;
    }

    const nextQueues: Record<string, TrainingQueueItem[]> = {};
    for (const hatchery of hatcheries) {
      nextQueues[hatchery.id] = [...(current.hatcheryTrainingQueues[hatchery.id] ?? [])];
    }

    let nextArmyInventory = { ...current.armyInventory };
    let nextArmySpaceUsed = armySpaceUsed;
    let nextPenResidents = [...current.penResidents];
    let nextResidentId = current.nextResidentId;
    const walkable = getWalkableGridFromState(state.buildings, state.gridSize);

    for (const hatchery of hatcheries) {
      const queue = nextQueues[hatchery.id] ?? [];
      if (!queue.length) {
        continue;
      }
      const active = queue[0];
      const activeMonsterLevel = current.monsterLevels[active.monsterType] || 1;
      if (nextArmySpaceUsed + getMonsterHousingSpace(active.monsterType, activeMonsterLevel) > maxArmySpace) {
        continue;
      }
      active.timeRemainingMs = Math.max(0, active.timeRemainingMs - deltaMs);
      if (active.timeRemainingMs > 0) {
        continue;
      }

      queue.shift();

      const preferredPens = pens.filter((pen) => {
        const preference = current.penHousingSettings[pen.id]?.priority ?? 'ANY';
        return preference === 'ANY' || preference === active.monsterType;
      });
      const candidatePens = preferredPens.length ? preferredPens : pens;
      const targetPen = candidatePens[Math.floor(Math.random() * candidatePens.length)];
      if (targetPen) {
        const residentWalkable = getResidentWalkableGrid(state.buildings, state.gridSize, targetPen.id);
        const hatcheryExitCells = getRectangleBorderCells(hatchery.x, hatchery.y, hatchery.sizeX, hatchery.sizeY, state.gridSize);
        const penInteriorGoals = getPenInteriorCells(targetPen, state.gridSize).filter(
          (cell) => residentWalkable[cell.y]?.[cell.x] ?? false
        );
        if (!penInteriorGoals.length) {
          continue;
        }
        const availableExitCells = hatcheryExitCells.filter((cell) => walkable[cell.y]?.[cell.x] ?? false);
        const startCell = availableExitCells[Math.floor(Math.random() * availableExitCells.length)] ?? hatcheryExitCells[0];
        if (!startCell) {
          continue;
        }
        const pathToPen = findPathAStar(residentWalkable, startCell, penInteriorGoals) ?? [startCell];
        const spawnPoint = toCellCenter(startCell);
        const travelPath = pathToPen.slice(1);
        const firstTarget = travelPath[0] ? toCellCenter(travelPath[0]) : spawnPoint;
        nextPenResidents.push({
          id: `resident-${nextResidentId}`,
          monsterType: active.monsterType,
          lifecycleState: 'TRAINING',
          penId: targetPen.id,
          hatcheryId: hatchery.id,
          x: spawnPoint.x,
          y: spawnPoint.y,
          targetX: firstTarget.x,
          targetY: firstTarget.y,
          path: travelPath,
          nextWanderAt: now + 5000 + Math.random() * 7000,
          moving: travelPath.length > 0,
        });
        nextResidentId += 1;
      }
    }

    set({
      hatcheryTrainingQueues: nextQueues,
      armyInventory: nextArmyInventory,
      armySpaceUsed: nextArmySpaceUsed,
      maxArmySpace,
      penResidents: nextPenResidents,
      nextResidentId,
      lastHatcheryTick: now,
    });

    if (nextPenResidents.length !== current.penResidents.length || nextResidentId !== current.nextResidentId) {
      savePersistedGameData({
        resources: state.resources,
        buildings: state.buildings,
        shiny: current.shiny,
        penHousingSettings: current.penHousingSettings,
        penResidents: nextPenResidents,
        nextResidentId,
        unlockedLandCells: current.unlockedLandCells,
        landExpansionPreview: current.landExpansionPreview,
      });
    }
  },
  tickPenResidents: () => {
    const current = get();
    if (!current.penResidents.length) {
      return;
    }
    const state = current.engine.getState();
    const pensById = new Map(state.buildings.filter((building) => building.type === BUILDING_TYPES.ARMY_MONSTER_PEN).map((building) => [building.id, building]));
    const now = Date.now();
    const delta = 0.1;
    const hasPathChanged = (leftPath: GridPoint[], rightPath: GridPoint[]) => {
      if (leftPath.length !== rightPath.length) {
        return true;
      }
      for (let index = 0; index < leftPath.length; index += 1) {
        if (leftPath[index].x !== rightPath[index].x || leftPath[index].y !== rightPath[index].y) {
          return true;
        }
      }
      return false;
    };
    const hasResidentChanged = (previous: PenResident, next: PenResident) => {
      if (previous === next) {
        return false;
      }
      if (previous.lifecycleState !== next.lifecycleState) {
        return true;
      }
      if (previous.penId !== next.penId || previous.hatcheryId !== next.hatcheryId) {
        return true;
      }
      if (previous.monsterType !== next.monsterType) {
        return true;
      }
      if (previous.moving !== next.moving || previous.nextWanderAt !== next.nextWanderAt) {
        return true;
      }
      if (
        previous.x !== next.x ||
        previous.y !== next.y ||
        previous.targetX !== next.targetX ||
        previous.targetY !== next.targetY
      ) {
        return true;
      }
      return hasPathChanged(previous.path, next.path);
    };

    let nextArmyInventory = { ...current.armyInventory };
    let nextArmySpaceUsed = current.armySpaceUsed;
    let shouldPersistResidents = false;
    let didResidentsChange = false;
    const nextResidents = current.penResidents
      .map((resident) => {
        const pen = pensById.get(resident.penId);
        if (!pen || pen.status !== 'ACTIVE') {
          shouldPersistResidents = true;
          didResidentsChange = true;
          return null;
        }
        const next = { ...resident };
        if (next.moving && next.path.length) {
          const waypoint = next.path[0];
          const waypointCenter = toCellCenter(waypoint);
          next.targetX = waypointCenter.x;
          next.targetY = waypointCenter.y;
        }

        if (next.moving) {
          const dx = next.targetX - next.x;
          const dy = next.targetY - next.y;
          const dist = Math.hypot(dx, dy);
          const speed = resolveResidentSpeed(next.monsterType);
          if (dist <= 0.02) {
            next.x = next.targetX;
            next.y = next.targetY;
            if (next.path.length) {
              next.path = next.path.slice(1);
            }
            if (!next.path.length) {
              next.moving = false;
              if (next.lifecycleState === 'TRAINING') {
                next.lifecycleState = 'HOUSED';
                shouldPersistResidents = true;
                nextArmyInventory = {
                  ...nextArmyInventory,
                  [next.monsterType]: nextArmyInventory[next.monsterType] + 1,
                };
                const nextLevel = current.monsterLevels[next.monsterType] || 1;
                nextArmySpaceUsed += getMonsterHousingSpace(next.monsterType, nextLevel);
              }
              next.nextWanderAt = now + 5000 + Math.random() * 7000;
            } else {
              const target = toCellCenter(next.path[0]);
              next.targetX = target.x;
              next.targetY = target.y;
            }
          } else {
            const step = Math.min(dist, speed * delta);
            next.x += (dx / dist) * step;
            next.y += (dy / dist) * step;
          }
        }

        if (!next.moving && next.lifecycleState === 'TRAINING' && !next.path.length) {
          next.lifecycleState = 'HOUSED';
          shouldPersistResidents = true;
          next.nextWanderAt = now + 5000 + Math.random() * 7000;
          nextArmyInventory = {
            ...nextArmyInventory,
            [next.monsterType]: nextArmyInventory[next.monsterType] + 1,
          };
          const nextLevel = current.monsterLevels[next.monsterType] || 1;
          nextArmySpaceUsed += getMonsterHousingSpace(next.monsterType, nextLevel);
        }

        if (!next.moving && next.lifecycleState === 'HOUSED' && now >= next.nextWanderAt) {
          const penCells = getPenInteriorCells(pen, state.gridSize);
          if (!penCells.length) {
            next.nextWanderAt = now + 5000 + Math.random() * 7000;
            return next;
          }
          const targetCell = penCells[Math.floor(Math.random() * penCells.length)];
          const originCell: GridPoint = {
            x: Math.round(next.x - 0.5),
            y: Math.round(next.y - 0.5),
          };
          const residentWalkable = getResidentWalkableGrid(state.buildings, state.gridSize, next.penId);
          const canWalkFromOrigin = residentWalkable[originCell.y]?.[originCell.x] ?? false;
          if (!canWalkFromOrigin) {
            const fallback = penCells[Math.floor(Math.random() * penCells.length)];
            const fallbackCenter = toCellCenter(fallback);
            next.x = fallbackCenter.x;
            next.y = fallbackCenter.y;
            next.targetX = fallbackCenter.x;
            next.targetY = fallbackCenter.y;
            next.path = [];
            next.moving = false;
            next.nextWanderAt = now + 5000 + Math.random() * 7000;
            return next;
          }
          const wanderPath = findPathAStar(residentWalkable, originCell, [targetCell]) ?? [originCell];
          const travelPath = wanderPath.slice(1);
          if (travelPath.length) {
            const firstTarget = toCellCenter(travelPath[0]);
            next.path = travelPath;
            next.targetX = firstTarget.x;
            next.targetY = firstTarget.y;
            next.moving = true;
          } else {
            next.nextWanderAt = now + 5000 + Math.random() * 7000;
          }
        }

        if (hasResidentChanged(resident, next)) {
          didResidentsChange = true;
          return next;
        }
        return resident;
      })
      .filter((resident): resident is PenResident => resident !== null);

    const inventoryChanged =
      nextArmyInventory.Pokey !== current.armyInventory.Pokey || nextArmyInventory.Rambot !== current.armyInventory.Rambot;
    const armySpaceChanged = nextArmySpaceUsed !== current.armySpaceUsed;
    if (!didResidentsChange && !inventoryChanged && !armySpaceChanged) {
      return;
    }

    set({
      penResidents: nextResidents,
      armyInventory: nextArmyInventory,
      armySpaceUsed: nextArmySpaceUsed,
    });

    if (shouldPersistResidents) {
      savePersistedGameData({
        resources: state.resources,
        buildings: state.buildings,
        shiny: current.shiny,
        monsterLevels: current.monsterLevels,
        penHousingSettings: current.penHousingSettings,
        penResidents: nextResidents,
        nextResidentId: current.nextResidentId,
        unlockedLandCells: current.unlockedLandCells,
        landExpansionPreview: current.landExpansionPreview,
      });
    }
  },
  tickResources: () => {
    const current = get();
    const now = Date.now();
    if (now <= current.lastResourceTick) {
      return;
    }
    const state = current.engine.getState();
    const nextResources: GameResources = {
      twigs: { ...current.resources.twigs },
      pebbles: { ...current.resources.pebbles },
      putty: { ...current.resources.putty },
      goo: { ...current.resources.goo },
    };

    for (const building of state.buildings) {
      if (building.status !== 'ACTIVE') {
        continue;
      }
      const def = ENHANCED_BUILDING_CATALOG[building.type];
      if (!def.production) {
        continue;
      }
      const hpRatio = building.maxHp > 0 ? building.hp / building.maxHp : 1;
      if (hpRatio < 0.5) {
        continue;
      }
      if (
        building.type === BUILDING_TYPES.RESOURCE_GOO_COLLECTOR ||
        building.type === BUILDING_TYPES.RESOURCE_PEBBLE_COLLECTOR ||
        building.type === BUILDING_TYPES.RESOURCE_PUTTY_COLLECTOR ||
        building.type === BUILDING_TYPES.RESOURCE_TWIG_COLLECTOR
      ) {
        continue;
      }
      const resourceType = def.production.type;
      const last = building.lastHarvested ?? current.lastResourceTick;
      const deltaTime = Math.max(0, now - last);
      const productionPerMs = building.productionPerMs ?? def.production.ratePerMs;
      const generated = deltaTime * productionPerMs;
      nextResources[resourceType] = {
        ...nextResources[resourceType],
        current: Math.min(nextResources[resourceType].current + generated, nextResources[resourceType].max),
      };
      current.engine.updateBuildingLastHarvested(building.id, now);
    }
    current.engine.setResources(nextResources);
    const hasObstacleCapacity =
      state.buildings.filter((building) => building.tags?.includes('obstacle')).length < OBSTACLE_RESPAWN_TARGET_COUNT;
    let didSpawnObstacle = false;
    let nextObstacleRespawnAt = current.nextObstacleRespawnAt;
    if (hasObstacleCapacity && now >= current.nextObstacleRespawnAt) {
      didSpawnObstacle = trySpawnRandomObstacle(current.unlockedLandCells);
      nextObstacleRespawnAt = now + getRandomObstacleRespawnDelayMs();
    }

    set({
      resources: nextResources,
      lastResourceTick: now,
      nextObstacleRespawnAt,
    });

    if (didSpawnObstacle) {
      current.refreshEcs();
    }
  },
});
