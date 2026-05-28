import type { ThreeEvent } from '@react-three/fiber';
import { memo, useMemo } from 'react';
import { EntityType } from '../../ecs/components/components';
import type { RenderEntitySnapshot } from '../../ecs/systems/sync-grid-system';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';
import { ConstructionOverlay } from './construction-overlay';
import { BuildingContactShadow } from './building-contact-shadow';
import { BuildingDirtDecal } from './building-dirt-decal';
import { ModularPenMesh } from './modular-pen-mesh';
import { useSpawnScale } from './use-spawn-scale';

type PenMeshProps = {
  entity: RenderEntitySnapshot;
};

const PenMeshImpl = ({ entity }: PenMeshProps) => {
  const openBuildingContextMenu = useGameStore((state) => state.openBuildingContextMenu);
  const openHousingDetailsModal = useGameStore((state) => state.openHousingDetailsModal);
  const engine = useGameStore((state) => state.engine);
  const groupRef = useSpawnScale(entity.sourceId);

  const isPen = entity.kind === EntityType.PEN;
  if (!isPen) {
    return null;
  }

  const sourceId = entity.sourceId ?? '';
  const building = sourceId ? engine.getState().buildings.find((item) => item.id === sourceId) : null;
  const buildingLevel = building?.level ?? 1;
  const [worldX, , worldZ] = useMemo(
    () => gridToWorldCenter(entity.x, entity.y, entity.sizeX, entity.sizeY, GRID_SIZE, CELL_SIZE),
    [entity.x, entity.y, entity.sizeX, entity.sizeY]
  );

  const handleLeftClick = (event: ThreeEvent<MouseEvent>): void => {
    event.stopPropagation();
    if (!sourceId || entity.status !== 'ACTIVE') {
      return;
    }
    openHousingDetailsModal(sourceId);
  };

  const handleContextMenu = (event: ThreeEvent<MouseEvent>): void => {
    event.stopPropagation();
    event.nativeEvent.preventDefault();
    if (!sourceId) {
      return;
    }
    openBuildingContextMenu(sourceId, {
      x: event.nativeEvent.clientX,
      y: event.nativeEvent.clientY,
    });
  };

  return (
    <group ref={groupRef} position={[worldX, 0, worldZ]} onClick={handleLeftClick} onContextMenu={handleContextMenu}>
      <BuildingDirtDecal sizeX={entity.sizeX} sizeY={entity.sizeY} status={entity.status} intensity={0.85} />
      <ModularPenMesh level={buildingLevel} sizeXCells={entity.sizeX} sizeYCells={entity.sizeY} />
      <BuildingContactShadow sizeX={entity.sizeX} sizeY={entity.sizeY} status={entity.status} />
      {entity.status === 'UNDER_CONSTRUCTION' || entity.status === 'PENDING' ? (
        <ConstructionOverlay sizeX={entity.sizeX * CELL_SIZE} sizeY={entity.sizeY * CELL_SIZE} progress={entity.constructionProgress ?? 0} />
      ) : null}
    </group>
  );
};

const arePenEntityPropsEqual = (prev: PenMeshProps, next: PenMeshProps): boolean => {
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

export const PenMesh = memo(PenMeshImpl, arePenEntityPropsEqual);
