import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group, Mesh } from 'three';
import { LowPolyParticles } from '../../fx/low-poly-particles';
import { computeDimensions, DEBRIS_TWIGS, OVERFLOW_TWIG_PILES } from './geometry';
import { clamp01, easeInOut, lerp, resolveState, stagedProgress } from './helpers';
import { AnvilBlock } from './parts/anvil-block';
import { CrateLid } from './parts/crate-lid';
import { CrateWalls } from './parts/crate-walls';
import { DamagedOverlay, DestroyedOverlay } from './parts/damage-overlays';
import { GroundDecor } from './parts/ground-decor';
import { HammerLever } from './parts/hammer-lever';
import { OverflowTwigs } from './parts/overflow-twigs';
import { PivotPost } from './parts/pivot-post';
import { PlankPlatform } from './parts/plank-platform';
import { SideCrank } from './parts/side-crank';
import { SpikedRollers } from './parts/spiked-rollers';
import { TwigDebris } from './parts/twig-debris';
import { UpgradeExtras } from './parts/upgrade-extras';
import { WoodenFrame } from './parts/wooden-frame';
import { WoodenGears } from './parts/wooden-gears';
import type { TwigSnapperVisualProps } from './types';

const STRIKE_FREQUENCY_ACTIVE = 1;
const STRIKE_FREQUENCY_IDLE = 0.32;
const REST_ANGLE = -0.2;
const IDLE_ANGLE_AMPLITUDE = 0.05;
const DEBRIS_LIFETIME = 0.55;
const DEBRIS_GRAVITY = -1.6;
const IMPACT_THRESHOLD = 0.08;
const GEAR_SPIN_ACTIVE = 1.8;
const GEAR_SPIN_IDLE = 0.32;
const ROLLER_SPIN_ACTIVE = 2.4;
const ROLLER_SPIN_IDLE = 0.45;

const computeImpactAngle = (
  pivotY: number,
  anvilTop: number,
  headLocalX: number,
  headLocalY: number,
): number => {
  const targetDeltaY = anvilTop - pivotY - headLocalY;
  const ratio = clamp01(Math.abs(targetDeltaY / headLocalX));
  return Math.max(0, Math.min(0.45, Math.asin(ratio)));
};

const computeWobble = (isActive: boolean, isDamaged: boolean, elapsed: number): number => {
  if (!isDamaged) return 0;
  const wobbleFrequency = isActive ? 6.5 : 4.8;
  const wobbleAmplitude = isActive ? 0.02 : 0.03;
  return Math.sin(elapsed * wobbleFrequency) * wobbleAmplitude;
};

const computeHammerAngle = (
  cosWave: number,
  phase: number,
  isActive: boolean,
  isDamaged: boolean,
  elapsed: number,
  impactAngle: number,
): number => {
  const wobble = computeWobble(isActive, isDamaged, elapsed);
  if (isActive) {
    const biased = Math.pow(cosWave, 0.85);
    return impactAngle + (REST_ANGLE - impactAngle) * biased + wobble;
  }
  const idleAngle = REST_ANGLE + Math.sin(phase) * IDLE_ANGLE_AMPLITUDE;
  return idleAngle + wobble;
};

const updateDebrisMesh = (mesh: Mesh, age: number, config: typeof DEBRIS_TWIGS[number]): void => {
  const ageNorm = age / DEBRIS_LIFETIME;
  mesh.visible = true;
  mesh.position.x = config.offsetX + config.velocityX * age;
  mesh.position.y = config.velocityY * age + 0.5 * DEBRIS_GRAVITY * age * age;
  mesh.position.z = config.offsetZ + config.velocityZ * age;
  mesh.rotation.x = config.spinAxisX * config.spinSpeed * age;
  mesh.rotation.y = config.spinAxisY * config.spinSpeed * age;
  mesh.rotation.z = Math.PI / 2 + config.spinAxisZ * config.spinSpeed * age;
  const fade = ageNorm < 0.12 ? ageNorm / 0.12 : 1 - (ageNorm - 0.12) / 0.88;
  mesh.scale.setScalar(Math.max(0.0001, fade));
};

const computeL2Stages = (level: number, isUpgrading: boolean, rawProgress: number) => {
  if (level < 2) {
    return { postScale: 0, beamScale: 0, railScale: 0, gearScale: 0, crankExtension: 0 };
  }
  if (!isUpgrading) {
    return { postScale: 1, beamScale: 1, railScale: 1, gearScale: 1, crankExtension: 1 };
  }
  const progress = clamp01(rawProgress);
  return {
    postScale: easeInOut(stagedProgress(progress, 0, 0.4)),
    beamScale: easeInOut(stagedProgress(progress, 0.3, 0.6)),
    railScale: easeInOut(stagedProgress(progress, 0.3, 0.6)),
    gearScale: easeInOut(stagedProgress(progress, 0.5, 0.8)),
    crankExtension: easeInOut(stagedProgress(progress, 0.7, 1)),
  };
};

const computeL3Stages = (level: number, isUpgrading: boolean, rawProgress: number) => {
  if (level < 3) {
    return { wallScale: 0, lidProgress: 0, rollerScale: 0 };
  }
  if (!isUpgrading) {
    return { wallScale: 1, lidProgress: 1, rollerScale: 1 };
  }
  const progress = clamp01(rawProgress);
  return {
    wallScale: easeInOut(stagedProgress(progress, 0, 0.45)),
    rollerScale: easeInOut(stagedProgress(progress, 0.35, 0.75)),
    lidProgress: easeInOut(stagedProgress(progress, 0.65, 1)),
  };
};

export const TwigSnapperVisual = ({
  level,
  footprintX,
  footprintZ,
  status,
  hp,
  maxHp,
  constructionProgress,
  storageFillRatio = 0,
  createMaterial,
}: TwigSnapperVisualProps) => {
  const hammerRef = useRef<Group | null>(null);
  const debrisRef = useRef<Group | null>(null);
  const bigGearRef = useRef<Group | null>(null);
  const smallGearRef = useRef<Group | null>(null);
  const crankRef = useRef<Group | null>(null);
  const overflowRef = useRef<Group | null>(null);
  const rollerFrontRef = useRef<Group | null>(null);
  const rollerBackRef = useRef<Group | null>(null);
  const lastTRef = useRef(1);
  const impactElapsedRef = useRef(-10);

  const visualState = resolveState(status, hp, maxHp);
  const isActive = visualState === 'in-action';
  const isDamaged = visualState === 'damaged';
  const isUpgrading = status === 'PENDING' || status === 'UNDER_CONSTRUCTION';
  const fillRatio = clamp01(storageFillRatio);

  const dim = useMemo(
    () => computeDimensions(level, footprintX, footprintZ),
    [level, footprintX, footprintZ],
  );

  const previousDim = useMemo(
    () => (level > 1 ? computeDimensions(level - 1, footprintX, footprintZ) : dim),
    [level, footprintX, footprintZ, dim],
  );

  const l2Stages = computeL2Stages(level, isUpgrading, constructionProgress ?? 0);
  const l3Stages = computeL3Stages(level, isUpgrading, constructionProgress ?? 0);
  const hasL2 = level >= 2;
  const hasL3 = level >= 3;

  const morphProgress = isUpgrading && level >= 2 ? easeInOut(clamp01(constructionProgress ?? 0)) : 1;
  const morphedDim = useMemo(() => {
    if (morphProgress >= 1) return dim;
    return {
      ...dim,
      postHeight: lerp(previousDim.postHeight, dim.postHeight, morphProgress),
      postTopY: lerp(previousDim.postTopY, dim.postTopY, morphProgress),
      hammerPivotY: lerp(previousDim.hammerPivotY, dim.hammerPivotY, morphProgress),
    };
  }, [dim, previousDim, morphProgress]);

  const headLocalY = -dim.hammerArmHeight / 2 - dim.hammerHeadHeight + 0.04;
  const impactAngle = useMemo(
    () => computeImpactAngle(morphedDim.hammerPivotY, morphedDim.anvilTop, dim.hammerHeadX, headLocalY),
    [morphedDim.hammerPivotY, morphedDim.anvilTop, dim.hammerHeadX, headLocalY],
  );

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const frequency = isActive ? STRIKE_FREQUENCY_ACTIVE : STRIKE_FREQUENCY_IDLE;
    const phase = elapsed * frequency * Math.PI * 2;
    const cosWave = (Math.cos(phase) + 1) * 0.5;

    if (hammerRef.current) {
      hammerRef.current.rotation.z = computeHammerAngle(cosWave, phase, isActive, isDamaged, elapsed, impactAngle);
      hammerRef.current.rotation.y = isActive && isDamaged ? Math.sin(elapsed * 4.1) * 0.02 : 0;
    }

    if (isActive && lastTRef.current > IMPACT_THRESHOLD && cosWave <= IMPACT_THRESHOLD) {
      impactElapsedRef.current = elapsed;
    }
    lastTRef.current = cosWave;

    if (hasL2) {
      const gearSpeed = isActive ? GEAR_SPIN_ACTIVE : GEAR_SPIN_IDLE;
      const bigRotation = elapsed * gearSpeed;
      const smallRotationRatio = dim.bigGearRadius / Math.max(0.0001, dim.smallGearRadius);
      if (bigGearRef.current) {
        bigGearRef.current.rotation.x = bigRotation;
      }
      if (smallGearRef.current) {
        smallGearRef.current.rotation.x = -bigRotation * smallRotationRatio;
      }
      if (crankRef.current) {
        crankRef.current.rotation.x = bigRotation;
      }
    }

    if (hasL3) {
      const rollerSpeed = isActive ? ROLLER_SPIN_ACTIVE : ROLLER_SPIN_IDLE;
      const rollerRotation = elapsed * rollerSpeed;
      if (rollerFrontRef.current) {
        rollerFrontRef.current.rotation.x = rollerRotation;
      }
      if (rollerBackRef.current) {
        rollerBackRef.current.rotation.x = -rollerRotation;
      }
    }

    if (overflowRef.current) {
      overflowRef.current.children.forEach((child, index) => {
        const config = OVERFLOW_TWIG_PILES[index];
        const mesh = child as Mesh;
        if (!config) {
          mesh.visible = false;
          return;
        }
        const intensity = clamp01((fillRatio - config.threshold) / Math.max(0.001, 1 - config.threshold));
        if (intensity <= 0.01) {
          mesh.visible = false;
          return;
        }
        mesh.visible = true;
        const bob = isActive ? Math.sin(elapsed * 1.4 + config.bobPhase) * 0.008 : 0;
        mesh.position.y = config.y + bob;
        mesh.scale.setScalar(intensity);
      });
    }

    const sinceImpact = elapsed - impactElapsedRef.current;

    if (debrisRef.current) {
      const burstActive = isActive && sinceImpact >= 0 && sinceImpact < DEBRIS_LIFETIME;
      debrisRef.current.children.forEach((child, index) => {
        const config = DEBRIS_TWIGS[index];
        const mesh = child as Mesh;
        if (!config || !burstActive) {
          mesh.visible = false;
          return;
        }
        const age = sinceImpact + config.phaseOffset;
        if (age < 0 || age > DEBRIS_LIFETIME) {
          mesh.visible = false;
          return;
        }
        updateDebrisMesh(mesh, age, config);
      });
    }
  });

  if (visualState === 'destroyed') {
    return <DestroyedOverlay dim={dim} createMaterial={createMaterial} />;
  }

  const interiorScale = hasL3
    ? Math.max(0.0001, 1 - clamp01(l3Stages.wallScale * 1.1))
    : 1;
  const interiorVisible = interiorScale > 0.02;

  return (
    <group>
      <GroundDecor dim={dim} createMaterial={createMaterial} />

      <PlankPlatform dim={dim} createMaterial={createMaterial} />

      <group scale={[1, interiorScale, 1]} visible={interiorVisible}>
        <AnvilBlock dim={dim} createMaterial={createMaterial} />
        <PivotPost dim={morphedDim} createMaterial={createMaterial} />
        <HammerLever
          dim={morphedDim}
          level={level}
          createMaterial={createMaterial}
          hammerRef={hammerRef}
        />
      </group>

      {hasL2 ? (
        <WoodenFrame
          dim={dim}
          postScale={l2Stages.postScale}
          beamScale={l2Stages.beamScale}
          railScale={l2Stages.railScale * (hasL3 ? 1 - l3Stages.wallScale : 1)}
          createMaterial={createMaterial}
        />
      ) : null}

      {hasL2 ? (
        <WoodenGears
          dim={dim}
          scale={l2Stages.gearScale * (hasL3 ? 1 - l3Stages.wallScale : 1)}
          createMaterial={createMaterial}
          bigGearRef={bigGearRef}
          smallGearRef={smallGearRef}
        />
      ) : null}

      {hasL2 ? (
        <SideCrank
          dim={dim}
          extension={l2Stages.crankExtension}
          createMaterial={createMaterial}
          crankRef={crankRef}
        />
      ) : null}

      {hasL3 ? (
        <CrateWalls dim={dim} scale={l3Stages.wallScale} createMaterial={createMaterial} />
      ) : null}

      {hasL3 ? (
        <SpikedRollers
          dim={dim}
          scale={l3Stages.rollerScale}
          createMaterial={createMaterial}
          rollerFrontRef={rollerFrontRef}
          rollerBackRef={rollerBackRef}
        />
      ) : null}

      {hasL3 ? (
        <CrateLid dim={dim} openProgress={l3Stages.lidProgress} createMaterial={createMaterial} />
      ) : null}

      <UpgradeExtras dim={dim} level={level} createMaterial={createMaterial} />
      {!hasL3 ? <TwigDebris dim={dim} createMaterial={createMaterial} debrisRef={debrisRef} /> : null}
      <OverflowTwigs createMaterial={createMaterial} groupRef={overflowRef} />

      <LowPolyParticles
        enabled={isActive}
        count={isActive ? 10 : 0}
        shape="tetrahedron"
        color="#caa06a"
        emissive="#8a5c30"
        emissiveIntensity={0.28}
        size={0.04}
        sizeVariance={0.6}
        radius={0.12}
        upwardSpeed={0.7}
        horizontalSpeed={0.32}
        rotationSpeed={5.4}
        lifetimeSeconds={0.7}
        origin={[dim.anvilX, dim.anvilTop + 0.02, dim.anvilZ]}
        gravity={-0.85}
      />

      {isDamaged ? (
        <>
          <DamagedOverlay dim={dim} createMaterial={createMaterial} />
          <LowPolyParticles
            enabled
            count={5}
            shape="octahedron"
            color="#5a4636"
            size={0.05}
            sizeVariance={0.5}
            radius={0.14}
            upwardSpeed={0.3}
            horizontalSpeed={0.14}
            rotationSpeed={2.2}
            lifetimeSeconds={1.6}
            origin={[dim.postX - 0.1, dim.postTopY - 0.1, dim.postZ + 0.05]}
            gravity={-0.05}
          />
        </>
      ) : null}
    </group>
  );
};
