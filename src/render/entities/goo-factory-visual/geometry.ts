import { resolveTierScale } from './helpers';

export type PumpStyle = 'standard' | 'large';
export type DriveType = 'wheel' | 'gear-motor';
export type TankMaterial = 'wood' | 'bronze';

export type PumpSlot = {
  id: string;
  x: number;
  z: number;
  scale: number;
  phaseOffset: number;
  style: PumpStyle;
};

export type PipeSlot = {
  id: string;
  side: 1 | -1;
  hasGauge: boolean;
};

export type GooFactoryDimensions = {
  tankRadius: number;
  tankHeight: number;
  baseLift: number;
  tankBottom: number;
  tankTop: number;
  pumpShaftRadius: number;
  pumpShaftBaseY: number;
  pumpShaftTopY: number;
  pumpBodyBaseY: number;
  pumpBodyHeight: number;
  pumpBodyTopY: number;
  pistonRestY: number;
  pistonStroke: number;
  driveCenterX: number;
  driveCenterY: number;
  driveCenterZ: number;
  motorBaseY: number;
  motorBodyY: number;
  motorTopY: number;
  motorRadius: number;
  wheelRadius: number;
  pinRadius: number;
  pipeOutletX: number;
  pipeOutletY: number;
  pipeCornerX: number;
  pipeBottomY: number;
  pipeGroundEndX: number;
  groundY: number;
  staveCount: number;
  legSpan: number;
  pumps: PumpSlot[];
  pipes: PipeSlot[];
  driveType: DriveType;
  tankMaterial: TankMaterial;
  hasGauge: boolean;
  hasValves: boolean;
  hasTopArchPipe: boolean;
};

const computePumps = (level: number): PumpSlot[] => {
  if (level >= 3) {
    return [{ id: 'pump-big', x: 0, z: 0, scale: 1, phaseOffset: 0, style: 'large' }];
  }
  if (level >= 2) {
    return [
      { id: 'pump-a', x: 0, z: -0.16, scale: 0.82, phaseOffset: 0, style: 'standard' },
      { id: 'pump-b', x: 0, z: 0.16, scale: 0.82, phaseOffset: Math.PI, style: 'standard' },
    ];
  }
  return [{ id: 'pump-main', x: 0, z: 0, scale: 1, phaseOffset: 0, style: 'standard' }];
};

const computePipes = (level: number): PipeSlot[] => {
  if (level >= 3) {
    return [
      { id: 'pipe-right', side: 1, hasGauge: false },
      { id: 'pipe-left', side: -1, hasGauge: false },
    ];
  }
  return [{ id: 'pipe-right', side: 1, hasGauge: level >= 2 }];
};

const computeDriveType = (level: number): DriveType =>
  level >= 3 ? 'gear-motor' : 'wheel';

export const computeDimensions = (
  level: number,
  footprintX: number,
  footprintZ: number,
): GooFactoryDimensions => {
  const tierScale = resolveTierScale(level);
  const isTallSlim = level >= 3;
  const baseTankRadius = Math.max(
    0.46,
    Math.min(0.6, Math.min(footprintX, footprintZ) * 0.28) * tierScale,
  );
  const tankRadius = isTallSlim ? baseTankRadius * 0.78 : baseTankRadius;
  const tankHeight = (isTallSlim ? 1.05 : 0.82) * tierScale;
  const baseLift = 0.22;
  const tankBottom = baseLift;
  const tankTop = tankBottom + tankHeight;
  const pumpShaftRadius = isTallSlim ? 0.105 : 0.075;
  const pumpShaftBaseY = tankBottom + 0.04;
  const pumpShaftTopY = tankTop + 0.04;
  const pumpBodyBaseY = pumpShaftTopY;
  const pumpBodyHeight = isTallSlim ? 0.26 : 0.16;
  const pumpBodyTopY = pumpBodyBaseY + pumpBodyHeight;
  const pistonRestY = pumpBodyTopY + 0.02;
  const pistonStroke = isTallSlim ? 0.05 : 0.08;
  const driveCenterX = isTallSlim ? tankRadius * 0.55 : tankRadius + 0.32;
  const driveCenterZ = isTallSlim ? tankRadius + 0.36 : 0;
  const motorBaseY = 0.03 + 0.07;
  const motorRadius = 0.13;
  const pedestalHeight = isTallSlim ? 0.22 : 0;
  const motorBodyY = motorBaseY + 0.07 + pedestalHeight + motorRadius;
  const motorTopY = motorBodyY + motorRadius;
  const driveCenterY = isTallSlim
    ? motorBodyY
    : pumpBodyBaseY + pumpBodyHeight * 0.5;
  const wheelRadius = isTallSlim ? 0.18 : 0.14;
  const pinRadius = wheelRadius * 0.55;
  const pipeOutletY = tankBottom + (isTallSlim ? 0.16 : 0.2);
  const pipeOutletX = tankRadius - 0.06;
  const pipeCornerX = tankRadius + 0.28;
  const pipeBottomY = 0.08;
  const pipeGroundEndX = tankRadius + 0.72;
  const groundY = 0.03;
  return {
    tankRadius,
    tankHeight,
    baseLift,
    tankBottom,
    tankTop,
    pumpShaftRadius,
    pumpShaftBaseY,
    pumpShaftTopY,
    pumpBodyBaseY,
    pumpBodyHeight,
    pumpBodyTopY,
    pistonRestY,
    pistonStroke,
    driveCenterX,
    driveCenterY,
    driveCenterZ,
    motorBaseY,
    motorBodyY,
    motorTopY,
    motorRadius,
    wheelRadius,
    pinRadius,
    pipeOutletX,
    pipeOutletY,
    pipeCornerX,
    pipeBottomY,
    pipeGroundEndX,
    groundY,
    staveCount: isTallSlim ? 12 : 14,
    legSpan: tankRadius + 0.32,
    pumps: computePumps(level),
    pipes: computePipes(level),
    driveType: computeDriveType(level),
    tankMaterial: isTallSlim ? 'bronze' : 'wood',
    hasGauge: level === 2,
    hasValves: isTallSlim,
    hasTopArchPipe: isTallSlim,
  };
};

export const interpolatePumps = (
  current: PumpSlot[],
  previous: PumpSlot[],
  progress: number,
): PumpSlot[] =>
  current.map((slot, index) => {
    const prev = previous[index];
    if (!prev) {
      return slot;
    }
    return {
      ...slot,
      x: prev.x + (slot.x - prev.x) * progress,
      z: prev.z + (slot.z - prev.z) * progress,
      scale: prev.scale + (slot.scale - prev.scale) * progress,
    };
  });

export const computeFadingPumps = (
  current: PumpSlot[],
  previous: PumpSlot[],
  progress: number,
): PumpSlot[] => {
  if (previous.length <= current.length) {
    return [];
  }
  return previous.slice(current.length).map((slot) => ({
    ...slot,
    scale: slot.scale * Math.max(0, 1 - progress * 1.5),
  }));
};
