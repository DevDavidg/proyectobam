import type { StoreApi } from "zustand";
import type {
  MonsterLifecycleState,
  MonsterRuntimeState,
  MonsterType,
} from "../../core/constants/monster-catalog";
import type { GameEngine } from "../../core/engine/game-engine";
import type { Building, BuildingCategory, BuildingType } from "../../core/types/building";
import type { Enemy } from "../../core/types/enemy";
import type { GameResources } from "../../core/types/resources";
import type { RenderEntitySnapshot } from "../../ecs/systems/sync-grid-system";
import type { createEcsWorld } from "../../ecs/world/world";

export type GridPoint = {
  x: number;
  y: number;
};

export type PlacementSize = {
  sizeX: number;
  sizeY: number;
};

export type ContextMenuPosition = {
  x: number;
  y: number;
};

export type CameraCelebrationRequest = {
  buildingId: string;
  gridX: number;
  gridY: number;
  sizeX: number;
  sizeY: number;
  token: number;
};

export type Projectile = {
  id: string;
  turretId: string;
  targetEnemyId: string;
  originX: number;
  originY: number;
  targetSnapshotX: number;
  targetSnapshotY: number;
  pathType: "linear" | "arc";
  damage: number;
  splashRadius: number;
  applyDamageOnImpact: boolean;
  progress: number;
  speed: number;
};

export type ImpactVfx = {
  id: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
};

export type FloatingText = {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
};

export type ResourceOrbResourceType = "twigs" | "pebbles" | "putty" | "goo";

export type ResourceOrb = {
  id: string;
  resourceType: ResourceOrbResourceType;
  amount: number;
  sizeFactor: number;
  startX: number;
  startY: number;
  startZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  startedAt: number;
  durationMs: number;
  delayMs: number;
};

export type TrainingQueueItem = {
  monsterType: MonsterType;
  timeRemainingMs: number;
  totalTimeMs: number;
};

export type PenResident = {
  id: string;
  monsterType: MonsterType;
  lifecycleState: MonsterLifecycleState;
  penId: string;
  hatcheryId: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  path: GridPoint[];
  nextWanderAt: number;
  moving: boolean;
};

export type MonsterResearchState = {
  labId: string;
  monsterType: MonsterType;
  targetLevel: number;
  startedAt: number;
  endsAt: number;
} | null;

export type AcademyResearch = {
  monsterType: MonsterType | null;
  endTime: number | null;
  durationTotal: number;
  startedAt: number | null;
  targetLevel: number | null;
  labId: string | null;
};

export type PendingRaidSpawn = {
  spawnAt: number;
  enemy: Enemy;
};

export type BuildableType = Exclude<
  BuildingType,
  | "TOWN_HALL"
  | "PREVIEW"
  | "OBSTACLE_TREE"
  | "OBSTACLE_ROCK"
  | "OBSTACLE_MUSHROOM"
>;

export type Worker = {
  id: string;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  state: "IDLE" | "MOVING_TO_TASK" | "WORKING" | "RETURNING";
  path: GridPoint[];
  assignedBuildingId?: string;
  taskTargetX?: number;
  taskTargetY?: number;
  taskType?: "BUILD" | "CLEAR_OBSTACLE";
  taskEndsAt?: number;
};

export type WorkerBusyModalState = {
  queuedBuildingType: BuildableType;
  activeTaskBuildingId: string;
  shinyCost: number;
  remainingMs: number;
} | null;

export type GameStore = {
  engine: GameEngine;
  world: ReturnType<typeof createEcsWorld>;
  entities: RenderEntitySnapshot[];
  enemies: Enemy[];
  projectiles: Projectile[];
  impacts: ImpactVfx[];
  floatingTexts: FloatingText[];
  resourceOrbs: ResourceOrb[];
  resources: GameResources;
  shiny: number;
  workers: Worker[];
  workersTotal: number;
  landLevel: number;
  maxLandLevel: number;
  unlockedGridSize: number;
  unlockedLandCells: Record<string, true>;
  landExpansionPreview: GridPoint[];
  landExpansionMode: boolean;
  damageTimestamps: Record<string, number>;
  turretCooldownById: Record<string, number>;
  freeBuildMode: boolean;
  developerModeEnabled: boolean;
  battleMode: boolean;
  selectedArmyMonster: MonsterType | null;
  hatcheryModalBuildingId: string | null;
  hatcheryTrainingQueues: Record<string, TrainingQueueItem[]>;
  armyInventory: Record<MonsterType, number>;
  monsterCatalogState: Record<MonsterType, MonsterRuntimeState>;
  monsterLevels: Record<MonsterType, number>;
  activeResearch: AcademyResearch;
  armySpaceUsed: number;
  maxArmySpace: number;
  penResidents: PenResident[];
  nextResidentId: number;
  battleExclusion: { minX: number; minY: number; maxX: number; maxY: number };
  pendingRaidSpawns: PendingRaidSpawn[];
  battleHasStarted: boolean;
  battleResult: "VICTORY" | "DEFEAT" | null;
  selectedBuildingId: string | null;
  buildingContextMenuPosition: ContextMenuPosition | null;
  buildingInfoPanelOpen: boolean;
  openBuildingInfoPanel: () => void;
  closeBuildingInfoPanel: () => void;
  activePenMenuBuildingId: string | null;
  housingDetailsPenId: string | null;
  movingBuildingId: string | null;
  movingBuildingOrigin: { x: number; y: number } | null;
  penHousingSettings: Record<
    string,
    { name: string; priority: "ANY" | MonsterType }
  >;
  hoveredBuildingId: string | null;
  selectedBuildingType: BuildableType;
  activeBuildTab: BuildingCategory;
  shopOpen: boolean;
  workerBusyModal: WorkerBusyModalState;
  queuedMonsters: string[];
  enemyCount: number;
  projectileCount: number;
  activeCell: { x: number; y: number } | null;
  placementValid: boolean;
  placementEnabled: boolean;
  placementSize: PlacementSize;
  lastResourceTick: number;
  lastCombatTick: number;
  lastConstructionTick: number;
  lastHatcheryTick: number;
  nextObstacleRespawnAt: number;
  cameraCelebration: CameraCelebrationRequest | null;
  requestCameraCelebration: (building: Building) => void;
  clearCameraCelebration: () => void;
  refreshEcs: () => void;
  recalculateMaxCapacities: () => void;
  tickResources: () => void;
  tickCombat: () => void;
  tickConstruction: () => void;
  tickHatcheries: () => void;
  tickMonsterResearch: () => void;
  tickPenResidents: () => void;
  tickProjectiles: (deltaSeconds: number) => void;
  tickEffects: (deltaSeconds: number) => void;
  setActiveCell: (x: number, y: number) => void;
  clearActiveCell: () => void;
  togglePlacementMode: () => void;
  cancelPlacementMode: () => void;
  toggleFreeBuildMode: () => void;
  toggleDeveloperMode: () => void;
  resetProgress: () => void;
  toggleBattleMode: () => void;
  startRaid: () => void;
  closeBattleResult: () => void;
  setShopOpen: (open: boolean) => void;
  openPenHousingMenu: (buildingId: string) => void;
  closePenHousingMenu: () => void;
  openHousingDetailsModal: (buildingId: string) => void;
  closeHousingDetailsModal: () => void;
  startMovingBuilding: (buildingId: string) => void;
  confirmMovingBuilding: () => void;
  cancelMovingBuilding: () => void;
  setPenHousingSettings: (
    buildingId: string,
    settings: { name: string; priority: "ANY" | MonsterType },
  ) => void;
  openBuildingContextMenu: (
    buildingId: string,
    position?: ContextMenuPosition,
  ) => void;
  closeBuildingContextMenu: () => void;
  setHoveredBuildingId: (buildingId: string | null) => void;
  upgradeSelectedBuilding: () => void;
  repairSelectedBuilding: () => void;
  fortifySelectedBuilding: () => void;
  recycleSelectedBuilding: () => void;
  setSelectedArmyMonster: (monsterType: MonsterType | null) => void;
  openHatcheryModal: (buildingId: string) => void;
  closeHatcheryModal: () => void;
  queueMonsterTraining: (monsterType: MonsterType) => void;
  startMonsterUpgrade: (monsterType: MonsterType) => boolean;
  startMonsterResearch: (labId: string, monsterType: MonsterType) => void;
  instantFinishMonsterResearch: () => void;
  deploySelectedMonster: () => void;
  setSelectedBuildingType: (buildingType: BuildableType) => void;
  setActiveBuildTab: (tab: BuildingCategory) => void;
  placeSelectedBuilding: () => void;
  dismissWorkerBusyModal: () => void;
  instantFinishBuildingWithShiny: (buildingId: string) => void;
  buyWorker: () => void;
  buyLandExpansion: () => void;
  startLandExpansionMode: () => void;
  cancelLandExpansionMode: () => void;
  confirmLandExpansionAtActiveCell: () => void;
  refreshLandExpansionPreview: () => void;
  spawnEnemy: () => void;
  collectFromCollector: (collectorId: string) => void;
  collectAllCollectors: () => void;
  pruneExpiredResourceOrbs: () => void;
  clearObstacle: (obstacleId: string) => void;
};

export type GameStoreSet = StoreApi<GameStore>["setState"];
export type GameStoreGet = () => GameStore;
