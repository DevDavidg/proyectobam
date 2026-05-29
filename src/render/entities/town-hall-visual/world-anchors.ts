import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../../utils/coordinates';

export type TownHallAnchorInput = {
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
  level?: number;
};

export type TownHallWorldAnchor = {
  x: number;
  y: number;
  z: number;
};

const TIER_SCALE_TABLE: ReadonlyArray<{ min: number; scale: number }> = [
  { min: 10, scale: 1.16 },
  { min: 6, scale: 1.1 },
  { min: 3, scale: 1.07 },
  { min: 2, scale: 1.04 },
];

const resolveTierScale = (level: number): number => {
  for (const entry of TIER_SCALE_TABLE) {
    if (level >= entry.min) {
      return entry.scale;
    }
  }
  return 1;
};

const resolveCoreDimensions = (entity: TownHallAnchorInput) => {
  const tierScale = resolveTierScale(entity.level ?? 1);
  const footprintX = entity.sizeX * CELL_SIZE;
  const footprintZ = entity.sizeY * CELL_SIZE;
  const halfFootprintMin = Math.min(footprintX, footprintZ) * 0.5;
  const halfX = Math.min(1.7, halfFootprintMin * 0.7) * tierScale;
  const bodyHeight = halfX * 1.7;
  const baseLift = 0.05;
  const bodyTop = baseLift + bodyHeight;
  const roofHeight = bodyHeight * 0.05;
  const roofTop = bodyTop + roofHeight;
  return { halfX, bodyHeight, roofTop };
};

export const computeTownHallDoorWorld = (entity: TownHallAnchorInput): TownHallWorldAnchor => {
  const { halfX } = resolveCoreDimensions(entity);
  const doorOffsetX = -halfX * 0.3;
  const doorOffsetZ = halfX + 0.18;
  const [centerX, , centerZ] = gridToWorldCenter(
    entity.x,
    entity.y,
    entity.sizeX,
    entity.sizeY,
    GRID_SIZE,
    CELL_SIZE,
  );
  return { x: centerX + doorOffsetX, y: 0, z: centerZ + doorOffsetZ };
};

export const computeTownHallFunnelWorld = (entity: TownHallAnchorInput): TownHallWorldAnchor => {
  const { bodyHeight, roofTop } = resolveCoreDimensions(entity);
  const funnelStemHeight = bodyHeight * 0.06;
  const funnelHeight = bodyHeight * 0.3;
  const funnelTopY = roofTop + funnelStemHeight + funnelHeight;
  const [centerX, , centerZ] = gridToWorldCenter(
    entity.x,
    entity.y,
    entity.sizeX,
    entity.sizeY,
    GRID_SIZE,
    CELL_SIZE,
  );
  return { x: centerX, y: funnelTopY, z: centerZ };
};
