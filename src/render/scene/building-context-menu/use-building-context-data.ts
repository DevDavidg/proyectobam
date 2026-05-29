import { getInstantFinishShinyCost } from '../../../core/constants/build-rules';
import { ENHANCED_BUILDING_CATALOG } from '../../../core/constants/catalog';
import {
  computeGooCollectorBuffer,
  getGooFactoryLevelSpec,
  getGooFactoryMaxLevel,
} from '../../../core/constants/goo-factory-catalog';
import {
  computePebbleShinerBuffer,
  getPebbleShinerLevelSpec,
  getPebbleShinerMaxLevel,
} from '../../../core/constants/pebble-shiner-catalog';
import {
  computePuttySquisherBuffer,
  getPuttySquisherLevelSpec,
  getPuttySquisherMaxLevel,
} from '../../../core/constants/putty-squisher-catalog';
import { getCannonTowerLevelSpec, getCannonTowerMaxLevel } from '../../../core/constants/cannon-tower-catalog';
import { getLaserTowerLevelSpec, getLaserTowerMaxLevel } from '../../../core/constants/laser-tower-catalog';
import {
  getMonsterAcademyLevelSpec,
  getMonsterAcademyMaxLevel,
} from '../../../core/constants/monster-academy-catalog';
import { getSniperTowerLevelSpec, getSniperTowerMaxLevel } from '../../../core/constants/sniper-tower-catalog';
import {
  getStorageSiloLevelSpec,
  getStorageSiloMaxLevel,
} from '../../../core/constants/storage-silo-catalog';
import {
  computeTwigSnapperBuffer,
  getTwigSnapperLevelSpec,
  getTwigSnapperMaxLevel,
} from '../../../core/constants/twig-snapper-catalog';
import { BUILDING_TYPES, type Building } from '../../../core/types/building';
import { isUnrestrictedMode } from '../../../state/game-store/helpers';
import type { GameStore } from '../../../state/game-store/types';
import { BUILDING_DESCRIPTIONS } from './building-descriptions';

export type BuildingContextData = {
  building: Building;
  townHall: Building;
  nextLevel: number;
  isTwigSnapper: boolean;
  isGooFactory: boolean;
  isPebbleShiner: boolean;
  isPuttySquisher: boolean;
  isStorageSilo: boolean;
  isFixedHarvester: boolean;
  isCollector: boolean;
  twigBuffer: ReturnType<typeof computeTwigSnapperBuffer> | null;
  gooBuffer: ReturnType<typeof computeGooCollectorBuffer> | null;
  pebbleBuffer: ReturnType<typeof computePebbleShinerBuffer> | null;
  puttyBuffer: ReturnType<typeof computePuttySquisherBuffer> | null;
  canCollectTwigs: boolean;
  canCollectGoo: boolean;
  canCollectPebbles: boolean;
  canCollectPutty: boolean;
  canMoveBuilding: boolean;
  isMonsterAcademy: boolean;
  isObstacle: boolean;
  canRecycleMonsterAcademy: boolean;
  canRecycleObstacle: boolean;
  canOpenMonsterAcademy: boolean;
  buildingName: string;
  hasCatalogEntry: boolean;
  description: string;
  upgradeCost: { twigs: number; pebbles: number; putty: number; goo: number };
  repairCost: { twigs: number; pebbles: number; putty: number; goo: number };
  fortifyCost: { twigs: number; pebbles: number; putty: number; goo: number };
  missingRatio: number;
  isBuildingDamaged: boolean;
  isMaxTownHallLevel: boolean;
  isTwigSnapperMaxLevel: boolean;
  isGooFactoryMaxLevel: boolean;
  isPebbleShinerMaxLevel: boolean;
  isPuttySquisherMaxLevel: boolean;
  isStorageSiloMaxLevel: boolean;
  isSniperTowerMaxLevel: boolean;
  isLaserTowerMaxLevel: boolean;
  isCannonTowerMaxLevel: boolean;
  isMonsterAcademyMaxLevel: boolean;
  requiredTownHallLevel: number;
  requiredMonsterPenLevel: number | null;
  highestMonsterPenLevel: number;
  meetsMonsterPenRequirement: boolean;
  canUpgradeTownHall: boolean;
  canUpgradeResources: boolean;
  canRepairResources: boolean;
  canUseFortify: boolean;
  canFortifyMore: boolean;
  canFortifyResources: boolean;
  fortificationLevel: number;
  currentProductionPerHour: number;
  nextProductionPerHour: number;
  currentCapacity: number | null;
  nextCapacity: number | null;
  currentStorageCapacity: number | null;
  nextStorageCapacity: number | null;
  estimatedUpgradeDurationMs: number;
  estimatedRepairDurationMs: number;
  remainingMs: number;
  instantFinishCost: number;
  hasUnlimitedShiny: boolean;
  canInstantFinish: boolean;
  isResearchLab: boolean;
  researchRemainingMs: number;
  researchFinishCost: number;
  canFinishResearch: boolean;
  unrestrictedMode: boolean;
  totalPendingResources: {
    twigs: number;
    pebbles: number;
    putty: number;
    goo: number;
  };
};

type StoreSnapshot = Pick<
  GameStore,
  | 'engine'
  | 'lastResourceTick'
  | 'activeResearch'
  | 'shiny'
  | 'developerModeEnabled'
  | 'resources'
  | 'freeBuildMode'
  | 'hatcheryTrainingQueues'
>;

export const buildBuildingContextData = (
  selectedBuildingId: string,
  store: StoreSnapshot,
): BuildingContextData | null => {
  const engineState = store.engine.getState();
  const building = engineState.buildings.find((item) => item.id === selectedBuildingId);
  const townHall = engineState.buildings.find((item) => item.type === BUILDING_TYPES.TOWN_HALL);
  if (!building || !townHall) {
    return null;
  }

  const nextLevel = building.level + 1;
  const isTwigSnapper = building.type === BUILDING_TYPES.RESOURCE_TWIG_COLLECTOR;
  const isGooFactory = building.type === BUILDING_TYPES.RESOURCE_GOO_COLLECTOR;
  const isPebbleShiner = building.type === BUILDING_TYPES.RESOURCE_PEBBLE_COLLECTOR;
  const isPuttySquisher = building.type === BUILDING_TYPES.RESOURCE_PUTTY_COLLECTOR;
  const isStorageSilo =
    building.type === BUILDING_TYPES.RESOURCE_WOOD_SILO || building.type === BUILDING_TYPES.RESOURCE_STONE_SILO;
  const isSniperTower = building.type === BUILDING_TYPES.DEFENSE_TURRET_RAPID;
  const isLaserTower = building.type === BUILDING_TYPES.DEFENSE_LASER_TOWER;
  const isCannonTower = building.type === BUILDING_TYPES.DEFENSE_MORTAR;
  const isMonsterAcademy = building.type === BUILDING_TYPES.ARMY_HATCHERY;
  const isObstacle = building.tags?.includes('obstacle') ?? false;
  const isFixedHarvester = isTwigSnapper || isGooFactory || isPebbleShiner || isPuttySquisher;
  const isCollector = isFixedHarvester;

  const harvestReference = Math.max(store.lastResourceTick, building.lastHarvested ?? 0);
  const twigBuffer = isTwigSnapper ? computeTwigSnapperBuffer(building, harvestReference) : null;
  const gooBuffer = isGooFactory ? computeGooCollectorBuffer(building, harvestReference) : null;
  const pebbleBuffer = isPebbleShiner ? computePebbleShinerBuffer(building, harvestReference) : null;
  const puttyBuffer = isPuttySquisher ? computePuttySquisherBuffer(building, harvestReference) : null;

  const isActive = building.status === 'ACTIVE';
  const canCollectTwigs = !!twigBuffer && twigBuffer.amount > 0 && isActive;
  const canCollectGoo = !!gooBuffer && gooBuffer.amount > 0 && isActive;
  const canCollectPebbles = !!pebbleBuffer && pebbleBuffer.amount > 0 && isActive;
  const canCollectPutty = !!puttyBuffer && puttyBuffer.amount > 0 && isActive;

  const canMoveBuilding =
    isActive && building.type !== BUILDING_TYPES.TOWN_HALL && !building.tags?.includes('obstacle');
  const isMonsterAcademyBusy =
    isMonsterAcademy &&
    ((store.hatcheryTrainingQueues[building.id]?.length ?? 0) > 0 ||
      (store.activeResearch.labId === building.id && !!store.activeResearch.monsterType));
  const resolvedCanMoveBuilding = isMonsterAcademy ? canMoveBuilding && !isMonsterAcademyBusy : canMoveBuilding;
  const canRecycleMonsterAcademy = isMonsterAcademy && isActive && building.hp > 0 && !isMonsterAcademyBusy;
  const canRecycleObstacle = isObstacle && building.status === 'ACTIVE';
  const canOpenMonsterAcademy = isMonsterAcademy && isActive && building.hp > 0;

  const buildingCatalogEntry = ENHANCED_BUILDING_CATALOG[building.type];
  const baseCost = buildingCatalogEntry?.cost ?? { twigs: 0, pebbles: 0, putty: 0, goo: 0 };
  const buildingName = buildingCatalogEntry?.name ?? building.type;
  const hasCatalogEntry = !!buildingCatalogEntry;

  const currentTwigSnapperSpec = isTwigSnapper ? getTwigSnapperLevelSpec(building.level) : null;
  const nextTwigSnapperSpec = isTwigSnapper ? getTwigSnapperLevelSpec(nextLevel) : null;
  const currentGooFactorySpec = isGooFactory ? getGooFactoryLevelSpec(building.level) : null;
  const nextGooFactorySpec = isGooFactory ? getGooFactoryLevelSpec(nextLevel) : null;
  const currentPebbleShinerSpec = isPebbleShiner ? getPebbleShinerLevelSpec(building.level) : null;
  const nextPebbleShinerSpec = isPebbleShiner ? getPebbleShinerLevelSpec(nextLevel) : null;
  const currentPuttySquisherSpec = isPuttySquisher ? getPuttySquisherLevelSpec(building.level) : null;
  const nextPuttySquisherSpec = isPuttySquisher ? getPuttySquisherLevelSpec(nextLevel) : null;
  const currentStorageSiloSpec = isStorageSilo ? getStorageSiloLevelSpec(building.level) : null;
  const nextStorageSiloSpec = isStorageSilo ? getStorageSiloLevelSpec(nextLevel) : null;
  const currentSniperTowerSpec = isSniperTower ? getSniperTowerLevelSpec(building.level) : null;
  const nextSniperTowerSpec = isSniperTower ? getSniperTowerLevelSpec(nextLevel) : null;
  const currentLaserTowerSpec = isLaserTower ? getLaserTowerLevelSpec(building.level) : null;
  const nextLaserTowerSpec = isLaserTower ? getLaserTowerLevelSpec(nextLevel) : null;
  const currentCannonTowerSpec = isCannonTower ? getCannonTowerLevelSpec(building.level) : null;
  const nextCannonTowerSpec = isCannonTower ? getCannonTowerLevelSpec(nextLevel) : null;
  const currentMonsterAcademySpec = isMonsterAcademy ? getMonsterAcademyLevelSpec(building.level) : null;
  const nextMonsterAcademySpec = isMonsterAcademy ? getMonsterAcademyLevelSpec(nextLevel) : null;

  const isTwigSnapperMaxLevel = isTwigSnapper && building.level >= getTwigSnapperMaxLevel();
  const isGooFactoryMaxLevel = isGooFactory && building.level >= getGooFactoryMaxLevel();
  const isPebbleShinerMaxLevel = isPebbleShiner && building.level >= getPebbleShinerMaxLevel();
  const isPuttySquisherMaxLevel = isPuttySquisher && building.level >= getPuttySquisherMaxLevel();
  const isStorageSiloMaxLevel = isStorageSilo && building.level >= getStorageSiloMaxLevel();
  const isSniperTowerMaxLevel = isSniperTower && building.level >= getSniperTowerMaxLevel();
  const isLaserTowerMaxLevel = isLaserTower && building.level >= getLaserTowerMaxLevel();
  const isCannonTowerMaxLevel = isCannonTower && building.level >= getCannonTowerMaxLevel();
  const isMonsterAcademyMaxLevel = isMonsterAcademy && building.level >= getMonsterAcademyMaxLevel();
  const isMaxTownHallLevel = building.type === BUILDING_TYPES.TOWN_HALL && building.level >= 20;

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
        nextMonsterAcademySpec?.requiredTownHallLevel ??
        nextLevel;
  const highestMonsterPenLevel = engineState.buildings
    .filter((item) => item.type === BUILDING_TYPES.ARMY_MONSTER_PEN)
    .reduce((maxLevel, item) => Math.max(maxLevel, item.level), 0);
  const requiredMonsterPenLevel = nextMonsterAcademySpec?.requiredMonsterPenLevel ?? null;
  const meetsMonsterPenRequirement = requiredMonsterPenLevel === null || highestMonsterPenLevel >= requiredMonsterPenLevel;

  const fallbackUpgradeCost = {
    twigs: Math.round(baseCost.twigs * (1 + nextLevel * 0.55)),
    pebbles: Math.round(baseCost.pebbles * (1 + nextLevel * 0.55)),
    putty: Math.round(baseCost.putty * (1 + nextLevel * 0.55)),
    goo: Math.round(baseCost.goo * (1 + nextLevel * 0.55)),
  };
  const upgradeCost =
    nextTwigSnapperSpec?.upgradeCost ??
    nextGooFactorySpec?.upgradeCost ??
    nextPebbleShinerSpec?.upgradeCost ??
    nextPuttySquisherSpec?.upgradeCost ??
    nextStorageSiloSpec?.upgradeCost ??
    nextSniperTowerSpec?.upgradeCost ??
    nextLaserTowerSpec?.upgradeCost ??
    nextCannonTowerSpec?.upgradeCost ??
    nextMonsterAcademySpec?.upgradeCost ??
    fallbackUpgradeCost;

  const missingRatio = 1 - building.hp / Math.max(1, building.maxHp);
  const repairCost = {
    twigs: Math.round(baseCost.twigs * missingRatio * 0.45),
    pebbles: Math.round(baseCost.pebbles * missingRatio * 0.45),
    putty: Math.round(baseCost.putty * missingRatio * 0.45),
    goo: Math.round(baseCost.goo * missingRatio * 0.45),
  };

  const fortificationLevel = building.fortificationLevel ?? 0;
  const fortifyCost = {
    twigs: Math.round(500 + baseCost.twigs * (fortificationLevel + 1) * 4),
    pebbles: Math.round(500 + baseCost.pebbles * (fortificationLevel + 1) * 4),
    putty: Math.round(220 + baseCost.putty * (fortificationLevel + 1) * 3),
    goo: Math.round(180 + baseCost.goo * (fortificationLevel + 1) * 3),
  };

  const isBuildingDamaged = building.hp < building.maxHp;
  const unrestricted = isUnrestrictedMode(store);
  const canUpgradeTownHall =
    unrestricted ||
    (hasCatalogEntry &&
      !isMaxTownHallLevel &&
      !isTwigSnapperMaxLevel &&
      !isGooFactoryMaxLevel &&
      !isPebbleShinerMaxLevel &&
      !isPuttySquisherMaxLevel &&
      !isStorageSiloMaxLevel &&
      !isSniperTowerMaxLevel &&
      !isLaserTowerMaxLevel &&
      !isCannonTowerMaxLevel &&
      !isMonsterAcademyMaxLevel &&
      townHall.level >= requiredTownHallLevel &&
      meetsMonsterPenRequirement);

  const canUpgradeResources =
    unrestricted ||
    (store.resources.twigs.current >= upgradeCost.twigs &&
      store.resources.pebbles.current >= upgradeCost.pebbles &&
      store.resources.putty.current >= upgradeCost.putty &&
      store.resources.goo.current >= upgradeCost.goo);
  const canRepairResources =
    unrestricted ||
    (store.resources.twigs.current >= repairCost.twigs &&
      store.resources.pebbles.current >= repairCost.pebbles &&
      store.resources.putty.current >= repairCost.putty &&
      store.resources.goo.current >= repairCost.goo);
  const canFortifyResources =
    unrestricted ||
    (store.resources.twigs.current >= fortifyCost.twigs &&
      store.resources.pebbles.current >= fortifyCost.pebbles &&
      store.resources.putty.current >= fortifyCost.putty &&
      store.resources.goo.current >= fortifyCost.goo);

  const canUseFortify = building.type === BUILDING_TYPES.TOWN_HALL && (unrestricted || townHall.level >= 5);
  const canFortifyMore = unrestricted || fortificationLevel < 3;

  const description = BUILDING_DESCRIPTIONS[building.type] ?? 'Mejora esta construccion para aumentar su rendimiento y durabilidad.';
  const currentProductionPerHour = Math.round(
    (building.productionPerMs ?? buildingCatalogEntry?.production?.ratePerMs ?? 0) * 60 * 60 * 1000,
  );
  const nextProductionPerHour = nextTwigSnapperSpec
    ? nextTwigSnapperSpec.productionPerHour
    : nextGooFactorySpec
      ? nextGooFactorySpec.productionPerHour
      : nextPebbleShinerSpec
        ? nextPebbleShinerSpec.productionPerHour
        : nextPuttySquisherSpec
          ? nextPuttySquisherSpec.productionPerHour
          : Math.round((building.productionPerMs ?? buildingCatalogEntry?.production?.ratePerMs ?? 0) * 1.2 * 60 * 60 * 1000);

  const currentStorageCapacity = currentStorageSiloSpec?.capacityPerResource ?? null;
  const nextStorageCapacity = nextStorageSiloSpec?.capacityPerResource ?? null;
  const currentCapacity =
    currentTwigSnapperSpec?.capacity ??
    currentGooFactorySpec?.capacity ??
    currentPebbleShinerSpec?.capacity ??
    currentPuttySquisherSpec?.capacity ??
    null;
  const nextCapacity =
    nextTwigSnapperSpec?.capacity ??
    nextGooFactorySpec?.capacity ??
    nextPebbleShinerSpec?.capacity ??
    nextPuttySquisherSpec?.capacity ??
    null;

  const estimatedUpgradeDurationMs =
    nextTwigSnapperSpec?.buildTimeMs ??
    nextGooFactorySpec?.buildTimeMs ??
    nextPebbleShinerSpec?.buildTimeMs ??
    nextPuttySquisherSpec?.buildTimeMs ??
    nextStorageSiloSpec?.buildTimeMs ??
    nextSniperTowerSpec?.buildTimeMs ??
    nextLaserTowerSpec?.buildTimeMs ??
    nextCannonTowerSpec?.buildTimeMs ??
    nextMonsterAcademySpec?.buildTimeMs ??
    12000 + nextLevel * 2500;
  const estimatedRepairDurationMs =
    currentTwigSnapperSpec?.repairTimeMs ??
    currentGooFactorySpec?.repairTimeMs ??
    currentPebbleShinerSpec?.repairTimeMs ??
    currentPuttySquisherSpec?.repairTimeMs ??
    currentStorageSiloSpec?.repairTimeMs ??
    currentSniperTowerSpec?.repairTimeMs ??
    currentLaserTowerSpec?.repairTimeMs ??
    currentCannonTowerSpec?.repairTimeMs ??
    currentMonsterAcademySpec?.repairTimeMs ??
    6000;

  const remainingMs = Math.max(0, (building.buildEndsAt ?? 0) - Date.now());
  const instantFinishCost = getInstantFinishShinyCost(remainingMs);
  const hasUnlimitedShiny = unrestricted;
  const canInstantFinish = remainingMs > 0 && (hasUnlimitedShiny || store.shiny >= instantFinishCost);

  const isResearchLab =
    building.type === BUILDING_TYPES.ARMY_HATCHERY && store.activeResearch.labId === building.id;
  const researchRemainingMs = isResearchLab && store.activeResearch.endTime
    ? Math.max(0, store.activeResearch.endTime - Date.now())
    : 0;
  const researchFinishCost = getInstantFinishShinyCost(researchRemainingMs);
  const canFinishResearch = isResearchLab && (hasUnlimitedShiny || store.shiny >= researchFinishCost);

  const totalPendingResources = computeTotalPendingResources(engineState.buildings, harvestReference);

  return {
    building,
    townHall,
    nextLevel,
    isTwigSnapper,
    isGooFactory,
    isPebbleShiner,
    isPuttySquisher,
    isStorageSilo,
    isFixedHarvester,
    isCollector,
    twigBuffer,
    gooBuffer,
    pebbleBuffer,
    puttyBuffer,
    canCollectTwigs,
    canCollectGoo,
    canCollectPebbles,
    canCollectPutty,
    canMoveBuilding: resolvedCanMoveBuilding,
    isMonsterAcademy,
    isObstacle,
    canRecycleMonsterAcademy,
    canRecycleObstacle,
    canOpenMonsterAcademy,
    buildingName,
    hasCatalogEntry,
    description,
    upgradeCost,
    repairCost,
    fortifyCost,
    missingRatio,
    isBuildingDamaged,
    isMaxTownHallLevel,
    isTwigSnapperMaxLevel,
    isGooFactoryMaxLevel,
    isPebbleShinerMaxLevel,
    isPuttySquisherMaxLevel,
    isStorageSiloMaxLevel,
    isSniperTowerMaxLevel,
    isLaserTowerMaxLevel,
    isCannonTowerMaxLevel,
    isMonsterAcademyMaxLevel,
    requiredTownHallLevel,
    requiredMonsterPenLevel,
    highestMonsterPenLevel,
    meetsMonsterPenRequirement,
    canUpgradeTownHall,
    canUpgradeResources,
    canRepairResources,
    canUseFortify,
    canFortifyMore,
    canFortifyResources,
    fortificationLevel,
    currentProductionPerHour,
    nextProductionPerHour,
    currentCapacity,
    nextCapacity,
    currentStorageCapacity,
    nextStorageCapacity,
    estimatedUpgradeDurationMs,
    estimatedRepairDurationMs,
    remainingMs,
    instantFinishCost,
    hasUnlimitedShiny,
    canInstantFinish,
    isResearchLab,
    researchRemainingMs,
    researchFinishCost,
    canFinishResearch,
    unrestrictedMode: unrestricted,
    totalPendingResources,
  };
};

const computeTotalPendingResources = (
  buildings: Building[],
  harvestReference: number,
): { twigs: number; pebbles: number; putty: number; goo: number } => {
  const totals = { twigs: 0, pebbles: 0, putty: 0, goo: 0 };
  for (const item of buildings) {
    if (item.status !== 'ACTIVE') {
      continue;
    }
    const reference = Math.max(harvestReference, item.lastHarvested ?? 0);
    if (item.type === BUILDING_TYPES.RESOURCE_TWIG_COLLECTOR) {
      totals.twigs += computeTwigSnapperBuffer(item, reference).amount;
    } else if (item.type === BUILDING_TYPES.RESOURCE_PEBBLE_COLLECTOR) {
      totals.pebbles += computePebbleShinerBuffer(item, reference).amount;
    } else if (item.type === BUILDING_TYPES.RESOURCE_PUTTY_COLLECTOR) {
      totals.putty += computePuttySquisherBuffer(item, reference).amount;
    } else if (item.type === BUILDING_TYPES.RESOURCE_GOO_COLLECTOR) {
      totals.goo += computeGooCollectorBuffer(item, reference).amount;
    }
  }
  return totals;
};
