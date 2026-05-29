import type { ReactElement } from 'react';
import type { BuildingStatus } from '../../../core/types/building';

export type MaterialToken = 'gold' | 'iron' | 'wood' | 'goo' | 'stone';

export type MaterialFactory = (fallbackColor: string, token: MaterialToken) => ReactElement;

export type CreateMaterial = MaterialFactory;

export type BaseCollectorVisualProps = {
  level: number;
  footprintX: number;
  footprintZ: number;
  status?: BuildingStatus;
  hp?: number;
  maxHp?: number;
  storageFillRatio?: number;
  constructionProgress?: number;
  createMaterial: MaterialFactory;
};

export type { BuildingVisualState, StaticBuildingVisualState } from './building-visual-state';
