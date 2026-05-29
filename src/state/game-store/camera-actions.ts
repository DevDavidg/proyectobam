import type { Building } from '../../core/types/building';
import type { CameraCelebrationRequest, GameStore, GameStoreGet, GameStoreSet } from './types';

type CameraActions = Pick<GameStore, 'cameraCelebration' | 'requestCameraCelebration' | 'clearCameraCelebration'>;

let celebrationToken = 0;

export const createCameraActions = (set: GameStoreSet, get: GameStoreGet): CameraActions => ({
  cameraCelebration: null,
  requestCameraCelebration: (building: Building) => {
    celebrationToken += 1;
    const request: CameraCelebrationRequest = {
      buildingId: building.id,
      gridX: building.x,
      gridY: building.y,
      sizeX: building.sizeX,
      sizeY: building.sizeY,
      token: celebrationToken,
    };
    set({ cameraCelebration: request });
  },
  clearCameraCelebration: () => {
    if (get().cameraCelebration === null) {
      return;
    }
    set({ cameraCelebration: null });
  },
});
