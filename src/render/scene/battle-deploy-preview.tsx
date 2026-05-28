import { useMemo } from 'react';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';

export const BattleDeployPreview = () => {
  const battleMode = useGameStore((state) => state.battleMode);
  const activeCell = useGameStore((state) => state.activeCell);
  const placementValid = useGameStore((state) => state.placementValid);
  const selectedArmyMonster = useGameStore((state) => state.selectedArmyMonster);

  const worldPosition = useMemo(() => {
    if (!activeCell) {
      return null;
    }
    return gridToWorldCenter(activeCell.x, activeCell.y, 1, 1, GRID_SIZE, CELL_SIZE);
  }, [activeCell]);

  if (!battleMode || !selectedArmyMonster || !activeCell || !worldPosition) {
    return null;
  }

  return (
    <group position={[worldPosition[0], 0, worldPosition[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.45, 0.95, 28]} />
        <meshBasicMaterial color={placementValid ? '#22c55e' : '#ef4444'} transparent opacity={0.55} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color={placementValid ? '#86efac' : '#fca5a5'} emissive={placementValid ? '#16a34a' : '#b91c1c'} emissiveIntensity={0.45} />
      </mesh>
    </group>
  );
};
