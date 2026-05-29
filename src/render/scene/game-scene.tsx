import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AmbientLight, Color, DirectionalLight, HemisphereLight } from "three";
import { useShallow } from "zustand/react/shallow";
import { getDayNightCycleState } from "../../core/constants/day-night-cycle";
import { useGameStore } from "../../state/game-store";
import {
  CELL_SIZE,
  GRID_SIZE,
  getGridWorldSize,
} from "../../utils/coordinates";
import { CameraController } from "../camera/camera-controller";
import { IsometricCamera } from "../camera/isometric-camera";
import { ObstaclesLayer } from "../entities/obstacles/obstacles-layer";
import { GridPointer } from "../input/grid-pointer";
import { BattleExclusionLine } from "./battle-exclusion-line";
import { BattleDeployPreview } from "./battle-deploy-preview";
import { BuildingContextMenu } from "./building-context-menu";
import { CombatJuiceLayer } from "./combat-juice-layer";
import { EntitiesLayer } from "./entities-layer";
import { LandExpansionPreview } from "./land-expansion-preview";
import { PenResidentsLayer } from "./pen-residents-layer";
import { MoveBuildingGuides } from "./move-building-guides";
import { RangeRing } from "./range-ring";
import { ResourceCollectionLayer } from "./resource-collection-layer";
import { DynamicAtmosphere } from "./dynamic-atmosphere";
import { Terrain } from "./terrain";
import { WorkersLayer } from "./workers-layer";

const mixIntensity = (day: number, night: number, nightFactor: number): number =>
  day + (night - day) * nightFactor;

const DayNightLighting = () => {
  const hemisphereRef = useRef<HemisphereLight>(null);
  const ambientRef = useRef<AmbientLight>(null);
  const directionalRef = useRef<DirectionalLight>(null);
  const daySunColor = useMemo(() => new Color("#fff9e6"), []);
  const nightMoonColor = useMemo(() => new Color("#a3bfff"), []);
  const mixedDirectionalColor = useMemo(() => new Color(), []);

  useFrame(({ clock }) => {
    const cycle = getDayNightCycleState(clock.getElapsedTime());

    if (hemisphereRef.current) {
      hemisphereRef.current.intensity = mixIntensity(0.45, 0.2, cycle.nightFactor);
    }

    if (ambientRef.current) {
      ambientRef.current.intensity = mixIntensity(0.22, 0.36, cycle.nightFactor);
    }

    if (directionalRef.current) {
      directionalRef.current.intensity = mixIntensity(2.6, 1.1, cycle.nightFactor);
      mixedDirectionalColor.lerpColors(daySunColor, nightMoonColor, cycle.nightFactor);
      directionalRef.current.color.copy(mixedDirectionalColor);
    }
  });

  return (
    <>
      <hemisphereLight
        ref={hemisphereRef}
        intensity={0.45}
        groundColor="#17340f"
        color="#cdeeb8"
      />
      <ambientLight ref={ambientRef} intensity={0.22} color="#1a2e15" />
      <directionalLight
        ref={directionalRef}
        castShadow
        position={[-34, 44, -34]}
        intensity={2.6}
        color="#fff9e6"
        shadow-mapSize-width={1536}
        shadow-mapSize-height={1536}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-44}
        shadow-camera-right={44}
        shadow-camera-top={44}
        shadow-camera-bottom={-44}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
    </>
  );
};

export const GameScene = () => {
  const { placementEnabled, shopOpen, movingBuildingId } = useGameStore(
    useShallow((state) => ({
      placementEnabled: state.placementEnabled,
      shopOpen: state.shopOpen,
      movingBuildingId: state.movingBuildingId,
    })),
  );
  const worldSize = useMemo(() => getGridWorldSize(GRID_SIZE, CELL_SIZE), []);
  const isBuildAssistActive =
    placementEnabled || shopOpen || Boolean(movingBuildingId);
  const terrainGridOpacity = isBuildAssistActive ? 0.2 : 0.07;

  return (
    <>
      <IsometricCamera />
      <DynamicAtmosphere />
      <DayNightLighting />
      <Environment resolution={16} frames={1}>
        <Lightformer
          intensity={1.05}
          color="#fff4dc"
          position={[-20, 18, -18]}
          scale={[30, 30, 1]}
        />
        <Lightformer
          intensity={0.34}
          color="#8bc5ff"
          position={[22, 9, 20]}
          scale={[18, 18, 1]}
        />
      </Environment>
      <Terrain worldSize={worldSize} gridOpacity={terrainGridOpacity} />
      <ObstaclesLayer />
      <EntitiesLayer />
      <LandExpansionPreview />
      <BattleExclusionLine />
      <BattleDeployPreview />
      <RangeRing />
      <MoveBuildingGuides />
      <GridPointer />
      <WorkersLayer />
      <PenResidentsLayer />
      <BuildingContextMenu />
      <CombatJuiceLayer />
      <ResourceCollectionLayer />
      <CameraController worldSize={worldSize} />
    </>
  );
};
