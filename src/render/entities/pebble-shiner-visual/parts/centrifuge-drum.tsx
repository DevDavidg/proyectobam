import type { Ref } from 'react';
import { useMemo } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { MaterialFactory } from '../types';

type CentrifugeDrumProps = {
  centerX: number;
  centerY: number;
  centerZ: number;
  length: number;
  radius: number;
  drumRef: Ref<Group>;
  createMaterial: MaterialFactory;
};

const RING_COUNT = 6;
const AXIAL_BAR_COUNT = 22;
const INTERNAL_PEBBLE_COUNT = 9;

const PEBBLE_TONES = [
  PALETTE.drumInteriorPebble,
  PALETTE.pebbleWarm,
  PALETTE.pebbleCool,
  PALETTE.pebbleDark,
  PALETTE.pebbleHighlight,
];

export const CentrifugeDrum = ({
  centerX,
  centerY,
  centerZ,
  length,
  radius,
  drumRef,
  createMaterial,
}: CentrifugeDrumProps) => {
  const ringOffsets = useMemo(
    () =>
      Array.from({ length: RING_COUNT }, (_, index) => {
        const t = index / (RING_COUNT - 1);
        return (t - 0.5) * (length * 0.9);
      }),
    [length],
  );

  const axialBars = useMemo(
    () =>
      Array.from({ length: AXIAL_BAR_COUNT }, (_, index) => ({
        id: `bar-${index}`,
        angle: (index / AXIAL_BAR_COUNT) * Math.PI * 2,
      })),
    [],
  );

  const internalPebbles = useMemo(() => {
    let seed = 9.13 + centerX * 3.7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: INTERNAL_PEBBLE_COUNT }, (_, index) => ({
      id: `pebble-${index}`,
      x: (rand() - 0.5) * length * 0.72,
      angle: rand() * Math.PI * 2,
      r: radius * (0.4 + rand() * 0.4),
      size: 0.05 + rand() * 0.045,
      rotation: rand() * Math.PI,
      tone: PEBBLE_TONES[Math.floor(rand() * PEBBLE_TONES.length)] ?? PALETTE.drumInteriorPebble,
    }));
  }, [length, radius, centerX]);

  return (
    <group position={[centerX, centerY, centerZ]}>
      <group ref={drumRef}>
        {/* Interior stones being polished — visible through the mesh */}
        {internalPebbles.map((pebble) => (
          <mesh
            key={pebble.id}
            castShadow
            receiveShadow
            position={[
              pebble.x,
              Math.cos(pebble.angle) * pebble.r,
              Math.sin(pebble.angle) * pebble.r,
            ]}
            rotation={[pebble.rotation, pebble.rotation * 0.7, 0]}
          >
            <icosahedronGeometry args={[pebble.size, 0]} />
            {createMaterial(pebble.tone, 'stone')}
          </mesh>
        ))}

        {/* Faint translucent mesh shell so the cage reads as a perforated cylinder */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[radius, radius, length * 0.92, 28, 1, true]} />
          <meshToonMaterial
            color={PALETTE.drumMesh}
            transparent
            opacity={0.28}
            depthWrite={false}
          />
        </mesh>

        {/* Mesh ring hoops along the barrel */}
        {ringOffsets.map((offset, index) => (
          <mesh
            key={`ring-${index}`}
            castShadow
            receiveShadow
            position={[offset, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <torusGeometry args={[radius + 0.004, 0.012, 8, 32]} />
            {createMaterial(PALETTE.drumMeshHighlight, 'iron')}
          </mesh>
        ))}

        {/* Axial mesh bars forming the perforated cage */}
        {axialBars.map((bar) => (
          <mesh
            key={bar.id}
            castShadow
            receiveShadow
            position={[
              0,
              Math.cos(bar.angle) * (radius + 0.001),
              Math.sin(bar.angle) * (radius + 0.001),
            ]}
          >
            <boxGeometry args={[length * 0.9, 0.011, 0.011]} />
            {createMaterial(PALETTE.drumMeshShadow, 'iron')}
          </mesh>
        ))}

        {/* Solid metal end caps (drum heads) */}
        <mesh
          castShadow
          receiveShadow
          position={[length / 2 + 0.005, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[radius + 0.03, radius + 0.03, 0.07, 28]} />
          {createMaterial(PALETTE.drumEndCap, 'iron')}
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[length / 2 + 0.042, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[radius + 0.022, radius + 0.022, 0.015, 28]} />
          {createMaterial(PALETTE.drumEndCapHighlight, 'iron')}
        </mesh>

        <mesh
          castShadow
          receiveShadow
          position={[-length / 2 - 0.005, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[radius + 0.03, radius + 0.03, 0.07, 28]} />
          {createMaterial(PALETTE.drumEndCap, 'iron')}
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[-length / 2 - 0.042, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[radius + 0.022, radius + 0.022, 0.015, 28]} />
          {createMaterial(PALETTE.drumEndCapHighlight, 'iron')}
        </mesh>

        {/* Hub bolts on the end caps that spin with the drum */}
        <mesh castShadow receiveShadow position={[length / 2 + 0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[radius * 0.34, radius * 0.34, 0.04, 16]} />
          {createMaterial(PALETTE.drumEndCapShadow, 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[-length / 2 - 0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[radius * 0.34, radius * 0.34, 0.04, 16]} />
          {createMaterial(PALETTE.drumEndCapShadow, 'iron')}
        </mesh>
      </group>
    </group>
  );
};
