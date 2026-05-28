import { useMemo } from 'react';
import { BUILDING_TYPES } from '../../core/types/building';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';

export const RangeRing = () => {
  const selectedBuildingId = useGameStore((state) => state.selectedBuildingId);
  const hoveredBuildingId = useGameStore((state) => state.hoveredBuildingId);
  const engine = useGameStore((state) => state.engine);

  const focusBuilding = useMemo(() => {
    const focusId = selectedBuildingId ?? hoveredBuildingId;
    if (!focusId) {
      return null;
    }
    return engine.getState().buildings.find((building) => building.id === focusId) ?? null;
  }, [engine, hoveredBuildingId, selectedBuildingId]);

  if (!focusBuilding) {
    return null;
  }
  const isDefense = focusBuilding.tags?.includes('turret') ?? false;
  if (!isDefense || !focusBuilding.range || focusBuilding.status !== 'ACTIVE') {
    return null;
  }

  const [x, , z] = gridToWorldCenter(
    focusBuilding.x,
    focusBuilding.y,
    focusBuilding.sizeX,
    focusBuilding.sizeY,
    GRID_SIZE,
    CELL_SIZE
  );
  const radius = focusBuilding.range * CELL_SIZE;
  const isMortar = focusBuilding.type === BUILDING_TYPES.DEFENSE_MORTAR;

  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[Math.max(0.1, radius - 0.15), radius, 64]} />
        <meshBasicMaterial
          color={isMortar ? '#fb7185' : '#86efac'}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[radius, 48]} />
        <meshBasicMaterial color={isMortar ? '#be123c' : '#14532d'} transparent opacity={0.08} depthWrite={false} />
      </mesh>
    </group>
  );
};
