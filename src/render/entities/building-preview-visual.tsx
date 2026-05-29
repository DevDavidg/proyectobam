import type { BuildingStatus, BuildingType } from "../../core/types/building";
import { BuildingVisual } from "./BuildingVisual";
import { ModularPenMesh } from "./modular-pen-mesh";
import { TownHallVisual } from "./town-hall-visual";

type PreviewableBuildingType = Exclude<BuildingType, "PREVIEW">;

type BuildingPreviewVisualProps = {
  type: PreviewableBuildingType;
  level: number;
  sizeX: number;
  sizeY: number;
  cellSize?: number;
  interactive?: boolean;
  status?: BuildingStatus | string;
  constructionProgress?: number;
};

export const BuildingPreviewVisual = ({
  type,
  level,
  sizeX,
  sizeY,
  cellSize = 1,
  interactive = false,
  status,
  constructionProgress,
}: BuildingPreviewVisualProps) => {
  const safeLevel = Math.max(1, level);
  const footprintX = sizeX * cellSize;
  const footprintZ = sizeY * cellSize;

  if (type === "TOWN_HALL") {
    return (
      <TownHallVisual
        level={safeLevel}
        footprintX={footprintX}
        footprintZ={footprintZ}
        interactive={interactive}
        status={status as BuildingStatus | undefined}
        constructionProgress={constructionProgress}
      />
    );
  }

  if (
    type === "DEFENSE_WALL_WOOD" ||
    type === "DEFENSE_WALL_STONE" ||
    type === "DEFENSE_WALL_IRON"
  ) {
    return (
      <group>
        <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
          <boxGeometry args={[footprintX, 0.9, footprintZ]} />
          <meshStandardMaterial
            color="#8f5b3b"
            roughness={0.9}
            flatShading={true}
          />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 1.15, 0]}>
          <coneGeometry args={[0.55, 1, 6]} />
          <meshStandardMaterial
            color="#b67852"
            roughness={0.82}
            flatShading={true}
          />
        </mesh>
      </group>
    );
  }

  if (type === "DEFENSE_TURRET_RAPID" || type === "DEFENSE_MORTAR") {
    const isMortar = type === "DEFENSE_MORTAR";
    return (
      <group>
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <cylinderGeometry
            args={isMortar ? [1.45, 1.7, 1.1, 12] : [1.2, 1.4, 1, 10]}
          />
          <meshStandardMaterial
            color={isMortar ? "#6b7280" : "#5c6674"}
            roughness={0.88}
            metalness={0.08}
            flatShading={true}
          />
        </mesh>
        <group position={[0, 1.2, 0]}>
          {isMortar ? (
            <>
              <mesh castShadow receiveShadow>
                <cylinderGeometry args={[0.92, 0.72, 0.95, 10]} />
                <meshStandardMaterial
                  color="#9ca3af"
                  metalness={0.24}
                  roughness={0.64}
                  flatShading={true}
                />
              </mesh>
              <mesh castShadow receiveShadow position={[0.95, 0.42, 0]}>
                <cylinderGeometry args={[0.28, 0.28, 1.9, 10]} />
                <meshStandardMaterial
                  color="#d1d5db"
                  metalness={0.4}
                  roughness={0.42}
                  flatShading={true}
                />
              </mesh>
              <mesh castShadow receiveShadow position={[-0.6, 0.05, 0]}>
                <boxGeometry args={[0.4, 0.25, 1.3]} />
                <meshStandardMaterial
                  color="#4b5563"
                  roughness={0.82}
                  metalness={0.08}
                  flatShading={true}
                />
              </mesh>
            </>
          ) : (
            <>
              <mesh castShadow receiveShadow>
                <cylinderGeometry args={[0.5, 0.5, 1, 10]} />
                <meshStandardMaterial
                  color="#a2aab7"
                  metalness={0.28}
                  roughness={0.62}
                  flatShading={true}
                />
              </mesh>
              <mesh castShadow receiveShadow position={[0.8, 0.3, 0]}>
                <boxGeometry args={[1.2, 0.2, 0.25]} />
                <meshStandardMaterial
                  color="#e2e8f0"
                  metalness={0.35}
                  roughness={0.5}
                  flatShading={true}
                />
              </mesh>
            </>
          )}
        </group>
      </group>
    );
  }

  if (type === "ARMY_MONSTER_PEN") {
    return (
      <ModularPenMesh level={safeLevel} sizeXCells={sizeX} sizeYCells={sizeY} />
    );
  }

  return (
    <BuildingVisual
      type={type}
      level={safeLevel}
      sizeX={sizeX}
      sizeY={sizeY}
      cellSize={cellSize}
    />
  );
};
