import { resolveTierScale } from './helpers';
import type {
  CrateWallPlank,
  DebrisTwig,
  FrameCornerPosition,
  FrameRail,
  GearTooth,
  GroundTwig,
  OverflowTwig,
  PlankSlat,
  RollerSpike,
  TwigSnapperDimensions,
} from './types';

const BIG_GEAR_TEETH_COUNT = 12;
const SMALL_GEAR_TEETH_COUNT = 9;
const ROLLER_SPIKE_RINGS = 5;
const ROLLER_SPIKES_PER_RING = 6;

const buildGearTeeth = (count: number, idPrefix: string): GearTooth[] =>
  Array.from({ length: count }).map((_, index) => ({
    id: `${idPrefix}-${index}`,
    angle: (index / count) * Math.PI * 2,
  }));

const buildRollerSpikes = (
  rings: number,
  spikesPerRing: number,
  rollerLength: number,
  idPrefix: string,
): RollerSpike[] => {
  const spikes: RollerSpike[] = [];
  const halfLen = rollerLength / 2;
  const margin = rollerLength * 0.08;
  const usable = rollerLength - margin * 2;
  for (let ring = 0; ring < rings; ring += 1) {
    const ringT = rings === 1 ? 0.5 : ring / (rings - 1);
    const xLocal = -halfLen + margin + usable * ringT;
    const ringOffset = (ring % 2) * (Math.PI / spikesPerRing);
    for (let spike = 0; spike < spikesPerRing; spike += 1) {
      const angle = ringOffset + (spike / spikesPerRing) * Math.PI * 2;
      spikes.push({
        id: `${idPrefix}-${ring}-${spike}`,
        ringIndex: ring,
        spikeIndex: spike,
        x: xLocal,
        angle,
      });
    }
  }
  return spikes;
};

const buildCrateWallPlanks = (bottomY: number, height: number): CrateWallPlank[] => {
  const plankCount = 3;
  const tones: Array<'light' | 'mid' | 'dark'> = ['mid', 'light', 'dark'];
  const plankHeight = (height - 0.018) / plankCount;
  const planks: CrateWallPlank[] = [];
  for (let i = 0; i < plankCount; i += 1) {
    planks.push({
      id: `crate-plank-${i}`,
      y: bottomY + 0.01 + plankHeight / 2 + i * (plankHeight + 0.004),
      height: plankHeight,
      tone: tones[i] ?? 'mid',
    });
  }
  return planks;
};

export const computeDimensions = (
  level: number,
  footprintX: number,
  footprintZ: number,
): TwigSnapperDimensions => {
  const tierScale = resolveTierScale(level);
  const halfX = Math.min(0.78, footprintX * 0.4) * tierScale;
  const halfZ = Math.min(0.52, footprintZ * 0.28) * tierScale;
  const baseLift = 0.04;
  const platformHeight = 0.1;
  const platformTop = baseLift + platformHeight;

  const plankCount = 4;
  const plankSpacing = 0.012;
  const plankInsetZ = 0.02;
  const platformExtensionX = 0.06;

  const footHeight = 0.08;
  const footSize = 0.14;

  const anvilWidth = 0.22 * tierScale;
  const anvilDepth = 0.2 * tierScale;
  const anvilHeight = 0.18 * tierScale;
  const anvilX = -halfX + anvilWidth / 2 + 0.16;
  const anvilZ = 0.02;
  const anvilTop = platformTop + anvilHeight;

  const postWidth = 0.16 * tierScale;
  const postDepth = 0.16 * tierScale;
  const postHeightBase = level >= 2 ? 0.62 : 0.5;
  const postHeight = postHeightBase * tierScale;
  const postX = halfX - postWidth / 2 - 0.12;
  const postZ = -0.02;
  const postTopY = platformTop + postHeight;

  const hammerPivotX = postX;
  const hammerPivotY = postTopY - 0.05;
  const hammerPivotZ = postZ;
  const hammerArmLength = Math.abs(hammerPivotX - anvilX) + 0.14;
  const hammerArmThickness = 0.08 * tierScale;
  const hammerArmHeight = 0.09 * tierScale;
  const hammerHeadSize = 0.2 * tierScale;
  const hammerHeadHeight = 0.22 * tierScale;
  const hammerHeadX = -hammerArmLength + hammerHeadSize / 2 + 0.02;

  const frameCornerSize = 0.085;
  const frameInset = 0.04;
  const frameCornerHeight = 0.55;
  const frameCornerTopY = platformTop + frameCornerHeight;
  const frameCorners: FrameCornerPosition[] = [
    { id: 'frame-fl', x: -halfX + frameInset + frameCornerSize / 2, z: halfZ - frameInset - frameCornerSize / 2 },
    { id: 'frame-fr', x: halfX - frameInset - frameCornerSize / 2, z: halfZ - frameInset - frameCornerSize / 2 },
    { id: 'frame-bl', x: -halfX + frameInset + frameCornerSize / 2, z: -halfZ + frameInset + frameCornerSize / 2 },
    { id: 'frame-br', x: halfX - frameInset - frameCornerSize / 2, z: -halfZ + frameInset + frameCornerSize / 2 },
  ];
  const frameRails: FrameRail[] = [
    { id: 'rail-low', y: platformTop + 0.1, thickness: 0.04 },
    { id: 'rail-mid', y: platformTop + 0.27, thickness: 0.04 },
    { id: 'rail-top', y: platformTop + 0.44, thickness: 0.04 },
  ];
  const frameTopBeamY = frameCornerTopY - 0.025;
  const frameTopBeamThickness = 0.06;

  const hasL3 = level >= 3;
  const gearAxleY = platformTop + 0.26;
  const gearAxleZ = halfZ - 0.18;
  const gearAxleLength = halfX * 2 - frameInset * 2 - frameCornerSize - 0.04;
  const gearAxleRadius = 0.028;

  const bigGearRadius = 0.15;
  const bigGearThickness = 0.05;
  const bigGearX = -halfX * 0.18;
  const bigGearTeeth = buildGearTeeth(BIG_GEAR_TEETH_COUNT, 'big-tooth');

  const smallGearRadius = 0.11;
  const smallGearThickness = 0.045;
  const smallGearX = bigGearX + bigGearRadius + smallGearRadius - 0.018;
  const smallGearZ = gearAxleZ;
  const smallGearTeeth = buildGearTeeth(SMALL_GEAR_TEETH_COUNT, 'small-tooth');

  const crankSide: 1 | -1 = hasL3 ? 1 : -1;
  const crankAxleZ = hasL3 ? 0 : gearAxleZ;
  const crankAxleY = hasL3 ? platformTop + 0.3 : gearAxleY;
  const crankAxleStartX = hasL3 ? halfX - 0.02 : bigGearX;
  const crankAxleEndX = (halfX + 0.14) * crankSide;
  const crankArmLength = 0.12;
  const crankHandleLength = 0.12;
  const crankKnobRadius = 0.04;

  const crateWallThickness = 0.05;
  const crateWallBottomY = platformTop + 0.02;
  const crateWallTopY = frameCornerTopY - 0.05;
  const crateWallHeight = crateWallTopY - crateWallBottomY;
  const crateWallPlanks = buildCrateWallPlanks(crateWallBottomY, crateWallHeight);
  const crateFrontZ = halfZ - frameInset - crateWallThickness / 2 - 0.005;
  const crateBackZ = -halfZ + frameInset + crateWallThickness / 2 + 0.005;
  const crateLeftX = -halfX + frameInset + crateWallThickness / 2 + 0.005;
  const crateRightX = halfX - frameInset - crateWallThickness / 2 - 0.005;

  const lidWidthX = halfX * 2 - frameInset * 2 - frameCornerSize * 0.6;
  const lidDepthZ = halfZ * 1.18;
  const lidThickness = 0.035;
  const lidHingeZ = -halfZ + frameInset + frameCornerSize * 0.5;
  const lidHingeY = frameCornerTopY - 0.02;
  const lidOpenAngle = -1.0;

  const rollerRadius = 0.075;
  const rollerLength = halfX * 2 - frameInset * 2 - frameCornerSize - 0.06;
  const rollerY = platformTop + 0.4;
  const rollerSpacing = 0.2;
  const rollerFrontZ = rollerSpacing / 2;
  const rollerBackZ = -rollerSpacing / 2;
  const rollerSpikes = buildRollerSpikes(ROLLER_SPIKE_RINGS, ROLLER_SPIKES_PER_RING, rollerLength, 'spike');
  const rollerSpikeLength = 0.048;
  const rollerSpikeRadius = 0.018;

  return {
    tierScale,
    halfX,
    halfZ,
    baseLift,
    platformHeight,
    platformTop,
    plankCount,
    plankSpacing,
    plankInsetZ,
    platformExtensionX,
    footHeight,
    footSize,
    anvilX,
    anvilZ,
    anvilWidth,
    anvilDepth,
    anvilHeight,
    anvilTop,
    postX,
    postZ,
    postWidth,
    postDepth,
    postHeight,
    postTopY,
    hammerPivotX,
    hammerPivotY,
    hammerPivotZ,
    hammerArmLength,
    hammerArmThickness,
    hammerArmHeight,
    hammerHeadX,
    hammerHeadSize,
    hammerHeadHeight,
    frameCornerSize,
    frameCornerHeight,
    frameCornerTopY,
    frameInset,
    frameCorners,
    frameRails,
    frameTopBeamY,
    frameTopBeamThickness,
    gearAxleY,
    gearAxleZ,
    gearAxleLength,
    gearAxleRadius,
    bigGearRadius,
    bigGearThickness,
    bigGearX,
    bigGearTeeth,
    smallGearRadius,
    smallGearThickness,
    smallGearX,
    smallGearZ,
    smallGearTeeth,
    crankAxleStartX,
    crankAxleEndX,
    crankAxleY,
    crankAxleZ,
    crankArmLength,
    crankHandleLength,
    crankKnobRadius,
    crateWallThickness,
    crateWallBottomY,
    crateWallTopY,
    crateWallHeight,
    crateWallPlanks,
    crateFrontZ,
    crateBackZ,
    crateLeftX,
    crateRightX,
    lidWidthX,
    lidDepthZ,
    lidThickness,
    lidHingeZ,
    lidHingeY,
    lidOpenAngle,
    rollerRadius,
    rollerLength,
    rollerY,
    rollerFrontZ,
    rollerBackZ,
    rollerSpikes,
    rollerSpikeLength,
    rollerSpikeRadius,
  };
};

export const buildPlanks = (
  halfX: number,
  halfZ: number,
  plankCount: number,
  plankSpacing: number,
  plankInsetZ: number,
  platformExtensionX: number,
): PlankSlat[] => {
  const usableZ = halfZ * 2 - plankInsetZ * 2;
  const plankDepth = (usableZ - plankSpacing * (plankCount - 1)) / plankCount;
  const planks: PlankSlat[] = [];
  const tones: Array<'light' | 'mid' | 'dark'> = ['mid', 'light', 'mid', 'dark'];
  for (let index = 0; index < plankCount; index += 1) {
    const z = -halfZ + plankInsetZ + plankDepth / 2 + index * (plankDepth + plankSpacing);
    planks.push({
      id: `plank-${index}`,
      z,
      width: halfX * 2 + platformExtensionX * 2,
      depth: plankDepth,
      tone: tones[index] ?? 'mid',
    });
  }
  return planks;
};

export const GROUND_TWIG_BUNDLE_LEFT: GroundTwig[] = [
  { id: 'btl-1', x: -0.92, z: 0.62, y: 0.025, length: 0.32, thickness: 0.022, rotationY: 0.5, tiltX: 0.05, tiltZ: 0.08, tone: 'mid' },
  { id: 'btl-2', x: -1, z: 0.58, y: 0.05, length: 0.3, thickness: 0.018, rotationY: 0.85, tiltX: 0, tiltZ: 0.18, tone: 'dark' },
  { id: 'btl-3', x: -0.85, z: 0.7, y: 0.04, length: 0.28, thickness: 0.02, rotationY: 1.2, tiltX: 0.1, tiltZ: -0.05, tone: 'light' },
  { id: 'btl-4', x: -0.96, z: 0.74, y: 0.07, length: 0.34, thickness: 0.022, rotationY: 0.35, tiltX: -0.05, tiltZ: 0.12, tone: 'mid' },
  { id: 'btl-5', x: -1.06, z: 0.66, y: 0.08, length: 0.28, thickness: 0.018, rotationY: 1.5, tiltX: 0.08, tiltZ: -0.1, tone: 'bark' },
  { id: 'btl-6', x: -0.88, z: 0.56, y: 0.07, length: 0.26, thickness: 0.016, rotationY: 0.2, tiltX: 0, tiltZ: 0.22, tone: 'light' },
];

export const GROUND_TWIG_BUNDLE_RIGHT: GroundTwig[] = [
  { id: 'btr-1', x: 0.92, z: 0.66, y: 0.025, length: 0.36, thickness: 0.024, rotationY: -0.3, tiltX: 0.05, tiltZ: -0.06, tone: 'mid' },
  { id: 'btr-2', x: 1.04, z: 0.6, y: 0.045, length: 0.32, thickness: 0.02, rotationY: -0.7, tiltX: 0, tiltZ: -0.16, tone: 'dark' },
  { id: 'btr-3', x: 0.86, z: 0.74, y: 0.04, length: 0.3, thickness: 0.022, rotationY: -1.1, tiltX: 0.1, tiltZ: 0.04, tone: 'light' },
  { id: 'btr-4', x: 0.96, z: 0.78, y: 0.075, length: 0.32, thickness: 0.02, rotationY: -0.4, tiltX: -0.06, tiltZ: -0.1, tone: 'mid' },
  { id: 'btr-5', x: 1.1, z: 0.7, y: 0.08, length: 0.28, thickness: 0.018, rotationY: -1.6, tiltX: 0.08, tiltZ: 0.12, tone: 'bark' },
  { id: 'btr-6', x: 0.82, z: 0.62, y: 0.07, length: 0.24, thickness: 0.016, rotationY: -0.2, tiltX: 0, tiltZ: -0.2, tone: 'light' },
  { id: 'btr-7', x: 1, z: 0.86, y: 0.05, length: 0.22, thickness: 0.014, rotationY: -1.3, tiltX: 0.05, tiltZ: 0, tone: 'mid' },
];

export const STRAY_GROUND_TWIGS: GroundTwig[] = [
  { id: 'stray-1', x: -0.72, z: -0.78, y: 0.02, length: 0.22, thickness: 0.016, rotationY: 0.6, tiltX: 0, tiltZ: 0, tone: 'light' },
  { id: 'stray-2', x: 0.74, z: -0.74, y: 0.02, length: 0.2, thickness: 0.014, rotationY: -0.8, tiltX: 0, tiltZ: 0, tone: 'mid' },
  { id: 'stray-3', x: -0.04, z: 0.96, y: 0.02, length: 0.18, thickness: 0.014, rotationY: 1.3, tiltX: 0, tiltZ: 0, tone: 'dark' },
];

export const OVERFLOW_TWIG_PILES: OverflowTwig[] = [
  { id: 'ov-fl-1', x: -0.78, z: 0.5, y: 0.05, length: 0.3, thickness: 0.022, rotationY: 0.2, tiltX: 0, tiltZ: 0.16, tone: 'mid', threshold: 0.1, bobPhase: 0.0 },
  { id: 'ov-fl-2', x: -1.12, z: 0.5, y: 0.07, length: 0.28, thickness: 0.02, rotationY: 1.2, tiltX: 0.05, tiltZ: -0.08, tone: 'light', threshold: 0.18, bobPhase: 0.4 },
  { id: 'ov-fl-3', x: -0.94, z: 0.86, y: 0.11, length: 0.32, thickness: 0.022, rotationY: 0.6, tiltX: 0, tiltZ: 0.18, tone: 'dark', threshold: 0.26, bobPhase: 0.8 },
  { id: 'ov-fl-4', x: -0.88, z: 0.6, y: 0.14, length: 0.26, thickness: 0.018, rotationY: 1.0, tiltX: 0.08, tiltZ: -0.04, tone: 'bark', threshold: 0.42, bobPhase: 1.3 },

  { id: 'ov-fr-1', x: 0.78, z: 0.52, y: 0.05, length: 0.32, thickness: 0.022, rotationY: -0.2, tiltX: 0, tiltZ: -0.12, tone: 'mid', threshold: 0.12, bobPhase: 0.2 },
  { id: 'ov-fr-2', x: 1.16, z: 0.52, y: 0.07, length: 0.3, thickness: 0.02, rotationY: -1.2, tiltX: 0.05, tiltZ: 0.06, tone: 'light', threshold: 0.2, bobPhase: 0.55 },
  { id: 'ov-fr-3', x: 0.94, z: 0.92, y: 0.11, length: 0.34, thickness: 0.022, rotationY: -0.5, tiltX: 0, tiltZ: -0.18, tone: 'dark', threshold: 0.3, bobPhase: 0.95 },
  { id: 'ov-fr-4', x: 0.92, z: 0.62, y: 0.14, length: 0.28, thickness: 0.018, rotationY: -1.0, tiltX: 0.08, tiltZ: 0.04, tone: 'bark', threshold: 0.46, bobPhase: 1.45 },

  { id: 'ov-bl-1', x: -0.92, z: -0.7, y: 0.03, length: 0.28, thickness: 0.02, rotationY: 0.3, tiltX: 0, tiltZ: 0.1, tone: 'mid', threshold: 0.34, bobPhase: 1.7 },
  { id: 'ov-bl-2', x: -1.04, z: -0.78, y: 0.05, length: 0.3, thickness: 0.022, rotationY: 1.1, tiltX: 0.05, tiltZ: -0.08, tone: 'dark', threshold: 0.5, bobPhase: 2.1 },
  { id: 'ov-bl-3', x: -0.84, z: -0.6, y: 0.08, length: 0.26, thickness: 0.018, rotationY: 0.7, tiltX: 0, tiltZ: 0.14, tone: 'light', threshold: 0.66, bobPhase: 2.5 },

  { id: 'ov-br-1', x: 0.92, z: -0.7, y: 0.03, length: 0.3, thickness: 0.022, rotationY: -0.3, tiltX: 0, tiltZ: -0.1, tone: 'mid', threshold: 0.38, bobPhase: 1.9 },
  { id: 'ov-br-2', x: 1.04, z: -0.78, y: 0.05, length: 0.28, thickness: 0.02, rotationY: -1.1, tiltX: 0.05, tiltZ: 0.06, tone: 'dark', threshold: 0.54, bobPhase: 2.3 },
  { id: 'ov-br-3', x: 0.84, z: -0.6, y: 0.08, length: 0.26, thickness: 0.018, rotationY: -0.7, tiltX: 0, tiltZ: -0.14, tone: 'light', threshold: 0.7, bobPhase: 2.75 },

  { id: 'ov-sl-1', x: -1.18, z: 0.08, y: 0.04, length: 0.32, thickness: 0.022, rotationY: 1.5, tiltX: 0, tiltZ: 0, tone: 'mid', threshold: 0.58, bobPhase: 3.0 },
  { id: 'ov-sl-2', x: -1.22, z: -0.12, y: 0.07, length: 0.28, thickness: 0.02, rotationY: 1.4, tiltX: 0.04, tiltZ: 0.06, tone: 'bark', threshold: 0.78, bobPhase: 3.4 },

  { id: 'ov-sr-1', x: 1.18, z: 0.08, y: 0.04, length: 0.32, thickness: 0.022, rotationY: -1.5, tiltX: 0, tiltZ: 0, tone: 'mid', threshold: 0.6, bobPhase: 3.2 },
  { id: 'ov-sr-2', x: 1.22, z: -0.12, y: 0.07, length: 0.28, thickness: 0.02, rotationY: -1.4, tiltX: 0.04, tiltZ: -0.06, tone: 'bark', threshold: 0.82, bobPhase: 3.6 },

  { id: 'ov-stack-1', x: -0.78, z: -0.06, y: 0.18, length: 0.34, thickness: 0.022, rotationY: 0.05, tiltX: 0, tiltZ: 0, tone: 'dark', threshold: 0.86, bobPhase: 3.8 },
  { id: 'ov-stack-2', x: 0.78, z: -0.06, y: 0.18, length: 0.34, thickness: 0.022, rotationY: -0.05, tiltX: 0, tiltZ: 0, tone: 'dark', threshold: 0.92, bobPhase: 4.0 },
];

export const DEBRIS_TWIGS: DebrisTwig[] = [
  { id: 'dbr-1', offsetX: 0.04, offsetZ: 0.06, velocityX: 0.55, velocityZ: 0.4, velocityY: 0.7, spinAxisX: 0.3, spinAxisY: 0.8, spinAxisZ: 0.5, spinSpeed: 6.4, phaseOffset: 0, length: 0.16, thickness: 0.018, tone: 'mid' },
  { id: 'dbr-2', offsetX: -0.04, offsetZ: 0.02, velocityX: -0.5, velocityZ: 0.45, velocityY: 0.65, spinAxisX: 0.6, spinAxisY: 0.2, spinAxisZ: 0.8, spinSpeed: 5.8, phaseOffset: 0.07, length: 0.18, thickness: 0.02, tone: 'light' },
  { id: 'dbr-3', offsetX: 0.02, offsetZ: -0.05, velocityX: 0.35, velocityZ: -0.5, velocityY: 0.72, spinAxisX: 0.4, spinAxisY: 0.9, spinAxisZ: 0.1, spinSpeed: 7.2, phaseOffset: 0.04, length: 0.14, thickness: 0.016, tone: 'dark' },
  { id: 'dbr-4', offsetX: -0.06, offsetZ: -0.02, velocityX: -0.4, velocityZ: -0.45, velocityY: 0.58, spinAxisX: 0.9, spinAxisY: 0.5, spinAxisZ: 0.2, spinSpeed: 5.2, phaseOffset: 0.1, length: 0.2, thickness: 0.02, tone: 'mid' },
  { id: 'dbr-5', offsetX: 0, offsetZ: 0.04, velocityX: 0.05, velocityZ: 0.55, velocityY: 0.78, spinAxisX: 0.2, spinAxisY: 0.7, spinAxisZ: 0.6, spinSpeed: 6.8, phaseOffset: 0.02, length: 0.15, thickness: 0.018, tone: 'bark' },
  { id: 'dbr-6', offsetX: 0.05, offsetZ: -0.04, velocityX: 0.42, velocityZ: -0.12, velocityY: 0.66, spinAxisX: 0.5, spinAxisY: 0.4, spinAxisZ: 0.9, spinSpeed: 6, phaseOffset: 0.06, length: 0.17, thickness: 0.017, tone: 'light' },
];
