import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Vector3 } from "three";
import { useGameStore } from "../../state/game-store";
import {
  CELL_SIZE,
  GRID_SIZE,
  gridPointToWorld,
} from "../../utils/coordinates";

const EFFECTS_STEP_SECONDS = 1 / 30;
const MAX_EFFECT_STEPS_PER_FRAME = 3;

export const CombatJuiceLayer = () => {
  const enemies = useGameStore((state) => state.enemies);
  const projectiles = useGameStore((state) => state.projectiles);
  const impacts = useGameStore((state) => state.impacts);
  const floatingTexts = useGameStore((state) => state.floatingTexts);
  const tickProjectiles = useGameStore((state) => state.tickProjectiles);
  const tickEffects = useGameStore((state) => state.tickEffects);
  const effectsAccumulatorRef = useRef(0);

  useFrame((_, delta) => {
    effectsAccumulatorRef.current += delta;
    let steps = 0;
    while (
      effectsAccumulatorRef.current >= EFFECTS_STEP_SECONDS &&
      steps < MAX_EFFECT_STEPS_PER_FRAME
    ) {
      tickProjectiles(EFFECTS_STEP_SECONDS);
      tickEffects(EFFECTS_STEP_SECONDS);
      effectsAccumulatorRef.current -= EFFECTS_STEP_SECONDS;
      steps += 1;
    }
    if (steps === MAX_EFFECT_STEPS_PER_FRAME) {
      effectsAccumulatorRef.current = 0;
    }
  });

  const reusableStart = useMemo(() => new Vector3(), []);
  const reusableEnd = useMemo(() => new Vector3(), []);
  const reusableCurrent = useMemo(() => new Vector3(), []);

  return (
    <>
      {projectiles.map((projectile) => {
        const targetEnemy = enemies.find(
          (enemy) => enemy.id === projectile.targetEnemyId,
        );
        const targetX = targetEnemy?.x ?? projectile.targetSnapshotX;
        const targetY = targetEnemy?.y ?? projectile.targetSnapshotY;

        const [startX, , startZ] = gridPointToWorld(
          projectile.originX,
          projectile.originY,
          GRID_SIZE,
          CELL_SIZE,
        );
        const [endX, , endZ] = gridPointToWorld(
          targetX,
          targetY,
          GRID_SIZE,
          CELL_SIZE,
        );

        reusableStart.set(startX, 1.5, startZ);
        reusableEnd.set(endX, 0.85, endZ);
        reusableCurrent.lerpVectors(
          reusableStart,
          reusableEnd,
          projectile.progress,
        );
        if (projectile.pathType === "arc") {
          const controlPoint = new Vector3(
            (reusableStart.x + reusableEnd.x) * 0.5,
            Math.max(reusableStart.y, reusableEnd.y) + 3.0,
            (reusableStart.z + reusableEnd.z) * 0.5,
          );
          const t = projectile.progress;
          const oneMinusT = 1 - t;
          reusableCurrent.set(
            oneMinusT * oneMinusT * reusableStart.x +
              2 * oneMinusT * t * controlPoint.x +
              t * t * reusableEnd.x,
            oneMinusT * oneMinusT * reusableStart.y +
              2 * oneMinusT * t * controlPoint.y +
              t * t * reusableEnd.y,
            oneMinusT * oneMinusT * reusableStart.z +
              2 * oneMinusT * t * controlPoint.z +
              t * t * reusableEnd.z,
          );
        }

        return (
          <mesh
            key={projectile.id}
            position={[reusableCurrent.x, reusableCurrent.y, reusableCurrent.z]}
          >
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial
              emissive={projectile.pathType === "arc" ? "#fb7185" : "#fde047"}
              emissiveIntensity={1.5}
              color={projectile.pathType === "arc" ? "#fecdd3" : "#fef08a"}
            />
          </mesh>
        );
      })}
      {impacts.map((impact) => {
        const [baseX, , baseZ] = gridPointToWorld(
          impact.x,
          impact.y,
          GRID_SIZE,
          CELL_SIZE,
        );
        const lifeRatio = impact.life / impact.maxLife;
        const spread = (1 - lifeRatio) * 0.75;
        return (
          <group key={impact.id}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[baseX, 0.03, baseZ]}
            >
              <ringGeometry args={[0.15, 0.8 * Math.max(0.2, lifeRatio), 24]} />
              <meshBasicMaterial
                color="#0f172a"
                transparent
                opacity={0.35 * lifeRatio}
              />
            </mesh>
            {[0, 1, 2, 3, 4].map((piece) => {
              const angle = (piece / 5) * Math.PI * 2;
              const offsetX = Math.cos(angle) * spread;
              const offsetZ = Math.sin(angle) * spread;
              const riseY = (1 - lifeRatio) * 0.8;
              const scale = Math.max(0.01, lifeRatio * 0.28);
              return (
                <mesh
                  key={`${impact.id}-${piece}`}
                  position={[baseX + offsetX, 0.35 + riseY, baseZ + offsetZ]}
                  scale={scale}
                >
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial
                    color="#f97316"
                    emissive="#b91c1c"
                    emissiveIntensity={0.35}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}
      {floatingTexts.map((floatingText) => {
        const [worldX, , worldZ] = gridPointToWorld(
          floatingText.x,
          floatingText.y,
          GRID_SIZE,
          CELL_SIZE,
        );
        const opacity = Math.max(0, floatingText.life / floatingText.maxLife);
        return (
          <Html
            key={floatingText.id}
            position={[worldX, 2 + (1 - opacity), worldZ]}
            center
          >
            <div
              className="pointer-events-none text-sm font-bold drop-shadow-md"
              style={{ color: floatingText.color, opacity }}
            >
              {floatingText.text}
            </div>
          </Html>
        );
      })}
    </>
  );
};
