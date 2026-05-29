import type { BuildingStatus } from '../../../core/types/building';
import { resolveHpVisualState } from '../shared/building-visual-state';
import { clamp01 } from '../shared/math';
import { COLLECTOR_TIER_SCALES, resolveTierScaleFromTable } from '../shared/tier-scale';
import type { LeverPhase, PuttyState } from './types';

export { clamp01, easeInOut } from '../shared/math';

export const resolveState = (
  status: BuildingStatus | undefined,
  hp: number | undefined,
  maxHp: number | undefined,
): PuttyState => resolveHpVisualState(status, hp, maxHp);

export const resolveTierScale = (level: number): number =>
  resolveTierScaleFromTable(level, COLLECTOR_TIER_SCALES.puttySquisher);

export const LEVER_REST_ANGLE = Math.PI * 0.62;
export const LEVER_PRESS_ANGLE = Math.PI * 0.97;
export const LEVER_CYCLE_SECONDS = 2.8;
export const PRESS_DOWN_RATIO = 0.42;
export const PRESS_HOLD_RATIO = 0.1;
export const PRESS_UP_RATIO = 0.48;

export const computeLeverPhase = (elapsed: number): LeverPhase => {
  const rawT = (elapsed % LEVER_CYCLE_SECONDS) / LEVER_CYCLE_SECONDS;
  let pressNorm = 0;
  if (rawT < PRESS_DOWN_RATIO) {
    pressNorm = rawT / PRESS_DOWN_RATIO;
  } else if (rawT < PRESS_DOWN_RATIO + PRESS_HOLD_RATIO) {
    pressNorm = 1;
  } else {
    const upT = (rawT - PRESS_DOWN_RATIO - PRESS_HOLD_RATIO) / PRESS_UP_RATIO;
    pressNorm = 1 - clamp01(upT);
  }
  const eased = pressNorm < 0.5 ? 2 * pressNorm * pressNorm : 1 - Math.pow(-2 * pressNorm + 2, 2) / 2;
  const angle = LEVER_REST_ANGLE + (LEVER_PRESS_ANGLE - LEVER_REST_ANGLE) * eased;
  return { angle, pressNorm: eased, rawT };
};

export const computeNewestSpawnScale = (rawT: number): number => {
  if (rawT < PRESS_DOWN_RATIO) {
    const k = rawT / PRESS_DOWN_RATIO;
    return 0.05 + k * k * 0.95;
  }
  if (rawT < PRESS_DOWN_RATIO + PRESS_HOLD_RATIO) {
    const settle = (rawT - PRESS_DOWN_RATIO) / PRESS_HOLD_RATIO;
    return 1 + Math.sin(settle * Math.PI) * 0.08;
  }
  return 1;
};
