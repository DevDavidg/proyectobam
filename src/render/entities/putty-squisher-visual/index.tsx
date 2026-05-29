import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group, Mesh } from 'three';
import {
  buildBoltCorners,
  buildPuttyLayout,
  computeDimensions,
  PUTTY_TOTAL,
} from './geometry';
import {
  LEVER_REST_ANGLE,
  clamp01,
  computeLeverPhase,
  computeNewestSpawnScale,
  easeInOut,
  resolveState,
} from './helpers';
import { BottomPipes } from './parts/bottom-pipes';
import { CubeBody } from './parts/cube-body';
import { DamagedOverlay, DestroyedOverlay } from './parts/damage-overlays';
import { GearTrain } from './parts/gear-train';
import { OutputPipe } from './parts/output-pipe';
import { PressMechanism } from './parts/press-mechanism';
import { PuttyPile } from './parts/putty-pile';
import { ScrewMechanism } from './parts/screw-mechanism';
import { Spigot } from './parts/spigot';
import { TopPumps } from './parts/top-pumps';
import type { PuttySquisherVisualProps } from './types';

const SCREW_BOB_AMPLITUDE = 0.12;
const PUDDLE_BREATHE_AMPLITUDE = 0.022;
const PUMP_CYCLE_SECONDS = 1.4;

export const PuttySquisherVisual = ({
  level,
  footprintX,
  footprintZ,
  status,
  hp,
  maxHp,
  storageFillRatio = 0,
  constructionProgress = 0,
  createMaterial,
}: PuttySquisherVisualProps) => {
  const pressRootRef = useRef<Group | null>(null);
  const leverRef = useRef<Group | null>(null);
  const bladeRef = useRef<Group | null>(null);
  const newestPuttyRef = useRef<Mesh | null>(null);

  const screwRootRef = useRef<Group | null>(null);
  const screwAssemblyRef = useRef<Group | null>(null);
  const gearRootRef = useRef<Group | null>(null);
  const largeGearRef = useRef<Group | null>(null);
  const midGearRef = useRef<Group | null>(null);
  const smallGearRef = useRef<Group | null>(null);
  const pipeRootRef = useRef<Group | null>(null);
  const dripsRef = useRef<Group | null>(null);
  const puddleRef = useRef<Group | null>(null);

  const pumpsRootRef = useRef<Group | null>(null);
  const leftPistonRef = useRef<Group | null>(null);
  const rightPistonRef = useRef<Group | null>(null);
  const l3PipesRootRef = useRef<Group | null>(null);
  const l3DripsRef0 = useRef<Group | null>(null);
  const l3DripsRef1 = useRef<Group | null>(null);
  const l3DripsRef2 = useRef<Group | null>(null);
  const l3PuddleRef = useRef<Group | null>(null);

  const visualState = resolveState(status, hp, maxHp);
  const fillRatio = clamp01(storageFillRatio);
  const isFull = fillRatio >= 0.99;
  const isActive = visualState === 'in-action' && !isFull;

  const isUpgrading = status === 'PENDING' || status === 'UNDER_CONSTRUCTION';
  const morphProgress = isUpgrading ? clamp01(constructionProgress) : 1;

  const hasL2Mechanism = level >= 2;
  const hasL3Mechanism = level >= 3;
  const isL1ToL2Morph = level === 2 && isUpgrading;
  const isL2ToL3Morph = hasL3Mechanism && isUpgrading;
  const l3DoneFactor = hasL3Mechanism && !isUpgrading ? 1 : 0;

  const screwInForL2 = isL1ToL2Morph
    ? clamp01((morphProgress - 0.18) / 0.82)
    : hasL2Mechanism
      ? 1
      : 0;
  const gearsInForL2 = isL1ToL2Morph
    ? clamp01((morphProgress - 0.1) / 0.9)
    : hasL2Mechanism
      ? 1
      : 0;
  const pipeInForL2 = isL1ToL2Morph
    ? clamp01((morphProgress - 0.3) / 0.7)
    : hasL2Mechanism
      ? 1
      : 0;

  const l2HideForL3 = isL2ToL3Morph
    ? clamp01(morphProgress / 0.6)
    : l3DoneFactor;

  const screwEase = easeInOut(screwInForL2 * (1 - l2HideForL3));
  const gearsEase = easeInOut(gearsInForL2 * (1 - l2HideForL3));
  const pipeEase = easeInOut(pipeInForL2 * (1 - l2HideForL3));
  const pressHideEase = isL1ToL2Morph
    ? easeInOut(clamp01(morphProgress / 0.55))
    : hasL2Mechanism
      ? 1
      : 0;

  const pumpsInForL3 = isL2ToL3Morph
    ? clamp01((morphProgress - 0.18) / 0.82)
    : l3DoneFactor;
  const l3PipesInForL3 = isL2ToL3Morph
    ? clamp01((morphProgress - 0.3) / 0.7)
    : l3DoneFactor;
  const pumpsEase = easeInOut(pumpsInForL3);
  const l3PipesEase = easeInOut(l3PipesInForL3);

  const dim = useMemo(
    () => computeDimensions(level, footprintX, footprintZ),
    [level, footprintX, footprintZ],
  );

  const puttySlots = useMemo(() => buildPuttyLayout(dim.cubeSize), [dim.cubeSize]);
  const boltCorners = useMemo(() => buildBoltCorners(dim), [dim]);

  const l3DripsRefs = useMemo(
    () => [l3DripsRef0, l3DripsRef1, l3DripsRef2] as const,
    [],
  );

  useFrame((state, _delta) => {
    const elapsed = state.clock.getElapsedTime();
    const phase = isActive ? computeLeverPhase(elapsed) : null;

    if (pressRootRef.current) {
      const pressVisible = !hasL2Mechanism || pressHideEase < 0.99;
      pressRootRef.current.visible = pressVisible;
      const pressScale = hasL2Mechanism ? Math.max(0.0001, 1 - pressHideEase) : 1;
      pressRootRef.current.scale.setScalar(pressScale);
    }

    if (screwRootRef.current) {
      screwRootRef.current.visible = screwEase > 0.001;
      const screwScale = Math.max(0.0001, screwEase);
      screwRootRef.current.scale.setScalar(screwScale);
    }

    if (gearRootRef.current) {
      gearRootRef.current.visible = gearsEase > 0.001;
      const gearScale = Math.max(0.0001, gearsEase);
      gearRootRef.current.scale.setScalar(gearScale);
      const vibration = isActive
        ? Math.sin(elapsed * 24) * 0.0035 +
          (phase ? phase.pressNorm * Math.sin(elapsed * 38) * 0.004 : 0)
        : 0;
      gearRootRef.current.position.y = vibration;
    }

    if (pipeRootRef.current) {
      pipeRootRef.current.visible = pipeEase > 0.001;
      const pipeScale = Math.max(0.0001, pipeEase);
      pipeRootRef.current.scale.setScalar(pipeScale);
    }

    if (pumpsRootRef.current) {
      pumpsRootRef.current.visible = pumpsEase > 0.001;
      const pumpScale = Math.max(0.0001, pumpsEase);
      pumpsRootRef.current.scale.setScalar(pumpScale);
    }

    if (l3PipesRootRef.current) {
      l3PipesRootRef.current.visible = l3PipesEase > 0.001;
      const pipeScale = Math.max(0.0001, l3PipesEase);
      l3PipesRootRef.current.scale.setScalar(pipeScale);
    }

    if (leverRef.current) {
      if (isFull) {
        const idleSway = Math.sin(elapsed * 0.6) * 0.005;
        leverRef.current.rotation.z = LEVER_REST_ANGLE + idleSway;
      } else if (phase) {
        leverRef.current.rotation.z = phase.angle;
      } else if (visualState === 'damaged') {
        const wobble = Math.sin(elapsed * 4.2) * 0.04;
        leverRef.current.rotation.z = LEVER_REST_ANGLE + wobble;
      } else {
        const idle = Math.sin(elapsed * 1.1) * 0.012;
        leverRef.current.rotation.z = LEVER_REST_ANGLE + idle;
      }
    }

    if (bladeRef.current) {
      bladeRef.current.position.y = phase ? -dim.cubeSize * 0.22 * phase.pressNorm : 0;
    }

    const pulseMesh = newestPuttyRef.current;
    if (pulseMesh) {
      if (!phase || isFull) {
        pulseMesh.scale.setScalar(1);
      } else {
        pulseMesh.scale.setScalar(computeNewestSpawnScale(phase.rawT));
      }
    }

    if (screwAssemblyRef.current) {
      const spinSpeed = isActive ? 1.8 : isFull ? 0 : 0.22;
      screwAssemblyRef.current.rotation.y += _delta * spinSpeed;
      const bob = phase ? -dim.cubeSize * SCREW_BOB_AMPLITUDE * phase.pressNorm : 0;
      screwAssemblyRef.current.position.y = bob;
    }

    const baseSpeed = isActive ? 2.1 : isFull ? 0 : 0.32;
    const pressBoost = phase ? phase.pressNorm * 0.6 : 0;

    if (largeGearRef.current) {
      largeGearRef.current.rotation.x += _delta * (baseSpeed + pressBoost);
    }

    if (midGearRef.current) {
      const ratio = dim.gearLargeRadius / dim.gearMidRadius;
      midGearRef.current.rotation.x -= _delta * (baseSpeed + pressBoost) * ratio;
    }

    if (smallGearRef.current) {
      const ratio =
        (dim.gearLargeRadius / dim.gearMidRadius) * (dim.gearMidRadius / dim.gearSmallRadius);
      smallGearRef.current.rotation.x += _delta * (baseSpeed + pressBoost) * ratio;
    }

    if (dripsRef.current) {
      const flowing = isActive && pipeEase > 0.5;
      const fallDistance = dim.pipeEndY - dim.puddleY;
      dripsRef.current.children.forEach((child, index) => {
        if (!flowing) {
          child.visible = false;
          return;
        }
        const phaseOffset = (elapsed * 0.9 + index * 0.27) % 1;
        const fall = phaseOffset * fallDistance;
        child.position.y = -fall;
        child.visible = phaseOffset > 0.04 && phaseOffset < 0.96;
        const stretch = 1 + Math.min(1, phaseOffset * 2.2) * 0.6;
        child.scale.set(0.95, stretch, 0.95);
      });
    }

    if (puddleRef.current) {
      const baseScale = hasL2Mechanism ? 0.22 + easeInOut(fillRatio) * 1.28 : 0;
      const breath = isActive ? 1 + Math.sin(elapsed * 2.4) * PUDDLE_BREATHE_AMPLITUDE : 1;
      const overflowPulse = isFull ? 1 + Math.sin(elapsed * 1.4) * 0.025 : 1;
      const finalScale = Math.max(0.0001, baseScale * breath * overflowPulse * pipeEase);
      puddleRef.current.scale.setScalar(finalScale);
      puddleRef.current.visible = pipeEase > 0.001 && baseScale > 0.005;
    }

    if (pumpsEase > 0.001 && (leftPistonRef.current || rightPistonRef.current)) {
      const pumpFreq = (Math.PI * 2) / PUMP_CYCLE_SECONDS;
      const pumpSpeed = isActive ? 1.6 : isFull ? 0 : 0.35;
      const pumpPhase = elapsed * pumpFreq * pumpSpeed;
      const stroke = dim.pumpStroke;
      if (leftPistonRef.current) {
        const offset = (Math.sin(pumpPhase) + 1) * 0.5 * stroke;
        leftPistonRef.current.position.y = dim.pumpShaftTopY - offset;
      }
      if (rightPistonRef.current) {
        const offset = (Math.sin(pumpPhase + Math.PI) + 1) * 0.5 * stroke;
        rightPistonRef.current.position.y = dim.pumpShaftTopY - offset;
      }
    }

    if (l3PipesEase > 0.001) {
      const flowing = isActive && l3PipesEase > 0.5;
      const fallDistance = dim.l3PipeFloorY - dim.l3PuddleY;
      l3DripsRefs.forEach((ref, pipeIndex) => {
        const group = ref.current;
        if (!group) return;
        group.children.forEach((child, dripIndex) => {
          if (!flowing) {
            child.visible = false;
            return;
          }
          const phaseOffset =
            (elapsed * 1.1 + pipeIndex * 0.33 + dripIndex * 0.27) % 1;
          const fall = phaseOffset * fallDistance;
          child.position.y = -fall;
          child.visible = phaseOffset > 0.05 && phaseOffset < 0.95;
          const stretch = 1 + Math.min(1, phaseOffset * 2.4) * 0.7;
          child.scale.set(0.92, stretch, 0.92);
        });
      });
    }

    if (l3PuddleRef.current) {
      const baseScale = hasL3Mechanism ? 0.32 + easeInOut(fillRatio) * 1.5 : 0;
      const breath = isActive ? 1 + Math.sin(elapsed * 2.6) * 0.028 : 1;
      const overflowPulse = isFull ? 1 + Math.sin(elapsed * 1.6) * 0.04 : 1;
      const finalScale = Math.max(0.0001, baseScale * breath * overflowPulse * l3PipesEase);
      l3PuddleRef.current.scale.setScalar(finalScale);
      l3PuddleRef.current.visible = l3PipesEase > 0.001 && baseScale > 0.005;
    }
  });

  if (visualState === 'destroyed') {
    return <DestroyedOverlay dim={dim} createMaterial={createMaterial} />;
  }

  const visiblePuttyCount = isFull
    ? PUTTY_TOTAL
    : Math.max(0, Math.floor(fillRatio * PUTTY_TOTAL + 0.0001));
  const newestIndex = visiblePuttyCount > 0 ? visiblePuttyCount - 1 : -1;
  const damageTilt = visualState === 'damaged' ? 0.04 : 0;

  return (
    <group rotation={[damageTilt * 0.5, 0, -damageTilt]}>
      <CubeBody
        dim={dim}
        bolts={boltCorners}
        showRecessedTop={hasL2Mechanism && !hasL3Mechanism && screwEase > 0.05}
        createMaterial={createMaterial}
      />

      <Spigot dim={dim} createMaterial={createMaterial} />

      <PressMechanism
        dim={dim}
        createMaterial={createMaterial}
        rootRef={pressRootRef}
        leverRef={leverRef}
        bladeRef={bladeRef}
      />

      {hasL2Mechanism ? (
        <ScrewMechanism
          dim={dim}
          createMaterial={createMaterial}
          rootRef={screwRootRef}
          assemblyRef={screwAssemblyRef}
        />
      ) : null}

      {hasL2Mechanism ? (
        <GearTrain
          dim={dim}
          createMaterial={createMaterial}
          rootRef={gearRootRef}
          largeGearRef={largeGearRef}
          midGearRef={midGearRef}
          smallGearRef={smallGearRef}
        />
      ) : null}

      {hasL2Mechanism ? (
        <OutputPipe
          dim={dim}
          createMaterial={createMaterial}
          rootRef={pipeRootRef}
          dripsRef={dripsRef}
          puddleRef={puddleRef}
        />
      ) : null}

      {hasL3Mechanism ? (
        <TopPumps
          dim={dim}
          createMaterial={createMaterial}
          rootRef={pumpsRootRef}
          leftPistonRef={leftPistonRef}
          rightPistonRef={rightPistonRef}
        />
      ) : null}

      {hasL3Mechanism ? (
        <BottomPipes
          dim={dim}
          createMaterial={createMaterial}
          rootRef={l3PipesRootRef}
          dripsRefs={l3DripsRefs}
          puddleRef={l3PuddleRef}
        />
      ) : null}

      {!hasL2Mechanism ? (
        <PuttyPile
          slots={puttySlots}
          visibleCount={visiblePuttyCount}
          newestIndex={newestIndex}
          newestRef={newestPuttyRef}
          createMaterial={createMaterial}
        />
      ) : null}

      {visualState === 'damaged' ? (
        <DamagedOverlay dim={dim} createMaterial={createMaterial} />
      ) : null}
    </group>
  );
};
