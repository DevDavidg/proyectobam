import { ExtrudeGeometry, Shape, type BufferGeometry } from 'three';

export type RoundedBoxBevelOptions = {
  cornerRadius?: number;
  bevelEnabled?: boolean;
  bevelThickness?: number;
  bevelSize?: number;
  bevelSegments?: number;
  curveSegments?: number;
};

const DEFAULT_BEVEL: Required<RoundedBoxBevelOptions> = {
  cornerRadius: 0.12,
  bevelEnabled: true,
  bevelThickness: 0.06,
  bevelSize: 0.04,
  bevelSegments: 3,
  curveSegments: 4,
};

const ROUNDED_BOX_GEOMETRY_CACHE = new Map<string, ExtrudeGeometry>();

const buildRoundedRectShape = (width: number, depth: number, radius: number): Shape => {
  const w = Math.max(0.05, width);
  const d = Math.max(0.05, depth);
  const r = Math.max(0.001, Math.min(radius, w / 2 - 0.001, d / 2 - 0.001));
  const halfW = w / 2;
  const halfD = d / 2;
  const shape = new Shape();
  shape.moveTo(-halfW + r, -halfD);
  shape.lineTo(halfW - r, -halfD);
  shape.quadraticCurveTo(halfW, -halfD, halfW, -halfD + r);
  shape.lineTo(halfW, halfD - r);
  shape.quadraticCurveTo(halfW, halfD, halfW - r, halfD);
  shape.lineTo(-halfW + r, halfD);
  shape.quadraticCurveTo(-halfW, halfD, -halfW, halfD - r);
  shape.lineTo(-halfW, -halfD + r);
  shape.quadraticCurveTo(-halfW, -halfD, -halfW + r, -halfD);
  return shape;
};

const centerGeometryToOrigin = (geometry: BufferGeometry): void => {
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox;
  if (!bbox) {
    return;
  }
  const offsetX = -(bbox.max.x + bbox.min.x) / 2;
  const offsetY = -(bbox.max.y + bbox.min.y) / 2;
  const offsetZ = -(bbox.max.z + bbox.min.z) / 2;
  geometry.translate(offsetX, offsetY, offsetZ);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
};

const buildKey = (width: number, height: number, depth: number, cfg: Required<RoundedBoxBevelOptions>): string => {
  return [
    width.toFixed(3),
    height.toFixed(3),
    depth.toFixed(3),
    cfg.cornerRadius.toFixed(3),
    cfg.bevelEnabled ? 1 : 0,
    cfg.bevelThickness.toFixed(3),
    cfg.bevelSize.toFixed(3),
    cfg.bevelSegments,
    cfg.curveSegments,
  ].join('|');
};

export const getRoundedBoxGeometry = (
  width: number,
  height: number,
  depth: number,
  options?: RoundedBoxBevelOptions
): ExtrudeGeometry => {
  const cfg: Required<RoundedBoxBevelOptions> = { ...DEFAULT_BEVEL, ...(options ?? {}) };
  const key = buildKey(width, height, depth, cfg);
  const cached = ROUNDED_BOX_GEOMETRY_CACHE.get(key);
  if (cached) {
    return cached;
  }

  const bevelSizeOffset = cfg.bevelEnabled ? cfg.bevelSize : 0;
  const bevelThicknessOffset = cfg.bevelEnabled ? cfg.bevelThickness : 0;
  const compensatedWidth = Math.max(0.05, width - 2 * bevelSizeOffset);
  const compensatedDepth = Math.max(0.05, depth - 2 * bevelSizeOffset);
  const compensatedExtrudeHeight = Math.max(0.05, height - 2 * bevelThicknessOffset);
  const safeCornerRadius = Math.min(
    cfg.cornerRadius,
    compensatedWidth / 2.05,
    compensatedDepth / 2.05
  );

  const shape = buildRoundedRectShape(compensatedWidth, compensatedDepth, safeCornerRadius);
  const geometry = new ExtrudeGeometry(shape, {
    depth: compensatedExtrudeHeight,
    bevelEnabled: cfg.bevelEnabled,
    bevelThickness: cfg.bevelThickness,
    bevelSize: cfg.bevelSize,
    bevelSegments: cfg.bevelSegments,
    curveSegments: cfg.curveSegments,
    steps: 1,
  });

  geometry.rotateX(-Math.PI / 2);
  centerGeometryToOrigin(geometry);
  geometry.computeVertexNormals();

  ROUNDED_BOX_GEOMETRY_CACHE.set(key, geometry);
  return geometry;
};

export const getBevelDefaults = (): Readonly<Required<RoundedBoxBevelOptions>> => DEFAULT_BEVEL;
