import { Html } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { Vector3, type Camera, type Object3D } from 'three';
import { formatDurationMs, getInstantFinishShinyCost } from '../../core/constants/build-rules';
import { ENHANCED_BUILDING_CATALOG } from '../../core/constants/catalog';
import { getGooFactoryLevelSpec, getGooFactoryMaxLevel } from '../../core/constants/goo-factory-catalog';
import { getPebbleShinerLevelSpec, getPebbleShinerMaxLevel } from '../../core/constants/pebble-shiner-catalog';
import { getPuttySquisherLevelSpec, getPuttySquisherMaxLevel } from '../../core/constants/putty-squisher-catalog';
import { getCannonTowerLevelSpec, getCannonTowerMaxLevel } from '../../core/constants/cannon-tower-catalog';
import { getLaserTowerLevelSpec, getLaserTowerMaxLevel } from '../../core/constants/laser-tower-catalog';
import { getSniperTowerLevelSpec, getSniperTowerMaxLevel } from '../../core/constants/sniper-tower-catalog';
import { getStorageSiloCapacity, getStorageSiloLevelSpec, getStorageSiloMaxLevel } from '../../core/constants/storage-silo-catalog';
import {
  getTwigSnapperLevelSpec,
  getTwigSnapperMaxLevel,
} from '../../core/constants/twig-snapper-catalog';
import { BUILDING_TYPES } from '../../core/types/building';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';
import { BuildingPreview } from '../../ui/controls/building-preview';

const BUILDING_DESCRIPTIONS: Partial<Record<(typeof BUILDING_TYPES)[keyof typeof BUILDING_TYPES], string>> = {
  TOWN_HALL: 'Corazon de tu base. Subirlo desbloquea nuevas defensas, edificios y mejora global de progresion.',
  RESOURCE_TWIG_COLLECTOR: 'Produce ramitas (Twigs), recurso base para casi toda tu construccion y progreso temprano.',
  RESOURCE_PEBBLE_COLLECTOR: 'Produce Pebbles para construccion y upgrades de casi toda tu base.',
  RESOURCE_PUTTY_COLLECTOR: 'Produce Putty para desbloquear y mejorar monstruos, y para mejoras defensivas clave.',
  RESOURCE_GOO_COLLECTOR: 'Produce goo, recurso clave para tecnologia de monstruos y laboratorios.',
  RESOURCE_WOOD_SILO: 'Aumenta la capacidad maxima para almacenar recursos de madera y putty.',
  RESOURCE_STONE_SILO: 'Aumenta la capacidad maxima total para Twigs, Pebbles, Putty y Goo.',
  DEFENSE_TURRET_RAPID: 'Sniper Tower: altisimo dano por disparo y gran alcance, pero con recarga lenta.',
  DEFENSE_MORTAR: 'Cannon Tower: corto alcance, dano alto con explosion para grupos de monstruos.',
  DEFENSE_LASER_TOWER: 'Laser Tower: rayo continuo, ataque muy rapido en corto alcance.',
  ARMY_HATCHERY: 'Permite investigar y evolucionar monstruos para raids mas fuertes.',
  ARMY_MONSTER_PEN: 'Aloja monstruos y mejora el control logistico de tu ejercito.',
};

export const BuildingContextMenu = () => {
  const selectedBuildingId = useGameStore((state) => state.selectedBuildingId);
  const upgradeSelectedBuilding = useGameStore((state) => state.upgradeSelectedBuilding);
  const repairSelectedBuilding = useGameStore((state) => state.repairSelectedBuilding);
  const fortifySelectedBuilding = useGameStore((state) => state.fortifySelectedBuilding);
  const instantFinishBuildingWithShiny = useGameStore((state) => state.instantFinishBuildingWithShiny);
  const activeResearch = useGameStore((state) => state.activeResearch);
  const instantFinishMonsterResearch = useGameStore((state) => state.instantFinishMonsterResearch);
  const closeBuildingContextMenu = useGameStore((state) => state.closeBuildingContextMenu);
  const engine = useGameStore((state) => state.engine);
  const shiny = useGameStore((state) => state.shiny);
  const developerModeEnabled = useGameStore((state) => state.developerModeEnabled);
  const resources = useGameStore((state) => state.resources);
  const freeBuildMode = useGameStore((state) => state.freeBuildMode);
  const [detailMode, setDetailMode] = useState<'UPGRADE' | 'REPAIR' | 'FORTIFY' | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const projectedAnchorRef = useRef<Vector3>(new Vector3());

  useEffect(() => {
    setDetailMode(null);
  }, [selectedBuildingId]);

  if (!selectedBuildingId) {
    return null;
  }

  const building = engine.getState().buildings.find((item) => item.id === selectedBuildingId);
  const townHall = engine.getState().buildings.find((item) => item.type === BUILDING_TYPES.TOWN_HALL);
  if (!building || !townHall) {
    return null;
  }

  const nextLevel = building.level + 1;
  const isTwigSnapper = building.type === BUILDING_TYPES.RESOURCE_TWIG_COLLECTOR;
  const isGooFactory = building.type === BUILDING_TYPES.RESOURCE_GOO_COLLECTOR;
  const isPebbleShiner = building.type === BUILDING_TYPES.RESOURCE_PEBBLE_COLLECTOR;
  const isPuttySquisher = building.type === BUILDING_TYPES.RESOURCE_PUTTY_COLLECTOR;
  const isStorageSilo = building.type === BUILDING_TYPES.RESOURCE_WOOD_SILO || building.type === BUILDING_TYPES.RESOURCE_STONE_SILO;
  const isSniperTower = building.type === BUILDING_TYPES.DEFENSE_TURRET_RAPID;
  const isLaserTower = building.type === BUILDING_TYPES.DEFENSE_LASER_TOWER;
  const isCannonTower = building.type === BUILDING_TYPES.DEFENSE_MORTAR;
  const isFixedHarvester = isTwigSnapper || isGooFactory || isPebbleShiner || isPuttySquisher;
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
  const isTwigSnapperMaxLevel = isTwigSnapper && building.level >= getTwigSnapperMaxLevel();
  const isGooFactoryMaxLevel = isGooFactory && building.level >= getGooFactoryMaxLevel();
  const isPebbleShinerMaxLevel = isPebbleShiner && building.level >= getPebbleShinerMaxLevel();
  const isPuttySquisherMaxLevel = isPuttySquisher && building.level >= getPuttySquisherMaxLevel();
  const isStorageSiloMaxLevel = isStorageSilo && building.level >= getStorageSiloMaxLevel();
  const isSniperTowerMaxLevel = isSniperTower && building.level >= getSniperTowerMaxLevel();
  const isLaserTowerMaxLevel = isLaserTower && building.level >= getLaserTowerMaxLevel();
  const isCannonTowerMaxLevel = isCannonTower && building.level >= getCannonTowerMaxLevel();
  const isMaxTownHallLevel = building.type === BUILDING_TYPES.TOWN_HALL && building.level >= 20;
  const requiredTownHallLevel = building.type === BUILDING_TYPES.TOWN_HALL
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
  const buildingCatalogEntry = ENHANCED_BUILDING_CATALOG[building.type];
  const baseCost = buildingCatalogEntry?.cost ?? { twigs: 0, pebbles: 0, putty: 0, goo: 0 };
  const buildingName = buildingCatalogEntry?.name ?? building.type;
  const hasCatalogEntry = !!buildingCatalogEntry;
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
  const missingRatio = 1 - building.hp / Math.max(1, building.maxHp);
  const repairCost = {
    twigs: Math.round(baseCost.twigs * missingRatio * 0.45),
    pebbles: Math.round(baseCost.pebbles * missingRatio * 0.45),
    putty: Math.round(baseCost.putty * missingRatio * 0.45),
    goo: Math.round(baseCost.goo * missingRatio * 0.45),
  };

  const canUpgradeTownHall =
    hasCatalogEntry &&
    !isMaxTownHallLevel &&
    !isTwigSnapperMaxLevel &&
    !isGooFactoryMaxLevel &&
    !isPebbleShinerMaxLevel &&
    !isPuttySquisherMaxLevel &&
    !isStorageSiloMaxLevel &&
    !isSniperTowerMaxLevel &&
    !isLaserTowerMaxLevel &&
    !isCannonTowerMaxLevel &&
    townHall.level >= requiredTownHallLevel;
  const canUpgradeResources =
    freeBuildMode ||
    (resources.twigs.current >= upgradeCost.twigs &&
      resources.pebbles.current >= upgradeCost.pebbles &&
      resources.putty.current >= upgradeCost.putty &&
      resources.goo.current >= upgradeCost.goo);
  const canRepairResources =
    freeBuildMode ||
    (resources.twigs.current >= repairCost.twigs &&
      resources.pebbles.current >= repairCost.pebbles &&
      resources.putty.current >= repairCost.putty &&
      resources.goo.current >= repairCost.goo);
  const isBuildingDamaged = building.hp < building.maxHp;
  const description = BUILDING_DESCRIPTIONS[building.type] ?? 'Mejora esta construccion para aumentar su rendimiento y durabilidad.';
  const currentProductionPerHour = Math.round(
    (building.productionPerMs ?? buildingCatalogEntry?.production?.ratePerMs ?? 0) * 60 * 60 * 1000
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
  const currentCapacity = currentTwigSnapperSpec?.capacity ?? currentGooFactorySpec?.capacity ?? currentPebbleShinerSpec?.capacity ?? currentPuttySquisherSpec?.capacity ?? null;
  const nextCapacity = nextTwigSnapperSpec?.capacity ?? nextGooFactorySpec?.capacity ?? nextPebbleShinerSpec?.capacity ?? nextPuttySquisherSpec?.capacity ?? null;
  const estimatedUpgradeDurationMs = nextTwigSnapperSpec?.buildTimeMs ?? nextGooFactorySpec?.buildTimeMs ?? nextPebbleShinerSpec?.buildTimeMs ?? nextPuttySquisherSpec?.buildTimeMs ?? nextStorageSiloSpec?.buildTimeMs ?? nextSniperTowerSpec?.buildTimeMs ?? nextLaserTowerSpec?.buildTimeMs ?? nextCannonTowerSpec?.buildTimeMs ?? (12000 + nextLevel * 2500);
  const estimatedRepairDurationMs = currentTwigSnapperSpec?.repairTimeMs ?? currentGooFactorySpec?.repairTimeMs ?? currentPebbleShinerSpec?.repairTimeMs ?? currentPuttySquisherSpec?.repairTimeMs ?? currentStorageSiloSpec?.repairTimeMs ?? currentSniperTowerSpec?.repairTimeMs ?? currentLaserTowerSpec?.repairTimeMs ?? currentCannonTowerSpec?.repairTimeMs ?? 6000;
  const fortificationLevel = building.fortificationLevel ?? 0;
  const canUseFortify = building.type === BUILDING_TYPES.TOWN_HALL && townHall.level >= 5;
  const canFortifyMore = fortificationLevel < 3;
  const fortifyCost = {
    twigs: Math.round(500 + baseCost.twigs * (fortificationLevel + 1) * 4),
    pebbles: Math.round(500 + baseCost.pebbles * (fortificationLevel + 1) * 4),
    putty: Math.round(220 + baseCost.putty * (fortificationLevel + 1) * 3),
    goo: Math.round(180 + baseCost.goo * (fortificationLevel + 1) * 3),
  };
  const canFortifyResources =
    freeBuildMode ||
    (resources.twigs.current >= fortifyCost.twigs &&
      resources.pebbles.current >= fortifyCost.pebbles &&
      resources.putty.current >= fortifyCost.putty &&
      resources.goo.current >= fortifyCost.goo);

  const remainingMs = Math.max(0, (building.buildEndsAt ?? 0) - Date.now());
  const instantFinishCost = getInstantFinishShinyCost(remainingMs);
  const hasUnlimitedShiny = developerModeEnabled;
  const canInstantFinish = remainingMs > 0 && (hasUnlimitedShiny || shiny >= instantFinishCost);
  const isResearchLab = building.type === BUILDING_TYPES.ARMY_HATCHERY && activeResearch.labId === building.id;
  const labResearch = isResearchLab ? activeResearch : null;
  const researchRemainingMs = labResearch?.endTime ? Math.max(0, labResearch.endTime - Date.now()) : 0;
  const researchFinishCost = getInstantFinishShinyCost(researchRemainingMs);
  const canFinishResearch = isResearchLab && (hasUnlimitedShiny || shiny >= researchFinishCost);
  const [anchorWorldX, , anchorWorldZ] = gridToWorldCenter(building.x, building.y, building.sizeX, building.sizeY, GRID_SIZE, CELL_SIZE);
  const anchorWorldY = 0.45;
  const calculateMenuScreenPosition = (element: Object3D, cameraRef: Camera, size: { width: number; height: number }): [number, number] => {
    const bounds = menuRef.current?.getBoundingClientRect();
    const measuredWidth = bounds?.width ?? menuRef.current?.offsetWidth ?? 360;
    const measuredHeight = bounds?.height ?? menuRef.current?.offsetHeight ?? 340;
    const edgePadding = 10;
    const anchorOffset = 16;
    projectedAnchorRef.current.setFromMatrixPosition(element.matrixWorld).project(cameraRef);
    const anchorScreenX = (projectedAnchorRef.current.x * 0.5 + 0.5) * size.width;
    const anchorScreenY = (-projectedAnchorRef.current.y * 0.5 + 0.5) * size.height;
    const centeredX = anchorScreenX - measuredWidth * 0.5;
    const preferredTop = anchorScreenY - measuredHeight - anchorOffset;
    const preferredBottom = anchorScreenY + anchorOffset;
    const maxX = Math.max(edgePadding, size.width - measuredWidth - edgePadding);
    const maxY = Math.max(edgePadding, size.height - measuredHeight - edgePadding);
    const finalX = Math.max(edgePadding, Math.min(centeredX, maxX));
    const finalY = preferredTop >= edgePadding ? preferredTop : Math.max(edgePadding, Math.min(preferredBottom, maxY));
    return [finalX, finalY];
  };

  return (
    <Html position={[anchorWorldX, anchorWorldY, anchorWorldZ]} calculatePosition={calculateMenuScreenPosition}>
      <div className="pointer-events-none z-[60]">
        <div ref={menuRef} className="pointer-events-auto w-[360px]">
          <div className="ui-panel p-3 text-xs text-slate-100">
        <p className="ui-title mb-2">
          {buildingName} Lv.{building.level}
        </p>
        <p className="mb-2 rounded bg-slate-900/50 p-2 text-[11px] text-slate-300">{description}</p>
        {isFixedHarvester ? (
          <div className="mb-2 rounded bg-amber-950/30 p-2 text-[11px] text-amber-100">
            <p>Produccion actual: {currentProductionPerHour.toLocaleString()} / hora</p>
            {currentCapacity ? <p>Capacidad actual: {currentCapacity.toLocaleString()}</p> : null}
            <p>HP actual: {building.maxHp.toLocaleString()}</p>
          </div>
        ) : null}
        {isStorageSilo ? (
          <div className="mb-2 rounded bg-cyan-950/30 p-2 text-[11px] text-cyan-100">
            <p>Capacidad por recurso: {(currentStorageCapacity ?? 0).toLocaleString()}</p>
            <p>Capacidad total del silo: {((currentStorageCapacity ?? 0) * 4).toLocaleString()}</p>
            <p>HP actual: {building.maxHp.toLocaleString()}</p>
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            className={`ui-button px-2 py-1 ${canUpgradeTownHall ? 'border-emerald-600 bg-emerald-700/80 text-emerald-50' : 'text-slate-400'}`}
            onClick={() => setDetailMode('UPGRADE')}
            disabled={!canUpgradeTownHall}
          >
            Mejorar
          </button>
          <button type="button" className="ui-button border-amber-700 bg-amber-800/80 px-2 py-1 text-amber-100" onClick={() => setDetailMode('REPAIR')}>
            Reparar
          </button>
          <button
            type="button"
            className={`ui-button px-2 py-1 ${canUseFortify && canFortifyMore ? 'border-violet-600 bg-violet-700/70 text-violet-100' : 'text-slate-500'}`}
            onClick={() => setDetailMode('FORTIFY')}
            disabled={!canUseFortify || !canFortifyMore}
          >
            Fortificar
          </button>
          <button type="button" className="ui-button px-2 py-1">
            Mover
          </button>
        </div>
        {building.status === 'UNDER_CONSTRUCTION' || building.status === 'PENDING' ? (
          <div className="mt-2 rounded bg-slate-900/55 p-2 text-[11px]">
            <p className="text-slate-200">En construccion: {formatDurationMs(remainingMs)}</p>
            <button
              type="button"
              className={`mt-1 w-full rounded px-2 py-1 text-[11px] font-semibold ${canInstantFinish ? 'bg-emerald-700 text-emerald-50 hover:bg-emerald-600' : 'cursor-not-allowed bg-slate-700 text-slate-400'}`}
              onClick={() => instantFinishBuildingWithShiny(building.id)}
              disabled={!canInstantFinish}
            >
              Finalizar al instante ({hasUnlimitedShiny ? '∞' : instantFinishCost} shiny)
            </button>
          </div>
        ) : null}
        {isResearchLab ? (
          <div className="mt-2 rounded bg-indigo-950/55 p-2 text-[11px]">
            <p className="text-indigo-100">
              Investigando {labResearch?.monsterType} Nv.{labResearch?.targetLevel}
            </p>
            <p className="text-indigo-200">Tiempo restante: {formatDurationMs(researchRemainingMs)}</p>
            <button
              type="button"
              className={`mt-1 w-full rounded px-2 py-1 font-semibold ${canFinishResearch ? 'bg-emerald-700 text-emerald-50 hover:bg-emerald-600' : 'cursor-not-allowed bg-slate-700 text-slate-400'}`}
              onClick={instantFinishMonsterResearch}
              disabled={!canFinishResearch}
            >
              Finalizar investigacion ({hasUnlimitedShiny ? '∞' : researchFinishCost} shiny)
            </button>
          </div>
        ) : null}

        {detailMode === 'UPGRADE' ? (
          <div className="mt-2 rounded bg-slate-900/55 p-2 text-[11px]">
            <p className="font-semibold text-slate-100">Confirmar mejora</p>
            <BuildingPreview
              type={building.type}
              level={nextLevel}
              className="mt-2 h-[180px] w-full overflow-hidden rounded-md border border-slate-700 bg-slate-950/55"
            />
            <p className={canUpgradeTownHall ? 'text-emerald-300' : 'text-rose-300'}>
              Ayuntamiento requerido: Nv.{requiredTownHallLevel} ({townHall.level}/{requiredTownHallLevel})
            </p>
            {isMaxTownHallLevel ? <p className="text-amber-300">Nivel maximo del Ayuntamiento alcanzado (20).</p> : null}
            {isTwigSnapperMaxLevel ? <p className="text-amber-300">Nivel maximo del Twig Snapper alcanzado (10).</p> : null}
            {isGooFactoryMaxLevel ? <p className="text-amber-300">Nivel maximo de la Goo Factory alcanzado (10).</p> : null}
            {isPebbleShinerMaxLevel ? <p className="text-amber-300">Nivel maximo del Pebble Shiner alcanzado (10).</p> : null}
            {isPuttySquisherMaxLevel ? <p className="text-amber-300">Nivel maximo del Putty Squisher alcanzado (10).</p> : null}
            {isStorageSiloMaxLevel ? <p className="text-amber-300">Nivel maximo del Storage Silo alcanzado (10).</p> : null}
            {isSniperTowerMaxLevel ? <p className="text-amber-300">Nivel maximo del Sniper Tower alcanzado (10).</p> : null}
            {isLaserTowerMaxLevel ? <p className="text-amber-300">Nivel maximo del Laser Tower alcanzado (8).</p> : null}
            {isCannonTowerMaxLevel ? <p className="text-amber-300">Nivel maximo del Cannon Tower alcanzado (10).</p> : null}
            <p className={canUpgradeResources ? 'text-emerald-300' : 'text-rose-300'}>
              Recursos suficientes para mejora
            </p>
            {isFixedHarvester ? (
              <p className="mt-1 text-amber-200">
                Produccion: {currentProductionPerHour.toLocaleString()} {'->'} {nextProductionPerHour.toLocaleString()} / hora
                {nextCapacity ? ` | Capacidad: ${nextCapacity.toLocaleString()}` : ''}
              </p>
            ) : null}
            {isStorageSilo ? (
              <p className="mt-1 text-cyan-200">
                Capacidad: {(currentStorageCapacity ?? 0).toLocaleString()} {'->'} {(nextStorageCapacity ?? 0).toLocaleString()} por recurso
              </p>
            ) : null}
            <p className="mt-1 text-slate-300">{description}</p>
            <p className="mt-1 text-slate-300">Duracion estimada: {formatDurationMs(estimatedUpgradeDurationMs)}</p>
            <div className="mt-1 text-slate-300">
              T:{upgradeCost.twigs} P:{upgradeCost.pebbles} Pu:{upgradeCost.putty} G:{upgradeCost.goo}
            </div>
            <button
              type="button"
              className={`mt-2 w-full rounded px-2 py-1 font-semibold ${hasCatalogEntry && canUpgradeTownHall && canUpgradeResources ? 'bg-emerald-700 text-emerald-50 hover:bg-emerald-600' : 'cursor-not-allowed bg-slate-700 text-slate-400'}`}
              onClick={() => {
                upgradeSelectedBuilding();
                setDetailMode(null);
              }}
              disabled={!hasCatalogEntry || !canUpgradeTownHall || !canUpgradeResources}
            >
              Confirmar mejora
            </button>
          </div>
        ) : null}

        {detailMode === 'REPAIR' ? (
          <div className="mt-2 rounded bg-slate-900/55 p-2 text-[11px]">
            <p className="font-semibold text-slate-100">Confirmar reparacion</p>
            <p className={isBuildingDamaged ? 'text-emerald-300' : 'text-rose-300'}>
              Estado de dano: {Math.round((1 - building.hp / Math.max(1, building.maxHp)) * 100)}%
            </p>
            <p className={canRepairResources ? 'text-emerald-300' : 'text-rose-300'}>
              Recursos suficientes para reparar
            </p>
            <p className="mt-1 text-slate-300">Duracion estimada: {formatDurationMs(estimatedRepairDurationMs)}</p>
            <div className="mt-1 text-slate-300">
              T:{repairCost.twigs} P:{repairCost.pebbles} Pu:{repairCost.putty} G:{repairCost.goo}
            </div>
            <button
              type="button"
              className={`mt-2 w-full rounded px-2 py-1 font-semibold ${isBuildingDamaged && canRepairResources ? 'bg-amber-700 text-amber-50 hover:bg-amber-600' : 'cursor-not-allowed bg-slate-700 text-slate-400'}`}
              onClick={() => {
                repairSelectedBuilding();
                setDetailMode(null);
              }}
              disabled={!isBuildingDamaged || !canRepairResources}
            >
              Confirmar reparacion
            </button>
          </div>
        ) : null}

        {detailMode === 'FORTIFY' ? (
          <div className="mt-2 rounded bg-slate-900/55 p-2 text-[11px]">
            <p className="font-semibold text-slate-100">Fortificar Ayuntamiento</p>
            <p className={canUseFortify ? 'text-emerald-300' : 'text-rose-300'}>
              Requisito: Ayuntamiento nivel 5 ({townHall.level}/5)
            </p>
            <p className={canFortifyMore ? 'text-emerald-300' : 'text-amber-300'}>
              Nivel de fortificacion: {fortificationLevel}/3
            </p>
            <p className={canFortifyResources ? 'text-emerald-300' : 'text-rose-300'}>
              Recursos suficientes para fortificar
            </p>
            <p className="mt-1 text-slate-300">Agrega puas/enredaderas defensivas y sube la durabilidad del ayuntamiento.</p>
            <div className="mt-1 text-slate-300">
              T:{fortifyCost.twigs} P:{fortifyCost.pebbles} Pu:{fortifyCost.putty} G:{fortifyCost.goo}
            </div>
            <button
              type="button"
              className={`mt-2 w-full rounded px-2 py-1 font-semibold ${
                canUseFortify && canFortifyMore && canFortifyResources
                  ? 'bg-violet-700 text-violet-50 hover:bg-violet-600'
                  : 'cursor-not-allowed bg-slate-700 text-slate-400'
              }`}
              onClick={() => {
                fortifySelectedBuilding();
                setDetailMode(null);
              }}
              disabled={!canUseFortify || !canFortifyMore || !canFortifyResources}
            >
              Aplicar fortificacion
            </button>
          </div>
        ) : null}

        <button type="button" className="ui-button mt-2 w-full px-2 py-1" onClick={closeBuildingContextMenu}>
          Cerrar
        </button>
      </div>
        </div>
      </div>
    </Html>
  );
};
