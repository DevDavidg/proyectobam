import type { Ref } from 'react';
import { useMemo } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { MaterialFactory, PuttySquisherDimensions } from '../types';

type ScrewMechanismProps = {
  dim: PuttySquisherDimensions;
  createMaterial: MaterialFactory;
  rootRef?: Ref<Group>;
  assemblyRef: Ref<Group>;
};

const WING_NUT_SPOKES = 6;
const THREAD_RING_COUNT = 8;

export const ScrewMechanism = ({
  dim,
  createMaterial,
  rootRef,
  assemblyRef,
}: ScrewMechanismProps) => {
  const {
    cubeTopY,
    screwShaftRadius,
    screwShaftLength,
    wingNutRadius,
    wingNutThickness,
    wingNutY,
  } = dim;

  const spokes = useMemo(
    () =>
      Array.from({ length: WING_NUT_SPOKES }, (_, index) => ({
        id: `wing-spoke-${index}`,
        rotation: (index / WING_NUT_SPOKES) * Math.PI * 2,
      })),
    [],
  );

  const threadRings = useMemo(
    () =>
      Array.from({ length: THREAD_RING_COUNT }, (_, index) => ({
        id: `thread-${index}`,
        offsetY: (index / (THREAD_RING_COUNT - 1)) * (screwShaftLength * 0.92) - screwShaftLength * 0.46,
      })),
    [screwShaftLength],
  );

  const screwBaseY = cubeTopY - 0.005;
  const screwCenterY = screwBaseY + screwShaftLength * 0.5;

  return (
    <group ref={rootRef}>
      {/* Whole rotating + bobbing assembly: shaft + threads + wing nut */}
      <group ref={assemblyRef} position={[0, 0, 0]}>
        <mesh castShadow receiveShadow position={[0, screwCenterY, 0]} material={createMaterial(PALETTE.screwShaft, 'iron')}>
          <cylinderGeometry args={[screwShaftRadius, screwShaftRadius, screwShaftLength, 18]} /></mesh>
        <mesh castShadow receiveShadow position={[0, screwCenterY, 0]} material={createMaterial(PALETTE.screwShaftThread, 'iron')}>
          <cylinderGeometry
            args={[screwShaftRadius * 0.55, screwShaftRadius * 0.55, screwShaftLength + 0.01, 12]}
          /></mesh>
        {threadRings.map((ring) => (
          <mesh
            key={ring.id}
            castShadow
            receiveShadow
            position={[0, screwCenterY + ring.offsetY, 0]}
            rotation={[Math.PI / 2, 0, 0]}
           material={createMaterial(PALETTE.screwShaftThread, 'iron')}>
            <torusGeometry args={[screwShaftRadius * 1.05, screwShaftRadius * 0.18, 6, 14]} /></mesh>
        ))}
        <mesh castShadow receiveShadow position={[0, screwBaseY + 0.005, 0]} material={createMaterial(PALETTE.screwTip, 'iron')}>
          <cylinderGeometry args={[screwShaftRadius * 1.35, screwShaftRadius * 1.35, 0.018, 18]} /></mesh>

        <group position={[0, wingNutY, 0]}>
          <mesh castShadow receiveShadow material={createMaterial(PALETTE.wingNutBolt, 'iron')}>
            <cylinderGeometry
              args={[wingNutRadius * 0.32, wingNutRadius * 0.32, wingNutThickness * 1.2, 14]}
            /></mesh>
          {spokes.map((spoke) => (
            <group key={spoke.id} rotation={[0, spoke.rotation, 0]}>
              <mesh castShadow receiveShadow position={[wingNutRadius * 0.62, 0, 0]} material={createMaterial(PALETTE.wingNutBody, 'iron')}>
                <boxGeometry args={[wingNutRadius * 1.1, wingNutThickness, wingNutRadius * 0.4]} /></mesh>
              <mesh
                castShadow
                receiveShadow
                position={[wingNutRadius * 1.05, wingNutThickness * 0.4, 0]}
               material={createMaterial(PALETTE.wingNutShine, 'iron')}>
                <boxGeometry args={[wingNutRadius * 0.3, wingNutThickness * 0.18, wingNutRadius * 0.36]} /></mesh>
              <mesh castShadow receiveShadow position={[wingNutRadius * 1.1, 0, 0]} material={createMaterial(PALETTE.wingNutEdge, 'iron')}>
                <boxGeometry args={[wingNutThickness * 0.4, wingNutThickness * 0.92, wingNutRadius * 0.42]} /></mesh>
            </group>
          ))}
          <mesh castShadow receiveShadow position={[0, wingNutThickness * 0.55, 0]} material={createMaterial(PALETTE.wingNutBolt, 'iron')}>
            <cylinderGeometry
              args={[wingNutRadius * 0.18, wingNutRadius * 0.22, wingNutThickness * 0.4, 12]}
            /></mesh>
          <mesh castShadow receiveShadow position={[0, wingNutThickness * 0.78, 0]} material={createMaterial(PALETTE.wingNutShine, 'iron')}>
            <cylinderGeometry
              args={[wingNutRadius * 0.14, wingNutRadius * 0.14, wingNutThickness * 0.18, 10]}
            /></mesh>
        </group>
      </group>
    </group>
  );
};
