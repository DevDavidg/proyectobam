import type { Cell } from '../types/cell';

export const createCell = (): Cell => ({
  buildingId: null,
  walkable: true,
});

export const createGrid = (gridSize: number): Cell[][] =>
  Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, createCell));
