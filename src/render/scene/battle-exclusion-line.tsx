import { useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridPointToWorld } from '../../utils/coordinates';

export const BattleExclusionLine = () => {
  const battleMode = useGameStore((state) => state.battleMode);
  const exclusion = useGameStore((state) => state.battleExclusion);

  const geometry = useMemo(() => {
    const points: number[] = [];
    const corners = [
      { x: exclusion.minX, y: exclusion.minY },
      { x: exclusion.maxX + 1, y: exclusion.minY },
      { x: exclusion.maxX + 1, y: exclusion.maxY + 1 },
      { x: exclusion.minX, y: exclusion.maxY + 1 },
      { x: exclusion.minX, y: exclusion.minY },
    ];
    for (let index = 0; index < corners.length - 1; index += 1) {
      const from = corners[index];
      const to = corners[index + 1];
      const [fromX, , fromZ] = gridPointToWorld(from.x, from.y, GRID_SIZE, CELL_SIZE);
      const [toX, , toZ] = gridPointToWorld(to.x, to.y, GRID_SIZE, CELL_SIZE);
      points.push(fromX, 0.05, fromZ, toX, 0.05, toZ);
    }
    const lineGeometry = new BufferGeometry();
    lineGeometry.setAttribute('position', new Float32BufferAttribute(points, 3));
    return lineGeometry;
  }, [exclusion.maxX, exclusion.maxY, exclusion.minX, exclusion.minY]);

  if (!battleMode) {
    return null;
  }

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#ef4444" transparent opacity={0.9} />
    </lineSegments>
  );
};
