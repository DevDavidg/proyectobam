import type { BuildingStatus, BuildingType } from '../../../core/types/building';

export type { MaterialToken } from '../shared/types';

export type BuildingVisualMaterialMode = 'default' | 'highlight' | 'ghost-valid' | 'ghost-invalid';
export type PreviewableBuildingType = Exclude<BuildingType, 'PREVIEW'>;
export type BuildingVisualFamily = 'town-hall' | 'wall' | 'turret' | 'mortar' | 'pen' | 'collector' | 'hatchery' | 'decor';

export type BuildingVisualProps = {
  type: PreviewableBuildingType;
  level: number;
  sizeX?: number;
  sizeY?: number;
  cellSize?: number;
  materialMode?: BuildingVisualMaterialMode;
  hatcheryBusy?: boolean;
  status?: BuildingStatus;
  hp?: number;
  maxHp?: number;
  storageFillRatio?: number;
  constructionProgress?: number;
};
