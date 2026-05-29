import { Html } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../../utils/coordinates';
import { ActionButtons } from './action-buttons';
import { MonsterAcademyActionButtons } from './academy-action-buttons';
import { ObstacleActionButtons } from './obstacle-action-buttons';
import { CollectAllButton, CollectBufferPanel } from './collect-panels';
import { ConstructionStatusPanel, ResearchStatusPanel } from './status-panels';
import { FortifyPanel, RepairPanel, UpgradePanel } from './detail-panels';
import { buildBuildingContextData } from './use-building-context-data';
import { useContextMenuPosition } from './use-context-menu-position';
import type { DetailMode } from './types';

const ANCHOR_HEIGHT = 0.45;

export const BuildingContextMenu = () => {
  const selectedBuildingId = useGameStore((state) => state.selectedBuildingId);
  const closeBuildingContextMenu = useGameStore((state) => state.closeBuildingContextMenu);
  const upgradeSelectedBuilding = useGameStore((state) => state.upgradeSelectedBuilding);
  const repairSelectedBuilding = useGameStore((state) => state.repairSelectedBuilding);
  const fortifySelectedBuilding = useGameStore((state) => state.fortifySelectedBuilding);
  const instantFinishBuildingWithShiny = useGameStore((state) => state.instantFinishBuildingWithShiny);
  const instantFinishMonsterResearch = useGameStore((state) => state.instantFinishMonsterResearch);
  const activeResearch = useGameStore((state) => state.activeResearch);
  const lastResourceTick = useGameStore((state) => state.lastResourceTick);
  const engine = useGameStore((state) => state.engine);
  const shiny = useGameStore((state) => state.shiny);
  const developerModeEnabled = useGameStore((state) => state.developerModeEnabled);
  const resources = useGameStore((state) => state.resources);
  const freeBuildMode = useGameStore((state) => state.freeBuildMode);
  const hatcheryTrainingQueues = useGameStore((state) => state.hatcheryTrainingQueues);
  const startMovingBuilding = useGameStore((state) => state.startMovingBuilding);
  const recycleSelectedBuilding = useGameStore((state) => state.recycleSelectedBuilding);
  const clearObstacle = useGameStore((state) => state.clearObstacle);
  const openHatcheryModal = useGameStore((state) => state.openHatcheryModal);
  const openBuildingInfoPanel = useGameStore((state) => state.openBuildingInfoPanel);
  const buildingInfoPanelOpen = useGameStore((state) => state.buildingInfoPanelOpen);

  const [detailMode, setDetailMode] = useState<DetailMode>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const calculateMenuScreenPosition = useContextMenuPosition(menuRef);

  useEffect(() => {
    setDetailMode(null);
  }, [selectedBuildingId]);

  if (!selectedBuildingId || buildingInfoPanelOpen) {
    return null;
  }

  const data = buildBuildingContextData(selectedBuildingId, {
    engine,
    lastResourceTick,
    activeResearch,
    shiny,
    developerModeEnabled,
    resources,
    freeBuildMode,
    hatcheryTrainingQueues,
  });

  if (!data) {
    return null;
  }

  const handleMoveBuilding = (): void => {
    if (!data.canMoveBuilding) {
      return;
    }
    startMovingBuilding(data.building.id);
    closeBuildingContextMenu();
  };

  const handleOpenAcademy = (): void => {
    if (!data.canOpenMonsterAcademy) {
      return;
    }
    openHatcheryModal(data.building.id);
    closeBuildingContextMenu();
  };

  const handleRecycleBuilding = (): void => {
    if (!data.canRecycleMonsterAcademy) {
      return;
    }
    recycleSelectedBuilding();
  };

  const handleRecycleObstacle = (): void => {
    if (!data.canRecycleObstacle) {
      return;
    }
    clearObstacle(data.building.id);
  };

  const handleResetDetailMode = (): void => setDetailMode(null);

  const [anchorWorldX, , anchorWorldZ] = gridToWorldCenter(
    data.building.x,
    data.building.y,
    data.building.sizeX,
    data.building.sizeY,
    GRID_SIZE,
    CELL_SIZE,
  );

  return (
    <Html position={[anchorWorldX, ANCHOR_HEIGHT, anchorWorldZ]} calculatePosition={calculateMenuScreenPosition}>
      <div className="pointer-events-none z-[60]">
        <div ref={menuRef} className={`pointer-events-auto ${data.isObstacle ? 'w-[132px]' : 'w-[360px]'}`}>
          {data.isObstacle ? (
            <div className="ui-panel p-2 text-xs text-slate-100">
              <ObstacleActionButtons
                canRecycleObstacle={data.canRecycleObstacle}
                handleRecycleObstacle={handleRecycleObstacle}
                onOpenInfo={openBuildingInfoPanel}
              />
            </div>
          ) : (
          <div className="ui-panel p-3 text-xs text-slate-100">
            <p className="ui-title mb-2">
              {data.buildingName} Lv.{data.building.level}
            </p>
            <p className="mb-2 rounded bg-slate-900/50 p-2 text-[11px] text-slate-300">{data.description}</p>

            {data.isCollector ? <CollectAllButton summary={data.totalPendingResources} /> : null}

            {data.isFixedHarvester ? (
              <div className="mb-2 rounded bg-amber-950/30 p-2 text-[11px] text-amber-100">
                <p>Produccion actual: {data.currentProductionPerHour.toLocaleString()} / hora</p>
                {data.currentCapacity ? <p>Capacidad actual: {data.currentCapacity.toLocaleString()}</p> : null}
                <p>HP actual: {data.building.maxHp.toLocaleString()}</p>
              </div>
            ) : null}

            {data.isTwigSnapper && data.twigBuffer ? (
              <CollectBufferPanel
                buffer={data.twigBuffer}
                canCollect={data.canCollectTwigs}
                collectorId={data.building.id}
                resourceType="twigs"
              />
            ) : null}
            {data.isPebbleShiner && data.pebbleBuffer ? (
              <CollectBufferPanel
                buffer={data.pebbleBuffer}
                canCollect={data.canCollectPebbles}
                collectorId={data.building.id}
                resourceType="pebbles"
              />
            ) : null}
            {data.isPuttySquisher && data.puttyBuffer ? (
              <CollectBufferPanel
                buffer={data.puttyBuffer}
                canCollect={data.canCollectPutty}
                collectorId={data.building.id}
                resourceType="putty"
              />
            ) : null}
            {data.isGooFactory && data.gooBuffer ? (
              <CollectBufferPanel
                buffer={data.gooBuffer}
                canCollect={data.canCollectGoo}
                collectorId={data.building.id}
                resourceType="goo"
              />
            ) : null}

            {data.isStorageSilo ? (
              <div className="mb-2 rounded bg-cyan-950/30 p-2 text-[11px] text-cyan-100">
                <p>Capacidad por recurso: {(data.currentStorageCapacity ?? 0).toLocaleString()}</p>
                <p>Capacidad total del silo: {((data.currentStorageCapacity ?? 0) * 4).toLocaleString()}</p>
                <p>HP actual: {data.building.maxHp.toLocaleString()}</p>
              </div>
            ) : null}

            {data.isMonsterAcademy ? (
              <MonsterAcademyActionButtons
                canMoveBuilding={data.canMoveBuilding}
                canRecycleBuilding={data.canRecycleMonsterAcademy}
                canOpenAcademy={data.canOpenMonsterAcademy}
                canUpgradeTownHall={data.canUpgradeTownHall}
                setDetailMode={setDetailMode}
                onOpenInfo={openBuildingInfoPanel}
                handleMoveBuilding={handleMoveBuilding}
                handleRecycleBuilding={handleRecycleBuilding}
                handleOpenAcademy={handleOpenAcademy}
              />
            ) : (
              <ActionButtons
                canUpgradeTownHall={data.canUpgradeTownHall}
                canUseFortify={data.canUseFortify}
                canFortifyMore={data.canFortifyMore}
                canMoveBuilding={data.canMoveBuilding}
                setDetailMode={setDetailMode}
                onOpenInfo={openBuildingInfoPanel}
                handleMoveBuilding={handleMoveBuilding}
              />
            )}

            {data.building.status === 'UNDER_CONSTRUCTION' || data.building.status === 'PENDING' ? (
              <ConstructionStatusPanel
                remainingMs={data.remainingMs}
                instantFinishCost={data.instantFinishCost}
                hasUnlimitedShiny={data.hasUnlimitedShiny}
                canInstantFinish={data.canInstantFinish}
                buildingId={data.building.id}
                instantFinishBuildingWithShiny={instantFinishBuildingWithShiny}
              />
            ) : null}

            {data.isResearchLab ? (
              <ResearchStatusPanel
                labResearch={activeResearch}
                researchRemainingMs={data.researchRemainingMs}
                canFinishResearch={data.canFinishResearch}
                hasUnlimitedShiny={data.hasUnlimitedShiny}
                researchFinishCost={data.researchFinishCost}
                instantFinishMonsterResearch={instantFinishMonsterResearch}
              />
            ) : null}

            {detailMode === 'UPGRADE' ? (
              <UpgradePanel
                buildingType={data.building.type}
                nextLevel={data.nextLevel}
                canUpgradeTownHall={data.canUpgradeTownHall}
                canUpgradeResources={data.canUpgradeResources}
                hasCatalogEntry={data.hasCatalogEntry}
                requiredTownHallLevel={data.requiredTownHallLevel}
                townHallLevel={data.townHall.level}
                isFixedHarvester={data.isFixedHarvester}
                isStorageSilo={data.isStorageSilo}
                isMaxTownHallLevel={data.isMaxTownHallLevel}
                isTwigSnapperMaxLevel={data.isTwigSnapperMaxLevel}
                isGooFactoryMaxLevel={data.isGooFactoryMaxLevel}
                isPebbleShinerMaxLevel={data.isPebbleShinerMaxLevel}
                isPuttySquisherMaxLevel={data.isPuttySquisherMaxLevel}
                isStorageSiloMaxLevel={data.isStorageSiloMaxLevel}
                isSniperTowerMaxLevel={data.isSniperTowerMaxLevel}
                isLaserTowerMaxLevel={data.isLaserTowerMaxLevel}
                isCannonTowerMaxLevel={data.isCannonTowerMaxLevel}
                isMonsterAcademyMaxLevel={data.isMonsterAcademyMaxLevel}
                requiredMonsterPenLevel={data.requiredMonsterPenLevel}
                highestMonsterPenLevel={data.highestMonsterPenLevel}
                meetsMonsterPenRequirement={data.meetsMonsterPenRequirement}
                currentProductionPerHour={data.currentProductionPerHour}
                nextProductionPerHour={data.nextProductionPerHour}
                nextCapacity={data.nextCapacity}
                currentStorageCapacity={data.currentStorageCapacity}
                nextStorageCapacity={data.nextStorageCapacity}
                description={data.description}
                estimatedUpgradeDurationMs={data.estimatedUpgradeDurationMs}
                upgradeCost={data.upgradeCost}
                unrestrictedMode={data.unrestrictedMode}
                upgradeSelectedBuilding={upgradeSelectedBuilding}
                onClose={handleResetDetailMode}
              />
            ) : null}

            {detailMode === 'REPAIR' ? (
              <RepairPanel
                damageRatio={data.missingRatio}
                isBuildingDamaged={data.isBuildingDamaged}
                canRepairResources={data.canRepairResources}
                estimatedRepairDurationMs={data.estimatedRepairDurationMs}
                repairCost={data.repairCost}
                repairSelectedBuilding={repairSelectedBuilding}
                onClose={handleResetDetailMode}
              />
            ) : null}

            {detailMode === 'FORTIFY' ? (
              <FortifyPanel
                canUseFortify={data.canUseFortify}
                canFortifyMore={data.canFortifyMore}
                canFortifyResources={data.canFortifyResources}
                townHallLevel={data.townHall.level}
                fortificationLevel={data.fortificationLevel}
                fortifyCost={data.fortifyCost}
                fortifySelectedBuilding={fortifySelectedBuilding}
                onClose={handleResetDetailMode}
              />
            ) : null}

            <button type="button" className="ui-button mt-2 w-full px-2 py-1" onClick={closeBuildingContextMenu}>
              Cerrar
            </button>
          </div>
          )}
        </div>
      </div>
    </Html>
  );
};
