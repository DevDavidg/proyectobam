export const DOME_RADIUS = 0.96;
export const DOME_CENTER_Y = 0.38;
export const DOME_SQUASH_Y = 0.8;
export const TOP_HOLE_THETA = 0.34;
export const OPENING_RADIUS = DOME_RADIUS * Math.sin(TOP_HOLE_THETA);
export const OPENING_Y =
  DOME_CENTER_Y + DOME_RADIUS * Math.cos(TOP_HOLE_THETA) * DOME_SQUASH_Y - DOME_CENTER_Y * (1 - DOME_SQUASH_Y);
export const DOME_FRONT_Z = 0.76;

export const INTERNAL_GEAR_CUBES: Array<{ pos: [number, number, number]; size: number; rot: number }> = [
  { pos: [0, 0.02, 0], size: 0.15, rot: 0.12 },
  { pos: [-0.1, 0.06, -0.06], size: 0.12, rot: 0.55 },
  { pos: [0.09, 0.05, -0.04], size: 0.11, rot: -0.35 },
  { pos: [-0.04, -0.03, 0.08], size: 0.1, rot: 0.82 },
  { pos: [0.07, 0.09, 0.05], size: 0.09, rot: -0.7 },
];

export const DOME_PANEL_SEAMS = 8;
export const DOME_RIVET_RINGS: Array<{ y: number; count: number; radiusScale: number }> = [
  { y: 0.22, count: 10, radiusScale: 0.88 },
  { y: 0.42, count: 12, radiusScale: 0.93 },
];

export const PANEL_RIVET_OFFSETS: Array<[number, number]> = [
  [-0.28, 0.22],
  [0.28, 0.22],
  [-0.28, -0.22],
  [0.28, -0.22],
];
