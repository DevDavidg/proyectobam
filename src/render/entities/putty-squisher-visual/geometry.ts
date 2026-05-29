import { resolveTierScale } from './helpers';
import type { BoltCorner, PuttySlot, PuttySquisherDimensions } from './types';

export const PUTTY_GRID_COLS = 4;
export const PUTTY_GRID_ROWS = 3;
export const PUTTY_GRID_LAYERS = 2;
export const PUTTY_TOTAL = PUTTY_GRID_COLS * PUTTY_GRID_ROWS * PUTTY_GRID_LAYERS;

export const computeDimensions = (
  level: number,
  footprintX: number,
  footprintZ: number,
): PuttySquisherDimensions => {
  const tierScale = resolveTierScale(level);
  const cubeSize = Math.max(0.78, Math.min(1.05, Math.min(footprintX, footprintZ) * 0.5)) * tierScale;
  const cubeBaseY = 0.04;
  const cubeCenterY = cubeBaseY + cubeSize / 2;
  const cubeTopY = cubeBaseY + cubeSize;
  const half = cubeSize / 2;
  const boltRadius = cubeSize * 0.08;
  const boltInset = cubeSize * 0.13;
  const boltOffset = half - boltInset;
  const mountWidth = cubeSize * 0.32;
  const mountDepth = cubeSize * 0.26;
  const mountHeight = cubeSize * 0.18;
  const mountCenterX = cubeSize * 0.12;
  const mountCenterZ = -cubeSize * 0.18;
  const pivotY = cubeTopY + mountHeight + 0.02;
  const leverLength = cubeSize * 0.95;
  const spigotY = cubeBaseY + cubeSize * 0.28;
  const spigotX = cubeSize * 0.5 + 0.005;
  const spigotZ = cubeSize * 0.18;

  const screwSocketSize = cubeSize * 0.42;
  const screwSocketDepth = cubeSize * 0.1;
  const screwShaftRadius = cubeSize * 0.06;
  const screwShaftLength = cubeSize * 0.6;
  const screwTopY = cubeTopY + screwShaftLength * 0.85;
  const wingNutRadius = cubeSize * 0.32;
  const wingNutThickness = cubeSize * 0.08;
  const wingNutY = screwTopY + wingNutThickness * 0.5;

  const gearAxisX = half + cubeSize * 0.04;
  const gearAxisY = cubeBaseY + cubeSize * 0.42;
  const gearAxisZ = 0;
  const gearLargeRadius = cubeSize * 0.22;
  const gearMidRadius = cubeSize * 0.14;
  const gearSmallRadius = cubeSize * 0.11;
  const gearThickness = cubeSize * 0.07;

  const pipeStartX = -half - 0.005;
  const pipeStartY = cubeBaseY + cubeSize * 0.32;
  const pipeStartZ = cubeSize * 0.18;
  const pipeEndX = pipeStartX - cubeSize * 0.32;
  const pipeEndY = cubeBaseY + cubeSize * 0.04;
  const pipeRadius = cubeSize * 0.06;

  const puddleY = 0.014;
  const puddleX = pipeEndX;
  const puddleZ = pipeStartZ;

  const pumpSocketRadius = cubeSize * 0.16;
  const pumpSocketDepth = cubeSize * 0.05;
  const pumpBodyRadius = cubeSize * 0.13;
  const pumpBodyHeight = cubeSize * 0.12;
  const pumpShaftRadius = cubeSize * 0.045;
  const pumpShaftBaseY = cubeTopY - pumpSocketDepth;
  const pumpShaftTopY = cubeTopY + cubeSize * 0.42;
  const pumpHeadRadius = cubeSize * 0.18;
  const pumpHeadThickness = cubeSize * 0.07;
  const pumpStroke = cubeSize * 0.11;
  const pumpLeftX = -cubeSize * 0.2;
  const pumpRightX = cubeSize * 0.2;
  const pumpZ = -cubeSize * 0.05;

  const l3PipeRadius = cubeSize * 0.075;
  const l3PipeStartY = cubeBaseY + cubeSize * 0.22;
  const l3PipeForwardZ = half;
  const l3PipeFloorY = cubeBaseY + cubeSize * 0.05;
  const l3PipeOffsetsX = [-cubeSize * 0.34, cubeSize * 0.02, cubeSize * 0.36] as const;
  const l3PipeForwardLengths = [cubeSize * 0.22, cubeSize * 0.36, cubeSize * 0.5] as const;
  const l3PuddleY = 0.014;
  const l3PuddleZ = l3PipeForwardZ + cubeSize * 0.42;

  return {
    cubeSize,
    cubeBaseY,
    cubeCenterY,
    cubeTopY,
    half,
    boltRadius,
    boltInset,
    boltOffset,
    mountWidth,
    mountDepth,
    mountHeight,
    mountCenterX,
    mountCenterZ,
    pivotY,
    leverLength,
    spigotY,
    spigotX,
    spigotZ,
    screwSocketSize,
    screwSocketDepth,
    screwShaftRadius,
    screwShaftLength,
    screwTopY,
    wingNutRadius,
    wingNutThickness,
    wingNutY,
    gearAxisX,
    gearAxisY,
    gearAxisZ,
    gearLargeRadius,
    gearMidRadius,
    gearSmallRadius,
    gearThickness,
    pipeStartX,
    pipeStartY,
    pipeStartZ,
    pipeEndX,
    pipeEndY,
    pipeRadius,
    puddleY,
    puddleX,
    puddleZ,
    pumpSocketRadius,
    pumpSocketDepth,
    pumpBodyRadius,
    pumpBodyHeight,
    pumpShaftRadius,
    pumpShaftBaseY,
    pumpShaftTopY,
    pumpHeadRadius,
    pumpHeadThickness,
    pumpStroke,
    pumpLeftX,
    pumpRightX,
    pumpZ,
    l3PipeRadius,
    l3PipeStartY,
    l3PipeForwardZ,
    l3PipeFloorY,
    l3PipeOffsetsX,
    l3PipeForwardLengths,
    l3PuddleY,
    l3PuddleZ,
  };
};

export const buildBoltCorners = (dim: PuttySquisherDimensions): BoltCorner[] => {
  const { boltOffset, cubeTopY, cubeBaseY, boltInset } = dim;
  return [
    { id: 'tl-f', pos: [-boltOffset, cubeTopY - boltInset, boltOffset] },
    { id: 'tr-f', pos: [boltOffset, cubeTopY - boltInset, boltOffset] },
    { id: 'tl-b', pos: [-boltOffset, cubeTopY - boltInset, -boltOffset] },
    { id: 'tr-b', pos: [boltOffset, cubeTopY - boltInset, -boltOffset] },
    { id: 'bl-f', pos: [-boltOffset, cubeBaseY + boltInset, boltOffset] },
    { id: 'br-f', pos: [boltOffset, cubeBaseY + boltInset, boltOffset] },
    { id: 'bl-b', pos: [-boltOffset, cubeBaseY + boltInset, -boltOffset] },
    { id: 'br-b', pos: [boltOffset, cubeBaseY + boltInset, -boltOffset] },
  ];
};

export const buildPuttyLayout = (cubeSize: number): PuttySlot[] => {
  const slots: PuttySlot[] = [];
  const cubeUnit = cubeSize * 0.16;
  const gap = cubeUnit * 0.18;
  const stride = cubeUnit + gap;
  const startX = cubeSize * 0.55 + cubeUnit * 0.5;
  const startZ = -((PUTTY_GRID_COLS - 1) * stride) / 2;
  const baseY = 0.04 + cubeUnit * 0.5;
  let index = 0;
  for (let layer = 0; layer < PUTTY_GRID_LAYERS; layer += 1) {
    for (let row = 0; row < PUTTY_GRID_ROWS; row += 1) {
      for (let col = 0; col < PUTTY_GRID_COLS; col += 1) {
        const layerOffset = layer * (cubeUnit * 0.92);
        const wobbleX = (Math.sin(index * 12.9898) * 43758.5453) % 1;
        const wobbleZ = (Math.cos(index * 78.233) * 43758.5453) % 1;
        const wobbleR = Math.sin(index * 2.1) * 0.5;
        slots.push({
          id: `putty-${layer}-${row}-${col}`,
          x: startX + row * stride * 0.85 + wobbleX * cubeUnit * 0.08,
          y: baseY + layerOffset,
          z: startZ + col * stride + wobbleZ * cubeUnit * 0.08,
          rotY: wobbleR * 0.18,
          size: cubeUnit * (0.92 + ((index % 3) - 1) * 0.04),
          thresholdEntry: index / PUTTY_TOTAL,
        });
        index += 1;
      }
    }
  }
  return slots;
};
