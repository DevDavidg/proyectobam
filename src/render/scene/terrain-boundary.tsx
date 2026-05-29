import { memo, useLayoutEffect, useMemo, useRef } from 'react';
import type { InstancedMesh } from 'three';
import { Object3D } from 'three';
import {
  TERRAIN_BOUNDARY_CANOPY_GEOMETRY,
  TERRAIN_BOUNDARY_CANOPY_MATERIAL,
  TERRAIN_BOUNDARY_INSTANCE_COUNT,
  TERRAIN_BOUNDARY_MOUND_GEOMETRY,
  TERRAIN_BOUNDARY_MOUND_MATERIAL,
} from './terrain-boundary-resources';

export type TerrainBoundaryItem = {
  x: number;
  z: number;
  moundScale: number;
  canopyScale: number;
};

type TerrainBoundaryProps = {
  boundaryProps: TerrainBoundaryItem[];
};

const buildBoundarySignature = (boundaryProps: TerrainBoundaryItem[]): string =>
  boundaryProps
    .map(
      (item) =>
        `${item.x.toFixed(3)}:${item.z.toFixed(3)}:${item.moundScale.toFixed(3)}:${item.canopyScale.toFixed(3)}`,
    )
    .join('|');

const TerrainBoundaryImpl = ({ boundaryProps }: TerrainBoundaryProps) => {
  const moundRef = useRef<InstancedMesh>(null);
  const canopyRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const boundarySignature = buildBoundarySignature(boundaryProps);

  useLayoutEffect(() => {
    const moundMesh = moundRef.current;
    const canopyMesh = canopyRef.current;
    if (!moundMesh || !canopyMesh) {
      return;
    }

    const count = boundaryProps.length;
    moundMesh.count = count;
    canopyMesh.count = count;

    for (let index = 0; index < count; index += 1) {
      const item = boundaryProps[index];

      dummy.position.set(item.x, 0.22 * item.moundScale, item.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(item.moundScale);
      dummy.updateMatrix();
      moundMesh.setMatrixAt(index, dummy.matrix);

      dummy.position.set(item.x, 0.8 * item.canopyScale, item.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(item.canopyScale);
      dummy.updateMatrix();
      canopyMesh.setMatrixAt(index, dummy.matrix);
    }

    moundMesh.instanceMatrix.needsUpdate = true;
    canopyMesh.instanceMatrix.needsUpdate = true;
  }, [boundaryProps, boundarySignature, dummy]);

  return (
    <>
      <instancedMesh
        ref={moundRef}
        args={[
          TERRAIN_BOUNDARY_MOUND_GEOMETRY,
          TERRAIN_BOUNDARY_MOUND_MATERIAL,
          TERRAIN_BOUNDARY_INSTANCE_COUNT,
        ]}
        castShadow
        receiveShadow
        frustumCulled={false}
        matrixAutoUpdate={false}
      />
      <instancedMesh
        ref={canopyRef}
        args={[
          TERRAIN_BOUNDARY_CANOPY_GEOMETRY,
          TERRAIN_BOUNDARY_CANOPY_MATERIAL,
          TERRAIN_BOUNDARY_INSTANCE_COUNT,
        ]}
        castShadow
        receiveShadow
        frustumCulled={false}
        matrixAutoUpdate={false}
      />
    </>
  );
};

export const TerrainBoundary = memo(TerrainBoundaryImpl);
