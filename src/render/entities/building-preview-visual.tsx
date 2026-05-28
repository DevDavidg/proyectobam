import type { BuildingType } from "../../core/types/building";
import { BuildingVisual } from "./BuildingVisual";
import { ModularPenMesh } from "./modular-pen-mesh";

type PreviewableBuildingType = Exclude<BuildingType, "PREVIEW">;

type BuildingPreviewVisualProps = {
  type: PreviewableBuildingType;
  level: number;
  sizeX: number;
  sizeY: number;
  cellSize?: number;
};

export const BuildingPreviewVisual = ({
  type,
  level,
  sizeX,
  sizeY,
  cellSize = 1,
}: BuildingPreviewVisualProps) => {
  const safeLevel = Math.max(1, level);
  const footprintX = sizeX * cellSize;
  const footprintZ = sizeY * cellSize;
  const maxFootprint = Math.max(sizeX, sizeY) * cellSize;

  if (type === "TOWN_HALL") {
    const cappedLevel = Math.min(20, Math.max(1, Math.floor(safeLevel)));
    const normalizedLevel = (cappedLevel - 1) / 19;
    const coreRadius = footprintX * (0.2 + normalizedLevel * 0.14);
    const shellHeight = 1.35 + normalizedLevel * 1.9;
    const pipeCount = 4 + Math.floor(normalizedLevel * 12);
    const panelCount = 8 + Math.floor(normalizedLevel * 18);
    const ringCount = 1 + Math.floor((cappedLevel - 1) / 2);
    const windowCount = 2 + Math.floor((cappedLevel - 1) / 3);
    const hasEnergyRing = cappedLevel >= 3;
    const hasSidePods = cappedLevel >= 6;
    const hasTopArray = cappedLevel >= 9;
    const hasDish = cappedLevel >= 12;
    const hasCrownSpikes = cappedLevel >= 16;
    const podPairs = Math.max(0, Math.floor((cappedLevel - 6) / 4) + 1);
    const beaconPulse = 0.9 + normalizedLevel * 0.4;
    const sidePipeRadius = Math.max(
      0.75,
      coreRadius + 0.3 + normalizedLevel * 0.5,
    );

    return (
      <group>
        <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
          <cylinderGeometry
            args={[coreRadius + 0.12, coreRadius + 0.18, 0.1, 20]}
          />
          <meshStandardMaterial
            color="#7a4f33"
            roughness={0.84}
            metalness={0.04}
            flatShading={true}
          />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
          <cylinderGeometry
            args={[coreRadius + 0.16, coreRadius + 0.24, 0.16, 24]}
          />
          <meshStandardMaterial
            color="#a7784f"
            roughness={0.74}
            metalness={0.07}
            flatShading={true}
          />
        </mesh>
        {Array.from({ length: 8 }).map((_, index) => {
          const angle = (Math.PI * 2 * index) / 8;
          const legX = Math.cos(angle) * (coreRadius + 0.28);
          const legZ = Math.sin(angle) * (coreRadius + 0.28);
          return (
            <group
              key={`preview-townhall-leg-${index}`}
              position={[legX, 0.1, legZ]}
              rotation={[0, -angle, 0]}
            >
              <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.032, 0.06, 0.2, 8]} />
                <meshStandardMaterial
                  color="#8a5a2f"
                  roughness={0.84}
                  metalness={0.04}
                  flatShading={true}
                />
              </mesh>
              <mesh castShadow receiveShadow position={[0, 0.01, 0]}>
                <sphereGeometry args={[0.055, 10, 10]} />
                <meshStandardMaterial
                  color="#d59e41"
                  roughness={0.46}
                  metalness={0.42}
                  flatShading={true}
                />
              </mesh>
            </group>
          );
        })}
        <mesh
          castShadow
          receiveShadow
          position={[0, 0.95 + normalizedLevel * 0.8, 0]}
        >
          <cylinderGeometry
            args={[coreRadius, coreRadius + 0.12, shellHeight, 30]}
          />
          <meshStandardMaterial
            color="#5d4f48"
            roughness={0.6}
            metalness={0.28}
            flatShading={true}
          />
        </mesh>
        {Array.from({ length: panelCount }).map((_, index) => {
          const angle = (Math.PI * 2 * index) / panelCount;
          const panelX = Math.cos(angle) * (coreRadius + 0.06);
          const panelZ = Math.sin(angle) * (coreRadius + 0.06);
          return (
            <mesh
              key={`preview-townhall-panel-${index}`}
              castShadow
              receiveShadow
              position={[panelX, 0.9 + normalizedLevel * 0.7, panelZ]}
              rotation={[0, -angle, 0]}
            >
              <boxGeometry args={[0.08, shellHeight - 0.42, 0.14]} />
              <meshStandardMaterial
                color="#9f8f83"
                roughness={0.74}
                metalness={0.1}
                flatShading={true}
              />
            </mesh>
          );
        })}
        {Array.from({ length: ringCount }).map((_, bandIndex) => (
          <mesh
            key={`preview-townhall-band-${bandIndex}`}
            castShadow
            receiveShadow
            position={[0, 0.66 + bandIndex * 0.22, 0]}
          >
            <torusGeometry args={[coreRadius + 0.13, 0.045, 8, 24]} />
            <meshStandardMaterial
              color="#d79f43"
              roughness={0.5}
              metalness={0.36}
              flatShading={true}
            />
          </mesh>
        ))}
        {Array.from({ length: windowCount }).map((_, index) => {
          const angle = (Math.PI * 2 * index) / windowCount + Math.PI / 8;
          const windowX = Math.cos(angle) * (coreRadius + 0.02);
          const windowZ = Math.sin(angle) * (coreRadius + 0.02);
          return (
            <mesh
              key={`preview-townhall-window-${index}`}
              castShadow
              receiveShadow
              position={[windowX, 1.45 + normalizedLevel * 1.15, windowZ]}
            >
              <sphereGeometry args={[0.12 + normalizedLevel * 0.11, 16, 12]} />
              <meshStandardMaterial
                color="#88caef"
                emissive="#2a4f7b"
                emissiveIntensity={0.62 + normalizedLevel * 0.9}
                roughness={0.26}
                metalness={0.2}
                flatShading={true}
              />
            </mesh>
          );
        })}
        <mesh
          castShadow
          receiveShadow
          position={[0, 1.7 + normalizedLevel * 1.65, 0]}
        >
          <sphereGeometry
            args={[
              coreRadius * 0.78,
              24,
              14,
              0,
              Math.PI * 2,
              0,
              Math.PI * 0.62,
            ]}
          />
          <meshStandardMaterial
            color="#6b5550"
            roughness={0.52}
            metalness={0.26}
            flatShading={true}
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[0, 1.95 + normalizedLevel * 1.88, 0]}
        >
          <sphereGeometry
            args={[
              coreRadius * 0.58,
              22,
              14,
              0,
              Math.PI * 2,
              0,
              Math.PI * 0.56,
            ]}
          />
          <meshStandardMaterial
            color="#9fa5b2"
            roughness={0.36}
            metalness={0.52}
            flatShading={true}
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[0, 2.05 + normalizedLevel * 1.98, 0]}
        >
          <cylinderGeometry
            args={[0.085, 0.1, 0.38 + normalizedLevel * 0.48, 10]}
          />
          <meshStandardMaterial
            color="#798394"
            roughness={0.38}
            metalness={0.54}
            flatShading={true}
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[0, 2.28 + normalizedLevel * 2.25, 0]}
        >
          <sphereGeometry args={[0.11 + normalizedLevel * 0.22, 12, 12]} />
          <meshStandardMaterial
            color="#8dd6ff"
            emissive="#2c6ca4"
            emissiveIntensity={0.7 * beaconPulse}
            roughness={0.18}
            metalness={0.14}
            flatShading={true}
          />
        </mesh>
        {Array.from({ length: pipeCount }).map((_, index) => {
          const angle = (Math.PI * 2 * index) / pipeCount;
          const pipeX = Math.cos(angle) * sidePipeRadius;
          const pipeZ = Math.sin(angle) * sidePipeRadius;
          return (
            <group
              key={`preview-townhall-pipe-${index}`}
              position={[pipeX, 0.42, pipeZ]}
              rotation={[0, -angle + Math.PI / 2, 0]}
            >
              <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
                <cylinderGeometry
                  args={[0.07, 0.07, 0.36 + normalizedLevel * 0.6, 8]}
                />
                <meshStandardMaterial
                  color="#cb2f23"
                  roughness={0.58}
                  metalness={0.28}
                  flatShading={true}
                />
              </mesh>
              <mesh
                castShadow
                receiveShadow
                position={[0.16, 0.32 + normalizedLevel * 0.3, 0]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <torusGeometry args={[0.16, 0.045, 8, 14, Math.PI * 0.62]} />
                <meshStandardMaterial
                  color="#d7412f"
                  roughness={0.54}
                  metalness={0.3}
                  flatShading={true}
                />
              </mesh>
            </group>
          );
        })}
        {hasEnergyRing ? (
          <mesh
            castShadow
            receiveShadow
            position={[0, 1.28 + normalizedLevel * 1.5, 0]}
          >
            <torusGeometry
              args={[coreRadius + 0.25 + normalizedLevel * 0.1, 0.05, 10, 40]}
            />
            <meshStandardMaterial
              color="#6bb7ff"
              emissive="#1e4f93"
              emissiveIntensity={0.42 + normalizedLevel * 1.05}
              roughness={0.34}
              metalness={0.3}
              flatShading={true}
            />
          </mesh>
        ) : null}
        {hasSidePods
          ? Array.from({ length: podPairs }).map((_, podIndex) => {
              const yOffset = 1.1 + podIndex * 0.34;
              const zOffset = podIndex % 2 === 0 ? 0 : 0.26;
              return (
                <group key={`preview-townhall-pod-pair-${podIndex}`}>
                  <mesh
                    castShadow
                    receiveShadow
                    position={[coreRadius + 0.45, yOffset, zOffset]}
                  >
                    <sphereGeometry
                      args={[0.18 + normalizedLevel * 0.14, 12, 12]}
                    />
                    <meshStandardMaterial
                      color="#8ba0bf"
                      roughness={0.4}
                      metalness={0.34}
                      flatShading={true}
                    />
                  </mesh>
                  <mesh
                    castShadow
                    receiveShadow
                    position={[-(coreRadius + 0.45), yOffset, -zOffset]}
                  >
                    <sphereGeometry
                      args={[0.18 + normalizedLevel * 0.14, 12, 12]}
                    />
                    <meshStandardMaterial
                      color="#8ba0bf"
                      roughness={0.4}
                      metalness={0.34}
                      flatShading={true}
                    />
                  </mesh>
                </group>
              );
            })
          : null}
        {hasTopArray ? (
          <group position={[0, 2.5 + normalizedLevel * 2.0, 0]}>
            <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 8]}>
              <boxGeometry args={[0.7 + normalizedLevel * 0.8, 0.05, 0.11]} />
              <meshStandardMaterial
                color="#a7adba"
                roughness={0.38}
                metalness={0.56}
                flatShading={true}
              />
            </mesh>
            <mesh
              castShadow
              receiveShadow
              rotation={[0, Math.PI / 2, Math.PI / 8]}
            >
              <boxGeometry args={[0.7 + normalizedLevel * 0.8, 0.05, 0.11]} />
              <meshStandardMaterial
                color="#a7adba"
                roughness={0.38}
                metalness={0.56}
                flatShading={true}
              />
            </mesh>
          </group>
        ) : null}
        {hasDish ? (
          <group
            position={[
              0.52 + normalizedLevel * 0.3,
              2.72 + normalizedLevel * 2.1,
              0.22,
            ]}
            rotation={[0.2, -0.3, 0]}
          >
            <mesh castShadow receiveShadow>
              <coneGeometry
                args={[
                  0.28 + normalizedLevel * 0.28,
                  0.18 + normalizedLevel * 0.12,
                  18,
                  1,
                  true,
                ]}
              />
              <meshStandardMaterial
                color="#d5dae3"
                roughness={0.34}
                metalness={0.58}
                flatShading={true}
              />
            </mesh>
            <mesh castShadow receiveShadow position={[0, -0.16, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
              <meshStandardMaterial
                color="#7b8698"
                roughness={0.42}
                metalness={0.46}
                flatShading={true}
              />
            </mesh>
          </group>
        ) : null}
        {hasCrownSpikes ? (
          <group position={[0, 2.7 + normalizedLevel * 2.0, 0]}>
            {Array.from({ length: 6 + Math.floor(normalizedLevel * 8) }).map(
              (_, spikeIndex, spikes) => {
                const angle = (Math.PI * 2 * spikeIndex) / spikes.length;
                const spikeX =
                  Math.cos(angle) * (0.45 + normalizedLevel * 0.45);
                const spikeZ =
                  Math.sin(angle) * (0.45 + normalizedLevel * 0.45);
                return (
                  <mesh
                    key={`preview-townhall-crown-spike-${spikeIndex}`}
                    castShadow
                    receiveShadow
                    position={[spikeX, 0, spikeZ]}
                    rotation={[0, -angle, 0]}
                  >
                    <coneGeometry
                      args={[
                        0.06 + normalizedLevel * 0.05,
                        0.24 + normalizedLevel * 0.25,
                        6,
                      ]}
                    />
                    <meshStandardMaterial
                      color="#d6a34f"
                      roughness={0.38}
                      metalness={0.58}
                      flatShading={true}
                    />
                  </mesh>
                );
              },
            )}
          </group>
        ) : null}
      </group>
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
