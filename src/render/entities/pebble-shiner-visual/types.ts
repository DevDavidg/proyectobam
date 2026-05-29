import type { BaseCollectorVisualProps, MaterialFactory, MaterialToken } from '../shared/types';

export type { MaterialFactory, MaterialToken };

export type PebbleShinerVisualProps = BaseCollectorVisualProps;

export type PebbleState = 'in-action' | 'normal' | 'damaged' | 'destroyed';

export type InteriorPebbleTone = 'warm' | 'mid' | 'cool' | 'dark' | 'highlight';

export type GroundPebbleTone = 'warm' | 'mid' | 'cool' | 'dark';

export type InteriorPebble = {
  id: string;
  x: number;
  z: number;
  size: number;
  rotation: number;
  threshold: number;
  tone: InteriorPebbleTone;
};

export type GroundPebble = {
  id: string;
  x: number;
  z: number;
  size: number;
  rotation: number;
  tone: GroundPebbleTone;
};

export type PebbleShinerDimensions = {
  halfX: number;
  halfZ: number;
  wallThickness: number;
  baseLift: number;
  stoneHeight: number;
  stoneTop: number;
  cornerWidth: number;
  cornerExtra: number;
  cornerHeight: number;
  woodFrameThickness: number;
  woodFrameHeight: number;
  woodFrameTop: number;
  innerHalfX: number;
  innerHalfZ: number;
  waterY: number;
  postX: number;
  postZ: number;
  postBaseY: number;
  postHeight: number;
  postTopY: number;
  armY: number;
  polishRodTopY: number;
  polishRodBottomY: number;
  polishRodCenterX: number;
  handleAxisY: number;
  tierScale: number;
  wheelCenterX: number;
  wheelCenterY: number;
  wheelCenterZ: number;
  wheelRadius: number;
  wheelDepth: number;
  cascadePoolY: number;
  frameWidth: number;
  frameDepth: number;
  frameHeight: number;
  frameTopY: number;
  frameBottomY: number;
  hopperCenterX: number;
  hopperCenterY: number;
  hopperWidth: number;
  hopperDepth: number;
  hopperHeight: number;
  hopperTopY: number;
  hopperBottomY: number;
  drumRadius: number;
  drumLength: number;
  drumCenterY: number;
  drum1CenterX: number;
  drum2CenterX: number;
  dustPileX: number;
  dustPileZ: number;
  outputRocksX: number;
};
