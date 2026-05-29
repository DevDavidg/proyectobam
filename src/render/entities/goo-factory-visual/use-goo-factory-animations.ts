import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import type { Group } from 'three';
import type { GooFactoryDimensions, PumpSlot } from './geometry';
import type { GooFactoryState } from './types';

type AnimationRefs = {
  wheelRef: RefObject<Group | null>;
  pistonRefs: RefObject<Group | null>[];
  gooSurfaceRef: RefObject<Group | null>;
  overflowRef: RefObject<Group | null>;
  suctionPulseRef: RefObject<Group | null>;
  groundPuddleRef: RefObject<Group | null>;
  flowParticleRef: RefObject<Group | null>;
  gaugeNeedleRef: RefObject<Group | null>;
};

type AnimationParams = {
  dim: GooFactoryDimensions;
  visualState: GooFactoryState;
  fillRatio: number;
  pumps: PumpSlot[];
  hasGauge: boolean;
};

const computeFlowParticlePosition = (t: number, dim: GooFactoryDimensions) => {
  if (t < 0.4) {
    const lt = t / 0.4;
    return {
      x: dim.pipeGroundEndX - lt * (dim.pipeGroundEndX - dim.pipeCornerX),
      y: dim.pipeBottomY,
    };
  }
  if (t < 0.85) {
    const lt = (t - 0.4) / 0.45;
    return {
      x: dim.pipeCornerX,
      y: dim.pipeBottomY + lt * (dim.pipeOutletY - dim.pipeBottomY),
    };
  }
  const lt = (t - 0.85) / 0.15;
  return {
    x: dim.pipeCornerX - lt * (dim.pipeCornerX - dim.pipeOutletX),
    y: dim.pipeOutletY,
  };
};

export const useGooFactoryAnimations = (
  refs: AnimationRefs,
  params: AnimationParams,
): void => {
  const { dim, visualState, fillRatio, pumps, hasGauge } = params;

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const isFull = fillRatio >= 0.99;
    const isActive = visualState === 'in-action' && !isFull;
    let wheelSpeed = 0.55;
    if (isActive) wheelSpeed = 3.4;
    if (isFull) wheelSpeed = 0;
    const wobble = visualState === 'damaged' ? Math.sin(elapsed * 6.2) * 0.04 : 0;

    if (refs.wheelRef.current) {
      refs.wheelRef.current.rotation.x += delta * wheelSpeed;
      refs.wheelRef.current.rotation.z = wobble * 0.4;
    }

    refs.pistonRefs.forEach((pistonRef, index) => {
      const piston = pistonRef.current;
      if (!piston) return;
      if (isFull) {
        piston.position.y = dim.pistonRestY;
      } else {
        const wheelAngle = refs.wheelRef.current?.rotation.x ?? 0;
        const phase = wheelAngle + Math.PI / 2 + (pumps[index]?.phaseOffset ?? 0);
        const stroke = dim.pistonStroke;
        const offset = (Math.sin(phase) + 1) * 0.5 * stroke;
        piston.position.y = dim.pistonRestY + offset;
      }
      piston.rotation.z = wobble * 0.4;
    });

    if (refs.gooSurfaceRef.current) {
      let ripple = Math.sin(elapsed * 1.8) * 0.005;
      if (isActive) ripple = Math.sin(elapsed * 5.2) * 0.012;
      if (isFull) ripple = Math.sin(elapsed * 1.4) * 0.006;
      const targetY = dim.tankBottom + 0.06 + fillRatio * (dim.tankHeight - 0.16);
      refs.gooSurfaceRef.current.position.y = targetY + ripple;
      let breatheAmp = 0.012;
      if (isActive) breatheAmp = 0.025;
      if (isFull) breatheAmp = 0.018;
      const breathe = 1 + Math.sin(elapsed * 3.2) * breatheAmp;
      refs.gooSurfaceRef.current.scale.set(breathe, 1, breathe);
    }

    if (refs.overflowRef.current) {
      const overflowAmount = Math.max(0, fillRatio - 0.78) / 0.22;
      const baseScale = 0.0001 + overflowAmount;
      const swell = isFull ? 1 + Math.sin(elapsed * 3.4) * 0.06 : 1;
      refs.overflowRef.current.scale.setScalar(baseScale * swell);
      const dripSpeed = isFull ? 3.2 : 4.8;
      const drip = Math.sin(elapsed * dripSpeed) * 0.02 * overflowAmount;
      refs.overflowRef.current.position.y = -0.03 + drip;
    }

    if (refs.suctionPulseRef.current) {
      let pulse = 1 + Math.sin(elapsed * 2) * 0.05;
      if (isActive) pulse = 1 + Math.sin(elapsed * 6.5) * 0.18;
      if (isFull) pulse = 1;
      refs.suctionPulseRef.current.scale.set(pulse, 1, pulse);
    }

    if (refs.groundPuddleRef.current) {
      const wobblePuddle = 1 + Math.sin(elapsed * 2.4) * 0.05;
      refs.groundPuddleRef.current.scale.set(wobblePuddle, 1, wobblePuddle);
    }

    if (refs.flowParticleRef.current) {
      const cycle = 1.6;
      const t = isActive ? (elapsed % cycle) / cycle : 0;
      const { x, y } = computeFlowParticlePosition(t, dim);
      refs.flowParticleRef.current.position.set(x, y, 0);
      refs.flowParticleRef.current.visible = isActive && !isFull && t > 0.02 && t < 0.98;
      const pulse = 0.7 + Math.sin(t * Math.PI) * 0.4;
      refs.flowParticleRef.current.scale.setScalar(pulse);
    }

    if (hasGauge && refs.gaugeNeedleRef.current) {
      const minAngle = -Math.PI * 0.75;
      const maxAngle = Math.PI * 0.75;
      const jitter = isActive ? Math.sin(elapsed * 7.3) * 0.04 : 0;
      const target = minAngle + (maxAngle - minAngle) * fillRatio + jitter;
      const current = refs.gaugeNeedleRef.current.rotation.x;
      const blend = Math.min(1, delta * 6);
      refs.gaugeNeedleRef.current.rotation.x = current + (target - current) * blend;
    }
  });
};
