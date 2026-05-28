import { BUILDING_TYPES } from '../../core/types/building';
import { ENHANCED_BUILDING_CATALOG } from '../../core/constants/catalog';
import { acquireTurretShotEvents, runCombatTickSystem } from '../../ecs/systems/combat-tick-system';
import { findPathAStar, getRectangleBorderCells } from '../../utils/pathfinding';
import { getWalkableGridFromState } from './helpers';
import type { GameStore, GameStoreGet, GameStoreSet, Projectile, Worker } from './types';

type CombatActions = Pick<GameStore, 'tickCombat' | 'tickConstruction' | 'tickProjectiles' | 'tickEffects'>;

export const createCombatActions = (set: GameStoreSet, get: GameStoreGet): CombatActions => ({
  tickCombat: () => {
    const current = get();
    const now = Date.now();
    const deltaSeconds = Math.max(0, (now - current.lastCombatTick) / 1000);
    if (deltaSeconds <= 0) {
      return;
    }

    const dueSpawns = current.pendingRaidSpawns.filter((spawn) => spawn.spawnAt <= now).map((spawn) => spawn.enemy);
    const remainingSpawns = current.pendingRaidSpawns.filter((spawn) => spawn.spawnAt > now);
    const mergedEnemies = [...current.enemies, ...dueSpawns];
    const shouldEvaluateBattleResult = current.battleMode && current.battleHasStarted;
    const canSkipCombatSimulation =
      mergedEnemies.length === 0 &&
      dueSpawns.length === 0 &&
      remainingSpawns.length === 0 &&
      !shouldEvaluateBattleResult;
    if (canSkipCombatSimulation) {
      set({ lastCombatTick: now });
      return;
    }
    if (dueSpawns.length) {
      current.engine.setEnemies(mergedEnemies);
    }

    const state = current.engine.getState();
    const combatResult = runCombatTickSystem({
      enemies: mergedEnemies,
      buildings: state.buildings,
      gridSize: state.gridSize,
      deltaSeconds,
    });
    const turretAcquisition = acquireTurretShotEvents(
      combatResult.enemies,
      state.buildings,
      now,
      current.turretCooldownById
    );
    const nextEnemies = [...combatResult.enemies];
    const nextDamageTimestamps = { ...current.damageTimestamps };
    const nextProjectiles = [...current.projectiles];
    let nextProjectileCount = current.projectileCount;

    for (const shot of turretAcquisition.shots) {
      const enemyIndex = nextEnemies.findIndex((enemy) => enemy.id === shot.enemyId);
      if (enemyIndex === -1) {
        continue;
      }
      const enemy = nextEnemies[enemyIndex];
      const turret = state.buildings.find((building) => building.id === shot.turretId);
      if (!turret && (shot.originX === undefined || shot.originY === undefined)) {
        continue;
      }
      const isMortar = shot.pathType === 'arc' || (turret?.tags?.includes('mortar') ?? false);

      if (!isMortar) {
        nextEnemies[enemyIndex] = {
          ...nextEnemies[enemyIndex],
          hp: nextEnemies[enemyIndex].hp - shot.damage,
        };
      }

      nextProjectileCount += 1;
      nextProjectiles.push({
        id: `proj-${nextProjectileCount}`,
        turretId: shot.turretId,
        targetEnemyId: shot.enemyId,
        originX: shot.originX ?? (turret ? turret.x + turret.sizeX / 2 : enemy.x),
        originY: shot.originY ?? (turret ? turret.y + turret.sizeY / 2 : enemy.y),
        targetSnapshotX: enemy.x,
        targetSnapshotY: enemy.y,
        pathType: isMortar ? 'arc' : 'linear',
        damage: shot.damage,
        splashRadius: turret?.splashRadius ?? 0,
        applyDamageOnImpact: isMortar,
        progress: 0,
        speed: isMortar ? 1.35 : 3.2,
      });
      nextDamageTimestamps[shot.enemyId] = now;
    }

    const aliveEnemies = nextEnemies.filter((enemy) => enemy.hp > 0);

    for (const event of combatResult.buildingDamage) {
      if (event.damage <= 0) {
        continue;
      }
      current.engine.applyDamageToBuilding(event.buildingId, event.damage);
      nextDamageTimestamps[event.buildingId] = now;
    }

    const townHall = current.engine.getState().buildings.find((building) => building.type === BUILDING_TYPES.TOWN_HALL && building.status === 'ACTIVE');
    const isDefeat = current.battleMode && current.battleHasStarted && !townHall;
    const isVictory = current.battleMode && current.battleHasStarted && townHall && aliveEnemies.length === 0 && remainingSpawns.length === 0;
    if (!townHall) {
      aliveEnemies.length = 0;
    }

    current.engine.setEnemies(aliveEnemies);
    set({
      enemies: aliveEnemies,
      pendingRaidSpawns: remainingSpawns,
      projectiles: nextProjectiles,
      projectileCount: nextProjectileCount,
      damageTimestamps: nextDamageTimestamps,
      turretCooldownById: turretAcquisition.cooldownByTurret,
      battleResult: isDefeat ? 'DEFEAT' : isVictory ? 'VICTORY' : current.battleResult,
      lastCombatTick: now,
    });
    const hasEnemySimulation = mergedEnemies.length > 0 || dueSpawns.length > 0;
    const hasBuildingDamage = combatResult.buildingDamage.length > 0;
    const enemyCountChanged = aliveEnemies.length !== current.enemies.length;
    if (hasEnemySimulation || hasBuildingDamage || enemyCountChanged) {
      current.refreshEcs();
    }
  },
  tickConstruction: () => {
    const current = get();
    const now = Date.now();
    const deltaSeconds = Math.max(0, (now - current.lastConstructionTick) / 1000);
    if (deltaSeconds <= 0) {
      return;
    }

    const hasIdleWorkers = current.workers.some((worker) => worker.state !== 'IDLE' || worker.path.length > 0);
    const hasPendingBuildings = current.engine.getState().buildings.some((building) => building.status === 'PENDING');
    if (!hasIdleWorkers && !hasPendingBuildings) {
      set({ lastConstructionTick: now });
      return;
    }

    const state = current.engine.getState();
    const walkable = getWalkableGridFromState(state.buildings, state.gridSize);
    const nextWorkers: Worker[] = current.workers.map((worker) => ({ ...worker, path: [...worker.path] }));
    const nextQueuedMonsters = [...current.queuedMonsters];
    const updatedBuildingIds = new Set<string>();
    const workerStateBefore = current.workers.map((worker) => `${worker.state}|${worker.x.toFixed(3)}|${worker.y.toFixed(3)}|${worker.path.length}`).join(';');

    const moveWorker = (worker: Worker): Worker => {
      if (!worker.path.length) {
        return worker;
      }
      let remaining = deltaSeconds * 2.1;
      while (remaining > 0 && worker.path.length > 0) {
        const target = worker.path[0];
        const dx = target.x - worker.x;
        const dy = target.y - worker.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= 0.001) {
          worker.x = target.x;
          worker.y = target.y;
          worker.path.shift();
          continue;
        }
        const step = Math.min(remaining, dist);
        worker.x += (dx / dist) * step;
        worker.y += (dy / dist) * step;
        remaining -= step;
        if (step === dist) {
          worker.path.shift();
        }
      }
      return worker;
    };

    for (let index = 0; index < nextWorkers.length; index += 1) {
      const worker = moveWorker(nextWorkers[index]);
      if (worker.state === 'MOVING_TO_TASK' && worker.path.length === 0 && worker.taskEndsAt) {
        if (typeof worker.taskTargetX === 'number' && typeof worker.taskTargetY === 'number') {
          worker.x = worker.taskTargetX;
          worker.y = worker.taskTargetY;
        }
        worker.state = 'WORKING';
      }
      if (worker.state === 'WORKING' && worker.taskEndsAt && now >= worker.taskEndsAt) {
        const assignedBuildingId = worker.assignedBuildingId;
        if (assignedBuildingId) {
          const assigned = state.buildings.find((building) => building.id === assignedBuildingId);
          if (assigned) {
            if (worker.taskType === 'CLEAR_OBSTACLE') {
              current.engine.removeBuilding(assignedBuildingId);
            } else {
              current.engine.updateBuilding(assignedBuildingId, (building) => ({
                ...building,
                status: 'ACTIVE',
                assignedWorkerId: undefined,
                buildEndsAt: undefined,
                buildStartedAt: undefined,
              }));
              updatedBuildingIds.add(assignedBuildingId);
              if (assigned.type === BUILDING_TYPES.ARMY_HATCHERY) {
                nextQueuedMonsters.push('Mite');
              }
            }
          }
        }

        const homePath = findPathAStar(walkable, { x: Math.round(worker.x), y: Math.round(worker.y) }, [{ x: worker.homeX, y: worker.homeY }]) ?? [];
        worker.path = homePath.slice(1);
        worker.state = 'RETURNING';
        worker.taskEndsAt = undefined;
        worker.assignedBuildingId = undefined;
        worker.taskTargetX = undefined;
        worker.taskTargetY = undefined;
        worker.taskType = undefined;
      }

      if (worker.state === 'RETURNING' && worker.path.length === 0) {
        worker.state = 'IDLE';
      }
      nextWorkers[index] = worker;
    }

    const freeWorkers = nextWorkers.filter((worker) => worker.state === 'IDLE');
    const pendingBuildings = current.engine
      .getState()
      .buildings.filter((building) => building.status === 'PENDING')
      .sort((left, right) => (left.buildStartedAt ?? 0) - (right.buildStartedAt ?? 0));

    for (const pending of pendingBuildings) {
      const worker = freeWorkers.shift();
      if (!worker) {
        break;
      }
      const targetCells = getRectangleBorderCells(pending.x, pending.y, pending.sizeX, pending.sizeY, state.gridSize);
      const path = findPathAStar(walkable, { x: Math.round(worker.x), y: Math.round(worker.y) }, targetCells);
      if (!path || path.length < 2) {
        continue;
      }
      const destinationCell = path[path.length - 1];
      const definition = ENHANCED_BUILDING_CATALOG[pending.type];
      const isObstacleTask = pending.tags?.includes('obstacle') ?? false;
      const presetRemainingMs = pending.buildEndsAt ? Math.max(0, pending.buildEndsAt - now) : 0;
      const duration = isObstacleTask ? 30000 : presetRemainingMs > 0 ? presetRemainingMs : definition.constructionMs;
      current.engine.updateBuilding(pending.id, (building) => ({
        ...building,
        status: 'UNDER_CONSTRUCTION',
        assignedWorkerId: worker.id,
        buildStartedAt: now,
        buildEndsAt: now + duration,
      }));
      worker.path = path.slice(1);
      worker.state = 'MOVING_TO_TASK';
      worker.taskType = isObstacleTask ? 'CLEAR_OBSTACLE' : 'BUILD';
      worker.assignedBuildingId = pending.id;
      worker.taskTargetX = destinationCell?.x ?? worker.x;
      worker.taskTargetY = destinationCell?.y ?? worker.y;
      worker.taskEndsAt = now + duration;
      updatedBuildingIds.add(pending.id);
    }

    const workerStateAfter = nextWorkers.map((worker) => `${worker.state}|${worker.x.toFixed(3)}|${worker.y.toFixed(3)}|${worker.path.length}`).join(';');
    const queuedMonstersChanged = nextQueuedMonsters.length !== current.queuedMonsters.length;
    const workersChanged = workerStateAfter !== workerStateBefore;
    const buildingsChanged = updatedBuildingIds.size > 0;

    set({
      workers: workersChanged ? nextWorkers : current.workers,
      queuedMonsters: queuedMonstersChanged ? nextQueuedMonsters : current.queuedMonsters,
      lastConstructionTick: now,
    });
    if (buildingsChanged) {
      current.recalculateMaxCapacities();
    }
    if (workersChanged || buildingsChanged) {
      current.refreshEcs();
    }
  },
  tickProjectiles: (deltaSeconds) => {
    const current = get();
    if (!current.projectiles.length) {
      return;
    }

    const nextProjectiles: Projectile[] = [];
    const nextImpacts = [...current.impacts];
    const nextDamageTimestamps = { ...current.damageTimestamps };
    let nextEnemies = [...current.enemies];
    const now = Date.now();

    for (const projectile of current.projectiles) {
      const nextProgress = projectile.progress + deltaSeconds * projectile.speed;
      if (nextProgress >= 1) {
        const targetEnemy = current.enemies.find((enemy) => enemy.id === projectile.targetEnemyId);
        const impactX = targetEnemy?.x ?? projectile.targetSnapshotX;
        const impactY = targetEnemy?.y ?? projectile.targetSnapshotY;
        nextImpacts.push({
          id: `impact-${projectile.id}-${now}`,
          x: impactX,
          y: impactY,
          life: 0.28,
          maxLife: 0.28,
        });

        if (projectile.applyDamageOnImpact) {
          if (projectile.splashRadius > 0) {
            nextEnemies = nextEnemies.map((enemy) => {
              const dist = Math.hypot(enemy.x - impactX, enemy.y - impactY);
              if (dist > projectile.splashRadius) {
                return enemy;
              }
              nextDamageTimestamps[enemy.id] = now;
              return {
                ...enemy,
                hp: enemy.hp - projectile.damage,
              };
            });
          } else {
            const targetEnemyIndex = nextEnemies.findIndex((enemy) => enemy.id === projectile.targetEnemyId);
            if (targetEnemyIndex !== -1) {
              nextEnemies[targetEnemyIndex] = {
                ...nextEnemies[targetEnemyIndex],
                hp: nextEnemies[targetEnemyIndex].hp - projectile.damage,
              };
              nextDamageTimestamps[projectile.targetEnemyId] = now;
            }
          }
        }
        continue;
      }

      nextProjectiles.push({
        ...projectile,
        progress: nextProgress,
      });
    }

    nextEnemies = nextEnemies.filter((enemy) => enemy.hp > 0);
    current.engine.setEnemies(nextEnemies);

    set({
      projectiles: nextProjectiles,
      impacts: nextImpacts,
      damageTimestamps: nextDamageTimestamps,
      enemies: nextEnemies,
    });
  },
  tickEffects: (deltaSeconds) => {
    const current = get();
    if (!current.impacts.length && !current.floatingTexts.length) {
      return;
    }

    const nextImpacts = current.impacts
      .map((impact) => ({
        ...impact,
        life: impact.life - deltaSeconds,
      }))
      .filter((impact) => impact.life > 0);

    const nextTexts = current.floatingTexts
      .map((text) => ({
        ...text,
        y: text.y + deltaSeconds * 0.8,
        life: text.life - deltaSeconds,
      }))
      .filter((text) => text.life > 0);

    set({
      impacts: nextImpacts,
      floatingTexts: nextTexts,
    });
  },
});
