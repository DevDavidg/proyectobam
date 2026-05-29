import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Color, type Group, type Mesh, type MeshToonMaterial } from 'three';
import { OPENING_Y } from './constants';
import { HATCHERY_PALETTE } from './palette';
import { DomeBody } from './parts/dome-body';
import { FrontHatchPanel } from './parts/front-hatch-panel';
import { GroundGear } from './parts/ground-gear';
import { InternalWoodBlocks } from './parts/internal-gears';
import { TopOpening } from './parts/top-opening';

type HatcheryVisualProps = {
  level: number;
  footprintX: number;
  footprintZ: number;
  hatcheryBusy: boolean;
};

const RED_HEAT_COLOR = new Color('#c86a48');
const BASE_DOME_COLOR = new Color(HATCHERY_PALETTE.domeSilver);
const HOT_DOME_COLOR = new Color('#d8c4b0');
const tempColor = new Color();

export const HatcheryVisual = ({ footprintX, footprintZ, hatcheryBusy }: HatcheryVisualProps) => {
  const largeGearRef = useRef<Group | null>(null);
  const smallGearRef = useRef<Group | null>(null);
  const internalBlocksRef = useRef<Group | null>(null);
  const domeRef = useRef<Mesh | null>(null);
  const bronzeBandRef = useRef<Mesh | null>(null);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const gearSpeed = hatcheryBusy ? 1.6 : 0.08;
    const internalSpeed = hatcheryBusy ? 0.35 : 0.04;

    if (largeGearRef.current) {
      largeGearRef.current.rotation.z += delta * gearSpeed;
    }
    if (smallGearRef.current) {
      smallGearRef.current.rotation.z -= delta * (gearSpeed * 1.15);
    }
    if (internalBlocksRef.current) {
      internalBlocksRef.current.rotation.y += delta * internalSpeed;
    }

    if (bronzeBandRef.current) {
      const bandMaterial = bronzeBandRef.current.material as MeshToonMaterial;
      if (hatcheryBusy) {
        const heatPulse = 0.12 + Math.sin(elapsed * 5.8) * 0.06;
        bandMaterial.emissive.copy(RED_HEAT_COLOR).multiplyScalar(0.28);
        bandMaterial.emissiveIntensity = Math.max(0, heatPulse);
      } else {
        bandMaterial.emissiveIntensity = 0;
      }
    }

    if (domeRef.current) {
      const domeMaterial = domeRef.current.material as import('three').MeshStandardMaterial;
      const targetColor = hatcheryBusy ? tempColor.copy(BASE_DOME_COLOR).lerp(HOT_DOME_COLOR, 0.22) : BASE_DOME_COLOR;
      domeMaterial.color.lerp(targetColor, Math.min(1, delta * 2.5));
      domeMaterial.emissiveIntensity = 0;
      domeMaterial.emissive.set('#000000');
    }
  });

  const largestFootprint = Math.max(footprintX, footprintZ);
  const gearAnchorX = largestFootprint * 0.39;
  const gearAnchorZ = largestFootprint * 0.29;

  return (
    <group>
      <DomeBody domeRef={domeRef} bronzeBandRef={bronzeBandRef} />
      <TopOpening />
      <InternalWoodBlocks openingY={OPENING_Y} blocksRef={internalBlocksRef} />
      <FrontHatchPanel />
      <GroundGear
        radius={0.2}
        toothCount={12}
        position={[gearAnchorX, 0.012, gearAnchorZ]}
        spinRef={largeGearRef}
      />
      <GroundGear
        radius={0.1}
        toothCount={10}
        position={[gearAnchorX + 0.14, 0.018, gearAnchorZ - 0.09]}
        spinRef={smallGearRef}
      />
    </group>
  );
};
