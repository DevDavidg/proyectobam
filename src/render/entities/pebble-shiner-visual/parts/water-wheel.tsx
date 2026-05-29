import type { Ref } from 'react';
import { useMemo } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { MaterialFactory, PebbleShinerDimensions } from '../types';

type WaterWheelProps = {
  dim: PebbleShinerDimensions;
  createMaterial: MaterialFactory;
  wheelRef: Ref<Group>;
  cascadeRef: Ref<Group>;
  rootRef?: Ref<Group>;
};

const SPOKE_COUNT = 8;
const PADDLE_COUNT = 8;
const CASCADE_DROPS = 6;

export const WaterWheel = ({
  dim,
  createMaterial,
  wheelRef,
  cascadeRef,
  rootRef,
}: WaterWheelProps) => {
  const spokes = useMemo(
    () =>
      Array.from({ length: SPOKE_COUNT }, (_, index) => ({
        id: `spoke-${index}`,
        rotation: (index / SPOKE_COUNT) * Math.PI * 2,
      })),
    [],
  );

  const paddles = useMemo(
    () =>
      Array.from({ length: PADDLE_COUNT }, (_, index) => ({
        id: `paddle-${index}`,
        rotation: (index / PADDLE_COUNT) * Math.PI * 2 + Math.PI / PADDLE_COUNT,
      })),
    [],
  );

  const drops = useMemo(
    () =>
      Array.from({ length: CASCADE_DROPS }, (_, index) => ({
        id: `drop-${index}`,
        offset: (index / CASCADE_DROPS) * 1.0,
        x: (index % 2 === 0 ? -1 : 1) * (0.02 + (index % 3) * 0.012),
        z: (index % 2 === 0 ? 1 : -1) * (0.01 + (index % 4) * 0.011),
      })),
    [],
  );

  const housingX = dim.halfX + 0.18;
  const housingHeight = dim.wheelCenterY + dim.wheelRadius + 0.05 - dim.baseLift;
  const housingDepth = dim.wheelDepth + 0.34;
  const housingWidth = 0.36;

  const poolX = dim.wheelCenterX;
  const poolY = dim.cascadePoolY;
  const poolWidth = dim.wheelRadius * 1.2;
  const poolDepth = dim.wheelDepth + 0.2;
  const poolHeight = 0.06;

  const wheelInnerR = dim.wheelRadius - 0.07;
  const spokeLength = wheelInnerR;
  const spokeThickness = 0.045;
  const paddleWidth = 0.13;
  const paddleHeight = 0.015;

  return (
    <group ref={rootRef}>
      {/* Stone housing pillar that anchors the wheel axle */}
      <group position={[housingX + housingWidth / 2 - 0.04, dim.baseLift + housingHeight / 2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[housingWidth, housingHeight, housingDepth]} />
          {createMaterial(PALETTE.stoneWall, 'stone')}
        </mesh>
        {/* Stone block courses for detail */}
        <mesh castShadow receiveShadow position={[-housingWidth / 2 - 0.0005, housingHeight * 0.18, 0]}>
          <boxGeometry args={[0.006, housingHeight * 0.6, housingDepth - 0.04]} />
          {createMaterial(PALETTE.stoneWallDeep, 'stone')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, -housingHeight / 2 + 0.005, 0]}>
          <boxGeometry args={[housingWidth + 0.04, 0.04, housingDepth + 0.04]} />
          {createMaterial(PALETTE.stoneCornerLight, 'stone')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, housingHeight / 2 - 0.04, 0]}>
          <boxGeometry args={[housingWidth + 0.04, 0.06, housingDepth + 0.04]} />
          {createMaterial(PALETTE.stoneCornerLight, 'stone')}
        </mesh>
      </group>

      {/* Lower water pool that catches the cascade */}
      <mesh receiveShadow position={[poolX, poolY + poolHeight / 2, 0]}>
        <boxGeometry args={[poolWidth, poolHeight, poolDepth]} />
        {createMaterial(PALETTE.cascadeWaterDeep, 'goo')}
      </mesh>
      <mesh receiveShadow position={[poolX, poolY + poolHeight - 0.0005, 0]}>
        <boxGeometry args={[poolWidth - 0.04, 0.005, poolDepth - 0.04]} />
        {createMaterial(PALETTE.cascadeWaterLight, 'goo')}
      </mesh>

      {/* Cascade drops (animated by ref outside) */}
      <group ref={cascadeRef} position={[dim.wheelCenterX, dim.wheelCenterY - dim.wheelRadius * 0.15, 0]}>
        {drops.map((drop) => (
          <mesh key={drop.id} position={[drop.x, 0, drop.z]}>
            <sphereGeometry args={[0.022, 8, 6]} />
            {createMaterial(PALETTE.cascadeWaterLight, 'goo')}
          </mesh>
        ))}
      </group>

      {/* Iron axle protruding from housing */}
      <mesh
        castShadow
        receiveShadow
        position={[dim.wheelCenterX, dim.wheelCenterY, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.05, 0.05, dim.wheelDepth + 0.32, 16]} />
        {createMaterial(PALETTE.wheelHubHighlight, 'iron')}
      </mesh>

      {/* The spinning wheel itself */}
      <group ref={wheelRef} position={[dim.wheelCenterX, dim.wheelCenterY, 0]}>
        {/* Outer rim (torus) front face */}
        <mesh castShadow receiveShadow position={[0, 0, dim.wheelDepth / 2]}>
          <torusGeometry args={[dim.wheelRadius, 0.045, 10, 36]} />
          {createMaterial(PALETTE.wheelWoodDark, 'wood')}
        </mesh>
        {/* Outer rim back face */}
        <mesh castShadow receiveShadow position={[0, 0, -dim.wheelDepth / 2]}>
          <torusGeometry args={[dim.wheelRadius, 0.045, 10, 36]} />
          {createMaterial(PALETTE.wheelWoodDark, 'wood')}
        </mesh>
        {/* Inner band cylinder gives volume between front and back rims */}
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[dim.wheelRadius - 0.01, dim.wheelRadius - 0.01, dim.wheelDepth, 28, 1, true]} />
          {createMaterial(PALETTE.wheelWoodMid, 'wood')}
        </mesh>
        {/* Inner trim circles */}
        <mesh castShadow receiveShadow position={[0, 0, dim.wheelDepth / 2 + 0.001]}>
          <torusGeometry args={[dim.wheelRadius - 0.085, 0.012, 8, 32]} />
          {createMaterial(PALETTE.wheelTrim, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0, -dim.wheelDepth / 2 - 0.001]}>
          <torusGeometry args={[dim.wheelRadius - 0.085, 0.012, 8, 32]} />
          {createMaterial(PALETTE.wheelTrim, 'iron')}
        </mesh>

        {/* Spokes (front face only, plus a back set for symmetry in iso) */}
        {spokes.map((spoke) => (
          <group key={spoke.id} rotation={[0, 0, spoke.rotation]}>
            <mesh castShadow receiveShadow position={[spokeLength / 2, 0, dim.wheelDepth / 2 - 0.01]}>
              <boxGeometry args={[spokeLength, spokeThickness, 0.03]} />
              {createMaterial(PALETTE.wheelWoodLight, 'wood')}
            </mesh>
            <mesh castShadow receiveShadow position={[spokeLength / 2, 0, -dim.wheelDepth / 2 + 0.01]}>
              <boxGeometry args={[spokeLength, spokeThickness, 0.03]} />
              {createMaterial(PALETTE.wheelWoodMid, 'wood')}
            </mesh>
          </group>
        ))}

        {/* Paddles (water-cup blades) jutting out radially to catch water */}
        {paddles.map((paddle) => (
          <group key={paddle.id} rotation={[0, 0, paddle.rotation]}>
            <mesh
              castShadow
              receiveShadow
              position={[dim.wheelRadius + 0.025, 0, 0]}
            >
              <boxGeometry args={[0.05, paddleHeight, paddleWidth]} />
              {createMaterial(PALETTE.wheelWoodMid, 'wood')}
            </mesh>
          </group>
        ))}

        {/* Hub iron caps */}
        <mesh castShadow receiveShadow position={[0, 0, dim.wheelDepth / 2 + 0.005]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.04, 16]} />
          {createMaterial(PALETTE.wheelHubIron, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0, -dim.wheelDepth / 2 - 0.005]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.04, 16]} />
          {createMaterial(PALETTE.wheelHubIron, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0, dim.wheelDepth / 2 + 0.025]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
          {createMaterial(PALETTE.wheelHubHighlight, 'iron')}
        </mesh>
      </group>
    </group>
  );
};
