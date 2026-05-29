import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { Group } from 'three';
import { useGameStore } from '../../../../state/game-store';
import type { Worker } from '../../../../state/game-store/types';

type DoorAnimationDriverProps = {
  doorRef: React.RefObject<Group | null>;
  fullyOpenAngle?: number;
};

const DEFAULT_OPEN_ANGLE = -1.2;
const OPEN_DURATION_MS = 280;
const HOLD_DURATION_MS = 900;
const CLOSE_DURATION_MS = 360;
const TOTAL_DURATION_MS = OPEN_DURATION_MS + HOLD_DURATION_MS + CLOSE_DURATION_MS;

const computeTargetOpenness = (lastEventAtMs: number | null, nowMs: number): number => {
  if (lastEventAtMs === null) {
    return 0;
  }
  const elapsed = nowMs - lastEventAtMs;
  if (elapsed >= TOTAL_DURATION_MS) {
    return 0;
  }
  if (elapsed < OPEN_DURATION_MS) {
    const t = elapsed / OPEN_DURATION_MS;
    return t * t * (3 - 2 * t);
  }
  if (elapsed < OPEN_DURATION_MS + HOLD_DURATION_MS) {
    return 1;
  }
  const t = (elapsed - OPEN_DURATION_MS - HOLD_DURATION_MS) / CLOSE_DURATION_MS;
  const eased = t * t * (3 - 2 * t);
  return 1 - eased;
};

const isLeavingTransition = (previous: Worker['state'] | undefined, next: Worker['state']): boolean => {
  if (previous === undefined) {
    return false;
  }
  if (previous === 'IDLE' && next === 'MOVING_TO_TASK') {
    return true;
  }
  if (previous === 'RETURNING' && next === 'IDLE') {
    return true;
  }
  return false;
};

export const DoorAnimationDriver = ({ doorRef, fullyOpenAngle = DEFAULT_OPEN_ANGLE }: DoorAnimationDriverProps) => {
  const workers = useGameStore((state) => state.workers);
  const previousStatesRef = useRef<Map<string, Worker['state']>>(new Map());
  const lastEventAtRef = useRef<number | null>(null);
  const currentOpennessRef = useRef<number>(0);

  useEffect(() => {
    const previousStates = previousStatesRef.current;
    let triggeredNow = false;

    workers.forEach((worker) => {
      const previous = previousStates.get(worker.id);
      if (isLeavingTransition(previous, worker.state)) {
        triggeredNow = true;
      }
    });

    const nextStates = new Map<string, Worker['state']>();
    workers.forEach((worker) => {
      nextStates.set(worker.id, worker.state);
    });
    previousStatesRef.current = nextStates;

    if (triggeredNow) {
      lastEventAtRef.current = performance.now();
    }
  }, [workers]);

  useFrame((_, delta) => {
    const target = doorRef.current;
    if (!target) {
      return;
    }
    const nowMs = performance.now();
    const targetOpenness = computeTargetOpenness(lastEventAtRef.current, nowMs);
    const current = currentOpennessRef.current;
    const lerpFactor = Math.min(1, delta * 12);
    const next = current + (targetOpenness - current) * lerpFactor;
    currentOpennessRef.current = next;
    target.rotation.y = next * fullyOpenAngle;
  });

  return null;
};
