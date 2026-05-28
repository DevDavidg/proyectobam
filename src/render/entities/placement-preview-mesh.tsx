import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import { EntityType } from '../../ecs/components/components';
import type { RenderEntitySnapshot } from '../../ecs/systems/sync-grid-system';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';
import { BuildingVisual } from './BuildingVisual';

type PlacementPreviewMeshProps = {
  entity: RenderEntitySnapshot;
};

export const PlacementPreviewMesh = ({ entity }: PlacementPreviewMeshProps) => {
  const previewRef = useRef<Group | null>(null);
  const selectedBuildingType = useGameStore((state) => state.selectedBuildingType);
  const movingBuildingId = useGameStore((state) => state.movingBuildingId);
  const position = useMemo(
    () => gridToWorldCenter(entity.x, entity.y, entity.sizeX, entity.sizeY, GRID_SIZE, CELL_SIZE),
    [entity.x, entity.y, entity.sizeX, entity.sizeY]
  );

  useFrame((_, delta) => {
    if (!previewRef.current) {
      return;
    }
    const targetScale = entity.valid ? 1 : 0.92;
    const currentScale = previewRef.current.scale.x;
    const nextScale = currentScale + (targetScale - currentScale) * Math.min(1, delta * 10);
    previewRef.current.scale.set(nextScale, nextScale, nextScale);
  });

  if (entity.kind !== EntityType.PREVIEW) {
    return null;
  }

  return (
    <group ref={previewRef} position={[position[0], 0, position[2]]}>
      {movingBuildingId ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[entity.sizeX * CELL_SIZE, entity.sizeY * CELL_SIZE]} />
          <meshStandardMaterial color={entity.valid ? '#22c55e' : '#ef4444'} transparent={true} opacity={0.28} />
        </mesh>
      ) : null}
      {movingBuildingId ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry
            args={[
              Math.max(0.22, Math.min(entity.sizeX * CELL_SIZE, entity.sizeY * CELL_SIZE) * 0.38),
              Math.max(0.38, Math.min(entity.sizeX * CELL_SIZE, entity.sizeY * CELL_SIZE) * 0.48),
              26,
            ]}
          />
          <meshStandardMaterial color={entity.valid ? '#16a34a' : '#dc2626'} transparent={true} opacity={0.65} />
        </mesh>
      ) : null}
      <BuildingVisual
        type={selectedBuildingType}
        level={1}
        sizeX={entity.sizeX}
        sizeY={entity.sizeY}
        cellSize={CELL_SIZE}
        materialMode={entity.valid ? 'ghost-valid' : 'ghost-invalid'}
      />
    </group>
  );
};
