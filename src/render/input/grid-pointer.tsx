import type { ThreeEvent } from '@react-three/fiber';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, getGridWorldSize, worldToGrid } from '../../utils/coordinates';

const inBounds = (x: number, y: number): boolean => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;

export const GridPointer = () => {
  const setActiveCell = useGameStore((state) => state.setActiveCell);
  const clearActiveCell = useGameStore((state) => state.clearActiveCell);
  const closeBuildingContextMenu = useGameStore((state) => state.closeBuildingContextMenu);
  const closePenHousingMenu = useGameStore((state) => state.closePenHousingMenu);
  const placementEnabled = useGameStore((state) => state.placementEnabled);
  const landExpansionMode = useGameStore((state) => state.landExpansionMode);
  const movingBuildingId = useGameStore((state) => state.movingBuildingId);
  const battleMode = useGameStore((state) => state.battleMode);
  const placeSelectedBuilding = useGameStore((state) => state.placeSelectedBuilding);
  const confirmLandExpansionAtActiveCell = useGameStore((state) => state.confirmLandExpansionAtActiveCell);
  const confirmMovingBuilding = useGameStore((state) => state.confirmMovingBuilding);
  const deploySelectedMonster = useGameStore((state) => state.deploySelectedMonster);

  const halfWorldSize = getGridWorldSize(GRID_SIZE, CELL_SIZE) / 2;

  const handlePointerMove = (event: ThreeEvent<PointerEvent>): void => {
    if (!placementEnabled && !battleMode && !landExpansionMode) {
      return;
    }

    const { x, y } = worldToGrid(event.point.x, event.point.z, GRID_SIZE, CELL_SIZE);
    if (!inBounds(x, y)) {
      clearActiveCell();
      return;
    }
    setActiveCell(x, y);
  };

  const handlePointerLeave = (): void => {
    clearActiveCell();
  };

  const handleClick = (): void => {
    closeBuildingContextMenu();
    closePenHousingMenu();
    if (landExpansionMode) {
      confirmLandExpansionAtActiveCell();
      return;
    }
    if (movingBuildingId) {
      confirmMovingBuilding();
      return;
    }
    if (battleMode) {
      deploySelectedMonster();
      return;
    }
    if (!placementEnabled) {
      return;
    }
    placeSelectedBuilding();
  };

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerLeave}
      onClick={handleClick}
    >
      <planeGeometry args={[halfWorldSize * 2, halfWorldSize * 2]} />
      <meshStandardMaterial visible={false} />
    </mesh>
  );
};
