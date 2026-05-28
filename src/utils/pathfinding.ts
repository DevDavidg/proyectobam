type Point = { x: number; y: number };

const pointKey = (point: Point): string => `${point.x},${point.y}`;

const manhattan = (a: Point, b: Point): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

const getNeighbors = (point: Point, gridSize: number): Point[] => {
  const candidates: Point[] = [
    { x: point.x + 1, y: point.y },
    { x: point.x - 1, y: point.y },
    { x: point.x, y: point.y + 1 },
    { x: point.x, y: point.y - 1 },
  ];

  return candidates.filter((candidate) => candidate.x >= 0 && candidate.y >= 0 && candidate.x < gridSize && candidate.y < gridSize);
};

export const findPathAStar = (
  walkable: boolean[][],
  start: Point,
  goals: Point[]
): Point[] | null => {
  if (!goals.length) {
    return null;
  }

  const gridSize = walkable.length;
  const goalKeys = new Set(goals.map(pointKey));
  const open: Point[] = [start];
  const cameFrom = new Map<string, Point>();
  const gScore = new Map<string, number>([[pointKey(start), 0]]);
  const fScore = new Map<string, number>([
    [pointKey(start), Math.min(...goals.map((goal) => manhattan(start, goal)))],
  ]);

  while (open.length > 0) {
    open.sort((left, right) => (fScore.get(pointKey(left)) ?? Infinity) - (fScore.get(pointKey(right)) ?? Infinity));
    const current = open.shift();
    if (!current) {
      return null;
    }

    if (goalKeys.has(pointKey(current))) {
      const path: Point[] = [current];
      let cursor = current;
      while (cameFrom.has(pointKey(cursor))) {
        const prev = cameFrom.get(pointKey(cursor));
        if (!prev) {
          break;
        }
        path.unshift(prev);
        cursor = prev;
      }
      return path;
    }

    for (const neighbor of getNeighbors(current, gridSize)) {
      const isGoal = goalKeys.has(pointKey(neighbor));
      if (!walkable[neighbor.y][neighbor.x] && !isGoal) {
        continue;
      }

      const tentativeG = (gScore.get(pointKey(current)) ?? Infinity) + 1;
      if (tentativeG >= (gScore.get(pointKey(neighbor)) ?? Infinity)) {
        continue;
      }

      cameFrom.set(pointKey(neighbor), current);
      gScore.set(pointKey(neighbor), tentativeG);
      const h = Math.min(...goals.map((goal) => manhattan(neighbor, goal)));
      fScore.set(pointKey(neighbor), tentativeG + h);
      if (!open.some((node) => node.x === neighbor.x && node.y === neighbor.y)) {
        open.push(neighbor);
      }
    }
  }

  return null;
};

export const getRectangleBorderCells = (
  x: number,
  y: number,
  sizeX: number,
  sizeY: number,
  gridSize: number
): Point[] => {
  const result: Point[] = [];
  for (let row = y - 1; row <= y + sizeY; row += 1) {
    for (let col = x - 1; col <= x + sizeX; col += 1) {
      const isInside = col >= x && col < x + sizeX && row >= y && row < y + sizeY;
      if (isInside) {
        continue;
      }
      if (col < 0 || row < 0 || col >= gridSize || row >= gridSize) {
        continue;
      }
      result.push({ x: col, y: row });
    }
  }
  return result;
};
