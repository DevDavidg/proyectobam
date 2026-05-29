import { useEffect, useMemo } from 'react';
import { useGameStore } from '../../state/game-store';
import { buildBuildingContextData } from '../../render/scene/building-context-menu/use-building-context-data';
import { BuildingInfoPanel } from './building-info-panel';

export const BuildingInfoOverlay = () => {
  const buildingInfoPanelOpen = useGameStore((state) => state.buildingInfoPanelOpen);
  const selectedBuildingId = useGameStore((state) => state.selectedBuildingId);
  const closeBuildingInfoPanel = useGameStore((state) => state.closeBuildingInfoPanel);
  const engine = useGameStore((state) => state.engine);
  const lastResourceTick = useGameStore((state) => state.lastResourceTick);
  const activeResearch = useGameStore((state) => state.activeResearch);
  const shiny = useGameStore((state) => state.shiny);
  const developerModeEnabled = useGameStore((state) => state.developerModeEnabled);
  const resources = useGameStore((state) => state.resources);
  const freeBuildMode = useGameStore((state) => state.freeBuildMode);
  const hatcheryTrainingQueues = useGameStore((state) => state.hatcheryTrainingQueues);

  const data = useMemo(() => {
    if (!buildingInfoPanelOpen || !selectedBuildingId) {
      return null;
    }
    return buildBuildingContextData(selectedBuildingId, {
      engine,
      lastResourceTick,
      activeResearch,
      shiny,
      developerModeEnabled,
      resources,
      freeBuildMode,
      hatcheryTrainingQueues,
    });
  }, [
    activeResearch,
    buildingInfoPanelOpen,
    developerModeEnabled,
    engine,
    freeBuildMode,
    hatcheryTrainingQueues,
    lastResourceTick,
    resources,
    selectedBuildingId,
    shiny,
  ]);

  useEffect(() => {
    if (buildingInfoPanelOpen && !selectedBuildingId) {
      closeBuildingInfoPanel();
    }
  }, [buildingInfoPanelOpen, closeBuildingInfoPanel, selectedBuildingId]);

  useEffect(() => {
    if (!buildingInfoPanelOpen || data) {
      return;
    }
    closeBuildingInfoPanel();
  }, [buildingInfoPanelOpen, closeBuildingInfoPanel, data]);

  if (!buildingInfoPanelOpen || !data) {
    return null;
  }

  return <BuildingInfoPanel data={data} onClose={closeBuildingInfoPanel} />;
};
