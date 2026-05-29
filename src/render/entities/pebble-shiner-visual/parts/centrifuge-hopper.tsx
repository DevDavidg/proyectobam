import { useMemo } from 'react';
import { PALETTE } from '../palette';
import type { MaterialFactory, PebbleShinerDimensions } from '../types';

type CentrifugeHopperProps = {
  dim: PebbleShinerDimensions;
  createMaterial: MaterialFactory;
};

const PEBBLE_TONES = [
  PALETTE.pebbleMid,
  PALETTE.pebbleWarm,
  PALETTE.pebbleCool,
  PALETTE.pebbleDark,
  PALETTE.pebbleHighlight,
];

export const CentrifugeHopper = ({
  dim,
  createMaterial,
}: CentrifugeHopperProps) => {
  const topR = Math.max(dim.hopperWidth, dim.hopperDepth) * 0.5 + 0.03;
  const bottomR = Math.max(dim.hopperWidth, dim.hopperDepth) * 0.16;

  const pebbles = useMemo(() => {
    let seed = 4.41;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const fillRadius = topR - 0.06;
    // Heaped mound of round stones, slightly piled above the open rim
    return Array.from({ length: 16 }, (_, index) => {
      const ang = rand() * Math.PI * 2;
      const rad = Math.sqrt(rand()) * fillRadius;
      return {
        id: `hopper-pebble-${index}`,
        x: Math.cos(ang) * rad,
        z: Math.sin(ang) * rad,
        yJitter: (1 - rad / fillRadius) * 0.05 + rand() * 0.02,
        size: 0.05 + rand() * 0.038,
        rotation: rand() * Math.PI * 2,
        tilt: rand() * 0.6,
        tone: PEBBLE_TONES[Math.floor(rand() * PEBBLE_TONES.length)] ?? PALETTE.pebbleMid,
      };
    });
  }, [topR]);

  const neckY = dim.hopperBottomY - 0.02;

  return (
    <group position={[dim.hopperCenterX, 0, 0]}>
      {/* Open funnel walls (no top cover) */}
      <mesh castShadow receiveShadow position={[0, dim.hopperCenterY, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[topR, bottomR, dim.hopperHeight, 4, 1, true]} />
        {createMaterial(PALETTE.hopperStone, 'stone')}
      </mesh>

      {/* Thick open rim around the mouth */}
      <mesh
        castShadow
        receiveShadow
        position={[0, dim.hopperTopY - 0.02, 0]}
        rotation={[Math.PI / 2, Math.PI / 4, 0]}
      >
        <torusGeometry args={[topR, 0.035, 6, 4]} />
        {createMaterial(PALETTE.hopperRim, 'stone')}
      </mesh>

      {/* Heaped round stones inside the open mouth */}
      {pebbles.map((pebble) => (
        <mesh
          key={pebble.id}
          castShadow
          receiveShadow
          position={[pebble.x, dim.hopperTopY - 0.08 + pebble.yJitter, pebble.z]}
          rotation={[pebble.tilt, pebble.rotation, 0]}
        >
          <icosahedronGeometry args={[pebble.size, 0]} />
          {createMaterial(pebble.tone, 'stone')}
        </mesh>
      ))}

      {/* Narrow filtering neck under the funnel */}
      <mesh castShadow receiveShadow position={[0, neckY, 0]}>
        <cylinderGeometry args={[bottomR * 0.85, bottomR * 0.7, 0.14, 8]} />
        {createMaterial(PALETTE.hopperStoneDark, 'stone')}
      </mesh>
      <mesh castShadow receiveShadow position={[0, neckY - 0.09, 0]}>
        <cylinderGeometry args={[bottomR * 0.55, bottomR * 0.42, 0.06, 8]} />
        {createMaterial(PALETTE.hopperStoneLight, 'stone')}
      </mesh>
    </group>
  );
};
