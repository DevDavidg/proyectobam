import type { BuildingStatus } from '../../../core/types/building';
import { resolveHpVisualState } from '../shared/building-visual-state';
import { COLLECTOR_TIER_SCALES, resolveTierScaleFromTable } from '../shared/tier-scale';
import { resolveToneColor } from '../shared/tone-resolver';
import { PALETTE } from './palette';
import type { GroundPebbleTone, InteriorPebbleTone, PebbleState } from './types';

export { clamp01, easeInOut } from '../shared/math';

export const resolveState = (
  status: BuildingStatus | undefined,
  hp: number | undefined,
  maxHp: number | undefined,
): PebbleState => resolveHpVisualState(status, hp, maxHp);

export const resolveTierScale = (level: number): number =>
  resolveTierScaleFromTable(level, COLLECTOR_TIER_SCALES.pebbleShiner);

const INTERIOR_PEBBLE_PALETTE: Record<InteriorPebbleTone, string> = {
  warm: PALETTE.pebbleWarm,
  mid: PALETTE.pebbleMid,
  cool: PALETTE.pebbleCool,
  dark: PALETTE.pebbleDark,
  highlight: PALETTE.pebbleHighlight,
};

const GROUND_PEBBLE_PALETTE: Record<GroundPebbleTone, string> = {
  warm: PALETTE.pebbleWarm,
  mid: PALETTE.pebbleMid,
  cool: PALETTE.pebbleCool,
  dark: PALETTE.pebbleDark,
};

export const tonePalette = (tone: InteriorPebbleTone): string =>
  resolveToneColor(tone, INTERIOR_PEBBLE_PALETTE, PALETTE.pebbleMid);

export const tonePaletteGround = (tone: GroundPebbleTone): string =>
  resolveToneColor(tone, GROUND_PEBBLE_PALETTE, PALETTE.pebbleMid);
