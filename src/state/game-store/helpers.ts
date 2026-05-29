import { ENHANCED_BUILDING_CATALOG } from '../../core/constants/catalog';
import {
  type MonsterRuntimeState,
  type MonsterType,
} from '../../core/constants/monster-catalog';
import { GameEngine } from '../../core/engine/game-engine';
import { BUILDING_TYPES, type Building } from '../../core/types/building';
import type { GameResources } from '../../core/types/resources';
import { createEcsWorld } from '../../ecs/world/world';
import { getRectangleBorderCells } from '../../utils/pathfinding';
import { GRID_SIZE } from '../../utils/coordinates';
import { loadPersistedGameData } from '../persistence';
import type { GridPoint } from './types';

const defaultTownHall: Omit<Building, 'id'> = {
  type: BUILDING_TYPES.TOWN_HALL,
  level: 1,
  x: 8,
  y: 8,
  sizeX: 4,
  sizeY: 4,
  hp: 5000,
  maxHp: 5000,
  status: 'ACTIVE',
  providesCapacity: { twigs: 1000, pebbles: 1000, putty: 1000, goo: 1000 },
  tags: ['core'],
};

export const engine = new GameEngine(GRID_SIZE);
export const persistedState = typeof window !== 'undefined' ? loadPersistedGameData() : null;
export const persistedShiny = persistedState?.shiny ?? 140;
export const INITIAL_OBSTACLE_SEED_COUNT = 9;
export const OBSTACLE_RESPAWN_MIN_MS = 20 * 60 * 1000;
export const OBSTACLE_RESPAWN_MAX_MS = 60 * 60 * 1000;
export const OBSTACLE_RESPAWN_TARGET_COUNT = 36;
const TOWN_HALL_SAFE_MIN = 6;
const TOWN_HALL_SAFE_MAX = 13;
const OBSTACLE_TYPES = [
  BUILDING_TYPES.OBSTACLE_TREE,
  BUILDING_TYPES.OBSTACLE_ROCK,
  BUILDING_TYPES.OBSTACLE_MUSHROOM,
] as const;

if (persistedState) {
  engine.loadSnapshot(persistedState);
}
if (!engine.getState().buildings.some((building) => building.type === BUILDING_TYPES.TOWN_HALL)) {
  engine.placeBuilding(defaultTownHall);
}

if (!persistedState) {
  let seeded = 0;
  let attempts = 0;
  while (seeded < INITIAL_OBSTACLE_SEED_COUNT && attempts < 300) {
    attempts += 1;
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    const isNearTownHall = x >= TOWN_HALL_SAFE_MIN && x <= TOWN_HALL_SAFE_MAX && y >= TOWN_HALL_SAFE_MIN && y <= TOWN_HALL_SAFE_MAX;
    if (isNearTownHall) {
      continue;
    }
    const obstacleType = OBSTACLE_TYPES[seeded % OBSTACLE_TYPES.length];
    const obstacleDef = ENHANCED_BUILDING_CATALOG[obstacleType];
    const placed = engine.placeBuilding({
      type: obstacleType,
      level: 1,
      x,
      y,
      sizeX: obstacleDef.size.x,
      sizeY: obstacleDef.size.y,
      hp: obstacleDef.baseHp,
      maxHp: obstacleDef.baseHp,
      status: 'ACTIVE',
      tags: ['obstacle'],
    });
    if (placed) {
      seeded += 1;
    }
  }
}

export const world = createEcsWorld();
export const INITIAL_UNLOCKED_GRID_SIZE = 14;
export const MAX_UNLOCKED_GRID_SIZE = GRID_SIZE;
export const MAX_WORKERS = 5;

type UnrestrictedFlags = {
  freeBuildMode?: boolean;
  developerModeEnabled?: boolean;
};

export const isUnrestrictedMode = (flags: UnrestrictedFlags): boolean =>
  Boolean(flags.freeBuildMode || flags.developerModeEnabled);
export const createLandCellKey = (x: number, y: number): string => `${x},${y}`;
export const getWorkerShinyCost = (nextWorkerNumber: number): number => {
  if (nextWorkerNumber <= 1) {
    return 0;
  }
  if (nextWorkerNumber > MAX_WORKERS) {
    return Infinity;
  }
  return 250 * 2 ** (nextWorkerNumber - 2);
};

export const OBSTACLE_CLEAR_SHINY_MIN = 0;
export const OBSTACLE_CLEAR_SHINY_MAX = 50;

export const rollObstacleClearShinyReward = (): number =>
  OBSTACLE_CLEAR_SHINY_MIN + Math.floor(Math.random() * (OBSTACLE_CLEAR_SHINY_MAX - OBSTACLE_CLEAR_SHINY_MIN + 1));

export const createInitialUnlockedLandCells = (unlockedGridSize: number): Record<string, true> => {
  const unlockedLandCells: Record<string, true> = {};
  const offset = Math.floor((GRID_SIZE - unlockedGridSize) / 2);
  const max = offset + unlockedGridSize;
  for (let y = offset; y < max; y += 1) {
    for (let x = offset; x < max; x += 1) {
      unlockedLandCells[createLandCellKey(x, y)] = true;
    }
  }
  return unlockedLandCells;
};

const CARDINAL_DIRECTIONS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

export const generateLandExpansionPreview = (
  unlockedLandCells: Record<string, true>,
  clusterSize: number
): GridPoint[] => {
  const frontier: GridPoint[] = [];
  const frontierSet: Record<string, true> = {};
  Object.keys(unlockedLandCells).forEach((cellKey) => {
    const [cellX, cellY] = cellKey.split(',').map((part) => Number(part));
    CARDINAL_DIRECTIONS.forEach((direction) => {
      const nextX = cellX + direction.x;
      const nextY = cellY + direction.y;
      if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
        return;
      }
      const nextKey = createLandCellKey(nextX, nextY);
      if (unlockedLandCells[nextKey] || frontierSet[nextKey]) {
        return;
      }
      frontierSet[nextKey] = true;
      frontier.push({ x: nextX, y: nextY });
    });
  });
  if (!frontier.length) {
    return [];
  }

  const seed = frontier[Math.floor(Math.random() * frontier.length)];
  const queue: GridPoint[] = [seed];
  const visited: Record<string, true> = { [createLandCellKey(seed.x, seed.y)]: true };
  const preview: GridPoint[] = [];
  const previewSet: Record<string, true> = {};

  while (queue.length && preview.length < clusterSize) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    const currentKey = createLandCellKey(current.x, current.y);
    if (!previewSet[currentKey] && !unlockedLandCells[currentKey]) {
      previewSet[currentKey] = true;
      preview.push(current);
    }
    const shuffledDirections = [...CARDINAL_DIRECTIONS].sort(() => Math.random() - 0.5);
    shuffledDirections.forEach((direction) => {
      const nextX = current.x + direction.x;
      const nextY = current.y + direction.y;
      if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
        return;
      }
      const nextKey = createLandCellKey(nextX, nextY);
      if (visited[nextKey] || unlockedLandCells[nextKey]) {
        return;
      }
      const touchingUnlocked = CARDINAL_DIRECTIONS.some((adjacentDirection) => {
        const adjacentKey = createLandCellKey(nextX + adjacentDirection.x, nextY + adjacentDirection.y);
        return Boolean(unlockedLandCells[adjacentKey] || previewSet[adjacentKey]);
      });
      if (!touchingUnlocked) {
        return;
      }
      visited[nextKey] = true;
      queue.push({ x: nextX, y: nextY });
    });
  }

  return preview;
};

export const getWalkableGridFromState = (buildings: Building[], gridSize: number): boolean[][] => {
  const walkable = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => true));
  for (const building of buildings) {
    if (building.status === 'ACTIVE' || building.status === 'UNDER_CONSTRUCTION' || building.status === 'PENDING') {
      for (let row = building.y; row < building.y + building.sizeY; row += 1) {
        for (let col = building.x; col < building.x + building.sizeX; col += 1) {
          if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
            walkable[row][col] = false;
          }
        }
      }
    }
  }
  return walkable;
};

export const getPenInteriorCells = (pen: Building, gridSize: number): GridPoint[] => {
  const hasInnerArea = pen.sizeX > 2 && pen.sizeY > 2;
  const startX = hasInnerArea ? pen.x + 1 : pen.x;
  const startY = hasInnerArea ? pen.y + 1 : pen.y;
  const endX = hasInnerArea ? pen.x + pen.sizeX - 1 : pen.x + pen.sizeX;
  const endY = hasInnerArea ? pen.y + pen.sizeY - 1 : pen.y + pen.sizeY;
  const cells: GridPoint[] = [];
  for (let row = startY; row < endY; row += 1) {
    for (let col = startX; col < endX; col += 1) {
      if (col < 0 || row < 0 || col >= gridSize || row >= gridSize) {
        continue;
      }
      cells.push({ x: col, y: row });
    }
  }
  return cells;
};

export const getResidentWalkableGrid = (
  buildings: Building[],
  gridSize: number,
  penId: string
): boolean[][] => {
  const walkable = getWalkableGridFromState(buildings, gridSize);
  const pen = buildings.find(
    (building) => building.id === penId && building.type === BUILDING_TYPES.ARMY_MONSTER_PEN && building.status === 'ACTIVE'
  );
  if (!pen) {
    return walkable;
  }
  for (let row = pen.y; row < pen.y + pen.sizeY; row += 1) {
    for (let col = pen.x; col < pen.x + pen.sizeX; col += 1) {
      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        walkable[row][col] = true;
      }
    }
  }
  return walkable;
};

export const spendResources = (
  resources: GameResources,
  cost: Record<'twigs' | 'pebbles' | 'putty' | 'goo', number>
): GameResources => ({
  twigs: { ...resources.twigs, current: Math.max(0, resources.twigs.current - cost.twigs) },
  pebbles: { ...resources.pebbles, current: Math.max(0, resources.pebbles.current - cost.pebbles) },
  putty: { ...resources.putty, current: Math.max(0, resources.putty.current - cost.putty) },
  goo: { ...resources.goo, current: Math.max(0, resources.goo.current - cost.goo) },
});

export const ensureStarterResources = (resources: GameResources): GameResources => {
  const total = resources.twigs.current + resources.pebbles.current + resources.putty.current + resources.goo.current;
  if (total > 1) {
    return resources;
  }

  return {
    twigs: {
      ...resources.twigs,
      current: Math.min(resources.twigs.max, 650),
    },
    pebbles: {
      ...resources.pebbles,
      current: Math.min(resources.pebbles.max, 600),
    },
    putty: {
      ...resources.putty,
      current: Math.min(resources.putty.max, 380),
    },
    goo: {
      ...resources.goo,
      current: Math.min(resources.goo.max, 320),
    },
  };
};

export const DEFAULT_MONSTER_CATALOG_STATE: Record<MonsterType, MonsterRuntimeState> = {
  Pokey: { unlockState: 'UNLOCKED', level: 1 },
  Rambot: { unlockState: 'LOCKED', level: 0 },
};

export const DEFAULT_MONSTER_LEVELS: Record<MonsterType, number> = {
  Pokey: 1,
  Rambot: 0,
};

export const toCellCenter = (cell: GridPoint): { x: number; y: number } => ({
  x: cell.x + 0.5,
  y: cell.y + 0.5,
});

export const resolveResidentSpeed = (monsterType: MonsterType): number => (monsterType === 'Pokey' ? 1.1 : 0.9);

export const getRandomObstacleRespawnDelayMs = (): number => {
  const windowMs = OBSTACLE_RESPAWN_MAX_MS - OBSTACLE_RESPAWN_MIN_MS;
  return OBSTACLE_RESPAWN_MIN_MS + Math.floor(Math.random() * (windowMs + 1));
};

export const trySpawnRandomObstacle = (
  unlockedLandCells: Record<string, true>
): boolean => {
  let attempts = 0;
  while (attempts < 120) {
    attempts += 1;
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    const cellKey = createLandCellKey(x, y);
    if (!unlockedLandCells[cellKey]) {
      continue;
    }
    const isNearTownHall = x >= TOWN_HALL_SAFE_MIN && x <= TOWN_HALL_SAFE_MAX && y >= TOWN_HALL_SAFE_MIN && y <= TOWN_HALL_SAFE_MAX;
    if (isNearTownHall) {
      continue;
    }
    const obstacleType = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    const obstacleDef = ENHANCED_BUILDING_CATALOG[obstacleType];
    const placed = engine.placeBuilding({
      type: obstacleType,
      level: 1,
      x,
      y,
      sizeX: obstacleDef.size.x,
      sizeY: obstacleDef.size.y,
      hp: obstacleDef.baseHp,
      maxHp: obstacleDef.baseHp,
      status: 'ACTIVE',
      tags: ['obstacle'],
    });
    if (placed) {
      return true;
    }
  }
  return false;
};

export const resolveWorkerHomeCells = (buildings: Building[], count: number): GridPoint[] => {
  const walkable = getWalkableGridFromState(buildings, GRID_SIZE);
  const townHall = buildings.find((building) => building.type === BUILDING_TYPES.TOWN_HALL);
  if (!townHall) {
    return Array.from({ length: count }, (_, index) => ({
      x: 7 + (index % 3),
      y: 12 + Math.floor(index / 3),
    }));
  }

  const centerX = townHall.x + Math.floor(townHall.sizeX / 2);
  const centerY = townHall.y + Math.floor(townHall.sizeY / 2);
  const borderCells = getRectangleBorderCells(townHall.x, townHall.y, townHall.sizeX, townHall.sizeY, GRID_SIZE)
    .filter((cell) => walkable[cell.y]?.[cell.x] ?? false)
    .sort((left, right) => {
      const leftDist = Math.abs(left.x - centerX) + Math.abs(left.y - centerY);
      const rightDist = Math.abs(right.x - centerX) + Math.abs(right.y - centerY);
      if (leftDist !== rightDist) {
        return leftDist - rightDist;
      }
      if (left.y !== right.y) {
        return left.y - right.y;
      }
      return left.x - right.x;
    });

  if (!borderCells.length) {
    return Array.from({ length: count }, (_, index) => ({
      x: townHall.x - 1 + (index % 3),
      y: townHall.y + townHall.sizeY + Math.floor(index / 3),
    }));
  }

  return Array.from({ length: count }, (_, index) => borderCells[index % borderCells.length]);
};

export const isWithinUnlockedArea = (
  x: number,
  y: number,
  sizeX: number,
  sizeY: number,
  unlockedGridSize: number,
  unlockedLandCells?: Record<string, true>
): boolean => {
  if (unlockedLandCells && Object.keys(unlockedLandCells).length > 0) {
    for (let row = y; row < y + sizeY; row += 1) {
      for (let col = x; col < x + sizeX; col += 1) {
        if (!unlockedLandCells[createLandCellKey(col, row)]) {
          return false;
        }
      }
    }
    return true;
  }
  const offset = Math.floor((GRID_SIZE - unlockedGridSize) / 2);
  const min = offset;
  const max = offset + unlockedGridSize;
  return x >= min && y >= min && x + sizeX <= max && y + sizeY <= max;
};
