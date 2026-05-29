import { useMemo, useRef, type ReactElement } from 'react';
import type { Group } from 'three';
import {
  computeDimensions,
  resolveDimensionBlend,
  resolveState,
  resolveTier2Weight,
  resolveTier3Weight,
} from './dimensions';
import { ArmorBands } from './parts/armor-bands';
import { DamagedOverlay } from './parts/damaged-overlay';
import { Destroyed } from './parts/destroyed';
import { DoorAnimationDriver } from './parts/door-animation-driver';
import { FrontDoor } from './parts/front-door';
import { FunnelUpgrades } from './parts/funnel-upgrades';
import { GlowWindows } from './parts/glow-windows';
import { GroundDecor } from './parts/ground-decor';
import { InteriorChamber } from './parts/interior-chamber';
import { IronWalls } from './parts/iron-walls';
import { Rivets } from './parts/rivets';
import { RobotLegs } from './parts/robot-legs';
import { RoofAntenna } from './parts/roof-antenna';
import { RoofFunnel } from './parts/roof-funnel';
import { SidePatch } from './parts/side-patch';
import { SidePipes } from './parts/side-pipes';
import type { MaterialFactory, MaterialToken, TownHallVisualProps } from './types';

const defaultMaterialFactory: MaterialFactory = (fallbackColor: string, _token: MaterialToken): ReactElement => (
  <meshStandardMaterial color={fallbackColor} roughness={0.78} metalness={0.16} flatShading />
);

export const TownHallVisual = ({
  level,
  footprintX,
  footprintZ,
  status,
  hp,
  maxHp,
  createMaterial,
  interactive = false,
  constructionProgress,
}: TownHallVisualProps) => {
  const dimensionBlend = useMemo(
    () => resolveDimensionBlend(level, status, constructionProgress),
    [level, status, constructionProgress],
  );

  const dim = useMemo(
    () => computeDimensions(level, footprintX, footprintZ, dimensionBlend),
    [level, footprintX, footprintZ, dimensionBlend],
  );

  const visualState = resolveState(status, hp, maxHp);
  const factory = createMaterial ?? defaultMaterialFactory;
  const doorHingeRef = useRef<Group>(null);

  const tier2Weight = useMemo(
    () => resolveTier2Weight(level, status, constructionProgress),
    [level, status, constructionProgress],
  );

  const tier3Weight = useMemo(
    () => resolveTier3Weight(level, status, constructionProgress),
    [level, status, constructionProgress],
  );

  const funnelSegments = useMemo(() => {
    if (level >= 6) {
      return 32;
    }
    if (level >= 3) {
      return 24;
    }
    return 4;
  }, [level]);

  if (visualState === 'destroyed') {
    return <Destroyed dim={dim} createMaterial={factory} />;
  }

  return (
    <group>
      <GroundDecor dim={dim} createMaterial={factory} />
      <RobotLegs dim={dim} createMaterial={factory} weight={tier3Weight} />
      <IronWalls dim={dim} createMaterial={factory} chamferWeight={tier3Weight} />
      <Rivets dim={dim} createMaterial={factory} />
      <InteriorChamber dim={dim} createMaterial={factory} />
      <FrontDoor
        ref={doorHingeRef}
        dim={dim}
        createMaterial={factory}
        tier2Weight={tier2Weight}
        tier3Weight={tier3Weight}
      />
      <SidePatch dim={dim} createMaterial={factory} />
      <SidePipes dim={dim} createMaterial={factory} />
      <RoofFunnel dim={dim} createMaterial={factory} segments={funnelSegments} />
      <ArmorBands dim={dim} createMaterial={factory} weight={tier2Weight} />
      <FunnelUpgrades
        dim={dim}
        createMaterial={factory}
        weight={tier2Weight}
        segments={funnelSegments}
      />
      <RoofAntenna dim={dim} createMaterial={factory} weight={tier2Weight} />
      <GlowWindows dim={dim} createMaterial={factory} weight={tier3Weight} />
      {visualState === 'damaged' ? <DamagedOverlay dim={dim} createMaterial={factory} /> : null}
      {interactive ? <DoorAnimationDriver doorRef={doorHingeRef} /> : null}
    </group>
  );
};
