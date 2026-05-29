import type { Group, Mesh } from 'three';

export type WorkerAnimRefs = {
  torso: Group;
  leftArm: Group;
  rightArm: Group;
  leftLeg: Group;
  rightLeg: Group;
  tool: Mesh;
  head: Group | null;
};

const TORSO_BASE_Y = 0.6;
const LEG_BASE_Y = 0.34;

export type WalkPoseContext = {
  phase: number;
  weight: number;
  isReturning: boolean;
  speed: number;
  ambientTime: number;
};

export const applyWalkPose = (refs: WorkerAnimRefs, ctx: WalkPoseContext): void => {
  const { phase, weight, isReturning, speed, ambientTime } = ctx;
  const idle = 1 - weight;
  const sinP = Math.sin(phase);
  const sin2P = Math.sin(phase * 2);
  const absSinP = Math.abs(sinP);

  const idleBob = Math.sin(ambientTime * 2.4) * 0.022;
  const idleArmDrift = Math.sin(ambientTime * 2.1) * 0.09;
  const idleHeadDrift = Math.sin(ambientTime * 1.4) * 0.05;
  const idleHeadTilt = Math.sin(ambientTime * 1.7) * 0.04;

  const legSwingAmp = isReturning ? 0.55 : 0.7;
  const armSwingAmp = isReturning ? 0.32 : 0.55;
  const footLiftAmp = isReturning ? 0.05 : 0.09;
  const torsoLeanX = isReturning ? 0.22 : Math.min(0.05, speed * 0.012);
  const pelvisSwayAmp = 0.045;
  const torsoTwistAmp = 0.07;
  const torsoRollAmp = 0.06;
  const stepLiftAmp = isReturning ? 0.025 : 0.04;
  const returningCrouch = isReturning ? -0.04 : 0;

  refs.torso.position.x = sinP * pelvisSwayAmp * weight;
  refs.torso.position.y =
    TORSO_BASE_Y +
    idleBob * idle +
    (Math.abs(sin2P) * stepLiftAmp + returningCrouch) * weight;
  refs.torso.position.z = 0;
  refs.torso.rotation.x = torsoLeanX * weight;
  refs.torso.rotation.y = sinP * torsoTwistAmp * weight;
  refs.torso.rotation.z = -sinP * torsoRollAmp * weight;

  const leftLegSwing = Math.sin(phase);
  const rightLegSwing = Math.sin(phase + Math.PI);
  refs.leftLeg.rotation.x = leftLegSwing * legSwingAmp * weight;
  refs.rightLeg.rotation.x = rightLegSwing * legSwingAmp * weight;
  refs.leftLeg.position.y = LEG_BASE_Y + Math.max(0, leftLegSwing) * footLiftAmp * weight;
  refs.rightLeg.position.y = LEG_BASE_Y + Math.max(0, rightLegSwing) * footLiftAmp * weight;
  refs.leftLeg.rotation.z = -0.018 * weight;
  refs.rightLeg.rotation.z = 0.018 * weight;

  const leftArmSwing = Math.sin(phase + Math.PI);
  const rightArmSwing = Math.sin(phase);
  const carryLift = isReturning ? 0.55 * weight : 0;
  refs.leftArm.rotation.x = leftArmSwing * armSwingAmp * weight + idleArmDrift * idle + carryLift;
  refs.rightArm.rotation.x = rightArmSwing * armSwingAmp * weight - idleArmDrift * idle + carryLift;
  refs.leftArm.rotation.z = -0.1 * weight;
  refs.rightArm.rotation.z = 0.1 * weight;

  refs.tool.rotation.z = sinP * 0.18 * weight + 0.04 * idle;
  refs.tool.rotation.x = -absSinP * 0.1 * weight;
  refs.tool.rotation.y = 0;

  if (refs.head) {
    refs.head.rotation.x = -sin2P * 0.045 * weight + idleHeadDrift * idle * 0.5;
    refs.head.rotation.y = sinP * 0.06 * weight + idleHeadDrift * idle;
    refs.head.rotation.z = sinP * 0.025 * weight + idleHeadTilt * idle;
  }
};

export type WorkPoseContext = {
  time: number;
  weight: number;
};

export const applyWorkingPose = (
  refs: WorkerAnimRefs,
  ctx: WorkPoseContext,
  particles: ReadonlyArray<Mesh | null>,
): void => {
  const { time, weight } = ctx;
  const idle = 1 - weight;
  const hammerSwing = Math.sin(time * 7) * 0.9;

  refs.torso.position.x = 0;
  refs.torso.position.y =
    TORSO_BASE_Y - 0.02 * weight + Math.sin(time * 7) * 0.015 * weight + Math.sin(time * 2.5) * 0.02 * idle;
  refs.torso.position.z = 0;
  refs.torso.rotation.x = 0.18 * weight;
  refs.torso.rotation.y = 0;
  refs.torso.rotation.z = Math.sin(time * 7) * 0.04 * weight;

  refs.leftLeg.rotation.x = 0.1 * weight;
  refs.rightLeg.rotation.x = -0.1 * weight;
  refs.leftLeg.position.y = LEG_BASE_Y;
  refs.rightLeg.position.y = LEG_BASE_Y;
  refs.leftLeg.rotation.z = 0;
  refs.rightLeg.rotation.z = 0;

  refs.leftArm.rotation.x = 0.2 * weight;
  refs.rightArm.rotation.x = (-1.1 + hammerSwing) * weight;
  refs.leftArm.rotation.z = 0;
  refs.rightArm.rotation.z = 0;

  refs.tool.rotation.z = (-0.2 + Math.sin(time * 14) * 0.45) * weight;
  refs.tool.rotation.x = 0;
  refs.tool.rotation.y = 0;

  if (refs.head) {
    refs.head.rotation.x = 0.06 * weight;
    refs.head.rotation.y = 0;
    refs.head.rotation.z = 0;
  }

  particles.forEach((particle, index) => {
    if (!particle) {
      return;
    }
    if (weight < 0.4) {
      particle.visible = false;
      return;
    }
    const phase = time * 4 + index * 1.2;
    const lateral = Math.sin(phase) * 0.08;
    const forward = 0.22 + Math.abs(Math.cos(phase * 1.35)) * 0.15;
    particle.visible = true;
    particle.position.set(lateral, 0.14 + Math.abs(Math.sin(phase * 1.4)) * 0.32, forward);
    const scale = 0.04 + Math.abs(Math.sin(phase * 2)) * 0.03;
    particle.scale.setScalar(scale);
  });
};

export const hideWorkParticles = (particles: ReadonlyArray<Mesh | null>): void => {
  particles.forEach((particle) => {
    if (!particle) {
      return;
    }
    particle.visible = false;
  });
};

export const stepFractionTowards = (deltaSeconds: number, rate: number): number => {
  return 1 - Math.exp(-Math.max(0, deltaSeconds) * rate);
};
