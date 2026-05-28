import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { Group } from 'three';

const seenBuildingIds = new Set<string>();
let spawnAnimationPrimed = false;
let primeScheduled = false;

export const useSpawnScale = (buildingId?: string) => {
  const groupRef = useRef<Group | null>(null);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (!buildingId || !groupRef.current) {
      return;
    }

    if (!spawnAnimationPrimed) {
      seenBuildingIds.add(buildingId);
      groupRef.current.scale.setScalar(1);
      if (!primeScheduled) {
        primeScheduled = true;
        queueMicrotask(() => {
          spawnAnimationPrimed = true;
        });
      }
      return;
    }

    if (seenBuildingIds.has(buildingId)) {
      groupRef.current.scale.setScalar(1);
      animatingRef.current = false;
      return;
    }

    seenBuildingIds.add(buildingId);
    groupRef.current.scale.setScalar(0.05);
    animatingRef.current = true;
  }, [buildingId]);

  useFrame((_, delta) => {
    if (!animatingRef.current || !groupRef.current) {
      return;
    }

    const currentScale = groupRef.current.scale.x;
    const springFactor = Math.min(1, delta * 11);
    const overshootTarget = 1.07;
    const nextScale =
      currentScale < 0.98
        ? currentScale + (overshootTarget - currentScale) * springFactor
        : currentScale + (1 - currentScale) * Math.min(1, delta * 18);

    groupRef.current.scale.setScalar(nextScale);

    if (Math.abs(nextScale - 1) < 0.002) {
      groupRef.current.scale.setScalar(1);
      animatingRef.current = false;
    }
  });

  return groupRef;
};
