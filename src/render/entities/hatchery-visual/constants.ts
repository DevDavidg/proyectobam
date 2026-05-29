export const DOME_RADIUS = 0.96;
export const DOME_CENTER_Y = 0.38;
export const DOME_SQUASH_Y = 0.8;
export const TOP_HOLE_THETA = 0.34;
export const OPENING_RADIUS = DOME_RADIUS * Math.sin(TOP_HOLE_THETA);
export const OPENING_Y =
  DOME_CENTER_Y + DOME_RADIUS * Math.cos(TOP_HOLE_THETA) * DOME_SQUASH_Y - DOME_CENTER_Y * (1 - DOME_SQUASH_Y);
export const DOME_FRONT_Z = 0.76;

/** Front-left hatch mount on the dome (concept art). */
export const HATCH_PANEL_POSITION: [number, number, number] = [-0.36, 0.5, 0.67];
export const HATCH_PANEL_ROTATION: [number, number, number] = [-0.12, 0.42, 0.02];

export const DOME_PANEL_SEAMS = 8;
export const DOME_HORIZONTAL_SEAM_HEIGHTS = [0.18, 0.34, 0.5] as const;
export const DOME_LATERAL_STEP_X = 0.82;

export const INTERNAL_WOOD_BLOCKS: Array<{
  pos: [number, number, number];
  size: [number, number, number];
  rot: number;
  color: 'light' | 'mid' | 'dark';
}> = [
  { pos: [-0.11, 0.01, -0.02], size: [0.2, 0.16, 0.18], rot: 0.24, color: 'light' },
  { pos: [0.12, 0.015, 0.03], size: [0.18, 0.15, 0.17], rot: -0.31, color: 'mid' },
  { pos: [0.01, 0.15, -0.01], size: [0.2, 0.14, 0.16], rot: 0.66, color: 'dark' },
];

export const PANEL_RIVET_OFFSETS: Array<[number, number]> = [
  [-0.22, 0.17],
  [0.2, 0.17],
  [-0.22, -0.17],
  [0.2, -0.17],
];
