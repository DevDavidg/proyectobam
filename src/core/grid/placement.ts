import type { Cell } from '../types/cell';

export const canPlaceBuilding = (
  grid: Cell[][],
  x: number,
  y: number,
  sizeX: number,
  sizeY: number
): boolean => {
  const gridSize = grid.length;

  if (x < 0 || y < 0) {
    return false;
  }

  if (x + sizeX > gridSize || y + sizeY > gridSize) {
    return false;
  }

  for (let row = y; row < y + sizeY; row += 1) {
    for (let col = x; col < x + sizeX; col += 1) {
      const cell = grid[row]?.[col];
      if (!cell || cell.buildingId !== null || !cell.walkable) {
        return false;
      }
    }
  }

  return true;
};
