import type { Ref } from 'react';
import { useMemo } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { MaterialFactory, PuttySquisherDimensions } from '../types';

type OutputPipeProps = {
  dim: PuttySquisherDimensions;
  createMaterial: MaterialFactory;
  rootRef?: Ref<Group>;
  dripsRef: Ref<Group>;
  puddleRef: Ref<Group>;
};

const DRIP_COUNT = 4;

export const OutputPipe = ({
  dim,
  createMaterial,
  rootRef,
  dripsRef,
  puddleRef,
}: OutputPipeProps) => {
  const {
    cubeSize,
    pipeStartX,
    pipeStartY,
    pipeStartZ,
    pipeEndX,
    pipeEndY,
    pipeRadius,
    puddleX,
    puddleY,
    puddleZ,
  } = dim;

  const horizontalLength = Math.abs(pipeEndX - pipeStartX) + pipeRadius * 0.4;
  const horizontalCenterX = (pipeStartX + pipeEndX) / 2 + pipeRadius * 0.18;
  const verticalLength = Math.abs(pipeStartY - pipeEndY);
  const verticalCenterY = (pipeStartY + pipeEndY) / 2;

  const drips = useMemo(
    () =>
      Array.from({ length: DRIP_COUNT }, (_, index) => ({
        id: `drip-${index}`,
        offset: index / DRIP_COUNT,
        size: 0.014 + (index % 2) * 0.004,
        wobble: ((index * 13) % 7) * 0.001,
      })),
    [],
  );

  return (
    <group ref={rootRef}>
      <group position={[pipeStartX - 0.005, pipeStartY, pipeStartZ]}>
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[pipeRadius * 1.05, pipeRadius * 1.05, pipeRadius * 0.45, 16]} />
          {createMaterial(PALETTE.pipeShadow, 'iron')}
        </mesh>
      </group>

      <mesh
        castShadow
        receiveShadow
        position={[horizontalCenterX, pipeStartY, pipeStartZ]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[pipeRadius, pipeRadius, horizontalLength, 18]} />
        {createMaterial(PALETTE.pipeBody, 'iron')}
      </mesh>

      <mesh
        castShadow
        receiveShadow
        position={[horizontalCenterX, pipeStartY + pipeRadius * 0.6, pipeStartZ]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[pipeRadius * 0.36, pipeRadius * 0.36, horizontalLength * 0.95, 14]} />
        {createMaterial(PALETTE.pipeRim, 'iron')}
      </mesh>

      <mesh castShadow receiveShadow position={[pipeEndX, pipeStartY, pipeStartZ]}>
        <sphereGeometry args={[pipeRadius * 1.12, 16, 12]} />
        {createMaterial(PALETTE.pipeBody, 'iron')}
      </mesh>

      <mesh
        castShadow
        receiveShadow
        position={[pipeEndX, verticalCenterY, pipeStartZ]}
      >
        <cylinderGeometry args={[pipeRadius * 0.92, pipeRadius * 0.92, verticalLength, 16]} />
        {createMaterial(PALETTE.pipeBody, 'iron')}
      </mesh>

      <mesh
        castShadow
        receiveShadow
        position={[pipeEndX, pipeEndY, pipeStartZ]}
      >
        <cylinderGeometry args={[pipeRadius * 1.05, pipeRadius * 1.18, pipeRadius * 0.55, 16]} />
        {createMaterial(PALETTE.pipeShadow, 'iron')}
      </mesh>

      <mesh
        position={[pipeEndX, pipeEndY - pipeRadius * 0.32, pipeStartZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[pipeRadius * 0.7, 14]} />
        {createMaterial(PALETTE.pipeInside, 'goo')}
      </mesh>

      <group ref={dripsRef} position={[pipeEndX, pipeEndY - pipeRadius * 0.32, pipeStartZ]}>
        {drips.map((drip) => (
          <mesh key={drip.id} castShadow receiveShadow position={[drip.wobble, 0, 0]}>
            <sphereGeometry args={[drip.size, 8, 8]} />
            {createMaterial(PALETTE.puttyDrip, 'goo')}
          </mesh>
        ))}
      </group>

      <group ref={puddleRef} position={[puddleX, puddleY, puddleZ]}>
        {/* Outer rim — irregular spilled edge */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[cubeSize * 0.42, 32]} />
          {createMaterial(PALETTE.puddleDeep, 'goo')}
        </mesh>
        {/* Mid pool */}
        <mesh receiveShadow position={[0, 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[cubeSize * 0.36, 30]} />
          {createMaterial(PALETTE.puddleMid, 'goo')}
        </mesh>
        {/* Bright inner pool */}
        <mesh receiveShadow position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[cubeSize * 0.26, 26]} />
          {createMaterial(PALETTE.puddleBright, 'goo')}
        </mesh>
        {/* Glossy shine highlight */}
        <mesh
          position={[-cubeSize * 0.06, 0.0042, -cubeSize * 0.05]}
          rotation={[-Math.PI / 2, 0, 0.2]}
        >
          <circleGeometry args={[cubeSize * 0.12, 16]} />
          {createMaterial(PALETTE.puddleShine, 'goo')}
        </mesh>
        {/* Central liquid blob — domed surface tension */}
        <mesh castShadow receiveShadow position={[0, cubeSize * 0.045, 0]} scale={[1, 0.6, 1]}>
          <sphereGeometry args={[cubeSize * 0.18, 18, 14]} />
          {createMaterial(PALETTE.puddleMid, 'goo')}
        </mesh>
        {/* Highlight on top of blob */}
        <mesh
          position={[-cubeSize * 0.06, cubeSize * 0.075, 0]}
          rotation={[0, 0.2, 0]}
          scale={[1, 0.55, 1]}
        >
          <sphereGeometry args={[cubeSize * 0.085, 12, 10]} />
          {createMaterial(PALETTE.puddleShine, 'goo')}
        </mesh>
        {/* Side splatter blobs — small spilled droplets around the main pool */}
        <mesh castShadow receiveShadow position={[cubeSize * 0.36, cubeSize * 0.012, cubeSize * 0.18]} scale={[1, 0.4, 1]}>
          <sphereGeometry args={[cubeSize * 0.07, 10, 8]} />
          {createMaterial(PALETTE.puddleMid, 'goo')}
        </mesh>
        <mesh castShadow receiveShadow position={[cubeSize * 0.28, cubeSize * 0.008, -cubeSize * 0.24]} scale={[1, 0.35, 1]}>
          <sphereGeometry args={[cubeSize * 0.058, 10, 8]} />
          {createMaterial(PALETTE.puddleDeep, 'goo')}
        </mesh>
        <mesh castShadow receiveShadow position={[-cubeSize * 0.32, cubeSize * 0.01, -cubeSize * 0.22]} scale={[1, 0.4, 1]}>
          <sphereGeometry args={[cubeSize * 0.062, 10, 8]} />
          {createMaterial(PALETTE.puddleMid, 'goo')}
        </mesh>
        <mesh castShadow receiveShadow position={[-cubeSize * 0.28, cubeSize * 0.008, cubeSize * 0.26]} scale={[1, 0.35, 1]}>
          <sphereGeometry args={[cubeSize * 0.05, 10, 8]} />
          {createMaterial(PALETTE.puddleDeep, 'goo')}
        </mesh>
        <mesh castShadow receiveShadow position={[cubeSize * 0.18, cubeSize * 0.014, cubeSize * 0.32]} scale={[1, 0.45, 1]}>
          <sphereGeometry args={[cubeSize * 0.075, 10, 8]} />
          {createMaterial(PALETTE.puddleBright, 'goo')}
        </mesh>
        <mesh receiveShadow position={[cubeSize * 0.34, 0.001, -cubeSize * 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[cubeSize * 0.06, 14]} />
          {createMaterial(PALETTE.puddleDeep, 'goo')}
        </mesh>
        <mesh receiveShadow position={[-cubeSize * 0.4, 0.001, cubeSize * 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[cubeSize * 0.05, 14]} />
          {createMaterial(PALETTE.puddleDeep, 'goo')}
        </mesh>
      </group>
    </group>
  );
};
