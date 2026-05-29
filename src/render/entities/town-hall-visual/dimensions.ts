import type { BuildingStatus } from '../../../core/types/building';
import { resolveHpVisualState } from '../shared/building-visual-state';
import { lerp } from '../shared/math';
import type { TownHallDimensions, TownHallState } from './types';

type TierProportions = {
  tierScale: number;
  bodyHeightMult: number;
  funnelHeightMult: number;
  funnelTopMult: number;
  funnelBaseMult: number;
  funnelStemMult: number;
  panelInsetMult: number;
  baseLiftMult: number;
  roofHeightMult: number;
};

const TIER_PROPORTIONS: Record<number, TierProportions> = {
  1: {
    tierScale: 0.96,
    bodyHeightMult: 1.55,
    funnelHeightMult: 0.28,
    funnelTopMult: 0.48,
    funnelBaseMult: 0.26,
    funnelStemMult: 0.21,
    panelInsetMult: 1,
    baseLiftMult: 1,
    roofHeightMult: 1,
  },
  2: {
    tierScale: 1.05,
    bodyHeightMult: 1.92,
    funnelHeightMult: 0.34,
    funnelTopMult: 0.55,
    funnelBaseMult: 0.3,
    funnelStemMult: 0.23,
    panelInsetMult: 1.05,
    baseLiftMult: 1,
    roofHeightMult: 1,
  },
  3: {
    tierScale: 1.1,
    bodyHeightMult: 2.0,
    funnelHeightMult: 0.5,
    funnelTopMult: 0.78,
    funnelBaseMult: 0.42,
    funnelStemMult: 0.22,
    panelInsetMult: 1.1,
    baseLiftMult: 4.4,
    roofHeightMult: 2.6,
  },
  6: {
    tierScale: 1.16,
    bodyHeightMult: 2.12,
    funnelHeightMult: 0.55,
    funnelTopMult: 0.84,
    funnelBaseMult: 0.44,
    funnelStemMult: 0.23,
    panelInsetMult: 1.12,
    baseLiftMult: 5,
    roofHeightMult: 2.8,
  },
  10: {
    tierScale: 1.22,
    bodyHeightMult: 2.26,
    funnelHeightMult: 0.6,
    funnelTopMult: 0.9,
    funnelBaseMult: 0.46,
    funnelStemMult: 0.24,
    panelInsetMult: 1.14,
    baseLiftMult: 5.6,
    roofHeightMult: 3.0,
  },
};

const resolveTierProportions = (level: number): TierProportions => {
  const safeLevel = Math.max(1, Math.floor(level));
  const knownLevels = Object.keys(TIER_PROPORTIONS)
    .map((key) => Number(key))
    .sort((a, b) => a - b);
  let chosen = TIER_PROPORTIONS[1];
  for (const known of knownLevels) {
    if (safeLevel >= known) {
      chosen = TIER_PROPORTIONS[known];
    }
  }
  return chosen;
};

const blendProportions = (a: TierProportions, b: TierProportions, t: number): TierProportions => ({
  tierScale: lerp(a.tierScale, b.tierScale, t),
  bodyHeightMult: lerp(a.bodyHeightMult, b.bodyHeightMult, t),
  funnelHeightMult: lerp(a.funnelHeightMult, b.funnelHeightMult, t),
  funnelTopMult: lerp(a.funnelTopMult, b.funnelTopMult, t),
  funnelBaseMult: lerp(a.funnelBaseMult, b.funnelBaseMult, t),
  funnelStemMult: lerp(a.funnelStemMult, b.funnelStemMult, t),
  panelInsetMult: lerp(a.panelInsetMult, b.panelInsetMult, t),
  baseLiftMult: lerp(a.baseLiftMult, b.baseLiftMult, t),
  roofHeightMult: lerp(a.roofHeightMult, b.roofHeightMult, t),
});

export type DimensionBlend = {
  fromLevel: number;
  toLevel: number;
  t: number;
};

export const resolveDimensionBlend = (
  level: number,
  status: string | undefined,
  constructionProgress: number | undefined,
): DimensionBlend => {
  if (status === 'UNDER_CONSTRUCTION' || status === 'PENDING') {
    const t = Math.max(0, Math.min(1, constructionProgress ?? 0));
    return { fromLevel: Math.max(1, level - 1), toLevel: Math.max(1, level), t };
  }
  return { fromLevel: level, toLevel: level, t: 1 };
};

export const resolveTierScale = (level: number): number => resolveTierProportions(level).tierScale;

const tierWeightFor = (
  targetTier: number,
  level: number,
  status: string | undefined,
  constructionProgress: number | undefined,
): number => {
  if (level < targetTier) {
    return 0;
  }
  if (level > targetTier) {
    return 1;
  }
  if (status === 'UNDER_CONSTRUCTION' || status === 'PENDING') {
    const raw = typeof constructionProgress === 'number' ? constructionProgress : 0;
    return Math.max(0, Math.min(1, raw));
  }
  return 1;
};

export const resolveTier2Weight = (
  level: number,
  status: string | undefined,
  constructionProgress: number | undefined,
): number => tierWeightFor(2, level, status, constructionProgress);

export const resolveTier3Weight = (
  level: number,
  status: string | undefined,
  constructionProgress: number | undefined,
): number => tierWeightFor(3, level, status, constructionProgress);

export const resolveState = (
  status: BuildingStatus | undefined,
  hp: number | undefined,
  maxHp: number | undefined,
): TownHallState => resolveHpVisualState(status, hp, maxHp, { includeInAction: false });

export const computeDimensions = (
  level: number,
  footprintX: number,
  footprintZ: number,
  blend: DimensionBlend = { fromLevel: level, toLevel: level, t: 1 },
): TownHallDimensions => {
  const fromProps = resolveTierProportions(blend.fromLevel);
  const toProps = resolveTierProportions(blend.toLevel);
  const props = blendProportions(fromProps, toProps, blend.t);

  const halfFootprintMin = Math.min(footprintX, footprintZ) * 0.5;

  const halfX = Math.min(1.7, halfFootprintMin * 0.7) * props.tierScale;
  const halfZ = halfX;

  const baseLift = 0.05 * props.baseLiftMult;
  const bodyHeight = halfX * props.bodyHeightMult;
  const bodyTop = baseLift + bodyHeight;

  const trimHeight = bodyHeight * 0.085;

  const panelCount = 6;
  const panelWidth = (halfX * 2) / panelCount;
  const panelInset = 0.012;
  const cornerInset = 0.06;

  const roofHeight = bodyHeight * 0.05 * props.roofHeightMult;
  const roofTop = bodyTop + roofHeight;

  const doorWidth = halfX * 0.55;
  const doorHeight = bodyHeight * 0.42;
  const doorDepth = 0.04;
  const doorY = baseLift + doorHeight / 2;
  const doorOffsetX = -halfX * 0.3;

  const patchWidth = halfX * 0.42;
  const patchHeight = bodyHeight * 0.22;
  const patchDepth = 0.045;
  const patchY = baseLift + bodyHeight * 0.55;
  const patchOffsetZ = halfZ * 0.18;

  const pipeRadius = 0.13;
  const pipeY = baseLift + pipeRadius + 0.04;

  const funnelStemRadius = halfX * props.funnelStemMult;
  const funnelStemHeight = bodyHeight * 0.06;
  const funnelStemY = roofTop + funnelStemHeight / 2;
  const funnelBaseRadius = halfX * props.funnelBaseMult;
  const funnelTopRadius = halfX * props.funnelTopMult;
  const funnelHeight = bodyHeight * props.funnelHeightMult;
  const funnelY = roofTop + funnelStemHeight + funnelHeight / 2;

  return {
    tierScale: props.tierScale,
    halfX,
    halfZ,
    baseLift,
    bodyHeight,
    bodyTop,
    trimHeight,
    panelCount,
    panelWidth,
    panelInset,
    cornerInset,
    roofHeight,
    roofTop,
    doorWidth,
    doorHeight,
    doorDepth,
    doorY,
    doorOffsetX,
    patchWidth,
    patchHeight,
    patchDepth,
    patchY,
    patchOffsetZ,
    pipeRadius,
    pipeY,
    funnelStemRadius,
    funnelStemHeight,
    funnelStemY,
    funnelBaseRadius,
    funnelTopRadius,
    funnelHeight,
    funnelY,
  };
};
