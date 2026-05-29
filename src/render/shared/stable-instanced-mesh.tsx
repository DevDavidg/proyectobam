import type { ThreeEvent } from '@react-three/fiber';
import { memo, useLayoutEffect, useMemo, useRef } from 'react';
import type { BufferGeometry, Material, InstancedMesh } from 'three';
import { Object3D } from 'three';

export type InstancedPlacement = {
  key: number;
  position: [number, number, number];
  scale: number;
  rotationY: number;
  sourceId?: string;
};

type StableInstancedMeshProps = {
  geometry: BufferGeometry;
  material: Material;
  placements: InstancedPlacement[];
  maxCapacity: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  onPlacementClick?: (sourceId: string, event: ThreeEvent<MouseEvent>) => void;
  onPlacementContextMenu?: (sourceId: string, event: ThreeEvent<MouseEvent>) => void;
};

const buildPlacementSignature = (placements: InstancedPlacement[]): string =>
  placements
    .map(
      (placement) =>
        `${placement.key}:${placement.position[0]}:${placement.position[1]}:${placement.position[2]}:${placement.scale}:${placement.rotationY}`,
    )
    .join('|');

export const StableInstancedMesh = memo(
  ({
    geometry,
    material,
    placements,
    maxCapacity,
    castShadow = false,
    receiveShadow = true,
    onPlacementClick,
    onPlacementContextMenu,
  }: StableInstancedMeshProps) => {
    const meshRef = useRef<InstancedMesh>(null);
    const dummy = useMemo(() => new Object3D(), []);
    const placementSignature = buildPlacementSignature(placements);

    useLayoutEffect(() => {
      const mesh = meshRef.current;
      if (!mesh) {
        return;
      }

      const count = placements.length;
      mesh.count = count;
      mesh.userData.sourceIds = placements.map((placement) => placement.sourceId ?? '');

      for (let index = 0; index < count; index += 1) {
        const placement = placements[index];
        dummy.position.set(placement.position[0], placement.position[1], placement.position[2]);
        dummy.rotation.set(0, placement.rotationY, 0);
        dummy.scale.setScalar(placement.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
    }, [dummy, placementSignature]);

    const handlePointer =
      (handler?: (sourceId: string, event: ThreeEvent<MouseEvent>) => void) =>
      (event: ThreeEvent<MouseEvent>): void => {
        if (!handler) {
          return;
        }
        event.stopPropagation();
        const instanceId = event.instanceId;
        if (instanceId === undefined || instanceId < 0) {
          return;
        }
        const sourceId = meshRef.current?.userData.sourceIds?.[instanceId] as string | undefined;
        if (!sourceId) {
          return;
        }
        handler(sourceId, event);
      };

    const handleClick = handlePointer(onPlacementClick);
    const handleContextMenu = (event: ThreeEvent<MouseEvent>): void => {
      event.nativeEvent.preventDefault();
      handlePointer(onPlacementContextMenu)(event);
    };

    return (
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, maxCapacity]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
        frustumCulled={false}
        matrixAutoUpdate={false}
        visible={placements.length > 0}
        onClick={onPlacementClick ? handleClick : undefined}
        onContextMenu={onPlacementContextMenu ? handleContextMenu : undefined}
      />
    );
  },
);

StableInstancedMesh.displayName = 'StableInstancedMesh';
