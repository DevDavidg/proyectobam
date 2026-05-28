import type { Building } from '../../core/types/building';
import type { Enemy } from '../../core/types/enemy';
import {
  type EcsEntity,
  EntityType,
  type EntityTypeValue,
} from '../components/components';
import type { EcsWorld } from '../world/world';

type PlacementPreview = {
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
  valid: boolean;
} | null;

export type RenderEntitySnapshot = {
  id: number;
  sourceId?: string;
  sourceType?: string;
  level: number;
  status?: string;
  constructionProgress?: number;
  kind: EntityTypeValue;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
  hp?: number;
  maxHp?: number;
  range?: number;
  damage?: number;
  valid?: boolean;
};

const PREVIEW_KEY = '__preview__';
const stableIdByKey = new Map<string, number>();
const previousEntityByKey = new Map<string, RenderEntitySnapshot>();
let previousSnapshotArray: RenderEntitySnapshot[] = [];
let nextStableId = 1;

const getStableId = (key: string): number => {
  const cached = stableIdByKey.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const allocated = nextStableId;
  nextStableId += 1;
  stableIdByKey.set(key, allocated);
  return allocated;
};

const buildKey = (kind: 'building' | 'enemy' | 'preview', sourceId: string): string => `${kind}:${sourceId}`;

const resolveEntityType = (buildingType: Building['type']): EntityTypeValue => {
  if (buildingType === 'TOWN_HALL') return EntityType.TOWN_HALL;
  if (buildingType === 'DEFENSE_WALL_WOOD' || buildingType === 'DEFENSE_WALL_STONE' || buildingType === 'DEFENSE_WALL_IRON') {
    return EntityType.WALL;
  }
  if (buildingType === 'DEFENSE_TURRET_RAPID') return EntityType.TURRET;
  if (buildingType === 'DEFENSE_LASER_TOWER') return EntityType.TURRET;
  if (buildingType === 'DEFENSE_MORTAR') return EntityType.MORTAR;
  if (buildingType === 'RESOURCE_TWIG_COLLECTOR') return EntityType.GOLD_COLLECTOR;
  if (buildingType === 'RESOURCE_GOO_COLLECTOR') return EntityType.GOO_COLLECTOR;
  if (buildingType === 'RESOURCE_PEBBLE_COLLECTOR') return EntityType.PEBBLE_COLLECTOR;
  if (buildingType === 'RESOURCE_PUTTY_COLLECTOR') return EntityType.PUTTY_COLLECTOR;
  if (buildingType === 'RESOURCE_WOOD_SILO' || buildingType === 'RESOURCE_STONE_SILO') return EntityType.STORAGE;
  if (buildingType === 'ARMY_HATCHERY') return EntityType.HATCHERY;
  if (buildingType === 'ARMY_MONSTER_PEN') return EntityType.PEN;
  if (buildingType === 'OBSTACLE_TREE' || buildingType === 'OBSTACLE_ROCK' || buildingType === 'OBSTACLE_MUSHROOM') return EntityType.OBSTACLE;
  return EntityType.DECOR;
};

const computeConstructionProgress = (building: Building): number => {
  if (
    building.status === 'UNDER_CONSTRUCTION' &&
    building.buildStartedAt &&
    building.buildEndsAt
  ) {
    const totalDuration = Math.max(1, building.buildEndsAt - building.buildStartedAt);
    const elapsed = Date.now() - building.buildStartedAt;
    return Math.max(0, Math.min(1, elapsed / totalDuration));
  }
  if (building.status === 'ACTIVE') {
    return 1;
  }
  return 0;
};

const areEntitiesEquivalent = (left: RenderEntitySnapshot, right: RenderEntitySnapshot): boolean => {
  return (
    left.id === right.id &&
    left.kind === right.kind &&
    left.level === right.level &&
    left.status === right.status &&
    left.constructionProgress === right.constructionProgress &&
    left.x === right.x &&
    left.y === right.y &&
    left.sizeX === right.sizeX &&
    left.sizeY === right.sizeY &&
    left.hp === right.hp &&
    left.maxHp === right.maxHp &&
    left.range === right.range &&
    left.damage === right.damage &&
    left.valid === right.valid &&
    left.sourceId === right.sourceId &&
    left.sourceType === right.sourceType
  );
};

const reuseOrCreateEntity = (key: string, candidate: RenderEntitySnapshot): RenderEntitySnapshot => {
  const previous = previousEntityByKey.get(key);
  if (previous && areEntitiesEquivalent(previous, candidate)) {
    return previous;
  }
  previousEntityByKey.set(key, candidate);
  return candidate;
};

const buildBuildingEntity = (building: Building): RenderEntitySnapshot => {
  const key = buildKey('building', building.id);
  const stableId = getStableId(key);
  const candidate: RenderEntitySnapshot = {
    id: stableId,
    sourceId: building.id,
    sourceType: building.type,
    level: building.level,
    status: building.status,
    constructionProgress: computeConstructionProgress(building),
    kind: resolveEntityType(building.type),
    x: building.x,
    y: building.y,
    sizeX: building.sizeX,
    sizeY: building.sizeY,
    hp: building.hp,
    maxHp: building.maxHp,
    range: building.range,
    damage: building.damage,
  };
  return reuseOrCreateEntity(key, candidate);
};

const buildPreviewEntity = (preview: NonNullable<PlacementPreview>): RenderEntitySnapshot => {
  const key = buildKey('preview', PREVIEW_KEY);
  const stableId = getStableId(key);
  const candidate: RenderEntitySnapshot = {
    id: stableId,
    kind: EntityType.PREVIEW,
    level: 1,
    x: preview.x,
    y: preview.y,
    sizeX: preview.sizeX,
    sizeY: preview.sizeY,
    valid: preview.valid,
  };
  return reuseOrCreateEntity(key, candidate);
};

const buildEnemyEntity = (enemy: Enemy): RenderEntitySnapshot => {
  const key = buildKey('enemy', enemy.id);
  const stableId = getStableId(key);
  const candidate: RenderEntitySnapshot = {
    id: stableId,
    kind: EntityType.ENEMY,
    level: 1,
    x: enemy.x,
    y: enemy.y,
    sizeX: 1,
    sizeY: 1,
    sourceId: enemy.id,
    hp: enemy.hp,
    maxHp: enemy.maxHp,
  };
  return reuseOrCreateEntity(key, candidate);
};

const pruneOrphanEntries = (currentKeys: Set<string>): void => {
  for (const cachedKey of Array.from(previousEntityByKey.keys())) {
    if (!currentKeys.has(cachedKey)) {
      previousEntityByKey.delete(cachedKey);
    }
  }
};

const arraysAreReferenceEqual = (left: RenderEntitySnapshot[], right: RenderEntitySnapshot[]): boolean => {
  if (left === right) {
    return true;
  }
  if (left.length !== right.length) {
    return false;
  }
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }
  return true;
};

const syncWorldMembership = (world: EcsWorld, entities: RenderEntitySnapshot[]): void => {
  world.clear();
  for (const entity of entities) {
    world.add(entity as EcsEntity);
  }
};

export const syncGridSystem = (
  world: EcsWorld,
  buildings: Building[],
  preview: PlacementPreview,
  enemies: Enemy[]
): RenderEntitySnapshot[] => {
  const currentKeys = new Set<string>();
  const nextEntities: RenderEntitySnapshot[] = [];

  for (const building of buildings) {
    const key = buildKey('building', building.id);
    currentKeys.add(key);
    nextEntities.push(buildBuildingEntity(building));
  }

  if (preview) {
    const key = buildKey('preview', PREVIEW_KEY);
    currentKeys.add(key);
    nextEntities.push(buildPreviewEntity(preview));
  }

  for (const enemy of enemies) {
    const key = buildKey('enemy', enemy.id);
    currentKeys.add(key);
    nextEntities.push(buildEnemyEntity(enemy));
  }

  pruneOrphanEntries(currentKeys);

  if (arraysAreReferenceEqual(previousSnapshotArray, nextEntities)) {
    return previousSnapshotArray;
  }

  previousSnapshotArray = nextEntities;
  syncWorldMembership(world, nextEntities);
  return nextEntities;
};

export const resetSyncGridSystemCache = (): void => {
  stableIdByKey.clear();
  previousEntityByKey.clear();
  previousSnapshotArray = [];
  nextStableId = 1;
};
