import type { GameStoreGet, GameStoreSet } from './types';

export const createBuildingInfoActions = (set: GameStoreSet, get: GameStoreGet) => ({
  buildingInfoPanelOpen: false,
  openBuildingInfoPanel: () => {
    const { selectedBuildingId } = get();
    if (!selectedBuildingId) {
      return;
    }
    set({ buildingInfoPanelOpen: true, buildingContextMenuPosition: null });
  },
  closeBuildingInfoPanel: () => {
    set({ buildingInfoPanelOpen: false });
  },
});
