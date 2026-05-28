import { useMemo } from 'react';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';
import { BuildingVisual } from '../entities/BuildingVisual';

export const MoveBuildingGuides = () => {
  const movingBuildingId = useGameStore((state) => state.movingBuildingId);
  const movingBuildingOrigin = useGameStore((state) => state.movingBuildingOrigin);
  const engine = useGameStore((state) => state.engine);

  const movingBuilding = useMemo(() => {
    if (!movingBuildingId) {
      return null;
    }
    return engine.getState().buildings.find((building) => building.id === movingBuildingId) ?? null;
  }, [engine, movingBuildingId]);

  if (!movingBuildingId || !movingBuildingOrigin || !movingBuilding) {
    return null;
  }

  const [originWorldX, , originWorldZ] = gridToWorldCenter(
    movingBuildingOrigin.x,
    movingBuildingOrigin.y,
    movingBuilding.sizeX,
    movingBuilding.sizeY,
    GRID_SIZE,
    CELL_SIZE
  );

  const footprintX = movingBuilding.sizeX * CELL_SIZE;
  const footprintZ = movingBuilding.sizeY * CELL_SIZE;

  return (
    <group position={[originWorldX, 0, originWorldZ]}>
      <BuildingVisual
        type={movingBuilding.type}
        level={movingBuilding.level}
        sizeX={movingBuilding.sizeX}
        sizeY={movingBuilding.sizeY}
        cellSize={CELL_SIZE}
        materialMode="ghost-invalid"
        status={movingBuilding.status}
        hp={movingBuilding.hp}
        maxHp={movingBuilding.maxHp}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[footprintX * 1.02, footprintZ * 1.02]} />
        <meshStandardMaterial color="#f59e0b" transparent={true} opacity={0.22} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[Math.max(0.2, Math.min(footprintX, footprintZ) * 0.45), Math.max(0.4, Math.min(footprintX, footprintZ) * 0.52), 28]} />
        <meshStandardMaterial color="#f97316" transparent={true} opacity={0.6} />
      </mesh>
    </group>
  );
};
