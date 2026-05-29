import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Color, type Group, type Material, type Mesh, type MeshToonMaterial } from 'three';
import { getCylinderGeometry, getTorusGeometry } from '../building-visual/geometry-cache';
import { OPENING_RADIUS, OPENING_Y } from './constants';
import { HATCHERY_PALETTE } from './palette';
import { DomeBody } from './parts/dome-body';
import { FrontHatchPanel } from './parts/front-hatch-panel';
import { GroundGear } from './parts/ground-gear';
import { InternalGears } from './parts/internal-gears';

type MaterialToken = 'gold' | 'iron' | 'wood' | 'goo' | 'stone';

type HatcheryVisualProps = {
  level: number;
  footprintX: number;
  footprintZ: number;
  hatcheryBusy: boolean;
  createMaterial: (fallbackColor: string, token: MaterialToken) => Material;
};

const RED_HEAT_COLOR = new Color('#ff5a32');
const BASE_DOME_COLOR = new Color(HATCHERY_PALETTE.domeSilver);
const HOT_DOME_COLOR = new Color('#ead8cf');
const tempColor = new Color();

export const HatcheryVisual = ({ footprintX, footprintZ, hatcheryBusy, createMaterial }: HatcheryVisualProps) => {
  const largeGearRef = useRef<Group | null>(null);
  const smallGearRef = useRef<Group | null>(null);
  const internalGearsRef = useRef<Group | null>(null);
  const domeRef = useRef<Mesh | null>(null);
  const bronzeBandRef = useRef<Mesh | null>(null);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const gearSpeed = hatcheryBusy ? 2.4 : 0.2;
    const internalSpeed = hatcheryBusy ? 2.8 : 0.12;

    if (largeGearRef.current) {
      largeGearRef.current.rotation.y += delta * gearSpeed;
    }
    if (smallGearRef.current) {
      smallGearRef.current.rotation.y -= delta * (gearSpeed * 1.2);
    }
    if (internalGearsRef.current) {
      internalGearsRef.current.rotation.y += delta * internalSpeed;
    }

    if (bronzeBandRef.current) {
      const bandMaterial = bronzeBandRef.current.material as MeshToonMaterial;
      if (hatcheryBusy) {
        const heatPulse = 0.18 + Math.sin(elapsed * 5.8) * 0.1;
        bandMaterial.emissive.copy(RED_HEAT_COLOR).multiplyScalar(0.45);
        bandMaterial.emissiveIntensity = Math.max(0, heatPulse);
      } else {
        bandMaterial.emissiveIntensity = 0;
      }
    }

    if (domeRef.current) {
      const domeMaterial = domeRef.current.material as import('three').MeshStandardMaterial;
      const targetColor = hatcheryBusy ? tempColor.copy(BASE_DOME_COLOR).lerp(HOT_DOME_COLOR, 0.35) : BASE_DOME_COLOR;
      domeMaterial.color.lerp(targetColor, Math.min(1, delta * 3));
      domeMaterial.emissiveIntensity = hatcheryBusy ? 0.06 + Math.sin(elapsed * 4.2) * 0.03 : 0;
      if (hatcheryBusy) {
        domeMaterial.emissive.copy(RED_HEAT_COLOR).multiplyScalar(0.08);
      }
    }
  });

  const largestFootprint = Math.max(footprintX, footprintZ);
  const gearFieldX = Math.max(1.05, largestFootprint * 0.44);

  return (
    <group>
      <DomeBody domeRef={domeRef} bronzeBandRef={bronzeBandRef} createMaterial={createMaterial} />

      <mesh position={[0, OPENING_Y - 0.38, 0]}>
        <primitive attach="geometry" object={getCylinderGeometry(OPENING_RADIUS + 0.05, OPENING_RADIUS + 0.1, 0.48, 28)} />
        <meshStandardMaterial color={HATCHERY_PALETTE.foundation} roughness={0.88} metalness={0.12} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, OPENING_Y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <primitive attach="geometry" object={getTorusGeometry(OPENING_RADIUS, 0.05, 16, 40)} /></mesh>

      <InternalGears openingY={OPENING_Y} gearsRef={internalGearsRef} />

      <FrontHatchPanel createMaterial={createMaterial} />

      <GroundGear radius={0.22} toothCount={10} position={[gearFieldX, 0.03, 0.1]} spinRef={largeGearRef} />
      <GroundGear radius={0.14} toothCount={8} position={[gearFieldX + 0.36, 0.025, -0.14]} spinRef={smallGearRef} />
    </group>
  );
};
