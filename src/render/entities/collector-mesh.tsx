import type { ThreeEvent } from '@react-three/fiber';
import { memo, useMemo } from 'react';
import type { BuildingType } from '../../core/types/building';
import { EntityType } from '../../ecs/components/components';
import type { RenderEntitySnapshot } from '../../ecs/systems/sync-grid-system';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';
import { BuildingVisual } from './BuildingVisual';
import { BuildingContactShadow } from './building-contact-shadow';
import { BuildingDirtDecal } from './building-dirt-decal';
import { ConstructionOverlay } from './construction-overlay';
import { useSpawnScale } from './use-spawn-scale';

type CollectorMeshProps = {
  entity: RenderEntitySnapshot;
};

const SOURCE_TYPE_TO_BUILDING_TYPE = new Set<Exclude<BuildingType, 'PREVIEW'>>([
  'RESOURCE_TWIG_COLLECTOR',
  'RESOURCE_PEBBLE_COLLECTOR',
  'RESOURCE_PUTTY_COLLECTOR',
  'RESOURCE_GOO_COLLECTOR',
  'RESOURCE_WOOD_SILO',
  'RESOURCE_STONE_SILO',
  'ARMY_HATCHERY',
  'DECOR_MUSHROOM_TOTEM',
]);

const resolveVisualType = (entity: RenderEntitySnapshot): Exclude<BuildingType, 'PREVIEW'> | null => {
  if (entity.sourceType && SOURCE_TYPE_TO_BUILDING_TYPE.has(entity.sourceType as Exclude<BuildingType, 'PREVIEW'>)) {
    return entity.sourceType as Exclude<BuildingType, 'PREVIEW'>;
  }
  if (entity.kind === EntityType.GOLD_COLLECTOR) return 'RESOURCE_TWIG_COLLECTOR';
  if (entity.kind === EntityType.GOO_COLLECTOR) return 'RESOURCE_GOO_COLLECTOR';
  if (entity.kind === EntityType.PEBBLE_COLLECTOR) return 'RESOURCE_PEBBLE_COLLECTOR';
  if (entity.kind === EntityType.PUTTY_COLLECTOR) return 'RESOURCE_PUTTY_COLLECTOR';
  if (entity.kind === EntityType.STORAGE) return 'RESOURCE_WOOD_SILO';
  if (entity.kind === EntityType.HATCHERY) return 'ARMY_HATCHERY';
  if (entity.kind === EntityType.DECOR) return 'DECOR_MUSHROOM_TOTEM';
  return null;
};

type CollectorVisualOverlayProps = {
  sourceId: string;
  visualType: Exclude<BuildingType, 'PREVIEW'>;
  fallbackLevel: number;
  entity: RenderEntitySnapshot;
  isTwigCollector: boolean;
  isStorage: boolean;
  isHatchery: boolean;
};

const CollectorVisualOverlay = ({
  sourceId,
  visualType,
  fallbackLevel,
  entity,
  isTwigCollector,
  isStorage,
  isHatchery,
}: CollectorVisualOverlayProps) => {
  const visualLevel = useGameStore((state) => {
    if (!sourceId) {
      return fallbackLevel;
    }
    const building = state.engine.getState().buildings.find((item) => item.id === sourceId);
    return building?.level ?? fallbackLevel;
  });
  const isFull = useGameStore((state) =>
    isTwigCollector ? state.resources.twigs.current >= state.resources.twigs.max : false
  );
  const storageFillRatio = useGameStore((state) => {
    if (!isStorage) {
      return 0;
    }
    const r = state.resources;
    return Math.max(
      r.twigs.max > 0 ? r.twigs.current / r.twigs.max : 0,
      r.pebbles.max > 0 ? r.pebbles.current / r.pebbles.max : 0,
      r.putty.max > 0 ? r.putty.current / r.putty.max : 0,
      r.goo.max > 0 ? r.goo.current / r.goo.max : 0
    );
  });
  const isHatcheryBusy = useGameStore((state) => {
    if (!isHatchery || !sourceId) {
      return false;
    }
    const queueLen = state.hatcheryTrainingQueues[sourceId]?.length ?? 0;
    const isResearchingHere = state.activeResearch.labId === sourceId && !!state.activeResearch.monsterType;
    return queueLen > 0 || isResearchingHere;
  });
  return (
    <BuildingVisual
      type={visualType}
      level={visualLevel}
      sizeX={entity.sizeX}
      sizeY={entity.sizeY}
      cellSize={CELL_SIZE}
      materialMode={isFull ? 'highlight' : 'default'}
      hatcheryBusy={isHatcheryBusy}
      status={entity.status as 'PENDING' | 'UNDER_CONSTRUCTION' | 'ACTIVE' | undefined}
      hp={entity.hp}
      maxHp={entity.maxHp}
      storageFillRatio={storageFillRatio}
    />
  );
};

const CollectorMeshImpl = ({ entity }: CollectorMeshProps) => {
  const collectFromCollector = useGameStore((state) => state.collectFromCollector);
  const openBuildingContextMenu = useGameStore((state) => state.openBuildingContextMenu);
  const openHatcheryModal = useGameStore((state) => state.openHatcheryModal);
  const groupRef = useSpawnScale(entity.sourceId);
  const position = useMemo(
    () => gridToWorldCenter(entity.x, entity.y, entity.sizeX, entity.sizeY, GRID_SIZE, CELL_SIZE),
    [entity.x, entity.y, entity.sizeX, entity.sizeY]
  );

  const isTwigCollector = entity.kind === EntityType.GOLD_COLLECTOR;
  const isGooCollector = entity.kind === EntityType.GOO_COLLECTOR;
  const isPebbleCollector = entity.kind === EntityType.PEBBLE_COLLECTOR;
  const isPuttyCollector = entity.kind === EntityType.PUTTY_COLLECTOR;
  const isStorage = entity.kind === EntityType.STORAGE;
  const isHatchery = entity.kind === EntityType.HATCHERY;
  const isDecor = entity.kind === EntityType.DECOR;
  if (!isTwigCollector && !isGooCollector && !isPebbleCollector && !isPuttyCollector && !isStorage && !isHatchery && !isDecor) {
    return null;
  }
  const sourceId = entity.sourceId ?? '';
  const visualType = resolveVisualType(entity);
  if (!visualType) {
    return null;
  }
  const fallbackLevel = entity.level ?? 1;

  const handleCollectorClick = (event: ThreeEvent<MouseEvent>): void => {
    event.stopPropagation();
    if (sourceId && isHatchery && entity.status === 'ACTIVE') {
      openHatcheryModal(sourceId);
      return;
    }
    if (!sourceId || !isTwigCollector) {
      return;
    }
    collectFromCollector(sourceId);
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
    <group ref={groupRef} position={[position[0], 0, position[2]]} onClick={handleCollectorClick} onContextMenu={handleContextMenu}>
      <BuildingDirtDecal sizeX={entity.sizeX} sizeY={entity.sizeY} status={entity.status} />
      <CollectorVisualOverlay
        sourceId={sourceId}
        visualType={visualType}
        fallbackLevel={fallbackLevel}
        entity={entity}
        isTwigCollector={isTwigCollector}
        isStorage={isStorage}
        isHatchery={isHatchery}
      />
      <BuildingContactShadow sizeX={entity.sizeX} sizeY={entity.sizeY} status={entity.status} />
      {entity.status === 'UNDER_CONSTRUCTION' || entity.status === 'PENDING' ? (
        <ConstructionOverlay sizeX={entity.sizeX * CELL_SIZE} sizeY={entity.sizeY * CELL_SIZE} progress={entity.constructionProgress ?? 0} />
      ) : null}
    </group>
  );
};

const areCollectorEntityPropsEqual = (prev: CollectorMeshProps, next: CollectorMeshProps): boolean => {
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
    prevEntity.hp === nextEntity.hp &&
    prevEntity.maxHp === nextEntity.maxHp &&
    prevEntity.constructionProgress === nextEntity.constructionProgress &&
    prevEntity.sourceId === nextEntity.sourceId &&
    prevEntity.sourceType === nextEntity.sourceType
  );
};

export const CollectorMesh = memo(CollectorMeshImpl, areCollectorEntityPropsEqual);
