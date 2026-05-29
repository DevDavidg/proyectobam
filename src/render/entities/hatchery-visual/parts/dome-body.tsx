import type { RefObject } from 'react';
import {
  getBoxGeometry,
  getCylinderGeometry,
  getSphereGeometry,
  getTorusGeometry,
} from '../../building-visual/geometry-cache';
import { DOME_METAL, HATCHERY_PALETTE } from '../palette';
import {
  DOME_CENTER_Y,
  DOME_HORIZONTAL_SEAM_HEIGHTS,
  DOME_LATERAL_STEP_X,
  DOME_PANEL_SEAMS,
  DOME_RADIUS,
  DOME_SQUASH_Y,
  TOP_HOLE_THETA,
} from '../constants';

type DomeBodyProps = {
  domeRef: RefObject<import('three').Mesh | null>;
  bronzeBandRef: RefObject<import('three').Mesh | null>;
};

export const DomeBody = ({ domeRef, bronzeBandRef }: DomeBodyProps) => {
  const domeY = DOME_CENTER_Y / DOME_SQUASH_Y;

  return (
    <>
      <mesh castShadow receiveShadow position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <primitive attach="geometry" object={getCylinderGeometry(1.06, 1.1, 0.028, 36)} />
        <meshStandardMaterial color={HATCHERY_PALETTE.foundation} roughness={0.9} metalness={0.08} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <primitive attach="geometry" object={getCylinderGeometry(1.09, 1.09, 0.05, 36)} />
        <meshStandardMaterial color={HATCHERY_PALETTE.foundation} roughness={0.94} metalness={0.08} />
      </mesh>

      <mesh
        ref={bronzeBandRef}
        castShadow
        receiveShadow
        position={[0, 0.13, 0]}
      >
        <primitive attach="geometry" object={getCylinderGeometry(0.99, 1.04, 0.22, 40)} />
        <meshStandardMaterial color={HATCHERY_PALETTE.bronze} roughness={0.35} metalness={0.8} />
      </mesh>

      <group scale={[1, DOME_SQUASH_Y, 1]} position={[0, DOME_CENTER_Y - DOME_CENTER_Y * DOME_SQUASH_Y + 0.04, 0]}>
        <mesh ref={domeRef} castShadow receiveShadow position={[0, domeY, 0]}>
          <primitive
            attach="geometry"
            object={getSphereGeometry(DOME_RADIUS, 48, 32, 0, Math.PI * 2, TOP_HOLE_THETA, Math.PI * 0.58)}
          />
          <meshStandardMaterial
            color={HATCHERY_PALETTE.domeSilver}
            roughness={DOME_METAL.roughness}
            metalness={DOME_METAL.metalness}
            envMapIntensity={DOME_METAL.envMapIntensity}
          />
        </mesh>

        {Array.from({ length: DOME_PANEL_SEAMS }).map((_, index) => {
          const angle = (index / DOME_PANEL_SEAMS) * Math.PI * 2;
          const radius = DOME_RADIUS * 0.905;
          return (
            <mesh
              key={`dome-seam-v-${index}`}
              castShadow
              position={[Math.sin(angle) * radius, domeY, Math.cos(angle) * radius]}
              rotation={[0, angle, 0]}
            >
              <primitive attach="geometry" object={getBoxGeometry(0.02, 0.64, 0.034)} />
              <meshStandardMaterial color={HATCHERY_PALETTE.panelSeam} roughness={0.72} metalness={0.32} />
            </mesh>
          );
        })}

        {Array.from({ length: DOME_PANEL_SEAMS * 2 }).map((_, index) => {
          const angle = (index / (DOME_PANEL_SEAMS * 2)) * Math.PI * 2;
          const radius = DOME_RADIUS * 0.89;
          const y = domeY - 0.19;
          return (
            <mesh key={`dome-rivet-a-${index}`} castShadow position={[Math.sin(angle) * radius, y, Math.cos(angle) * radius]}>
              <primitive attach="geometry" object={getSphereGeometry(0.018, 8, 8)} />
              <meshStandardMaterial color={HATCHERY_PALETTE.rivetShadow} roughness={0.62} metalness={0.54} />
            </mesh>
          );
        })}
        {Array.from({ length: DOME_PANEL_SEAMS * 2 + 2 }).map((_, index) => {
          const angle = (index / (DOME_PANEL_SEAMS * 2 + 2)) * Math.PI * 2 + 0.08;
          const radius = DOME_RADIUS * 0.86;
          const y = domeY + 0.02;
          return (
            <mesh key={`dome-rivet-b-${index}`} castShadow position={[Math.sin(angle) * radius, y, Math.cos(angle) * radius]}>
              <primitive attach="geometry" object={getSphereGeometry(0.016, 8, 8)} />
              <meshStandardMaterial color={HATCHERY_PALETTE.rivetShine} roughness={0.55} metalness={0.62} />
            </mesh>
          );
        })}

        {DOME_HORIZONTAL_SEAM_HEIGHTS.map((height) => {
          const normalized = Math.abs((height - domeY) / DOME_RADIUS);
          const ringRadius = DOME_RADIUS * Math.cos(normalized * 1.1) * 0.9;
          if (!Number.isFinite(ringRadius) || ringRadius < 0.25) {
            return null;
          }
          return (
            <mesh key={`dome-seam-h-${height}`} castShadow position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <primitive attach="geometry" object={getTorusGeometry(ringRadius, 0.012, 8, 40)} />
              <meshStandardMaterial color={HATCHERY_PALETTE.panelSeam} roughness={0.78} metalness={0.22} />
            </mesh>
          );
        })}

        <mesh castShadow position={[DOME_RADIUS * DOME_LATERAL_STEP_X, domeY + 0.02, 0.02]} rotation={[0, -0.12, 0.08]}>
          <primitive attach="geometry" object={getBoxGeometry(0.14, 0.38, 0.36)} />
          <meshStandardMaterial color={HATCHERY_PALETTE.domeShadow} roughness={0.7} metalness={0.32} />
        </mesh>
        <mesh castShadow position={[DOME_RADIUS * (DOME_LATERAL_STEP_X - 0.06), domeY - 0.04, 0.04]}>
          <primitive attach="geometry" object={getBoxGeometry(0.08, 0.22, 0.28)} />
          <meshStandardMaterial color={HATCHERY_PALETTE.panelSeam} roughness={0.75} metalness={0.28} />
        </mesh>

        <mesh position={[0, 0.14, 0]} scale={[1.04, 0.12, 1.04]}>
          <primitive attach="geometry" object={getCylinderGeometry(0.94, 1.02, 1, 32)} />
          <meshStandardMaterial
            color={HATCHERY_PALETTE.grime}
            roughness={1}
            metalness={0}
            transparent
            opacity={0.42}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0.165, 0]} scale={[1.02, 0.08, 1.02]}>
          <primitive attach="geometry" object={getCylinderGeometry(0.88, 0.98, 1, 30)} />
          <meshStandardMaterial
            color="#2f2419"
            roughness={1}
            metalness={0}
            transparent
            opacity={0.24}
            depthWrite={false}
          />
        </mesh>
      </group>
    </>
  );
};
