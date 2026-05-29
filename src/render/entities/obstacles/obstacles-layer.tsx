import { memo, useCallback, useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { EntityType } from '../../../ecs/components/components';
import type { RenderEntitySnapshot } from '../../../ecs/systems/sync-grid-system';
import { useGameStore } from '../../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../../utils/coordinates';
import { StableInstancedMesh, type InstancedPlacement } from '../../shared/stable-instanced-mesh';
import {
  OBSTACLE_ARCHETYPE_LIBRARY,
  resolveObstacleTypeKey,
  type ObstacleTypeKey,
} from './obstacle-archetype-geometries';
import {
  hashString,
  resolveObstacleRotationY,
  resolveObstacleScale,
  resolveObstacleVariantIndex,
} from './obstacle-seed';
import { OBSTACLE_INSTANCE_MATERIAL, OBSTACLE_MAX_INSTANCES } from './obstacle-shared-resources';

type ObstacleEntitySnapshot = Pick<
  RenderEntitySnapshot,
  'id' | 'sourceId' | 'sourceType' | 'x' | 'y' | 'sizeX' | 'sizeY' | 'status' | 'kind'
>;

type ObstaclePlacement = {
  entity: ObstacleEntitySnapshot;
  position: [number, number, number];
  scale: number;
  rotationY: number;
  variantIndex: number;
  typeKey: ObstacleTypeKey;
};

type ObstacleInstanceLayer = 'shadow' | 'detail';

type ObstacleInstanceSlot = {
  slotKey: string;
  typeKey: ObstacleTypeKey;
  variantIndex: number;
  layer: ObstacleInstanceLayer;
};

const EMPTY_OBSTACLE_PLACEMENTS: ObstaclePlacement[] = [];
const OBSTACLE_TYPE_KEYS: ObstacleTypeKey[] = ['tree', 'rock', 'mushroom'];
const OBSTACLE_VARIANT_INDICES = [0, 1, 2] as const;
const OBSTACLE_INSTANCE_LAYERS: ObstacleInstanceLayer[] = ['shadow', 'detail'];

const OBSTACLE_INSTANCE_SLOTS: ObstacleInstanceSlot[] = OBSTACLE_TYPE_KEYS.flatMap((typeKey) =>
  OBSTACLE_VARIANT_INDICES.flatMap((variantIndex) =>
    OBSTACLE_INSTANCE_LAYERS.map((layer) => ({
      slotKey: `${typeKey}:${variantIndex}:${layer}`,
      typeKey,
      variantIndex,
      layer,
    })),
  ),
);

const selectObstacleEntities = (entities: RenderEntitySnapshot[]): ObstacleEntitySnapshot[] =>
  entities.filter((entity) => entity.kind === EntityType.OBSTACLE);

const buildObstaclePlacements = (entities: ObstacleEntitySnapshot[]): ObstaclePlacement[] =>
  entities.map((entity) => {
    const seed = hashString(entity.sourceId ?? `obstacle-${entity.id}`);
    const position = gridToWorldCenter(entity.x, entity.y, entity.sizeX, entity.sizeY, GRID_SIZE, CELL_SIZE);
    return {
      entity,
      position: [position[0], 0, position[2]] as [number, number, number],
      scale: resolveObstacleScale(seed),
      rotationY: resolveObstacleRotationY(seed),
      variantIndex: resolveObstacleVariantIndex(seed),
      typeKey: resolveObstacleTypeKey(entity.sourceType),
    };
  });

const toInstancedPlacements = (placements: ObstaclePlacement[]): InstancedPlacement[] =>
  placements.map((placement) => ({
    key: placement.entity.id,
    position: placement.position,
    scale: placement.scale,
    rotationY: placement.rotationY,
    sourceId: placement.entity.sourceId,
  }));

const buildPlacementsBySlot = (placements: ObstaclePlacement[]): Map<string, ObstaclePlacement[]> => {
  const slotMap = new Map<string, ObstaclePlacement[]>(
    OBSTACLE_INSTANCE_SLOTS.map((slot) => [slot.slotKey, []]),
  );

  for (const placement of placements) {
    for (const layer of OBSTACLE_INSTANCE_LAYERS) {
      const slotKey = `${placement.typeKey}:${placement.variantIndex}:${layer}`;
      slotMap.get(slotKey)?.push(placement);
    }
  }

  return slotMap;
};

type ObstacleInstanceSlotMeshProps = {
  slot: ObstacleInstanceSlot;
  placements: ObstaclePlacement[];
  onOpenContextMenu: (sourceId: string, clientPosition: { x: number; y: number }) => void;
};

const ObstacleInstanceSlotMesh = memo(
  ({ slot, placements, onOpenContextMenu }: ObstacleInstanceSlotMeshProps) => {
    const geometry = OBSTACLE_ARCHETYPE_LIBRARY[slot.typeKey][slot.variantIndex][slot.layer];
    const instancedPlacements = useMemo(() => toInstancedPlacements(placements), [placements]);

    const handleOpenMenu = useCallback(
      (sourceId: string, event: ThreeEvent<MouseEvent>) => {
        onOpenContextMenu(sourceId, {
          x: event.nativeEvent.clientX,
          y: event.nativeEvent.clientY,
        });
      },
      [onOpenContextMenu],
    );

    return (
      <StableInstancedMesh
        geometry={geometry}
        material={OBSTACLE_INSTANCE_MATERIAL}
        placements={instancedPlacements}
        maxCapacity={OBSTACLE_MAX_INSTANCES}
        castShadow={slot.layer === 'shadow'}
        receiveShadow
        onPlacementClick={slot.layer === 'shadow' ? handleOpenMenu : undefined}
        onPlacementContextMenu={slot.layer === 'shadow' ? handleOpenMenu : undefined}
      />
    );
  },
);

ObstacleInstanceSlotMesh.displayName = 'ObstacleInstanceSlotMesh';

const ObstacleConstructionMarkers = ({ placements }: { placements: ObstaclePlacement[] }) => {
  const pendingPlacements = placements.filter(
    (placement) =>
      placement.entity.status === 'PENDING' || placement.entity.status === 'UNDER_CONSTRUCTION',
  );

  if (pendingPlacements.length === 0) {
    return null;
  }

  return (
    <>
      {pendingPlacements.map((placement) => (
        <mesh
          key={`obstacle-marker-${placement.entity.id}`}
          castShadow
          receiveShadow
          position={[placement.position[0], 0.42 * placement.scale, placement.position[2]]}
          scale={[placement.scale, placement.scale, placement.scale]}
          rotation={[0, placement.rotationY, 0]}
        >
          <boxGeometry args={[0.9, 0.04, 0.9]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#b45309"
            emissiveIntensity={0.25}
            roughness={0.35}
            metalness={0.08}
          />
        </mesh>
      ))}
    </>
  );
};

const ObstaclesLayerImpl = () => {
  const entities = useGameStore((state) => state.entities);
  const openBuildingContextMenu = useGameStore((state) => state.openBuildingContextMenu);

  const placements = useMemo(() => {
    const obstacleEntities = selectObstacleEntities(entities);
    return buildObstaclePlacements(obstacleEntities);
  }, [entities]);
  const placementsBySlot = useMemo(() => buildPlacementsBySlot(placements), [placements]);

  return (
    <group>
      {OBSTACLE_INSTANCE_SLOTS.map((slot) => (
        <ObstacleInstanceSlotMesh
          key={slot.slotKey}
          slot={slot}
          placements={placementsBySlot.get(slot.slotKey) ?? EMPTY_OBSTACLE_PLACEMENTS}
          onOpenContextMenu={openBuildingContextMenu}
        />
      ))}
      <ObstacleConstructionMarkers placements={placements} />
    </group>
  );
};

export const ObstaclesLayer = memo(ObstaclesLayerImpl);
