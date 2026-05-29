import type { Ref } from 'react';
import { useMemo } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { MaterialFactory, PuttySquisherDimensions } from '../types';

type GearTrainProps = {
  dim: PuttySquisherDimensions;
  createMaterial: MaterialFactory;
  rootRef?: Ref<Group>;
  largeGearRef: Ref<Group>;
  midGearRef: Ref<Group>;
  smallGearRef: Ref<Group>;
};

const LARGE_GEAR_TEETH = 12;
const MID_GEAR_TEETH = 9;
const SMALL_GEAR_TEETH = 7;
const SPOKE_HOLES = 5;

type Tooth = { id: string; rotation: number };

const buildTeeth = (count: number, prefix: string): Tooth[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index}`,
    rotation: (index / count) * Math.PI * 2,
  }));

const buildSpokeHoles = (count: number, prefix: string): Tooth[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-spoke-${index}`,
    rotation: (index / count) * Math.PI * 2 + Math.PI / count,
  }));

type SingleGearProps = {
  radius: number;
  thickness: number;
  toothCount: number;
  prefix: string;
  hasHandle?: boolean;
  hasSpokeHoles?: boolean;
  createMaterial: MaterialFactory;
  groupRef: Ref<Group>;
};

const Gear = ({
  radius,
  thickness,
  toothCount,
  prefix,
  hasHandle = false,
  hasSpokeHoles = true,
  createMaterial,
  groupRef,
}: SingleGearProps) => {
  const teeth = useMemo(() => buildTeeth(toothCount, prefix), [toothCount, prefix]);
  const spokes = useMemo(() => buildSpokeHoles(SPOKE_HOLES, prefix), [prefix]);

  const pitch = (Math.PI * 2 * radius) / toothCount;
  const toothBaseWidth = pitch * 0.6;
  const toothTipWidth = pitch * 0.38;
  const toothHeight = radius * 0.18;
  const hubRadius = radius * 0.26;
  const spokeHoleRadius = radius * 0.085;
  const spokeHoleCenterRadius = radius * 0.55;
  const faceOffset = thickness * 0.5;

  return (
    <group ref={groupRef}>
      {/* Main gear body — disc with axis along X */}
      <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.gearFace, 'iron')}>
        <cylinderGeometry args={[radius, radius, thickness, 28]} /></mesh>
      {/* Slim raised polish ring (outer rim) on visible face */}
      <mesh
        castShadow
        receiveShadow
        position={[faceOffset + 0.001, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
       material={createMaterial(PALETTE.gearFaceShine, 'iron')}>
        <torusGeometry args={[radius * 0.85, radius * 0.025, 8, 30]} /></mesh>
      {/* Mid groove ring for visual depth */}
      <mesh
        castShadow
        receiveShadow
        position={[faceOffset + 0.0018, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
       material={createMaterial(PALETTE.gearFaceDark, 'iron')}>
        <torusGeometry args={[radius * 0.66, radius * 0.022, 8, 28]} /></mesh>
      {/* Inner ring around the hub */}
      <mesh
        castShadow
        receiveShadow
        position={[faceOffset + 0.0026, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
       material={createMaterial(PALETTE.gearHubRing, 'iron')}>
        <torusGeometry args={[hubRadius + radius * 0.04, radius * 0.018, 8, 22]} /></mesh>

      {/* Spoke holes — dark circular indents around the face */}
      {hasSpokeHoles
        ? spokes.map((spoke) => (
            <group key={spoke.id} rotation={[spoke.rotation, 0, 0]}>
              <mesh
                receiveShadow
                position={[faceOffset + 0.0015, spokeHoleCenterRadius, 0]}
                rotation={[0, Math.PI / 2, 0]}
               material={createMaterial(PALETTE.gearSpokeHole, 'iron')}>
                <circleGeometry args={[spokeHoleRadius, 12]} /></mesh>
              <mesh
                receiveShadow
                position={[faceOffset + 0.0028, spokeHoleCenterRadius, 0]}
                rotation={[0, Math.PI / 2, 0]}
               material={createMaterial(PALETTE.gearFaceDeep, 'iron')}>
                <circleGeometry args={[spokeHoleRadius * 0.55, 10]} /></mesh>
            </group>
          ))
        : null}

      {/* Teeth — chunky trapezoidal silhouette via base + tip layered boxes */}
      {teeth.map((tooth) => (
        <group key={tooth.id} rotation={[tooth.rotation, 0, 0]}>
          {/* Tooth base (wider) */}
          <mesh
            castShadow
            receiveShadow
            position={[0, radius + toothHeight * 0.32, 0]}
           material={createMaterial(PALETTE.gearTeeth, 'iron')}>
            <boxGeometry args={[thickness * 0.96, toothHeight * 0.65, toothBaseWidth]} /></mesh>
          {/* Tooth tip (narrower, slightly lighter for highlight) */}
          <mesh
            castShadow
            receiveShadow
            position={[0, radius + toothHeight * 0.78, 0]}
           material={createMaterial(PALETTE.gearTeethShine, 'iron')}>
            <boxGeometry args={[thickness * 0.94, toothHeight * 0.42, toothTipWidth]} /></mesh>
          {/* Front-face accent strip on the tooth for visible contrast */}
          <mesh
            castShadow
            receiveShadow
            position={[faceOffset - 0.001, radius + toothHeight * 0.55, 0]}
           material={createMaterial(PALETTE.gearTeethDark, 'iron')}>
            <boxGeometry args={[0.004, toothHeight * 0.95, toothBaseWidth * 0.94]} /></mesh>
        </group>
      ))}

      {/* Hub recessed disc */}
      <mesh
        castShadow
        receiveShadow
        position={[faceOffset + 0.0012, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
       material={createMaterial(PALETTE.gearHub, 'iron')}>
        <circleGeometry args={[hubRadius, 18]} /></mesh>
      {/* Hub raised cylinder (slight bump) */}
      <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.gearAxle, 'iron')}>
        <cylinderGeometry args={[hubRadius * 0.6, hubRadius * 0.6, thickness * 1.05, 16]} /></mesh>
      {/* Center bolt cap — small bright sphere */}
      <mesh
        castShadow
        receiveShadow
        position={[faceOffset + 0.005, 0, 0]}
       material={createMaterial(PALETTE.gearHubRing, 'iron')}>
        <sphereGeometry args={[hubRadius * 0.4, 12, 10]} /></mesh>
      {/* Tiny center pin */}
      <mesh
        castShadow
        receiveShadow
        position={[faceOffset + 0.012, 0, 0]}
       material={createMaterial(PALETTE.gearAxle, 'iron')}>
        <sphereGeometry args={[hubRadius * 0.18, 8, 8]} /></mesh>

      {hasHandle ? (
        <group position={[faceOffset + 0.012, radius * 0.55, 0]}>
          <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.gearHubRing, 'iron')}>
            <cylinderGeometry args={[radius * 0.06, radius * 0.06, thickness * 0.5, 12]} /></mesh>
          <mesh castShadow receiveShadow position={[thickness * 0.18, 0, 0]} material={createMaterial(PALETTE.gearTeethShine, 'iron')}>
            <sphereGeometry args={[radius * 0.12, 14, 12]} /></mesh>
          <mesh castShadow receiveShadow position={[thickness * 0.18, 0, 0]} material={createMaterial(PALETTE.gearAxle, 'iron')}>
            <sphereGeometry args={[radius * 0.05, 8, 6]} /></mesh>
        </group>
      ) : null}
    </group>
  );
};

type MountPlateProps = {
  width: number;
  height: number;
  depth: number;
  centerX: number;
  centerY: number;
  centerZ: number;
  createMaterial: MaterialFactory;
};

const MountPlate = ({
  width,
  height,
  depth,
  centerX,
  centerY,
  centerZ,
  createMaterial,
}: MountPlateProps) => {
  const frameThickness = Math.min(height, depth) * 0.08;
  const frameDepth = width;
  const cornerBoltRadius = frameThickness * 0.45;
  const cornerInset = frameThickness * 0.5;
  const innerHalfH = height / 2 - frameThickness;
  const innerHalfD = depth / 2 - frameThickness;

  const frontX = centerX + width * 0.5;
  const cornerY = innerHalfH + frameThickness * 0.5;
  const cornerZ = innerHalfD + frameThickness * 0.5;

  return (
    <group>
      {/* Recessed inner panel — dark slab behind the gears */}
      <mesh castShadow receiveShadow position={[centerX, centerY, centerZ]} material={createMaterial(PALETTE.gearMountInset, 'iron')}>
        <boxGeometry args={[frameDepth, height, depth]} /></mesh>
      {/* Slightly brighter inner backplate */}
      <mesh
        receiveShadow
        position={[frontX - frameDepth * 0.1, centerY, centerZ]}
        rotation={[0, Math.PI / 2, 0]}
       material={createMaterial(PALETTE.gearFaceDeep, 'iron')}>
        <planeGeometry args={[depth - frameThickness * 0.4, height - frameThickness * 0.4]} /></mesh>

      {/* Frame: top, bottom, left, right rails on the front face */}
      <mesh
        castShadow
        receiveShadow
        position={[frontX - frameDepth * 0.1, centerY + cornerY, centerZ]}
       material={createMaterial(PALETTE.gearMountFrame, 'iron')}>
        <boxGeometry args={[frameDepth * 0.3, frameThickness, depth]} /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[frontX - frameDepth * 0.1, centerY - cornerY, centerZ]}
       material={createMaterial(PALETTE.gearMountFrame, 'iron')}>
        <boxGeometry args={[frameDepth * 0.3, frameThickness, depth]} /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[frontX - frameDepth * 0.1, centerY, centerZ + cornerZ]}
       material={createMaterial(PALETTE.gearMountFrame, 'iron')}>
        <boxGeometry args={[frameDepth * 0.3, height, frameThickness]} /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[frontX - frameDepth * 0.1, centerY, centerZ - cornerZ]}
       material={createMaterial(PALETTE.gearMountFrame, 'iron')}>
        <boxGeometry args={[frameDepth * 0.3, height, frameThickness]} /></mesh>

      {/* Bevel highlight strip along the top of the front frame */}
      <mesh
        receiveShadow
        position={[frontX - frameDepth * 0.1 + frameDepth * 0.16, centerY + cornerY, centerZ]}
       material={createMaterial(PALETTE.gearMountFrameLight, 'iron')}>
        <boxGeometry args={[0.006, frameThickness * 0.4, depth - frameThickness * 0.2]} /></mesh>

      {/* Corner bolts on the frame */}
      {[
        { id: 'tl', y: centerY + cornerY, z: centerZ - cornerZ },
        { id: 'tr', y: centerY + cornerY, z: centerZ + cornerZ },
        { id: 'bl', y: centerY - cornerY, z: centerZ - cornerZ },
        { id: 'br', y: centerY - cornerY, z: centerZ + cornerZ },
      ].map(({ id, y, z }) => (
        <group key={`mount-bolt-${id}`} position={[frontX - frameDepth * 0.1 + frameDepth * 0.18, y, z]}>
          <mesh castShadow receiveShadow material={createMaterial(PALETTE.gearHub, 'iron')}>
            <sphereGeometry args={[cornerBoltRadius, 10, 8]} /></mesh>
          <mesh castShadow receiveShadow position={[cornerInset * 0.3, 0, 0]} material={createMaterial(PALETTE.gearHubRing, 'iron')}>
            <sphereGeometry args={[cornerBoltRadius * 0.55, 8, 6]} /></mesh>
        </group>
      ))}
    </group>
  );
};

export const GearTrain = ({
  dim,
  createMaterial,
  rootRef,
  largeGearRef,
  midGearRef,
  smallGearRef,
}: GearTrainProps) => {
  const {
    half,
    cubeSize,
    gearAxisY,
    gearAxisZ,
    gearLargeRadius,
    gearMidRadius,
    gearSmallRadius,
    gearThickness,
  } = dim;

  // Mount plate sits flush against the cube's +X face, gears sit on top of the plate
  const mountPlateBackX = half + 0.001;
  const mountPlateThickness = cubeSize * 0.05;
  const gearBackX = mountPlateBackX + mountPlateThickness;

  const overlap = 0.014;
  const largePosX = gearBackX + gearThickness * 0.5;
  const largePosY = gearAxisY;
  const largePosZ = gearAxisZ;

  const largeMidDist = gearLargeRadius + gearMidRadius - overlap;
  const midAngle = Math.PI * 1.78; // mid is to the front-and-slightly-down (visible next to large)
  const midPosY = largePosY + Math.sin(midAngle) * largeMidDist;
  const midPosZ = largePosZ + Math.cos(midAngle) * largeMidDist;

  const midSmallDist = gearMidRadius + gearSmallRadius - overlap;
  const smallAngle = Math.PI * 1.42; // small is below-and-slightly-back of mid
  const smallPosY = midPosY + Math.sin(smallAngle) * midSmallDist;
  const smallPosZ = midPosZ + Math.cos(smallAngle) * midSmallDist;

  const minY = Math.min(
    largePosY - gearLargeRadius,
    midPosY - gearMidRadius,
    smallPosY - gearSmallRadius,
  );
  const maxY = Math.max(
    largePosY + gearLargeRadius,
    midPosY + gearMidRadius,
    smallPosY + gearSmallRadius,
  );
  const minZ = Math.min(
    largePosZ - gearLargeRadius,
    midPosZ - gearMidRadius,
    smallPosZ - gearSmallRadius,
  );
  const maxZ = Math.max(
    largePosZ + gearLargeRadius,
    midPosZ + gearMidRadius,
    smallPosZ + gearSmallRadius,
  );

  const padding = gearThickness * 1.15;
  const mountPlateHeight = (maxY - minY) + padding;
  const mountPlateDepth = (maxZ - minZ) + padding;
  const mountPlateCenterX = mountPlateBackX + mountPlateThickness * 0.5;
  const mountPlateCenterY = (minY + maxY) / 2;
  const mountPlateCenterZ = (minZ + maxZ) / 2;

  return (
    <group ref={rootRef}>
      <MountPlate
        width={mountPlateThickness}
        height={mountPlateHeight}
        depth={mountPlateDepth}
        centerX={mountPlateCenterX}
        centerY={mountPlateCenterY}
        centerZ={mountPlateCenterZ}
        createMaterial={createMaterial}
      />

      <group position={[largePosX, largePosY, largePosZ]}>
        <Gear
          radius={gearLargeRadius}
          thickness={gearThickness}
          toothCount={LARGE_GEAR_TEETH}
          prefix='gear-large'
          hasHandle
          createMaterial={createMaterial}
          groupRef={largeGearRef}
        />
      </group>

      <group position={[largePosX - gearThickness * 0.18, midPosY, midPosZ]}>
        <Gear
          radius={gearMidRadius}
          thickness={gearThickness * 0.92}
          toothCount={MID_GEAR_TEETH}
          prefix='gear-mid'
          createMaterial={createMaterial}
          groupRef={midGearRef}
        />
      </group>

      <group position={[largePosX - gearThickness * 0.32, smallPosY, smallPosZ]}>
        <Gear
          radius={gearSmallRadius}
          thickness={gearThickness * 0.86}
          toothCount={SMALL_GEAR_TEETH}
          prefix='gear-small'
          createMaterial={createMaterial}
          groupRef={smallGearRef}
        />
      </group>
    </group>
  );
};
