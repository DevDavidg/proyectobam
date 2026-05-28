import type { ThreeEvent } from '@react-three/fiber';
import { memo, useMemo } from 'react';
import { EntityType } from '../../ecs/components/components';
import type { RenderEntitySnapshot } from '../../ecs/systems/sync-grid-system';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';
import { ConstructionOverlay } from './construction-overlay';
import { HealthBar } from './health-bar';
import { BuildingContactShadow } from './building-contact-shadow';
import { useSpawnScale } from './use-spawn-scale';

type WallMeshProps = {
  entity: RenderEntitySnapshot;
};

const WallHealthIndicator = ({ sourceId, hp, maxHp }: { sourceId: string; hp: number; maxHp: number }) => {
  const damageTimestamp = useGameStore((state) => state.damageTimestamps[sourceId] ?? 0);
  const visible = damageTimestamp > 0 && Date.now() - damageTimestamp < 1200;
  return (
    <group position={[0, 1.85, 0]}>
      <HealthBar hp={hp} maxHp={maxHp} visible={visible} />
    </group>
  );
};

const WallMeshImpl = ({ entity }: WallMeshProps) => {
  const openBuildingContextMenu = useGameStore((state) => state.openBuildingContextMenu);
  const groupRef = useSpawnScale(entity.sourceId);
  const position = useMemo(
    () => gridToWorldCenter(entity.x, entity.y, entity.sizeX, entity.sizeY, GRID_SIZE, CELL_SIZE),
    [entity.x, entity.y, entity.sizeX, entity.sizeY]
  );

  if (entity.kind !== EntityType.WALL) {
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

  return (
    <group ref={groupRef} position={[position[0], 0, position[2]]} onContextMenu={handleContextMenu}>
      <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[entity.sizeX * CELL_SIZE, 0.9, entity.sizeY * CELL_SIZE]} />
        <meshStandardMaterial color="#8f5b3b" roughness={0.9} flatShading={true} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.15, 0]}>
        <coneGeometry args={[0.55, 1, 6]} />
        <meshStandardMaterial color="#b67852" roughness={0.82} flatShading={true} />
      </mesh>
      {entity.status === 'UNDER_CONSTRUCTION' || entity.status === 'PENDING' ? (
        <ConstructionOverlay sizeX={entity.sizeX * CELL_SIZE} sizeY={entity.sizeY * CELL_SIZE} progress={entity.constructionProgress ?? 0} />
      ) : null}
      <BuildingContactShadow sizeX={entity.sizeX} sizeY={entity.sizeY} status={entity.status} />
      {entity.sourceId ? (
        <WallHealthIndicator sourceId={entity.sourceId} hp={entity.hp ?? 0} maxHp={entity.maxHp ?? 1} />
      ) : null}
    </group>
  );
};

const areWallEntityPropsEqual = (prev: WallMeshProps, next: WallMeshProps): boolean => {
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
    prevEntity.hp === nextEntity.hp &&
    prevEntity.maxHp === nextEntity.maxHp &&
    prevEntity.constructionProgress === nextEntity.constructionProgress &&
    prevEntity.sourceId === nextEntity.sourceId
  );
};

export const WallMesh = memo(WallMeshImpl, areWallEntityPropsEqual);
