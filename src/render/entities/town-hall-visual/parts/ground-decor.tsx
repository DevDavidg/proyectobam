import { Fragment } from 'react';
import { PALETTE } from '../palette';
import { GroundDecal } from '../../shared/ground-decal';
import { resolveToneColor } from '../../shared/tone-resolver';
import type { MaterialFactory, TownHallDimensions } from '../types';

type GroundDecorProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
};

type RockSpec = {
  id: string;
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  tone: 'mid' | 'dark' | 'light';
  tilt?: number;
};

const buildRocks = (halfX: number, halfZ: number): RockSpec[] => [
  { id: 'rock-fl-1', x: -halfX * 0.55, z: halfZ + 0.62, width: 0.12, height: 0.08, depth: 0.1, rotation: 0.4, tone: 'mid' },
  { id: 'rock-fl-2', x: -halfX * 0.85, z: halfZ + 0.95, width: 0.16, height: 0.07, depth: 0.13, rotation: 1.1, tone: 'dark' },
  { id: 'rock-fl-3', x: -halfX * 0.4, z: halfZ + 0.92, width: 0.1, height: 0.06, depth: 0.09, rotation: 0.7, tone: 'mid', tilt: 0.12 },
  { id: 'rock-fc-1', x: halfX * 0.05, z: halfZ + 0.84, width: 0.11, height: 0.07, depth: 0.08, rotation: 0.2, tone: 'light' },
  { id: 'rock-fc-2', x: halfX * 0.18, z: halfZ + 0.66, width: 0.14, height: 0.05, depth: 0.1, rotation: 1.4, tone: 'dark' },
  { id: 'rock-fr-1', x: halfX * 0.55, z: halfZ + 0.92, width: 0.12, height: 0.07, depth: 0.1, rotation: 0.6, tone: 'mid' },
  { id: 'rock-r-1', x: halfX + 0.62, z: halfZ * 0.18, width: 0.13, height: 0.06, depth: 0.11, rotation: 0.5, tone: 'mid' },
  { id: 'rock-r-2', x: halfX + 0.96, z: halfZ * 0.45, width: 0.11, height: 0.07, depth: 0.09, rotation: 1.2, tone: 'dark', tilt: -0.1 },
  { id: 'rock-r-3', x: halfX + 0.5, z: -halfZ * 0.34, width: 0.1, height: 0.05, depth: 0.08, rotation: 0.8, tone: 'mid' },
  { id: 'rock-bl-1', x: -halfX * 0.6, z: -halfZ - 0.45, width: 0.13, height: 0.06, depth: 0.1, rotation: 1.6, tone: 'dark' },
  { id: 'rock-bl-2', x: -halfX * 0.9, z: -halfZ - 0.78, width: 0.1, height: 0.06, depth: 0.09, rotation: 0.3, tone: 'mid' },
];

const ROCK_TONE_PALETTE = {
  mid: PALETTE.rockMid,
  dark: PALETTE.rockShadow,
  light: PALETTE.rockLight,
} as const;

const tonePaletteRock = (tone: RockSpec['tone']): string =>
  resolveToneColor(tone, ROCK_TONE_PALETTE, PALETTE.rockMid);

const GEAR_TEETH = 10;

export const GroundDecor = ({ dim, createMaterial }: GroundDecorProps) => {
  const rocks = buildRocks(dim.halfX, dim.halfZ);
  const groundOuterRadius = Math.max(dim.halfX, dim.halfZ) + 1.05;

  const gearCenter: [number, number, number] = [-dim.halfX * 0.65, 0.04, dim.halfZ + 0.7];
  const gearRadius = 0.23;
  const gearThickness = 0.08;
  const toothLength = 0.075;
  const toothWidth = 0.07;

  return (
    <group>
      <GroundDecal
        radius={groundOuterRadius}
        color={PALETTE.groundDecal}
        createMaterial={createMaterial}
        y={0.011}
      />
      <mesh receiveShadow position={[0, 0.013, 0]} rotation={[-Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.groundDecalLight, 'wood')}>
        <ringGeometry args={[groundOuterRadius * 0.55, groundOuterRadius * 0.92, 28, 1]} /></mesh>

      <group position={gearCenter} rotation={[0, 0.32, 0]}>
        <mesh castShadow receiveShadow material={createMaterial(PALETTE.gearBody, 'iron')}>
          <cylinderGeometry args={[gearRadius, gearRadius, gearThickness, 18]} /></mesh>

        <mesh castShadow position={[0, gearThickness / 2 + 0.001, 0]} material={createMaterial(PALETTE.gearBodyLight, 'iron')}>
          <cylinderGeometry args={[gearRadius * 0.96, gearRadius * 0.96, 0.012, 18]} /></mesh>

        {Array.from({ length: GEAR_TEETH }).map((_, idx) => {
          const angle = (idx / GEAR_TEETH) * Math.PI * 2;
          const x = Math.cos(angle) * (gearRadius + toothLength * 0.45);
          const z = Math.sin(angle) * (gearRadius + toothLength * 0.45);
          return (
            <mesh
              key={`gear-tooth-${idx}`}
              castShadow
              receiveShadow
              position={[x, 0, z]}
              rotation={[0, -angle, 0]}
             material={createMaterial(PALETTE.gearTeeth, 'iron')}>
              <boxGeometry args={[toothLength, gearThickness * 0.92, toothWidth]} /></mesh>
          );
        })}

        <mesh castShadow position={[0, gearThickness / 2 + 0.012, 0]} material={createMaterial(PALETTE.gearHubDark, 'iron')}>
          <cylinderGeometry args={[gearRadius * 0.32, gearRadius * 0.32, 0.024, 12]} /></mesh>
        <mesh position={[0, gearThickness / 2 + 0.026, 0]} material={createMaterial(PALETTE.boltShine, 'iron')}>
          <cylinderGeometry args={[gearRadius * 0.12, gearRadius * 0.12, 0.014, 10]} /></mesh>

        {Array.from({ length: 4 }).map((_, idx) => {
          const angle = (idx / 4) * Math.PI * 2 + Math.PI / 4;
          const x = Math.cos(angle) * gearRadius * 0.62;
          const z = Math.sin(angle) * gearRadius * 0.62;
          return (
            <mesh
              key={`gear-spoke-hole-${idx}`}
              position={[x, gearThickness / 2 + 0.014, z]}
             material={createMaterial(PALETTE.gearHubDark, 'iron')}>
              <cylinderGeometry args={[0.04, 0.04, 0.012, 12]} /></mesh>
          );
        })}
      </group>

      {rocks.map((rock) => (
        <Fragment key={rock.id}>
          <mesh
            castShadow
            receiveShadow
            position={[rock.x, rock.height / 2 + 0.01, rock.z]}
            rotation={[rock.tilt ?? 0, rock.rotation, 0]}
           material={createMaterial(tonePaletteRock(rock.tone), 'stone')}>
            <boxGeometry args={[rock.width, rock.height, rock.depth]} /></mesh>
          <mesh
            position={[
              rock.x + Math.sin(rock.rotation) * 0.005,
              rock.height + 0.012,
              rock.z + Math.cos(rock.rotation) * 0.005,
            ]}
            rotation={[rock.tilt ?? 0, rock.rotation, 0]}
           material={createMaterial(PALETTE.rockLight, 'stone')}>
            <boxGeometry args={[rock.width * 0.6, 0.014, rock.depth * 0.6]} /></mesh>
        </Fragment>
      ))}

      <mesh receiveShadow position={[gearCenter[0] + 0.02, 0.013, gearCenter[2] + 0.04]} material={createMaterial(PALETTE.groundDecalLight, 'wood')}>
        <boxGeometry args={[gearRadius * 2.4, 0.005, gearRadius * 1.8]} /></mesh>
    </group>
  );
};
