import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group, Mesh } from 'three';
import { buildInteriorPebbles, computeDimensions } from './geometry';
import { clamp01, easeInOut, resolveState } from './helpers';
import { CentrifugeMachine } from './parts/centrifuge-machine';
import { DamagedOverlay, DestroyedOverlay } from './parts/damage-overlays';
import { GroundDecor } from './parts/ground-decor';
import { PolishMechanism } from './parts/polish-mechanism';
import { StoneBasin } from './parts/stone-basin';
import { UpgradeExtras } from './parts/upgrade-extras';
import { WaterAndPebbles } from './parts/water-and-pebbles';
import { WaterWheel } from './parts/water-wheel';
import { WoodFrame } from './parts/wood-frame';
import type { PebbleShinerVisualProps } from './types';

export const PebbleShinerVisual = ({
  level,
  footprintX,
  footprintZ,
  status,
  hp,
  maxHp,
  storageFillRatio = 0,
  constructionProgress = 0,
  createMaterial,
}: PebbleShinerVisualProps) => {
  const handleRef = useRef<Group | null>(null);
  const polishRodRef = useRef<Group | null>(null);
  const polishRootRef = useRef<Group | null>(null);
  const waterSurfaceRef = useRef<Mesh | null>(null);
  const pebblesGroupRef = useRef<Group | null>(null);
  const sparkleRef = useRef<Group | null>(null);
  const wheelRef = useRef<Group | null>(null);
  const wheelRootRef = useRef<Group | null>(null);
  const cascadeRef = useRef<Group | null>(null);
  const legacyRootRef = useRef<Group | null>(null);
  const drum1Ref = useRef<Group | null>(null);
  const drum2Ref = useRef<Group | null>(null);
  const hopperDustRef = useRef<Group | null>(null);
  const endDustRef = useRef<Group | null>(null);
  const centrifugeRootRef = useRef<Group | null>(null);

  const visualState = resolveState(status, hp, maxHp);
  const isActive = visualState === 'in-action';
  const fillRatio = clamp01(storageFillRatio);
  const isFull = fillRatio >= 0.999;
  const isWorking = isActive && !isFull;

  const isUpgrading = status === 'PENDING' || status === 'UNDER_CONSTRUCTION';
  const morphProgress = isUpgrading ? clamp01(constructionProgress) : 1;

  const tier = level >= 3 ? 3 : level >= 2 ? 2 : 1;
  const isUpgradingToL2 = tier === 2 && isUpgrading;
  const isUpgradingToL3 = tier === 3 && isUpgrading;

  const showLegacyBasin = tier <= 2 || isUpgradingToL3;
  const showPolishCrank = tier === 1 || isUpgradingToL2;
  const showWaterWheel = tier === 2 || isUpgradingToL3 || isUpgradingToL2;
  const showCentrifuge = tier === 3;

  const dim = useMemo(
    () => computeDimensions(level, footprintX, footprintZ),
    [level, footprintX, footprintZ],
  );

  const interiorPebbles = useMemo(
    () => buildInteriorPebbles(dim.innerHalfX, dim.innerHalfZ),
    [dim.innerHalfX, dim.innerHalfZ],
  );

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();

    let polishHide = 0;
    let wheelShow = 0;
    let legacyHide = 0;
    let centrifugeShow = 0;

    if (tier === 1) {
      polishHide = 0;
      wheelShow = 0;
      legacyHide = 0;
      centrifugeShow = 0;
    } else if (tier === 2) {
      if (isUpgrading) {
        polishHide = easeInOut(clamp01(morphProgress / 0.55));
        wheelShow = easeInOut(clamp01((morphProgress - 0.25) / 0.75));
      } else {
        polishHide = 1;
        wheelShow = 1;
      }
      legacyHide = 0;
      centrifugeShow = 0;
    } else {
      polishHide = 1;
      if (isUpgrading) {
        wheelShow = 1 - easeInOut(clamp01((morphProgress - 0.1) / 0.5));
        legacyHide = easeInOut(clamp01((morphProgress - 0.1) / 0.55));
        centrifugeShow = easeInOut(clamp01((morphProgress - 0.35) / 0.65));
      } else {
        wheelShow = 0;
        legacyHide = 1;
        centrifugeShow = 1;
      }
    }

    if (handleRef.current) {
      const handleSpeed = isWorking && tier === 1 ? 4.6 : 0;
      handleRef.current.rotation.x += delta * handleSpeed;
      const wobble = visualState === 'damaged' ? Math.sin(elapsed * 6) * 0.05 : 0;
      handleRef.current.rotation.z = wobble;
    }

    if (polishRodRef.current) {
      const rodSpeed = isWorking && tier === 1 ? 5.4 : 0;
      polishRodRef.current.rotation.y += delta * rodSpeed;
    }

    if (polishRootRef.current) {
      const polishScale = Math.max(0.0001, 1 - polishHide);
      polishRootRef.current.visible = polishHide < 0.99;
      polishRootRef.current.scale.setScalar(polishScale);
    }

    if (wheelRootRef.current) {
      wheelRootRef.current.visible = wheelShow > 0.001;
      wheelRootRef.current.scale.setScalar(Math.max(0.0001, wheelShow));
    }

    if (wheelRef.current) {
      const wheelSpeed = isWorking && tier === 2 ? 1.6 : visualState === 'damaged' && tier === 2 ? 0.4 : 0;
      wheelRef.current.rotation.z -= delta * wheelSpeed;
    }

    if (cascadeRef.current) {
      const flowing = isWorking && tier === 2 && wheelShow > 0.5;
      cascadeRef.current.children.forEach((child, index) => {
        if (!flowing) {
          child.visible = false;
          return;
        }
        const phase = (elapsed * 1.6 + index * 0.42) % 1;
        const fall = phase * (dim.wheelRadius * 0.85);
        child.visible = phase > 0.05 && phase < 0.95;
        child.position.y = -fall;
        const fade = 1 - Math.abs(phase - 0.5) * 1.4;
        child.scale.setScalar(Math.max(0.4, fade));
      });
    }

    if (legacyRootRef.current) {
      const legacyScale = Math.max(0.0001, 1 - legacyHide);
      legacyRootRef.current.visible = legacyHide < 0.99;
      legacyRootRef.current.scale.setScalar(legacyScale);
    }

    if (centrifugeRootRef.current) {
      centrifugeRootRef.current.visible = centrifugeShow > 0.001;
      centrifugeRootRef.current.scale.setScalar(Math.max(0.0001, centrifugeShow));
    }

    const centrifugeWorking = isWorking && tier === 3 && centrifugeShow > 0.6;

    if (drum1Ref.current) {
      const speed = centrifugeWorking ? 2.2 : visualState === 'damaged' && tier === 3 ? 0.5 : 0;
      drum1Ref.current.rotation.x += delta * speed;
    }
    if (drum2Ref.current) {
      const speed = centrifugeWorking ? -2.05 : visualState === 'damaged' && tier === 3 ? -0.45 : 0;
      drum2Ref.current.rotation.x += delta * speed;
    }

    // Hopper neck filters sand constantly while the machine is running
    if (hopperDustRef.current) {
      const flowing = centrifugeShow > 0.6 && (isWorking || isActive) && tier === 3;
      const fallDistance = dim.hopperBottomY - dim.frameBottomY + 0.05;
      hopperDustRef.current.children.forEach((child, index) => {
        if (!flowing) {
          child.visible = false;
          return;
        }
        const phase = (elapsed * 1.5 + index * 0.27) % 1;
        child.visible = phase > 0.04 && phase < 0.96;
        child.position.y = -phase * fallDistance;
        const fade = 1 - Math.abs(phase - 0.5) * 1.5;
        child.scale.setScalar(Math.max(0.35, fade));
      });
    }

    // Discharge end sheds residue sand while polishing
    if (endDustRef.current) {
      const fallDistance = dim.frameHeight * 0.55;
      endDustRef.current.children.forEach((child, index) => {
        if (!centrifugeWorking) {
          child.visible = false;
          return;
        }
        const phase = (elapsed * 1.4 + index * 0.33) % 1;
        child.visible = phase > 0.05 && phase < 0.95;
        child.position.y = -phase * fallDistance;
        const fade = 1 - Math.abs(phase - 0.5) * 1.6;
        child.scale.setScalar(Math.max(0.3, fade));
      });
    }

    if (waterSurfaceRef.current) {
      const ripple = isWorking && tier <= 2
        ? Math.sin(elapsed * 3.6) * 0.006
        : Math.sin(elapsed * 1.2) * 0.0015;
      waterSurfaceRef.current.position.y = dim.waterY + ripple;
      const breathe = 1 + Math.sin(elapsed * 2.6) * (isWorking ? 0.012 : 0.004);
      waterSurfaceRef.current.scale.set(breathe, 1, breathe);
    }

    if (pebblesGroupRef.current) {
      pebblesGroupRef.current.children.forEach((child, index) => {
        const shape = interiorPebbles[index];
        if (!shape) return;
        const visible = fillRatio > shape.threshold;
        child.visible = visible;
        if (visible) {
          const intensity = clamp01((fillRatio - shape.threshold) / (1 - shape.threshold + 0.001));
          const wobbleY = isWorking && tier <= 2 ? Math.sin(elapsed * 2.4 + shape.rotation * 4) * 0.006 : 0;
          child.position.y = wobbleY;
          const popIn = isFull ? 1 : 0.4 + intensity * 0.6;
          child.scale.setScalar(popIn);
        }
      });
    }

    if (sparkleRef.current) {
      const isPolishing = isWorking && tier <= 2 && fillRatio > 0.55;
      sparkleRef.current.children.forEach((child, index) => {
        const offsetPhase = index * 1.7;
        const localPulse = isPolishing
          ? 0.6 + Math.abs(Math.sin(elapsed * 5.2 + offsetPhase)) * 0.6
          : 0;
        child.visible = isPolishing && localPulse > 0.55;
        child.scale.setScalar(Math.max(0.0001, localPulse));
      });
    }
  });

  if (visualState === 'destroyed') {
    return <DestroyedOverlay dim={dim} createMaterial={createMaterial} />;
  }

  return (
    <group>
      <GroundDecor dim={dim} createMaterial={createMaterial} />

      {showLegacyBasin || showPolishCrank || showWaterWheel ? (
        <group ref={legacyRootRef}>
          {showLegacyBasin ? (
            <>
              <StoneBasin dim={dim} createMaterial={createMaterial} />
              <WoodFrame dim={dim} createMaterial={createMaterial} />
              <WaterAndPebbles
                dim={dim}
                interiorPebbles={interiorPebbles}
                createMaterial={createMaterial}
                waterRef={waterSurfaceRef}
                pebblesRef={pebblesGroupRef}
                sparkleRef={sparkleRef}
              />
            </>
          ) : null}
          {showPolishCrank ? (
            <PolishMechanism
              dim={dim}
              createMaterial={createMaterial}
              handleRef={handleRef}
              polishRodRef={polishRodRef}
              rootRef={polishRootRef}
            />
          ) : null}
          {showWaterWheel ? (
            <WaterWheel
              dim={dim}
              createMaterial={createMaterial}
              wheelRef={wheelRef}
              cascadeRef={cascadeRef}
              rootRef={wheelRootRef}
            />
          ) : null}
        </group>
      ) : null}

      {showCentrifuge ? (
        <CentrifugeMachine
          dim={dim}
          createMaterial={createMaterial}
          rootRef={centrifugeRootRef}
          drum1Ref={drum1Ref}
          drum2Ref={drum2Ref}
          hopperDustRef={hopperDustRef}
          endDustRef={endDustRef}
        />
      ) : null}

      <UpgradeExtras dim={dim} level={level} createMaterial={createMaterial} />
      {visualState === 'damaged' ? <DamagedOverlay dim={dim} createMaterial={createMaterial} /> : null}
    </group>
  );
};
