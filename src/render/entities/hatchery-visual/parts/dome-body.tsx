import type { RefObject } from 'react';
import type { Material } from 'three';
import { getBoxGeometry, getCylinderGeometry, getSphereGeometry } from '../../building-visual/geometry-cache';
import { HATCHERY_PALETTE } from '../palette';
import {
  DOME_CENTER_Y,
  DOME_PANEL_SEAMS,
  DOME_RADIUS,
  DOME_RIVET_RINGS,
  DOME_SQUASH_Y,
  TOP_HOLE_THETA,
} from '../constants';

type DomeBodyProps = {
  domeRef: RefObject<import('three').Mesh | null>;
  bronzeBandRef: RefObject<import('three').Mesh | null>;
  createMaterial: (fallbackColor: string, token: 'gold' | 'iron' | 'wood' | 'goo' | 'stone') => Material;
};

export const DomeBody = ({ domeRef, bronzeBandRef, createMaterial }: DomeBodyProps) => (
  <>
    <mesh castShadow receiveShadow position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <primitive attach="geometry" object={getCylinderGeometry(1.04, 1.08, 0.035, 36)} />
      <meshStandardMaterial color={HATCHERY_PALETTE.foundation} roughness={0.85} metalness={0.15} />
    </mesh>

    <mesh ref={bronzeBandRef} castShadow receiveShadow position={[0, 0.13, 0]}>
      <primitive attach="geometry" object={getCylinderGeometry(0.98, 1.06, 0.24, 40)} /></mesh>

    <group scale={[1, DOME_SQUASH_Y, 1]} position={[0, DOME_CENTER_Y - DOME_CENTER_Y * DOME_SQUASH_Y + 0.04, 0]}>
      <mesh ref={domeRef} castShadow receiveShadow position={[0, DOME_CENTER_Y / DOME_SQUASH_Y, 0]}>
        <primitive
          attach="geometry"
          object={getSphereGeometry(DOME_RADIUS, 44, 30, 0, Math.PI * 2, TOP_HOLE_THETA, Math.PI * 0.58)}
        />
        <meshStandardMaterial
          color={HATCHERY_PALETTE.domeSilver}
          roughness={0.34}
          metalness={0.72}
          envMapIntensity={0.85}
        />
      </mesh>

      {Array.from({ length: DOME_PANEL_SEAMS }).map((_, index) => {
        const angle = (index / DOME_PANEL_SEAMS) * Math.PI * 2;
        const radius = DOME_RADIUS * 0.91;
        const y = DOME_CENTER_Y / DOME_SQUASH_Y;
        return (
          <mesh
            key={`dome-seam-${index}`}
            castShadow
            position={[Math.sin(angle) * radius, y, Math.cos(angle) * radius]}
            rotation={[0, angle, 0]}
          >
            <primitive attach="geometry" object={getBoxGeometry(0.014, 0.62, 0.028)} />
            <meshStandardMaterial color={HATCHERY_PALETTE.panelSeam} roughness={0.48} metalness={0.55} />
          </mesh>
        );
      })}

      {DOME_RIVET_RINGS.flatMap((ring, ringIndex) =>
        Array.from({ length: ring.count }).map((_, index) => {
          const angle = (index / ring.count) * Math.PI * 2 + ringIndex * 0.2;
          const radius = DOME_RADIUS * ring.radiusScale;
          const y = ring.y / DOME_SQUASH_Y;
          return (
            <mesh
              key={`dome-rivet-${ringIndex}-${index}`}
              castShadow
              position={[Math.sin(angle) * radius, y, Math.cos(angle) * radius]}
            >
              <primitive attach="geometry" object={getSphereGeometry(0.016, 8, 8)} />
              <meshStandardMaterial color={HATCHERY_PALETTE.rivetShine} roughness={0.35} metalness={0.8} />
            </mesh>
          );
        }),
      )}
    </group>
  </>
);
