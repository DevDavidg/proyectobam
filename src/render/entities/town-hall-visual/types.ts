import type { BuildingStatus } from '../../../core/types/building';
import type { MaterialFactory, MaterialToken } from '../shared/types';

export type { MaterialFactory, MaterialToken };

export type TownHallVisualProps = {
  level: number;
  footprintX: number;
  footprintZ: number;
  status?: BuildingStatus;
  hp?: number;
  maxHp?: number;
  createMaterial?: MaterialFactory;
  interactive?: boolean;
  constructionProgress?: number;
};

export type TownHallState = 'normal' | 'damaged' | 'destroyed';

export type TownHallDimensions = {
  tierScale: number;
  halfX: number;
  halfZ: number;
  baseLift: number;
  bodyHeight: number;
  bodyTop: number;
  trimHeight: number;
  panelCount: number;
  panelWidth: number;
  panelInset: number;
  cornerInset: number;
  roofHeight: number;
  roofTop: number;
  doorWidth: number;
  doorHeight: number;
  doorDepth: number;
  doorY: number;
  doorOffsetX: number;
  patchWidth: number;
  patchHeight: number;
  patchDepth: number;
  patchY: number;
  patchOffsetZ: number;
  pipeRadius: number;
  pipeY: number;
  funnelStemRadius: number;
  funnelStemHeight: number;
  funnelStemY: number;
  funnelBaseRadius: number;
  funnelTopRadius: number;
  funnelHeight: number;
  funnelY: number;
};
