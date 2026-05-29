import { lazy, Suspense, useEffect } from 'react';
import { useGameStore } from '../state/game-store';
import { ArmyDeck } from '../ui/controls/army-deck';
import { BattleResultModal } from '../ui/controls/battle-result-modal';
import { HatcheryModal } from '../ui/controls/hatchery-modal';
import { HousingDetailsModal } from '../ui/controls/housing-details-modal';
import { PlacementControls } from '../ui/controls/placement-controls';
import { BuildingInfoOverlay } from '../ui/controls/building-info-overlay';
import { ResourceHud } from '../ui/hud/resource-hud';

const GameCanvas = lazy(async () => import('../render/scene/game-canvas').then((module) => ({ default: module.GameCanvas })));

export const App = () => {
  const tickResources = useGameStore((state) => state.tickResources);
  const tickCombat = useGameStore((state) => state.tickCombat);
  const tickConstruction = useGameStore((state) => state.tickConstruction);
  const tickHatcheries = useGameStore((state) => state.tickHatcheries);
  const tickMonsterResearch = useGameStore((state) => state.tickMonsterResearch);
  const tickPenResidents = useGameStore((state) => state.tickPenResidents);
  const battleMode = useGameStore((state) => state.battleMode);
  const placementEnabled = useGameStore((state) => state.placementEnabled);
  const landExpansionMode = useGameStore((state) => state.landExpansionMode);
  const movingBuildingId = useGameStore((state) => state.movingBuildingId);
  const shopOpen = useGameStore((state) => state.shopOpen);
  const buildingInfoPanelOpen = useGameStore((state) => state.buildingInfoPanelOpen);
  const closeBuildingInfoPanel = useGameStore((state) => state.closeBuildingInfoPanel);
  const cancelPlacementMode = useGameStore((state) => state.cancelPlacementMode);
  const cancelMovingBuilding = useGameStore((state) => state.cancelMovingBuilding);
  const setShopOpen = useGameStore((state) => state.setShopOpen);
  const cancelLandExpansionMode = useGameStore((state) => state.cancelLandExpansionMode);

  useEffect(() => {
    const cadenceMs = {
      resources: 250,
      combat: 100,
      construction: 150,
      hatcheries: 300,
      research: 300,
      residents: 100,
    } as const;
    const now = Date.now();
    const lastTickAt = {
      resources: now,
      combat: now,
      construction: now,
      hatcheries: now,
      research: now,
      residents: now,
    };
    const intervalId = window.setInterval(() => {
      const tickNow = Date.now();
      if (tickNow - lastTickAt.resources >= cadenceMs.resources) {
        tickResources();
        lastTickAt.resources = tickNow;
      }
      if (tickNow - lastTickAt.combat >= cadenceMs.combat) {
        tickCombat();
        lastTickAt.combat = tickNow;
      }
      if (tickNow - lastTickAt.construction >= cadenceMs.construction) {
        tickConstruction();
        lastTickAt.construction = tickNow;
      }
      if (tickNow - lastTickAt.hatcheries >= cadenceMs.hatcheries) {
        tickHatcheries();
        lastTickAt.hatcheries = tickNow;
      }
      if (tickNow - lastTickAt.research >= cadenceMs.research) {
        tickMonsterResearch();
        lastTickAt.research = tickNow;
      }
      if (tickNow - lastTickAt.residents >= cadenceMs.residents) {
        tickPenResidents();
        lastTickAt.residents = tickNow;
      }
    }, 100);

    const handleContextMenu = (event: MouseEvent): void => {
      event.preventDefault();
    };
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [tickCombat, tickConstruction, tickHatcheries, tickMonsterResearch, tickPenResidents, tickResources]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') {
        return;
      }
      if (movingBuildingId) {
        cancelMovingBuilding();
        return;
      }
      if (placementEnabled) {
        cancelPlacementMode();
        return;
      }
      if (landExpansionMode) {
        cancelLandExpansionMode();
        return;
      }
      if (buildingInfoPanelOpen) {
        closeBuildingInfoPanel();
        return;
      }
      if (shopOpen) {
        setShopOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    buildingInfoPanelOpen,
    cancelLandExpansionMode,
    cancelMovingBuilding,
    cancelPlacementMode,
    closeBuildingInfoPanel,
    landExpansionMode,
    movingBuildingId,
    placementEnabled,
    setShopOpen,
    shopOpen,
  ]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-stone-900">
      <ResourceHud />
      {battleMode ? <ArmyDeck /> : <PlacementControls />}
      <HatcheryModal />
      <HousingDetailsModal />
      <BattleResultModal />
      <BuildingInfoOverlay />
      <Suspense fallback={<div className="absolute inset-0 grid place-items-center text-sm text-lime-100/90">Loading scene...</div>}>
        <GameCanvas />
      </Suspense>
    </main>
  );
};
