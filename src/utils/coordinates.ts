export const CELL_SIZE = 2;
export const GRID_SIZE = 20;

export const getGridWorldSize = (gridSize: number, cellSize: number): number => gridSize * cellSize;

export const gridToWorldCenter = (
  x: number,
  y: number,
  sizeX: number,
  sizeY: number,
  gridSize: number,
  cellSize: number
): [number, number, number] => {
  const halfWorld = getGridWorldSize(gridSize, cellSize) / 2;
  const worldX = (x + sizeX / 2) * cellSize - halfWorld;
  const worldZ = (y + sizeY / 2) * cellSize - halfWorld;
  return [worldX, 0, worldZ];
};

export const worldToGrid = (
  worldX: number,
  worldZ: number,
  gridSize: number,
  cellSize: number
): { x: number; y: number } => {
  const halfWorld = getGridWorldSize(gridSize, cellSize) / 2;
  const x = Math.floor((worldX + halfWorld) / cellSize);
  const y = Math.floor((worldZ + halfWorld) / cellSize);
  return { x, y };
};

export const gridPointToWorld = (
  x: number,
  y: number,
  gridSize: number,
  cellSize: number
): [number, number, number] => {
  const halfWorld = getGridWorldSize(gridSize, cellSize) / 2;
  const worldX = x * cellSize - halfWorld;
  const worldZ = y * cellSize - halfWorld;
  return [worldX, 0, worldZ];
};
