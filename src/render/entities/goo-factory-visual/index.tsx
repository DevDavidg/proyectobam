import { forwardRef, useMemo, useRef } from 'react';
import type { Group } from 'three';
import type { DriveType, GooFactoryDimensions, PipeSlot } from './geometry';
import { computeDimensions, computeFadingPumps, interpolatePumps } from './geometry';
import { clamp01, resolveState } from './helpers';
import { ConnectingPipe } from './parts/connecting-pipe';
import { DamageDebris, Destroyed } from './parts/damage-states';
import { GearMotor } from './parts/gear-motor';
import { Overflow } from './parts/overflow';
import { FlowParticle, Gauge, Pipe, Suction } from './parts/pipe';
import { PumpAssembly, Wheel } from './parts/pump-assembly';
import { Tank } from './parts/tank';
import { useGooFactoryAnimations } from './use-goo-factory-animations';
import type { CreateMaterial, GooFactoryVisualProps } from './types';

const MAX_PUMP_SLOTS = 4;

type DriveProps = {
  type: DriveType;
  dim: GooFactoryDimensions;
  createMaterial: CreateMaterial;
};

const Drive = forwardRef<Group, DriveProps>(({ type, dim, createMaterial }, ref) => {
  if (type === 'gear-motor') {
    return <GearMotor ref={ref} dim={dim} createMaterial={createMaterial} />;
  }
  return <Wheel ref={ref} dim={dim} createMaterial={createMaterial} />;
});

Drive.displayName = 'Drive';

const isMainPuddleFor = (pipe: PipeSlot, pipes: PipeSlot[]): boolean => {
  if (pipes.length <= 1) return true;
  const leftPipe = pipes.find((p) => p.side === -1);
  if (leftPipe) return pipe.id === leftPipe.id;
  return pipe.id === pipes[0].id;
};

export const GooFactoryVisual = ({
  level,
  footprintX,
  footprintZ,
  status,
  hp,
  maxHp,
  storageFillRatio = 0,
  constructionProgress,
  createMaterial,
}: GooFactoryVisualProps) => {
  const driveRef = useRef<Group | null>(null);
  const gooSurfaceRef = useRef<Group | null>(null);
  const overflowRef = useRef<Group | null>(null);
  const suctionPulseRef = useRef<Group | null>(null);
  const groundPuddleRef = useRef<Group | null>(null);
  const flowParticleRef = useRef<Group | null>(null);
  const gaugeNeedleRef = useRef<Group | null>(null);
  const pistonRefSlot0 = useRef<Group | null>(null);
  const pistonRefSlot1 = useRef<Group | null>(null);
  const pistonRefSlot2 = useRef<Group | null>(null);
  const pistonRefSlot3 = useRef<Group | null>(null);
  const pistonRefs = useMemo(
    () => [pistonRefSlot0, pistonRefSlot1, pistonRefSlot2, pistonRefSlot3],
    [],
  );
  const noopPuddleRef = useRef<Group | null>(null);

  const visualState = resolveState(status, hp, maxHp);
  const fillRatio = clamp01(storageFillRatio);
  const upgradeProgress = clamp01(constructionProgress ?? 1);
  const isUpgrading = status === 'UNDER_CONSTRUCTION' || status === 'PENDING';

  const dim = useMemo(
    () => computeDimensions(level, footprintX, footprintZ),
    [level, footprintX, footprintZ],
  );

  const previousDim = useMemo(
    () => (level > 1 ? computeDimensions(level - 1, footprintX, footprintZ) : dim),
    [level, footprintX, footprintZ, dim],
  );

  useGooFactoryAnimations(
    {
      wheelRef: driveRef,
      pistonRefs: pistonRefs.slice(0, dim.pumps.length),
      gooSurfaceRef,
      overflowRef,
      suctionPulseRef,
      groundPuddleRef,
      flowParticleRef,
      gaugeNeedleRef,
    },
    {
      dim,
      visualState,
      fillRatio,
      pumps: dim.pumps,
      hasGauge: dim.hasGauge && (!isUpgrading || upgradeProgress > 0.05),
    },
  );

  if (visualState === 'destroyed') {
    return <Destroyed dim={dim} createMaterial={createMaterial} />;
  }

  const groundPuddleBase = 0.18 + (visualState === 'in-action' ? 0.06 : 0);
  const previousPumpCount = previousDim.pumps.length;
  const renderedPumps = isUpgrading
    ? interpolatePumps(dim.pumps, previousDim.pumps, upgradeProgress)
    : dim.pumps;
  const pumps = renderedPumps.slice(0, MAX_PUMP_SLOTS);
  const fadingPumps = isUpgrading
    ? computeFadingPumps(dim.pumps, previousDim.pumps, upgradeProgress)
    : [];
  const gaugeVisible = dim.hasGauge;
  const gaugeScale = isUpgrading ? upgradeProgress : 1;
  const previousHadDriveType = previousDim.driveType;
  const driveSwapping = isUpgrading && previousHadDriveType !== dim.driveType;
  const driveAppearScale = driveSwapping ? upgradeProgress : 1;
  const previousDriveFadeScale = driveSwapping ? 1 - upgradeProgress : 0;

  return (
    <group>
      <Tank
        ref={gooSurfaceRef}
        dim={dim}
        fillRatio={fillRatio}
        createMaterial={createMaterial}
      />
      <Overflow ref={overflowRef} dim={dim} createMaterial={createMaterial} />

      {pumps.map((slot, index) => {
        const isNewPumpForUpgrade = isUpgrading && index >= previousPumpCount;
        const slotScaleFactor = isNewPumpForUpgrade ? upgradeProgress : 1;
        return (
          <PumpAssembly
            key={slot.id}
            ref={pistonRefs[index]}
            dim={dim}
            slot={slot}
            createMaterial={createMaterial}
            scaleFactor={slotScaleFactor}
          />
        );
      })}

      {fadingPumps.map((slot) => (
        <PumpAssembly
          key={`fading-${slot.id}`}
          dim={previousDim}
          slot={slot}
          createMaterial={createMaterial}
        />
      ))}

      {driveAppearScale > 0.01 ? (
        <group scale={[driveAppearScale, driveAppearScale, driveAppearScale]}>
          <Drive ref={driveRef} type={dim.driveType} dim={dim} createMaterial={createMaterial} />
        </group>
      ) : null}

      {previousDriveFadeScale > 0.01 ? (
        <group scale={[previousDriveFadeScale, previousDriveFadeScale, previousDriveFadeScale]}>
          <Drive type={previousHadDriveType} dim={previousDim} createMaterial={createMaterial} />
        </group>
      ) : null}

      {dim.pipes.map((pipe) => (
        <Pipe
          key={pipe.id}
          dim={dim}
          createMaterial={createMaterial}
          side={pipe.side}
          showValve={dim.hasValves}
        />
      ))}

      {dim.pipes.map((pipe) => {
        const isMainPuddlePipe = isMainPuddleFor(pipe, dim.pipes);
        return (
          <Suction
            key={`suction-${pipe.id}`}
            ref={isMainPuddlePipe ? suctionPulseRef : undefined}
            puddleRef={isMainPuddlePipe ? groundPuddleRef : noopPuddleRef}
            dim={dim}
            createMaterial={createMaterial}
            groundPuddleBase={
              isMainPuddlePipe ? groundPuddleBase : groundPuddleBase * 0.55
            }
            side={pipe.side}
          />
        );
      })}

      {dim.hasTopArchPipe ? (
        <group scale={[driveAppearScale, driveAppearScale, driveAppearScale]}>
          <ConnectingPipe dim={dim} createMaterial={createMaterial} />
        </group>
      ) : null}

      {gaugeVisible && gaugeScale > 0.01 ? (
        <group scale={[gaugeScale, gaugeScale, gaugeScale]}>
          <Gauge ref={gaugeNeedleRef} dim={dim} createMaterial={createMaterial} />
        </group>
      ) : null}

      <FlowParticle ref={flowParticleRef} createMaterial={createMaterial} />

      {visualState === 'damaged' ? (
        <DamageDebris dim={dim} createMaterial={createMaterial} />
      ) : null}
    </group>
  );
};
