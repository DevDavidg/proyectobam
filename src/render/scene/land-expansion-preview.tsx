import { useMemo } from 'react';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';

const toCellKey = (x: number, y: number): string => `${x},${y}`;

const isExpansionCandidate = (x: number, y: number, unlockedLandCells: Record<string, true>): boolean => {
  if (unlockedLandCells[toCellKey(x, y)]) {
    return false;
  }
  return Boolean(
    unlockedLandCells[toCellKey(x + 1, y)] ||
      unlockedLandCells[toCellKey(x - 1, y)] ||
      unlockedLandCells[toCellKey(x, y + 1)] ||
      unlockedLandCells[toCellKey(x, y - 1)]
  );
};

export const LandExpansionPreview = () => {
  const landExpansionMode = useGameStore((state) => state.landExpansionMode);
  const landLevel = useGameStore((state) => state.landLevel);
  const maxLandLevel = useGameStore((state) => state.maxLandLevel);
  const activeCell = useGameStore((state) => state.activeCell);
  const unlockedLandCells = useGameStore((state) => state.unlockedLandCells);

  const borderCells = useMemo(() => {
    if (!landExpansionMode) {
      return [];
    }
    return Object.keys(unlockedLandCells)
      .map((cellKey) => cellKey.split(',').map((part) => Number(part)))
      .filter(([x, y]) => {
        const hasOutsideNeighbor =
          !unlockedLandCells[`${x + 1},${y}`] ||
          !unlockedLandCells[`${x - 1},${y}`] ||
          !unlockedLandCells[`${x},${y + 1}`] ||
          !unlockedLandCells[`${x},${y - 1}`];
        return hasOutsideNeighbor;
      })
      .map(([x, y]) => ({ x, y }));
  }, [landExpansionMode, unlockedLandCells]);

  if (!landExpansionMode || landLevel >= maxLandLevel) {
    return null;
  }

  const canExpandAtActiveCell = activeCell ? isExpansionCandidate(activeCell.x, activeCell.y, unlockedLandCells) : false;
  const activePosition = activeCell ? gridToWorldCenter(activeCell.x, activeCell.y, 1, 1, GRID_SIZE, CELL_SIZE) : null;

  return (
    <group>
      {borderCells.map((cell) => {
        const position = gridToWorldCenter(cell.x, cell.y, 1, 1, GRID_SIZE, CELL_SIZE);
        return (
          <mesh key={`border-${cell.x}-${cell.y}`} rotation={[-Math.PI / 2, 0, 0]} position={[position[0], 0.016, position[2]]}>
            <planeGeometry args={[CELL_SIZE * 0.92, CELL_SIZE * 0.92]} />
            <meshStandardMaterial color="#1d4ed8" transparent={true} opacity={0.16} />
          </mesh>
        );
      })}
      {activePosition ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[activePosition[0], 0.03, activePosition[2]]}>
          <planeGeometry args={[CELL_SIZE * 0.9, CELL_SIZE * 0.9]} />
          <meshStandardMaterial color={canExpandAtActiveCell ? '#22d3ee' : '#ef4444'} transparent={true} opacity={0.45} />
        </mesh>
      ) : null}
    </group>
  );
};
