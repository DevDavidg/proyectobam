import type { ThreeEvent } from '@react-three/fiber';
import { memo, useMemo } from 'react';
import { EntityType } from '../../ecs/components/components';
import type { RenderEntitySnapshot } from '../../ecs/systems/sync-grid-system';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';
import { BuildingPreviewVisual } from './building-preview-visual';
import { ConstructionOverlay } from './construction-overlay';
import { BuildingContactShadow } from './building-contact-shadow';
import { BuildingDirtDecal } from './building-dirt-decal';
import { useSpawnScale } from './use-spawn-scale';

type TownHallMeshProps = {
  entity: RenderEntitySnapshot;
};

const TownHallMeshImpl = ({ entity }: TownHallMeshProps) => {
  const openBuildingContextMenu = useGameStore((state) => state.openBuildingContextMenu);
  const engine = useGameStore((state) => state.engine);
  const groupRef = useSpawnScale(entity.sourceId);
  const position = useMemo(
    () => gridToWorldCenter(entity.x, entity.y, entity.sizeX, entity.sizeY, GRID_SIZE, CELL_SIZE),
    [entity.x, entity.y, entity.sizeX, entity.sizeY]
  );

  if (entity.kind !== EntityType.TOWN_HALL) {
    return null;
  }

  const handleContextMenu = (event: ThreeEvent<MouseEvent>): void => {
    event.stopPropagation();
    event.nativeEvent.preventDefault();
    if (!entity.sourceId) {
      return;
    }
    openBuildingContextMenu(entity.sourceId, {
      x: event.nativeEvent.clientX,
      y: event.nativeEvent.clientY,
    });
  };
  const building = entity.sourceId ? engine.getState().buildings.find((item) => item.id === entity.sourceId) : null;
  const effectiveLevel = building?.level ?? entity.level ?? 1;

  return (
    <group ref={groupRef} position={[position[0], 0, position[2]]} onContextMenu={handleContextMenu}>
      <BuildingDirtDecal sizeX={entity.sizeX} sizeY={entity.sizeY} status={entity.status} intensity={1.1} />
      <BuildingPreviewVisual type="TOWN_HALL" level={effectiveLevel} sizeX={entity.sizeX} sizeY={entity.sizeY} cellSize={CELL_SIZE} />
      {entity.status === 'UNDER_CONSTRUCTION' || entity.status === 'PENDING' ? (
        <ConstructionOverlay sizeX={entity.sizeX * CELL_SIZE} sizeY={entity.sizeY * CELL_SIZE} progress={entity.constructionProgress ?? 0} />
      ) : null}
      <BuildingContactShadow sizeX={entity.sizeX} sizeY={entity.sizeY} status={entity.status} />
    </group>
  );
};

const areTownHallEntityPropsEqual = (prev: TownHallMeshProps, next: TownHallMeshProps): boolean => {
  const prevEntity = prev.entity;
  const nextEntity = next.entity;
  return (
    prevEntity.id === nextEntity.id &&
    prevEntity.x === nextEntity.x &&
    prevEntity.y === nextEntity.y &&
    prevEntity.sizeX === nextEntity.sizeX &&
    prevEntity.sizeY === nextEntity.sizeY &&
    prevEntity.kind === nextEntity.kind &&
    prevEntity.status === nextEntity.status &&
    prevEntity.level === nextEntity.level &&
    prevEntity.constructionProgress === nextEntity.constructionProgress &&
    prevEntity.sourceId === nextEntity.sourceId
  );
};

export const TownHallMesh = memo(TownHallMeshImpl, areTownHallEntityPropsEqual);
