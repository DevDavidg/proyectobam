import type { BuildingStatus } from '../../../core/types/building';
import { resolveHpVisualState } from '../shared/building-visual-state';
import { COLLECTOR_TIER_SCALES, resolveTierScaleFromTable } from '../shared/tier-scale';
import type { GooFactoryState } from './types';

export { clamp01 } from '../shared/math';

export const resolveState = (
  status?: BuildingStatus,
  hp?: number,
  maxHp?: number,
): GooFactoryState => resolveHpVisualState(status, hp, maxHp);

export const resolveTierScale = (level: number): number =>
  resolveTierScaleFromTable(level, COLLECTOR_TIER_SCALES.gooFactory);
