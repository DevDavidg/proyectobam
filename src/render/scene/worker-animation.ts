import type { Group, Mesh, MeshStandardMaterial } from 'three';

export type WorkerAnimRefs = {
  body: Group;
  leftEye: Group;
  rightEye: Group;
  mouth: Mesh;
  hammer: Group;
};

const BODY_BASE_Y = 0.34;

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

  const idleBob = Math.sin(ambientTime * 2.6) * 0.02;
  const hop = absSinP * (isReturning ? 0.05 : 0.08) * weight;
  const squash = 1 - absSinP * 0.08 * weight;
  const stretch = 1 + absSinP * 0.06 * weight;

  refs.body.position.y = BODY_BASE_Y + idleBob * idle + hop;
  refs.body.position.x = sinP * 0.03 * weight;
  refs.body.scale.set(1 + (stretch - 1) * 0.5, squash, 1 + (stretch - 1) * 0.5);
  refs.body.rotation.z = sinP * 0.08 * weight;
  refs.body.rotation.x = Math.min(0.12, speed * 0.02) * weight;

  const eyeWobble = sin2P * 0.04 * weight;
  refs.leftEye.position.y = 0.1 + eyeWobble;
  refs.rightEye.position.y = 0.1 + eyeWobble;
  refs.leftEye.position.z = 0.22 + Math.max(0, sinP) * 0.02 * weight;
  refs.rightEye.position.z = 0.22 + Math.max(0, sinP) * 0.02 * weight;
  refs.leftEye.rotation.z = sinP * 0.06 * weight;
  refs.rightEye.rotation.z = -sinP * 0.06 * weight;

  refs.mouth.position.y = -0.05 + Math.sin(ambientTime * 3) * 0.01 * idle;
  refs.mouth.scale.y = 1 + absSinP * 0.2 * weight;

  refs.hammer.rotation.x = sinP * 0.25 * weight;
  refs.hammer.rotation.z = 0.35 + sinP * 0.15 * weight;
  refs.hammer.position.y = -0.04 + Math.max(0, -sinP) * 0.03 * weight;
};

export type WorkPoseContext = {
  time: number;
  weight: number;
  taskType?: 'BUILD' | 'CLEAR_OBSTACLE';
};

export const applyWorkingPose = (
  refs: WorkerAnimRefs,
  ctx: WorkPoseContext,
  particles: ReadonlyArray<Mesh | null>,
): void => {
  const { time, weight, taskType } = ctx;
  const idle = 1 - weight;
  const hammerPhase = time * 8;
  const hammerSwing = Math.sin(hammerPhase);
  const impact = Math.max(0, Math.cos(hammerPhase * 2));

  refs.body.position.y = BODY_BASE_Y - 0.03 * weight + Math.sin(time * 2.5) * 0.015 * idle;
  refs.body.position.x = 0;
  refs.body.scale.set(1 + impact * 0.04 * weight, 1 - impact * 0.06 * weight, 1);
  refs.body.rotation.x = 0.22 * weight;
  refs.body.rotation.z = Math.sin(time * 8) * 0.03 * weight;

  refs.leftEye.position.y = 0.1 + impact * 0.02 * weight;
  refs.rightEye.position.y = 0.1 + impact * 0.02 * weight;
  refs.leftEye.position.z = 0.24;
  refs.rightEye.position.z = 0.24;
  refs.leftEye.rotation.z = impact * 0.08 * weight;
  refs.rightEye.rotation.z = -impact * 0.08 * weight;

  refs.mouth.position.y = -0.04 - impact * 0.02 * weight;
  refs.mouth.scale.set(1 + impact * 0.15 * weight, 1 + impact * 0.35 * weight, 1);

  refs.hammer.position.set(0.18, 0.02, 0.16);
  refs.hammer.rotation.x = (-0.8 + hammerSwing * 1.1) * weight;
  refs.hammer.rotation.z = 0.5 * weight;

  const impactX = 0.08;
  const impactZ = 0.34;
  const particleColors =
    taskType === 'CLEAR_OBSTACLE'
      ? ['#a16207', '#78716c', '#84cc16']
      : ['#facc15', '#fbbf24', '#fde68a'];

  particles.forEach((particle, index) => {
    if (!particle) {
      return;
    }
    if (weight < 0.35 || impact < 0.25) {
      particle.visible = false;
      return;
    }
    const burst = impact * weight;
    const angle = (index / Math.max(1, particles.length)) * Math.PI * 2 + time * 2;
    const radius = 0.06 + burst * 0.12;
    particle.visible = true;
    particle.position.set(
      impactX + Math.cos(angle) * radius,
      0.08 + burst * 0.18 + index * 0.01,
      impactZ + Math.sin(angle) * radius * 0.7,
    );
    const scale = 0.03 + burst * 0.05;
    particle.scale.setScalar(scale);
    const material = particle.material as MeshStandardMaterial | undefined;
    if (material?.color) {
      material.color.set(particleColors[index % particleColors.length] ?? '#facc15');
    }
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
