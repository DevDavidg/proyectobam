import { Grid, OrbitControls } from '@react-three/drei';
import { useMemo } from 'react';
import { EntityType } from '../../ecs/components/components';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, getGridWorldSize } from '../../utils/coordinates';
import { IsometricCamera } from '../camera/isometric-camera';
import { CollectorMesh } from '../entities/collector-mesh';
import { EnemyMesh } from '../entities/enemy-mesh';
import { ObstacleMesh } from '../entities/obstacle-mesh';
import { PenMesh } from '../entities/pen-mesh';
import { PlacementPreviewMesh } from '../entities/placement-preview-mesh';
import { TownHallMesh } from '../entities/town-hall-mesh';
import { TurretMesh } from '../entities/turret-mesh';
import { WallMesh } from '../entities/wall-mesh';
import { GridPointer } from '../input/grid-pointer';
import { BattleExclusionLine } from './battle-exclusion-line';
import { BattleDeployPreview } from './battle-deploy-preview';
import { BuildingContextMenu } from './building-context-menu';
import { CombatJuiceLayer } from './combat-juice-layer';
import { LandExpansionPreview } from './land-expansion-preview';
import { PenResidentsLayer } from './pen-residents-layer';
import { MoveBuildingGuides } from './move-building-guides';
import { RangeRing } from './range-ring';
import { ResourceCollectionLayer } from './resource-collection-layer';
import { Terrain } from './terrain';
import { WorkersLayer } from './workers-layer';

export const GameScene = () => {
  const entities = useGameStore((state) => state.entities);
  const placementEnabled = useGameStore((state) => state.placementEnabled);
  const battleMode = useGameStore((state) => state.battleMode);
  const worldSize = useMemo(() => getGridWorldSize(GRID_SIZE, CELL_SIZE), []);

  return (
    <>
      <IsometricCamera />
      <color attach="background" args={['#86c43e']} />
      <hemisphereLight intensity={0.58} groundColor="#23420f" color="#f4ffd7" />
      <ambientLight intensity={0.34} color="#d8efbc" />
      <directionalLight
        castShadow
        position={[-28, 42, -24]}
        intensity={1.2}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-44}
        shadow-camera-right={44}
        shadow-camera-top={44}
        shadow-camera-bottom={-44}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
      {placementEnabled ? (
        <Grid
          args={[worldSize, worldSize]}
          sectionSize={CELL_SIZE}
          sectionThickness={0.85}
          sectionColor="#365314"
          cellSize={CELL_SIZE}
          cellThickness={0.2}
          cellColor="#4d7c0f"
          infiniteGrid={false}
        />
      ) : null}
      <Terrain worldSize={worldSize} />
      <LandExpansionPreview />
      <BattleExclusionLine />
      <BattleDeployPreview />
      <RangeRing />
      <MoveBuildingGuides />
      <GridPointer />
      {entities.map((entity) => {
        if (entity.kind === EntityType.TOWN_HALL) {
          return <TownHallMesh key={entity.id} entity={entity} />;
        }
        if (entity.kind === EntityType.WALL) {
          return <WallMesh key={entity.id} entity={entity} />;
        }
        if (entity.kind === EntityType.TURRET) {
          return <TurretMesh key={entity.id} entity={entity} />;
        }
        if (entity.kind === EntityType.MORTAR) {
          return <TurretMesh key={entity.id} entity={entity} />;
        }
        if (entity.kind === EntityType.GOLD_COLLECTOR || entity.kind === EntityType.GOO_COLLECTOR) {
          return <CollectorMesh key={entity.id} entity={entity} />;
        }
        if (
          entity.kind === EntityType.PEBBLE_COLLECTOR ||
          entity.kind === EntityType.PUTTY_COLLECTOR ||
          entity.kind === EntityType.STORAGE ||
          entity.kind === EntityType.HATCHERY ||
          entity.kind === EntityType.DECOR
        ) {
          return <CollectorMesh key={entity.id} entity={entity} />;
        }
        if (entity.kind === EntityType.PEN) {
          return <PenMesh key={entity.id} entity={entity} />;
        }
        if (entity.kind === EntityType.OBSTACLE) {
          return <ObstacleMesh key={entity.id} entity={entity} />;
        }
        if (entity.kind === EntityType.PREVIEW) {
          if (battleMode) {
            return null;
          }
          return <PlacementPreviewMesh key={entity.id} entity={entity} />;
        }
        if (entity.kind === EntityType.ENEMY) {
          return <EnemyMesh key={entity.id} entity={entity} />;
        }
        return null;
      })}
      <WorkersLayer />
      <PenResidentsLayer />
      <BuildingContextMenu />
      <CombatJuiceLayer />
      <ResourceCollectionLayer />
      <OrbitControls
        target={[0, 0, 0]}
        enablePan={true}
        enableRotate={true}
        enableZoom={true}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
};
