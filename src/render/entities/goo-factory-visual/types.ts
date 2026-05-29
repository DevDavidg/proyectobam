import type { BuildingStatus } from '../../../core/types/building';
import type { BaseCollectorVisualProps, CreateMaterial, MaterialToken } from '../shared/types';

export type { CreateMaterial, MaterialToken };

export type GooFactoryVisualProps = BaseCollectorVisualProps;

export type GooFactoryState = 'in-action' | 'normal' | 'damaged' | 'destroyed';
