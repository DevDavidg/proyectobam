import { resolveTierScale } from './helpers';
import type { GroundPebble, InteriorPebble, InteriorPebbleTone, PebbleShinerDimensions } from './types';

export const computeDimensions = (
  level: number,
  footprintX: number,
  footprintZ: number,
): PebbleShinerDimensions => {
  const tierScale = resolveTierScale(level);
  const halfX = Math.min(0.78, footprintX * 0.4) * tierScale;
  const halfZ = Math.min(0.62, footprintZ * 0.32) * tierScale;
  const wallThickness = 0.16;
  const baseLift = 0.04;
  const stoneHeight = 0.62 * tierScale;
  const stoneTop = baseLift + stoneHeight;
  const cornerWidth = 0.24;
  const cornerExtra = 0.04;
  const cornerHeight = stoneHeight + 0.08;
  const woodFrameThickness = 0.1;
  const woodFrameHeight = 0.12;
  const woodFrameTop = stoneTop + woodFrameHeight;
  const innerHalfX = halfX - wallThickness;
  const innerHalfZ = halfZ - wallThickness;
  const waterY = stoneTop - 0.1;
  const postX = halfX + 0.16;
  const postZ = -halfZ + 0.18;
  const postBaseY = baseLift;
  const postHeight = woodFrameTop + 0.42 * tierScale;
  const postTopY = postBaseY + postHeight;
  const armY = postTopY - 0.06;
  const polishRodTopY = armY - 0.02;
  const polishRodBottomY = waterY - 0.22;
  const polishRodCenterX = 0;
  const handleAxisY = stoneTop + 0.18;
  const wheelRadius = 0.42 * tierScale;
  const wheelDepth = 0.16;
  const wheelCenterX = halfX + wheelRadius * 0.95;
  const wheelCenterY = baseLift + wheelRadius + 0.04;
  const wheelCenterZ = 0;
  const cascadePoolY = baseLift + 0.04;

  // Centrifuge (L3) — elongated machine: open hopper + two mesh drums on a through-axle
  const frameDepth = halfZ * 2 * 1.02;
  const drumRadius = frameDepth * 0.42;
  const drumLength = drumRadius * 1.95;
  const drumGap = drumRadius * 0.42;
  const hopperWidth = drumRadius * 1.3;
  const endMargin = drumRadius * 0.6;
  const frameWidth =
    hopperWidth + drumGap + drumLength + drumGap + drumLength + endMargin;
  const frameHeight = drumRadius * 1.55;
  const frameBottomY = baseLift;
  const frameTopY = frameBottomY + frameHeight;
  const drumCenterY = frameTopY + drumRadius * 0.82;
  const hopperHeight = drumRadius * 1.7;
  const hopperBottomY = frameTopY + 0.02;
  const hopperTopY = hopperBottomY + hopperHeight;
  const hopperDepth = frameDepth * 0.66;
  const hopperCenterX = -frameWidth / 2 + hopperWidth / 2 + 0.02;
  const hopperCenterY = (hopperBottomY + hopperTopY) / 2;
  const drum1CenterX = hopperCenterX + hopperWidth / 2 + drumGap + drumLength / 2;
  const drum2CenterX = drum1CenterX + drumLength + drumGap;
  const dustPileX = hopperCenterX + hopperWidth * 0.05;
  const dustPileZ = frameDepth * 0.2;
  const outputRocksX = drum2CenterX + drumLength * 0.5 + drumRadius * 0.85;
  return {
    halfX,
    halfZ,
    wallThickness,
    baseLift,
    stoneHeight,
    stoneTop,
    cornerWidth,
    cornerExtra,
    cornerHeight,
    woodFrameThickness,
    woodFrameHeight,
    woodFrameTop,
    innerHalfX,
    innerHalfZ,
    waterY,
    postX,
    postZ,
    postBaseY,
    postHeight,
    postTopY,
    armY,
    polishRodTopY,
    polishRodBottomY,
    polishRodCenterX,
    handleAxisY,
    tierScale,
    wheelCenterX,
    wheelCenterY,
    wheelCenterZ,
    wheelRadius,
    wheelDepth,
    cascadePoolY,
    frameWidth,
    frameDepth,
    frameHeight,
    frameTopY,
    frameBottomY,
    hopperCenterX,
    hopperCenterY,
    hopperWidth,
    hopperDepth,
    hopperHeight,
    hopperTopY,
    hopperBottomY,
    drumRadius,
    drumLength,
    drumCenterY,
    drum1CenterX,
    drum2CenterX,
    dustPileX,
    dustPileZ,
    outputRocksX,
  };
};

export const buildInteriorPebbles = (innerHalfX: number, innerHalfZ: number): InteriorPebble[] => {
  const tones: InteriorPebbleTone[] = ['warm', 'mid', 'cool', 'dark', 'highlight'];
  const shapes: InteriorPebble[] = [];
  let seed = 1.234;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const cols = 5;
  const rows = 4;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const jitterX = (rand() - 0.5) * 0.08;
      const jitterZ = (rand() - 0.5) * 0.08;
      const x = (col / (cols - 1) - 0.5) * (innerHalfX * 1.6) + jitterX;
      const z = (row / (rows - 1) - 0.5) * (innerHalfZ * 1.6) + jitterZ;
      const size = 0.075 + rand() * 0.055;
      const rotation = rand() * Math.PI * 2;
      const tone = tones[Math.floor(rand() * tones.length)] ?? 'mid';
      const threshold = rand() * 0.55;
      shapes.push({
        id: `int-${row}-${col}`,
        x,
        z,
        size,
        rotation,
        threshold,
        tone,
      });
    }
  }
  return shapes;
};

export const GROUND_PEBBLES: GroundPebble[] = [
  { id: 'g-fl-1', x: -0.95, z: 0.78, size: 0.11, rotation: 0.4, tone: 'warm' },
  { id: 'g-fl-2', x: -1.05, z: 0.62, size: 0.08, rotation: 1.1, tone: 'mid' },
  { id: 'g-fl-3', x: -0.78, z: 0.92, size: 0.1, rotation: 0.8, tone: 'cool' },
  { id: 'g-fl-4', x: -0.86, z: 0.74, size: 0.07, rotation: 1.7, tone: 'dark' },
  { id: 'g-fl-5', x: -0.62, z: 0.84, size: 0.09, rotation: 0.2, tone: 'mid' },
  { id: 'g-fl-6', x: -1.02, z: 0.88, size: 0.07, rotation: 2.4, tone: 'warm' },
  { id: 'g-fl-7', x: -0.74, z: 1.04, size: 0.085, rotation: 1.9, tone: 'mid' },
  { id: 'g-fl-8', x: -1.16, z: 0.74, size: 0.075, rotation: 0.6, tone: 'cool' },
  { id: 'g-fr-1', x: 0.92, z: 0.86, size: 0.1, rotation: 0.3, tone: 'warm' },
  { id: 'g-fr-2', x: 0.78, z: 1.02, size: 0.085, rotation: 1.4, tone: 'mid' },
  { id: 'g-fr-3', x: 1.06, z: 0.7, size: 0.09, rotation: 2.1, tone: 'cool' },
  { id: 'g-fr-4', x: 0.66, z: 0.82, size: 0.07, rotation: 0.5, tone: 'dark' },
  { id: 'g-fr-5', x: 1.16, z: 0.92, size: 0.075, rotation: 1.8, tone: 'mid' },
  { id: 'g-fr-6', x: 0.94, z: 1.02, size: 0.08, rotation: 1.0, tone: 'warm' },
];
