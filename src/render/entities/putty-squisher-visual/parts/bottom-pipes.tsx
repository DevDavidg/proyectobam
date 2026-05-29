import type { Ref, RefObject } from 'react';
import { useMemo } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { MaterialFactory, PuttySquisherDimensions } from '../types';

type BottomPipesProps = {
  dim: PuttySquisherDimensions;
  createMaterial: MaterialFactory;
  rootRef?: Ref<Group>;
  dripsRefs: readonly RefObject<Group | null>[];
  puddleRef: Ref<Group>;
};

type SinglePipeProps = {
  dim: PuttySquisherDimensions;
  createMaterial: MaterialFactory;
  offsetX: number;
  forwardLength: number;
  dripsRef: RefObject<Group | null>;
};

const DRIPS_PER_PIPE = 3;

const SinglePipe = ({
  dim,
  createMaterial,
  offsetX,
  forwardLength,
  dripsRef,
}: SinglePipeProps) => {
  const { l3PipeRadius, l3PipeStartY, l3PipeForwardZ, l3PipeFloorY } = dim;
  const pipeStartZ = l3PipeForwardZ;
  const elbowZ = pipeStartZ + forwardLength;
  const horizontalCenterZ = (pipeStartZ + elbowZ) / 2;
  const verticalLength = Math.abs(l3PipeStartY - l3PipeFloorY);
  const verticalCenterY = (l3PipeStartY + l3PipeFloorY) / 2;

  const drips = useMemo(
    () =>
      Array.from({ length: DRIPS_PER_PIPE }, (_, index) => ({
        id: `drip-${index}`,
        size: 0.018 + (index % 2) * 0.005,
      })),
    [],
  );

  return (
    <group position={[offsetX, 0, 0]}>
      <mesh receiveShadow position={[0, l3PipeStartY, pipeStartZ - 0.005]}>
        <cylinderGeometry
          args={[l3PipeRadius * 1.08, l3PipeRadius * 1.08, l3PipeRadius * 0.4, 16]}
        />
        {createMaterial(PALETTE.pipeShadow, 'iron')}
      </mesh>

      <mesh
        castShadow
        receiveShadow
        position={[0, l3PipeStartY, horizontalCenterZ]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[l3PipeRadius, l3PipeRadius, forwardLength, 18]} />
        {createMaterial(PALETTE.pipeBody, 'iron')}
      </mesh>
      <mesh
        position={[l3PipeRadius * 0.32, l3PipeStartY + l3PipeRadius * 0.45, horizontalCenterZ]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[l3PipeRadius * 0.34, l3PipeRadius * 0.34, forwardLength * 0.95, 14]}
        />
        {createMaterial(PALETTE.pipeRim, 'iron')}
      </mesh>

      <mesh castShadow receiveShadow position={[0, l3PipeStartY, elbowZ]}>
        <sphereGeometry args={[l3PipeRadius * 1.18, 18, 14]} />
        {createMaterial(PALETTE.pipeBody, 'iron')}
      </mesh>
      <mesh position={[0, l3PipeStartY + l3PipeRadius * 0.45, elbowZ - l3PipeRadius * 0.4]}>
        <sphereGeometry args={[l3PipeRadius * 0.4, 10, 8]} />
        {createMaterial(PALETTE.pipeRim, 'iron')}
      </mesh>

      <mesh castShadow receiveShadow position={[0, verticalCenterY, elbowZ]}>
        <cylinderGeometry args={[l3PipeRadius * 0.95, l3PipeRadius * 0.95, verticalLength, 16]} />
        {createMaterial(PALETTE.pipeBody, 'iron')}
      </mesh>
      <mesh
        position={[l3PipeRadius * 0.4, verticalCenterY, elbowZ - l3PipeRadius * 0.05]}
      >
        <boxGeometry args={[l3PipeRadius * 0.16, verticalLength * 0.92, l3PipeRadius * 0.18]} />
        {createMaterial(PALETTE.pipeRim, 'iron')}
      </mesh>

      <mesh castShadow receiveShadow position={[0, l3PipeFloorY, elbowZ]}>
        <cylinderGeometry args={[l3PipeRadius * 1.1, l3PipeRadius * 1.22, l3PipeRadius * 0.5, 16]} />
        {createMaterial(PALETTE.pipeShadow, 'iron')}
      </mesh>
      <mesh
        position={[0, l3PipeFloorY - l3PipeRadius * 0.28, elbowZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[l3PipeRadius * 0.74, 16]} />
        {createMaterial(PALETTE.pipeInside, 'goo')}
      </mesh>

      <group ref={dripsRef} position={[0, l3PipeFloorY - l3PipeRadius * 0.28, elbowZ]}>
        {drips.map((drip) => (
          <mesh key={drip.id} castShadow receiveShadow position={[0, 0, 0]}>
            <sphereGeometry args={[drip.size, 8, 8]} />
            {createMaterial(PALETTE.puttyDripBright, 'goo')}
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const BottomPipes = ({
  dim,
  createMaterial,
  rootRef,
  dripsRefs,
  puddleRef,
}: BottomPipesProps) => {
  const { cubeSize, l3PipeOffsetsX, l3PipeForwardLengths, l3PuddleY, l3PuddleZ } = dim;

  return (
    <group ref={rootRef}>
      {l3PipeOffsetsX.map((offsetX, index) => (
        <SinglePipe
          key={`l3-pipe-${index}`}
          dim={dim}
          createMaterial={createMaterial}
          offsetX={offsetX}
          forwardLength={l3PipeForwardLengths[index] ?? l3PipeForwardLengths[0]}
          dripsRef={dripsRefs[index]}
        />
      ))}

      <group ref={puddleRef} position={[0, l3PuddleY, l3PuddleZ]}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[cubeSize * 0.55, 36]} />
          {createMaterial(PALETTE.puddleDeep, 'goo')}
        </mesh>
        <mesh receiveShadow position={[0, 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[cubeSize * 0.46, 32]} />
          {createMaterial(PALETTE.puddleMid, 'goo')}
        </mesh>
        <mesh receiveShadow position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[cubeSize * 0.34, 28]} />
          {createMaterial(PALETTE.puddleBright, 'goo')}
        </mesh>
        <mesh
          position={[-cubeSize * 0.08, 0.0042, -cubeSize * 0.06]}
          rotation={[-Math.PI / 2, 0, 0.18]}
        >
          <circleGeometry args={[cubeSize * 0.16, 18]} />
          {createMaterial(PALETTE.puddleShine, 'goo')}
        </mesh>

        <mesh castShadow receiveShadow position={[0, cubeSize * 0.05, 0]} scale={[1.3, 0.55, 1.3]}>
          <sphereGeometry args={[cubeSize * 0.2, 20, 14]} />
          {createMaterial(PALETTE.puddleMid, 'goo')}
        </mesh>
        <mesh
          position={[-cubeSize * 0.07, cubeSize * 0.085, -cubeSize * 0.02]}
          rotation={[0, 0.2, 0]}
          scale={[1.1, 0.5, 1.1]}
        >
          <sphereGeometry args={[cubeSize * 0.1, 14, 12]} />
          {createMaterial(PALETTE.puddleShine, 'goo')}
        </mesh>

        <mesh
          castShadow
          receiveShadow
          position={[cubeSize * 0.42, cubeSize * 0.014, cubeSize * 0.18]}
          scale={[1, 0.4, 1]}
        >
          <sphereGeometry args={[cubeSize * 0.085, 10, 8]} />
          {createMaterial(PALETTE.puddleMid, 'goo')}
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[-cubeSize * 0.46, cubeSize * 0.012, cubeSize * 0.12]}
          scale={[1, 0.35, 1]}
        >
          <sphereGeometry args={[cubeSize * 0.078, 10, 8]} />
          {createMaterial(PALETTE.puddleDeep, 'goo')}
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[cubeSize * 0.18, cubeSize * 0.012, cubeSize * 0.42]}
          scale={[1, 0.4, 1]}
        >
          <sphereGeometry args={[cubeSize * 0.07, 10, 8]} />
          {createMaterial(PALETTE.puddleBright, 'goo')}
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[-cubeSize * 0.22, cubeSize * 0.012, -cubeSize * 0.36]}
          scale={[1, 0.35, 1]}
        >
          <sphereGeometry args={[cubeSize * 0.065, 10, 8]} />
          {createMaterial(PALETTE.puddleMid, 'goo')}
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[cubeSize * 0.32, cubeSize * 0.014, -cubeSize * 0.32]}
          scale={[1, 0.4, 1]}
        >
          <sphereGeometry args={[cubeSize * 0.075, 10, 8]} />
          {createMaterial(PALETTE.puddleDeep, 'goo')}
        </mesh>

        <mesh
          receiveShadow
          position={[cubeSize * 0.5, 0.001, -cubeSize * 0.1]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[cubeSize * 0.07, 14]} />
          {createMaterial(PALETTE.puddleDeep, 'goo')}
        </mesh>
        <mesh
          receiveShadow
          position={[-cubeSize * 0.55, 0.001, -cubeSize * 0.06]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[cubeSize * 0.06, 14]} />
          {createMaterial(PALETTE.puddleDeep, 'goo')}
        </mesh>
      </group>
    </group>
  );
};
