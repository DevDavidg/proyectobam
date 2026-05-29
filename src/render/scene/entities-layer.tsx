import { memo, useMemo } from 'react';
import { EntityType } from '../../ecs/components/components';
import type { RenderEntitySnapshot } from '../../ecs/systems/sync-grid-system';
import { useGameStore } from '../../state/game-store';
import { CollectorMesh } from '../entities/collector-mesh';
import { EnemyMesh } from '../entities/enemy-mesh';
import { PenMesh } from '../entities/pen-mesh';
import { PlacementPreviewMesh } from '../entities/placement-preview-mesh';
import { TownHallMesh } from '../entities/town-hall-mesh';
import { TurretMesh } from '../entities/turret-mesh';
import { WallMesh } from '../entities/wall-mesh';

type EntityMeshRouterProps = {
  entity: RenderEntitySnapshot;
  battleMode: boolean;
};

const EntityMeshRouter = memo(
  ({ entity, battleMode }: EntityMeshRouterProps) => {
    if (entity.kind === EntityType.TOWN_HALL) {
      return <TownHallMesh entity={entity} />;
    }
    if (entity.kind === EntityType.WALL) {
      return <WallMesh entity={entity} />;
    }
    if (entity.kind === EntityType.TURRET || entity.kind === EntityType.MORTAR) {
      return <TurretMesh entity={entity} />;
    }
    if (entity.kind === EntityType.GOLD_COLLECTOR || entity.kind === EntityType.GOO_COLLECTOR) {
      return <CollectorMesh entity={entity} />;
    }
    if (
      entity.kind === EntityType.PEBBLE_COLLECTOR ||
      entity.kind === EntityType.PUTTY_COLLECTOR ||
      entity.kind === EntityType.STORAGE ||
      entity.kind === EntityType.HATCHERY ||
      entity.kind === EntityType.DECOR
    ) {
      return <CollectorMesh entity={entity} />;
    }
    if (entity.kind === EntityType.PEN) {
      return <PenMesh entity={entity} />;
    }
    if (entity.kind === EntityType.PREVIEW) {
      if (battleMode) {
        return null;
      }
      return <PlacementPreviewMesh entity={entity} />;
    }
    if (entity.kind === EntityType.ENEMY) {
      return <EnemyMesh entity={entity} />;
    }
    return null;
  },
  (previous, next) => previous.entity === next.entity && previous.battleMode === next.battleMode,
);

EntityMeshRouter.displayName = 'EntityMeshRouter';

const selectRenderableEntities = (entities: RenderEntitySnapshot[]): RenderEntitySnapshot[] =>
  entities.filter((entity) => entity.kind !== EntityType.OBSTACLE);

export const EntitiesLayer = () => {
  const entities = useGameStore((state) => state.entities);
  const battleMode = useGameStore((state) => state.battleMode);
  const renderableEntities = useMemo(() => selectRenderableEntities(entities), [entities]);

  return (
    <>
      {renderableEntities.map((entity) => (
        <EntityMeshRouter key={entity.id} entity={entity} battleMode={battleMode} />
      ))}
    </>
  );
};
