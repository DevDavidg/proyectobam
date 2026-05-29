import type { BuildingStatus } from '../../../core/types/building';
import { resolveHpVisualState } from '../shared/building-visual-state';
import { COLLECTOR_TIER_SCALES, resolveTierScaleFromTable } from '../shared/tier-scale';
import { resolveToneColor } from '../shared/tone-resolver';
import { PALETTE } from './palette';
import type { TwigState, TwigTone } from './types';

export { clamp01, easeInOut, lerp, stagedProgress } from '../shared/math';

export const resolveState = (
  status: BuildingStatus | undefined,
  hp: number | undefined,
  maxHp: number | undefined,
): TwigState => resolveHpVisualState(status, hp, maxHp);

export const resolveTierScale = (level: number): number =>
  resolveTierScaleFromTable(level, COLLECTOR_TIER_SCALES.twigSnapper);

const TWIG_TONE_PALETTE: Record<TwigTone, string> = {
  light: PALETTE.twigLight,
  mid: PALETTE.twigMid,
  dark: PALETTE.twigDark,
  bark: PALETTE.twigBark,
};

const PLANK_TONE_PALETTE = {
  light: PALETTE.plankLight,
  mid: PALETTE.plankMid,
  dark: PALETTE.plankDark,
} as const;

export const tonePaletteTwig = (tone: TwigTone): string =>
  resolveToneColor(tone, TWIG_TONE_PALETTE, PALETTE.twigMid);

export const tonePalettePlank = (tone: 'light' | 'mid' | 'dark'): string =>
  resolveToneColor(tone, PLANK_TONE_PALETTE, PALETTE.plankMid);
