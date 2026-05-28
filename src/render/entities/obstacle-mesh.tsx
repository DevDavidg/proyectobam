import type { ThreeEvent } from "@react-three/fiber";
import { useMemo } from "react";
import { EntityType } from "../../ecs/components/components";
import type { RenderEntitySnapshot } from "../../ecs/systems/sync-grid-system";
import { useGameStore } from "../../state/game-store";
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from "../../utils/coordinates";

type ObstacleMeshProps = {
  entity: RenderEntitySnapshot;
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const seeded = (seed: number, offset: number): number => {
  const value = Math.sin((seed + offset) * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const mapSeeded = (seed: number, offset: number, min: number, max: number): number =>
  min + seeded(seed, offset) * (max - min);

export const ObstacleMesh = ({ entity }: ObstacleMeshProps) => {
  const clearObstacle = useGameStore((state) => state.clearObstacle);
  const position = useMemo(
    () => gridToWorldCenter(entity.x, entity.y, entity.sizeX, entity.sizeY, GRID_SIZE, CELL_SIZE),
    [entity.x, entity.y, entity.sizeX, entity.sizeY],
  );

  if (entity.kind !== EntityType.OBSTACLE) {
    return null;
  }

  const handleClick = (event: ThreeEvent<MouseEvent>): void => {
    event.stopPropagation();
    if (!entity.sourceId) {
      return;
    }
    clearObstacle(entity.sourceId);
  };

  const isRock = entity.sourceType === "OBSTACLE_ROCK";
  const isMushroom = entity.sourceType === "OBSTACLE_MUSHROOM";
  const obstacleSeed = hashString(entity.sourceId ?? `obstacle-${entity.id}`);
  const baseScale = mapSeeded(obstacleSeed, 1, 0.92, 1.25);
  const obstacleScale = baseScale * 0.5;

  if (isRock) {
    const shardCount = 4 + Math.floor(mapSeeded(obstacleSeed, 2, 0, 4));
    return (
      <group position={[position[0], 0, position[2]]} onClick={handleClick} scale={[obstacleScale, obstacleScale, obstacleScale]}>
        <mesh castShadow receiveShadow position={[0, 0.48, 0]}>
          <dodecahedronGeometry args={[0.88, 0]} />
          <meshStandardMaterial color="#5f6673" roughness={0.95} metalness={0.05} flatShading={true} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.18, 0.72, -0.08]} rotation={[0.3, 0.5, 0.1]}>
          <icosahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial color="#7c8796" roughness={0.88} metalness={0.08} flatShading={true} />
        </mesh>
        {Array.from({ length: shardCount }).map((_, index) => {
          const angle = (Math.PI * 2 * index) / shardCount;
          const radius = mapSeeded(obstacleSeed, 10 + index, 0.42, 0.78);
          const shardX = Math.cos(angle) * radius;
          const shardZ = Math.sin(angle) * radius;
          const shardY = mapSeeded(obstacleSeed, 20 + index, 0.12, 0.28);
          const shardScale = mapSeeded(obstacleSeed, 30 + index, 0.18, 0.34);
          return (
            <mesh
              key={`rock-shard-${index}`}
              castShadow
              receiveShadow
              position={[shardX, shardY, shardZ]}
              rotation={[
                mapSeeded(obstacleSeed, 40 + index, -0.4, 0.4),
                mapSeeded(obstacleSeed, 50 + index, -0.6, 0.6),
                mapSeeded(obstacleSeed, 60 + index, -0.4, 0.4),
              ]}
              scale={[1, mapSeeded(obstacleSeed, 70 + index, 0.6, 1.5), 1]}
            >
              <dodecahedronGeometry args={[shardScale, 0]} />
              <meshStandardMaterial color="#8b97a7" roughness={0.9} metalness={0.04} flatShading={true} />
            </mesh>
          );
        })}
      </group>
    );
  }

  if (isMushroom) {
    const miniMushroomCount = 3 + Math.floor(mapSeeded(obstacleSeed, 3, 0, 4));
    const capRadius = mapSeeded(obstacleSeed, 4, 0.8, 1.05);
    const stemHeight = mapSeeded(obstacleSeed, 5, 1.15, 1.45);
    return (
      <group position={[position[0], 0, position[2]]} onClick={handleClick} scale={[obstacleScale, obstacleScale, obstacleScale]}>
        <mesh castShadow receiveShadow position={[0, stemHeight * 0.5, 0]}>
          <cylinderGeometry args={[0.22, 0.3, stemHeight, 12]} />
          <meshStandardMaterial color="#f6d4a8" roughness={0.86} metalness={0.03} flatShading={true} />
        </mesh>
        <group position={[0, stemHeight + 0.14, 0]} scale={[1, 0.62, 1]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[capRadius, 18, 14]} />
            <meshStandardMaterial color="#be1f1f" roughness={0.72} metalness={0.05} flatShading={true} />
          </mesh>
        </group>
        <mesh castShadow receiveShadow position={[0, stemHeight, 0]}>
          <torusGeometry args={[capRadius * 0.62, 0.05, 8, 20]} />
          <meshStandardMaterial color="#ffd7b5" roughness={0.8} metalness={0.02} flatShading={true} />
        </mesh>
        {Array.from({ length: 7 }).map((_, index) => {
          const angle = (Math.PI * 2 * index) / 7;
          const spotRadius = capRadius * mapSeeded(obstacleSeed, 80 + index, 0.16, 0.42);
          const spotX = Math.cos(angle) * spotRadius;
          const spotZ = Math.sin(angle) * spotRadius;
          return (
            <mesh key={`mushroom-spot-${index}`} castShadow receiveShadow position={[spotX, stemHeight + 0.5, spotZ]}>
              <sphereGeometry args={[mapSeeded(obstacleSeed, 90 + index, 0.08, 0.16), 8, 8]} />
              <meshStandardMaterial color="#fee2e2" roughness={0.72} metalness={0.02} flatShading={true} />
            </mesh>
          );
        })}
        {Array.from({ length: miniMushroomCount }).map((_, index) => {
          const angle = (Math.PI * 2 * index) / miniMushroomCount + mapSeeded(obstacleSeed, 100 + index, -0.4, 0.4);
          const radius = mapSeeded(obstacleSeed, 110 + index, 0.58, 0.92);
          const miniX = Math.cos(angle) * radius;
          const miniZ = Math.sin(angle) * radius;
          const miniScale = mapSeeded(obstacleSeed, 120 + index, 0.35, 0.62);
          return (
            <group key={`mini-mushroom-${index}`} position={[miniX, 0.06, miniZ]} scale={[miniScale, miniScale, miniScale]}>
              <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.12, 0.16, 0.58, 8]} />
                <meshStandardMaterial color="#f7d9b0" roughness={0.88} metalness={0.02} flatShading={true} />
              </mesh>
              <group position={[0, 0.72, 0]} scale={[1, 0.64, 1]}>
                <mesh castShadow receiveShadow>
                  <sphereGeometry args={[0.38, 10, 8]} />
                  <meshStandardMaterial color="#ef4444" roughness={0.72} metalness={0.03} flatShading={true} />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>
    );
  }

  const trunkHeight = mapSeeded(obstacleSeed, 6, 1.7, 2.5);
  const trunkRadius = mapSeeded(obstacleSeed, 7, 0.18, 0.28);
  const canopyLayers = 3 + Math.floor(mapSeeded(obstacleSeed, 8, 0, 3));

  return (
    <group position={[position[0], 0, position[2]]} onClick={handleClick} scale={[obstacleScale, obstacleScale, obstacleScale]}>
      <mesh castShadow receiveShadow position={[0, trunkHeight * 0.5, 0]}>
        <cylinderGeometry args={[trunkRadius * 0.85, trunkRadius * 1.18, trunkHeight, 10]} />
        <meshStandardMaterial color="#6f4524" roughness={0.9} metalness={0.02} flatShading={true} />
      </mesh>
      {Array.from({ length: canopyLayers }).map((_, index) => {
        const layerScale = 1 - index * 0.15;
        const layerHeight = trunkHeight + 0.42 + index * 0.48;
        return (
          <mesh key={`tree-canopy-${index}`} castShadow receiveShadow position={[0, layerHeight, 0]}>
            <coneGeometry args={[1.05 * layerScale, 1.18 * layerScale, 12]} />
            <meshStandardMaterial
              color={index === 0 ? "#1f7a37" : index === canopyLayers - 1 ? "#0f4f24" : "#166534"}
              roughness={0.86}
              metalness={0.03}
              flatShading={true}
            />
          </mesh>
        );
      })}
      {Array.from({ length: 6 }).map((_, index) => {
        const angle = (Math.PI * 2 * index) / 6;
        const rootX = Math.cos(angle) * (trunkRadius + 0.14);
        const rootZ = Math.sin(angle) * (trunkRadius + 0.14);
        return (
          <mesh key={`tree-root-${index}`} castShadow receiveShadow position={[rootX, 0.12, rootZ]} rotation={[0, -angle, mapSeeded(obstacleSeed, 130 + index, -0.24, 0.24)]}>
            <cylinderGeometry args={[0.04, 0.07, 0.3, 6]} />
            <meshStandardMaterial color="#5b3418" roughness={0.95} metalness={0.01} flatShading={true} />
          </mesh>
        );
      })}
      {Array.from({ length: 4 }).map((_, index) => {
        const leafAngle = (Math.PI * 2 * index) / 4 + mapSeeded(obstacleSeed, 140 + index, -0.4, 0.4);
        return (
          <mesh
            key={`tree-leaf-accent-${index}`}
            castShadow
            receiveShadow
            position={[Math.cos(leafAngle) * 0.5, trunkHeight + 0.85, Math.sin(leafAngle) * 0.5]}
            scale={[0.6, 0.45, 0.6]}
          >
            <sphereGeometry args={[0.34, 10, 10]} />
            <meshStandardMaterial color="#22a041" roughness={0.82} metalness={0.02} flatShading={true} />
          </mesh>
        );
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[0.95, 20]} />
        <meshStandardMaterial color="#4a2e18" roughness={0.94} metalness={0.02} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} receiveShadow>
        <ringGeometry args={[0.58, 0.93, 20]} />
        <meshStandardMaterial color="#356d2f" roughness={0.9} metalness={0.01} />
      </mesh>
      {entity.status === "PENDING" || entity.status === "UNDER_CONSTRUCTION" ? (
        <mesh castShadow receiveShadow position={[0, 0.42, 0]}>
          <boxGeometry args={[0.9, 0.04, 0.9]} />
          <meshStandardMaterial color="#f59e0b" emissive="#b45309" emissiveIntensity={0.25} roughness={0.35} metalness={0.08} />
        </mesh>
      ) : null}
    </group>
  );
};
