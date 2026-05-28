import type { Building } from '../../core/types/building';
import type { Enemy } from '../../core/types/enemy';
import { findPathAStar, getRectangleBorderCells } from '../../utils/pathfinding';

type CombatInput = {
  enemies: Enemy[];
  buildings: Building[];
  gridSize: number;
  deltaSeconds: number;
};

type CombatResult = {
  enemies: Enemy[];
  buildingDamage: Array<{ buildingId: string; damage: number }>;
};

const distance = (ax: number, ay: number, bx: number, by: number): number => Math.hypot(ax - bx, ay - by);

const buildWalkableGrid = (gridSize: number, buildings: Building[]): boolean[][] => {
  const walkable = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => true));
  for (const building of buildings.filter((item) => item.status === 'ACTIVE')) {
    for (let row = building.y; row < building.y + building.sizeY; row += 1) {
      for (let col = building.x; col < building.x + building.sizeX; col += 1) {
        walkable[row][col] = false;
      }
    }
  }
  return walkable;
};

const clampStep = (from: number, to: number, maxStep: number): number => {
  const delta = to - from;
  if (Math.abs(delta) <= maxStep) {
    return to;
  }
  return from + Math.sign(delta) * maxStep;
};

export const runCombatTickSystem = ({ enemies, buildings, gridSize, deltaSeconds }: CombatInput): CombatResult => {
  const activeBuildings = buildings.filter((building) => building.status === 'ACTIVE');
  const townHall = activeBuildings.find((building) => building.type === 'TOWN_HALL');
  if (!townHall) {
    return { enemies, buildingDamage: [] };
  }

  const walkable = buildWalkableGrid(gridSize, activeBuildings);
  const attackTargets = getRectangleBorderCells(townHall.x, townHall.y, townHall.sizeX, townHall.sizeY, gridSize);
  const walls = activeBuildings.filter((building) => building.tags?.includes('wall'));

  const buildingDamage: Array<{ buildingId: string; damage: number }> = [];
  const nextEnemies: Enemy[] = [];

  for (const enemy of enemies) {
    const enemyCell = { x: Math.round(enemy.x), y: Math.round(enemy.y) };
    const pathToHall = findPathAStar(walkable, enemyCell, attackTargets);

    if (pathToHall && pathToHall.length > 1) {
      const nextPathPoint = pathToHall[1];
      const step = enemy.speed * deltaSeconds;
      const nextX = clampStep(enemy.x, nextPathPoint.x, step);
      const nextY = clampStep(enemy.y, nextPathPoint.y, step);
      nextEnemies.push({ ...enemy, x: nextX, y: nextY });

      if (distance(nextX, nextY, townHall.x + townHall.sizeX / 2, townHall.y + townHall.sizeY / 2) < 1.8) {
        buildingDamage.push({ buildingId: townHall.id, damage: Math.round(enemy.damage * deltaSeconds) });
      }
      continue;
    }

    if (!walls.length) {
      nextEnemies.push(enemy);
      continue;
    }

    const nearestWall = walls
      .map((wall) => {
        const wallCenterX = wall.x + wall.sizeX / 2;
        const wallCenterY = wall.y + wall.sizeY / 2;
        return { wall, dist: distance(enemy.x, enemy.y, wallCenterX, wallCenterY) };
      })
      .sort((left, right) => left.dist - right.dist)[0]?.wall;

    if (!nearestWall) {
      nextEnemies.push(enemy);
      continue;
    }

    const wallTargets = getRectangleBorderCells(nearestWall.x, nearestWall.y, nearestWall.sizeX, nearestWall.sizeY, gridSize);
    const pathToWall = findPathAStar(walkable, enemyCell, wallTargets);

    if (pathToWall && pathToWall.length > 1) {
      const nextPathPoint = pathToWall[1];
      const step = enemy.speed * deltaSeconds;
      const nextX = clampStep(enemy.x, nextPathPoint.x, step);
      const nextY = clampStep(enemy.y, nextPathPoint.y, step);
      nextEnemies.push({ ...enemy, x: nextX, y: nextY });
    } else {
      nextEnemies.push(enemy);
    }

    if (distance(enemy.x, enemy.y, nearestWall.x + nearestWall.sizeX / 2, nearestWall.y + nearestWall.sizeY / 2) < 1.6) {
      buildingDamage.push({ buildingId: nearestWall.id, damage: Math.round(enemy.damage * deltaSeconds) });
    }
  }

  return { enemies: nextEnemies, buildingDamage };
};

export const runTurretTickSystem = (
  enemies: Enemy[],
  buildings: Building[],
  deltaSeconds: number
): Enemy[] => {
  const turrets = buildings.filter((building) => building.status === 'ACTIVE' && building.tags?.includes('turret'));
  if (!turrets.length || !enemies.length) {
    return enemies;
  }

  return enemies
    .map((enemy) => {
      let damage = 0;
      for (const turret of turrets) {
        const centerX = turret.x + turret.sizeX / 2;
        const centerY = turret.y + turret.sizeY / 2;
        const turretRange = turret.range ?? 4;
        if (distance(enemy.x, enemy.y, centerX, centerY) <= turretRange) {
          damage += (turret.damage ?? 35) * deltaSeconds;
        }
      }
      return { ...enemy, hp: enemy.hp - damage };
    })
    .filter((enemy) => enemy.hp > 0);
};

export type TurretShotEvent = {
  turretId: string;
  enemyId: string;
  damage: number;
  originX?: number;
  originY?: number;
  pathType?: 'linear' | 'arc';
};

const acquireFortifiedTownHallDroneShots = (
  enemies: Enemy[],
  buildings: Building[],
  now: number,
  cooldownByTurret: Record<string, number>
): TurretShotEvent[] => {
  const townHall = buildings.find((building) => building.type === 'TOWN_HALL' && building.status === 'ACTIVE');
  if (!townHall || !enemies.length) {
    return [];
  }

  const fortificationLevel = townHall.fortificationLevel ?? 0;
  if (fortificationLevel < 3 || townHall.level < 20) {
    return [];
  }

  const centerX = townHall.x + townHall.sizeX / 2;
  const centerY = townHall.y + townHall.sizeY / 2;
  const droneCount = 6;
  const orbitRadius = Math.max(townHall.sizeX, townHall.sizeY) * 0.9;
  const cooldownMs = 260;
  const range = 9.5;
  const damage = 44 + Math.round(townHall.level * 0.9);
  const shots: TurretShotEvent[] = [];

  for (let droneIndex = 0; droneIndex < droneCount; droneIndex += 1) {
    const droneId = `townhall-drone-${townHall.id}-${droneIndex}`;
    const lastShotAt = cooldownByTurret[droneId] ?? 0;
    if (now - lastShotAt < cooldownMs) {
      continue;
    }
    const angle = (Math.PI * 2 * droneIndex) / droneCount + now * 0.0014;
    const originX = centerX + Math.cos(angle) * orbitRadius;
    const originY = centerY + Math.sin(angle) * orbitRadius;

    const target = enemies
      .map((enemy) => ({
        enemy,
        dist: Math.hypot(enemy.x - originX, enemy.y - originY),
      }))
      .filter((entry) => entry.dist <= range)
      .sort((left, right) => left.dist - right.dist)[0]?.enemy;

    if (!target) {
      continue;
    }

    cooldownByTurret[droneId] = now;
    shots.push({
      turretId: droneId,
      enemyId: target.id,
      damage,
      originX,
      originY,
      pathType: 'linear',
    });
  }

  return shots;
};

export const acquireTurretShotEvents = (
  enemies: Enemy[],
  buildings: Building[],
  now: number,
  cooldownByTurret: Record<string, number>
): { shots: TurretShotEvent[]; cooldownByTurret: Record<string, number> } => {
  const turrets = buildings.filter((building) => building.status === 'ACTIVE' && building.tags?.includes('turret'));
  const nextCooldownByTurret = { ...cooldownByTurret };
  const shots: TurretShotEvent[] = [];

  for (const turret of turrets) {
    const turretRange = turret.range ?? 4;
    const turretCenterX = turret.x + turret.sizeX / 2;
    const turretCenterY = turret.y + turret.sizeY / 2;
    const lastShotAt = nextCooldownByTurret[turret.id] ?? 0;
    const cooldownMs = turret.tags?.includes('mortar')
      ? 1500
      : turret.tags?.includes('sniper')
        ? 2000
      : turret.tags?.includes('laser')
        ? 120
      : 420;
    if (now - lastShotAt < cooldownMs) {
      continue;
    }

    nextCooldownByTurret[turret.id] = now;
    const turretHealthRatio = turret.maxHp > 0 ? turret.hp / turret.maxHp : 1;
    const effectiveDamage = Math.max(1, Math.round((turret.damage ?? 55) * Math.max(0.2, turretHealthRatio)));
    if (turret.tags?.includes('laser')) {
      const laserTargets = enemies
        .map((enemy) => ({
          enemy,
          dist: Math.hypot(enemy.x - turretCenterX, enemy.y - turretCenterY),
        }))
        .filter((entry) => entry.dist <= turretRange)
        .sort((left, right) => left.dist - right.dist)
        .slice(0, 5)
        .map((entry) => entry.enemy);
      if (!laserTargets.length) {
        continue;
      }
      for (const target of laserTargets) {
        shots.push({
          turretId: turret.id,
          enemyId: target.id,
          damage: effectiveDamage,
          pathType: 'linear',
        });
      }
      continue;
    }

    const target = enemies
      .map((enemy) => ({
        enemy,
        dist: Math.hypot(enemy.x - turretCenterX, enemy.y - turretCenterY),
      }))
      .filter((entry) => entry.dist <= turretRange)
      .sort((left, right) => left.dist - right.dist)[0]?.enemy;

    if (!target) {
      continue;
    }
    shots.push({
      turretId: turret.id,
      enemyId: target.id,
      damage: effectiveDamage,
      pathType: turret.tags?.includes('mortar') ? 'arc' : 'linear',
    });
  }

  const fortifiedTownHallShots = acquireFortifiedTownHallDroneShots(enemies, buildings, now, nextCooldownByTurret);
  if (fortifiedTownHallShots.length) {
    shots.push(...fortifiedTownHallShots);
  }

  return {
    shots,
    cooldownByTurret: nextCooldownByTurret,
  };
};
