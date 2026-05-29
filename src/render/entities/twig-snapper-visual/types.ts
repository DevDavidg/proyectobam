import type { BaseCollectorVisualProps, MaterialFactory, MaterialToken } from '../shared/types';

export type { MaterialFactory, MaterialToken };

export type TwigSnapperVisualProps = BaseCollectorVisualProps;

export type OverflowTwig = GroundTwig & {
  threshold: number;
  bobPhase: number;
};

export type GearTooth = {
  id: string;
  angle: number;
};

export type FrameRail = {
  id: string;
  y: number;
  thickness: number;
};

export type FrameCornerPosition = {
  id: string;
  x: number;
  z: number;
};

export type RollerSpike = {
  id: string;
  ringIndex: number;
  spikeIndex: number;
  x: number;
  angle: number;
};

export type CrateWallPlank = {
  id: string;
  y: number;
  height: number;
  tone: 'light' | 'mid' | 'dark';
};

export type TwigState = 'in-action' | 'normal' | 'damaged' | 'destroyed';

export type TwigTone = 'light' | 'mid' | 'dark' | 'bark';

export type GroundTwig = {
  id: string;
  x: number;
  z: number;
  y: number;
  length: number;
  thickness: number;
  rotationY: number;
  tiltX: number;
  tiltZ: number;
  tone: TwigTone;
};

export type DebrisTwig = {
  id: string;
  offsetX: number;
  offsetZ: number;
  velocityX: number;
  velocityZ: number;
  velocityY: number;
  spinAxisX: number;
  spinAxisY: number;
  spinAxisZ: number;
  spinSpeed: number;
  phaseOffset: number;
  length: number;
  thickness: number;
  tone: TwigTone;
};

export type PlankSlat = {
  id: string;
  z: number;
  width: number;
  depth: number;
  tone: 'light' | 'mid' | 'dark';
};

export type TwigSnapperDimensions = {
  tierScale: number;
  halfX: number;
  halfZ: number;
  baseLift: number;
  platformHeight: number;
  platformTop: number;
  plankCount: number;
  plankSpacing: number;
  plankInsetZ: number;
  platformExtensionX: number;
  footHeight: number;
  footSize: number;
  anvilX: number;
  anvilZ: number;
  anvilWidth: number;
  anvilDepth: number;
  anvilHeight: number;
  anvilTop: number;
  postX: number;
  postZ: number;
  postWidth: number;
  postDepth: number;
  postHeight: number;
  postTopY: number;
  hammerPivotX: number;
  hammerPivotY: number;
  hammerPivotZ: number;
  hammerArmLength: number;
  hammerArmThickness: number;
  hammerArmHeight: number;
  hammerHeadX: number;
  hammerHeadSize: number;
  hammerHeadHeight: number;
  frameCornerSize: number;
  frameCornerHeight: number;
  frameCornerTopY: number;
  frameInset: number;
  frameCorners: FrameCornerPosition[];
  frameRails: FrameRail[];
  frameTopBeamY: number;
  frameTopBeamThickness: number;
  gearAxleY: number;
  gearAxleZ: number;
  gearAxleLength: number;
  gearAxleRadius: number;
  bigGearRadius: number;
  bigGearThickness: number;
  bigGearX: number;
  bigGearTeeth: GearTooth[];
  smallGearRadius: number;
  smallGearThickness: number;
  smallGearX: number;
  smallGearZ: number;
  smallGearTeeth: GearTooth[];
  crankAxleStartX: number;
  crankAxleEndX: number;
  crankAxleY: number;
  crankAxleZ: number;
  crankArmLength: number;
  crankHandleLength: number;
  crankKnobRadius: number;
  crateWallThickness: number;
  crateWallBottomY: number;
  crateWallTopY: number;
  crateWallHeight: number;
  crateWallPlanks: CrateWallPlank[];
  crateFrontZ: number;
  crateBackZ: number;
  crateLeftX: number;
  crateRightX: number;
  lidWidthX: number;
  lidDepthZ: number;
  lidThickness: number;
  lidHingeZ: number;
  lidHingeY: number;
  lidOpenAngle: number;
  rollerRadius: number;
  rollerLength: number;
  rollerY: number;
  rollerFrontZ: number;
  rollerBackZ: number;
  rollerSpikes: RollerSpike[];
  rollerSpikeLength: number;
  rollerSpikeRadius: number;
};
