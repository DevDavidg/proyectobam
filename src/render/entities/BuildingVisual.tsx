import {
  getCircleGeometry,
  getConeGeometry,
  getCylinderGeometry,
  getSphereGeometry,
} from "./building-visual/geometry-cache";
import { getCollectorColor, getTypeFamily } from "./building-visual/helpers";
import {
  BeveledShell,
  CylinderRivetRing,
  MechanicalGauge,
  OrganicElbowPipe,
  PerimeterRivetTrack,
  ScrapStraps,
} from "./building-visual/industrial-details";
import { createMaterialFactory } from "./building-visual/materials";
import { BuildingCornerBolts } from "./building-visual/micro-props";
import type { BuildingVisualProps } from "./building-visual/types";
import { GooFactoryVisual } from "./goo-factory-visual";
import { HatcheryVisual } from "./hatchery-visual";
import { LaserTowerVisual } from "./laser-tower-visual";
import { MushroomTotemVisual } from "./mushroom-totem-visual";
import { PebbleShinerVisual } from "./pebble-shiner-visual";
import { PuttySquisherVisual } from "./putty-squisher-visual";
import { StorageSiloVisual } from "./storage-silo-visual";
import { TownHallVisual } from "./town-hall-visual";
import { TwigSnapperVisual } from "./twig-snapper-visual";

export const BuildingVisual = ({
  type,
  level,
  sizeX = 2,
  sizeY = 2,
  cellSize = 1,
  materialMode = "default",
  hatcheryBusy = false,
  status,
  hp,
  maxHp,
  storageFillRatio,
  constructionProgress,
}: BuildingVisualProps) => {
  const family = getTypeFamily(type);
  const footprintX = sizeX * cellSize;
  const footprintZ = sizeY * cellSize;
  const isGhost =
    materialMode === "ghost-valid" || materialMode === "ghost-invalid";
  const opacity = isGhost ? 0.5 : 1;

  const createMaterial = createMaterialFactory(materialMode, isGhost, opacity);
  const strapSeed = `${type}-${level}`;

  if (family === "town-hall") {
    return (
      <TownHallVisual
        level={level}
        footprintX={footprintX}
        footprintZ={footprintZ}
        status={status}
        hp={hp}
        maxHp={maxHp}
      />
    );
  }

  if (family === "wall") {
    return (
      <group>
        <BeveledShell
          width={footprintX}
          height={0.8}
          depth={footprintZ}
          pivotY={0.4}
          color="#8f5b3b"
          token="wood"
          cornerRadius={0.1}
          createMaterial={createMaterial}
        />
        <ScrapStraps
          width={footprintX}
          height={0.55}
          depth={footprintZ}
          seed={strapSeed}
          color="#564030"
          token="iron"
          createMaterial={createMaterial}
          pivotY={0.4}
        />
        <mesh castShadow receiveShadow position={[0, 1, 0]} material={createMaterial("#b67852", "wood")}>
          <primitive
            attach="geometry"
            object={getConeGeometry(
              Math.max(0.22, Math.min(footprintX, footprintZ) * 0.45),
              0.7,
              6,
            )}
          /></mesh>
        <PerimeterRivetTrack
          width={footprintX}
          depth={footprintZ}
          height={0.72}
          spacing={0.25}
          rivetRadius={0.035}
          color="#2a1f15"
          createMaterial={createMaterial}
        />
        <BuildingCornerBolts
          footprintX={footprintX}
          footprintZ={footprintZ}
          height={0.78}
          inset={0.1}
          boltRadius={0.07}
          color="#5b4631"
          createMaterial={createMaterial}
        />
      </group>
    );
  }

  if (family === "turret" || family === "mortar") {
    const isMortar = family === "mortar";
    const baseRadius = isMortar ? 1.05 : 0.84;
    return (
      <group>
        <mesh castShadow receiveShadow position={[0, 0.5, 0]} material={createMaterial("#6b7280", "iron")}>
          <primitive
            attach="geometry"
            object={
              isMortar
                ? getCylinderGeometry(0.9, 1.05, 1, 12)
                : getCylinderGeometry(0.72, 0.84, 0.9, 10)
            }
          /></mesh>
        <CylinderRivetRing
          radius={baseRadius * 0.92}
          height={0.18}
          spacing={0.28}
          rivetRadius={0.04}
          color="#1f1a14"
          createMaterial={createMaterial}
        />
        <CylinderRivetRing
          radius={baseRadius * 0.92}
          height={0.86}
          spacing={0.28}
          rivetRadius={0.04}
          color="#1f1a14"
          createMaterial={createMaterial}
        />
        <mesh castShadow receiveShadow position={[0, 1.15, 0]} material={createMaterial("#a2aab7", "iron")}>
          <primitive
            attach="geometry"
            object={
              isMortar
                ? getCylinderGeometry(0.62, 0.48, 0.75, 10)
                : getCylinderGeometry(0.42, 0.42, 0.72, 10)
            }
          /></mesh>
        <mesh
          castShadow
          receiveShadow
          position={[isMortar ? 0.62 : 0.56, 1.35, 0]}
         material={createMaterial("#d1d5db", "iron")}>
          <primitive
            attach="geometry"
            object={
              isMortar
                ? getCylinderGeometry(0.2, 0.2, 1.25, 10)
                : getCylinderGeometry(0.12, 0.12, 0.92, 10)
            }
          /></mesh>
        <MechanicalGauge
          position={[isMortar ? -0.78 : -0.6, 0.62, isMortar ? 0.2 : 0.18]}
          rotationY={Math.PI / 5}
          dialRadius={0.11}
          needleAngle={-Math.PI / 2.6}
          createMaterial={createMaterial}
        />
      </group>
    );
  }

  if (family === "pen") {
    const railHeight = 0.55;
    return (
      <group>
        <BeveledShell
          width={footprintX}
          height={0.4}
          depth={footprintZ}
          pivotY={0.2}
          color="#9a5b2b"
          token="wood"
          cornerRadius={0.08}
          createMaterial={createMaterial}
        />
        <BeveledShell
          width={footprintX * 0.98}
          height={0.14}
          depth={0.12}
          pivotY={railHeight}
          color="#7c4a22"
          token="wood"
          cornerRadius={0.04}
          createMaterial={createMaterial}
        />
        <ScrapStraps
          width={footprintX}
          height={0.32}
          depth={footprintZ}
          seed={`${strapSeed}-pen`}
          color="#4a3520"
          token="iron"
          createMaterial={createMaterial}
          pivotY={0.2}
        />
        <PerimeterRivetTrack
          width={footprintX}
          depth={footprintZ}
          height={0.42}
          spacing={0.25}
          rivetRadius={0.032}
          color="#241a10"
          createMaterial={createMaterial}
        />
        <BuildingCornerBolts
          footprintX={footprintX}
          footprintZ={footprintZ}
          height={0.4}
          inset={0.14}
          boltRadius={0.075}
          color="#3f2b18"
          createMaterial={createMaterial}
        />
      </group>
    );
  }

  if (family === "hatchery") {
    return (
      <HatcheryVisual
        level={level}
        footprintX={footprintX}
        footprintZ={footprintZ}
        hatcheryBusy={hatcheryBusy}
      />
    );
  }

  if (family === "decor") {
    return (
      <MushroomTotemVisual
        level={level}
        footprintX={footprintX}
        footprintZ={footprintZ}
        createMaterial={createMaterial}
      />
    );
  }

  if (type === "RESOURCE_GOO_COLLECTOR") {
    return (
      <GooFactoryVisual
        level={level}
        footprintX={footprintX}
        footprintZ={footprintZ}
        status={status}
        hp={hp}
        maxHp={maxHp}
        storageFillRatio={storageFillRatio}
        constructionProgress={constructionProgress}
        createMaterial={createMaterial}
      />
    );
  }

  if (type === "RESOURCE_PEBBLE_COLLECTOR") {
    return (
      <PebbleShinerVisual
        level={level}
        footprintX={footprintX}
        footprintZ={footprintZ}
        status={status}
        hp={hp}
        maxHp={maxHp}
        storageFillRatio={storageFillRatio}
        createMaterial={createMaterial}
      />
    );
  }

  if (type === "RESOURCE_PUTTY_COLLECTOR") {
    return (
      <PuttySquisherVisual
        level={level}
        footprintX={footprintX}
        footprintZ={footprintZ}
        status={status}
        hp={hp}
        maxHp={maxHp}
        storageFillRatio={storageFillRatio}
        createMaterial={createMaterial}
      />
    );
  }

  if (type === "RESOURCE_WOOD_SILO" || type === "RESOURCE_STONE_SILO") {
    return (
      <StorageSiloVisual
        level={level}
        footprintX={footprintX}
        footprintZ={footprintZ}
        status={status}
        hp={hp}
        maxHp={maxHp}
        storageFillRatio={storageFillRatio}
        createMaterial={createMaterial}
      />
    );
  }

  if (type === "RESOURCE_TWIG_COLLECTOR") {
    return (
      <TwigSnapperVisual
        level={level}
        footprintX={footprintX}
        footprintZ={footprintZ}
        status={status}
        hp={hp}
        maxHp={maxHp}
        constructionProgress={constructionProgress}
        storageFillRatio={storageFillRatio}
        createMaterial={createMaterial}
      />
    );
  }

  if (type === "DEFENSE_LASER_TOWER") {
    return (
      <LaserTowerVisual
        level={level}
        isActive={status === "ACTIVE"}
        hp={hp}
        maxHp={maxHp}
      />
    );
  }

  const collectorColor = getCollectorColor(type);
  return (
    <group>
      <BeveledShell
        width={footprintX}
        height={0.8}
        depth={footprintZ}
        pivotY={0.4}
        color="#6b4f3a"
        token="wood"
        cornerRadius={0.1}
        createMaterial={createMaterial}
      />
      <ScrapStraps
        width={footprintX}
        height={0.6}
        depth={footprintZ}
        seed={`${strapSeed}-base`}
        color="#3f2a1a"
        token="iron"
        createMaterial={createMaterial}
        pivotY={0.4}
      />
      <mesh castShadow receiveShadow position={[0, 1.05, 0]} material={createMaterial(collectorColor, "goo")}>
        <primitive
          attach="geometry"
          object={getCylinderGeometry(0.52, 0.52, 0.72, 12)}
        /></mesh>
      <CylinderRivetRing
        radius={0.55}
        height={0.78}
        spacing={0.26}
        rivetRadius={0.035}
        color="#2a1f15"
        createMaterial={createMaterial}
      />
      <CylinderRivetRing
        radius={0.55}
        height={1.32}
        spacing={0.26}
        rivetRadius={0.035}
        color="#2a1f15"
        createMaterial={createMaterial}
      />
      {level >= 2 ? (
        <mesh castShadow receiveShadow position={[0, 1.75, 0]} material={createMaterial("#f8fafc", "stone")}>
          <primitive
            attach="geometry"
            object={getSphereGeometry(
              0.22 + Math.min(0.18, level * 0.03),
              12,
              12,
            )}
          /></mesh>
      ) : null}
      <PerimeterRivetTrack
        width={footprintX}
        depth={footprintZ}
        height={0.78}
        spacing={0.25}
        rivetRadius={0.035}
        color="#1f1611"
        createMaterial={createMaterial}
      />
      <OrganicElbowPipe
        origin={[footprintX / 2 - 0.04, 1.1, 0]}
        rotationY={0}
        arcRadius={0.28}
        tubeRadius={0.06}
        flangeRadius={0.12}
        flangeThickness={0.05}
        pipeColor="#8d6a44"
        flangeColor="#d0a85a"
        createMaterial={createMaterial}
      />
      <OrganicElbowPipe
        origin={[-footprintX / 2 + 0.04, 1.1, 0.18]}
        rotationY={Math.PI}
        arcRadius={0.22}
        tubeRadius={0.055}
        flangeRadius={0.1}
        flangeThickness={0.045}
        pipeColor="#7a5a3a"
        flangeColor="#caa15a"
        createMaterial={createMaterial}
      />
      <MechanicalGauge
        position={[-footprintX / 2 + 0.02, 1.08, -0.18]}
        rotationY={Math.PI / 2}
        dialRadius={0.11}
        needleAngle={-Math.PI / 3}
        createMaterial={createMaterial}
      />
      <mesh
        receiveShadow
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
       material={createMaterial("#3f2a1a", "wood")}>
        <primitive
          attach="geometry"
          object={getCircleGeometry(Math.max(0.9, footprintX * 0.45), 24)}
        /></mesh>
    </group>
  );
};
