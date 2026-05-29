import type { BaseCollectorVisualProps, MaterialFactory, MaterialToken } from '../shared/types';

export type { MaterialFactory, MaterialToken };

export type PuttySquisherVisualProps = BaseCollectorVisualProps;

export type PuttyState = 'in-action' | 'normal' | 'damaged' | 'destroyed';

export type PuttySquisherDimensions = {
  cubeSize: number;
  cubeBaseY: number;
  cubeCenterY: number;
  cubeTopY: number;
  half: number;
  boltRadius: number;
  boltInset: number;
  boltOffset: number;
  mountWidth: number;
  mountDepth: number;
  mountHeight: number;
  mountCenterX: number;
  mountCenterZ: number;
  pivotY: number;
  leverLength: number;
  spigotY: number;
  spigotX: number;
  spigotZ: number;
  screwSocketSize: number;
  screwSocketDepth: number;
  screwShaftRadius: number;
  screwShaftLength: number;
  screwTopY: number;
  wingNutRadius: number;
  wingNutThickness: number;
  wingNutY: number;
  gearAxisX: number;
  gearAxisY: number;
  gearAxisZ: number;
  gearLargeRadius: number;
  gearMidRadius: number;
  gearSmallRadius: number;
  gearThickness: number;
  pipeStartX: number;
  pipeStartY: number;
  pipeStartZ: number;
  pipeEndX: number;
  pipeEndY: number;
  pipeRadius: number;
  puddleY: number;
  puddleX: number;
  puddleZ: number;
  pumpSocketRadius: number;
  pumpSocketDepth: number;
  pumpBodyRadius: number;
  pumpBodyHeight: number;
  pumpShaftRadius: number;
  pumpShaftBaseY: number;
  pumpShaftTopY: number;
  pumpHeadRadius: number;
  pumpHeadThickness: number;
  pumpStroke: number;
  pumpLeftX: number;
  pumpRightX: number;
  pumpZ: number;
  l3PipeRadius: number;
  l3PipeStartY: number;
  l3PipeForwardZ: number;
  l3PipeFloorY: number;
  l3PipeOffsetsX: readonly number[];
  l3PipeForwardLengths: readonly number[];
  l3PuddleY: number;
  l3PuddleZ: number;
};

export type PuttySlot = {
  id: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  size: number;
  thresholdEntry: number;
};

export type BoltCorner = {
  id: string;
  pos: [number, number, number];
};

export type LeverPhase = {
  angle: number;
  pressNorm: number;
  rawT: number;
};
