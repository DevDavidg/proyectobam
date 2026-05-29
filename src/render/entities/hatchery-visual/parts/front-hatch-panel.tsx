import type { ReactElement } from 'react';
import { getBoxGeometry, getCylinderGeometry, getSphereGeometry, getTorusGeometry } from '../../building-visual/geometry-cache';
import { DOME_FRONT_Z, PANEL_RIVET_OFFSETS } from '../constants';
import { HATCHERY_PALETTE } from '../palette';

type MaterialToken = 'gold' | 'iron' | 'wood' | 'goo' | 'stone';

type FrontHatchPanelProps = {
  createMaterial: (fallbackColor: string, token: MaterialToken) => ReactElement;
};

export const FrontHatchPanel = ({ createMaterial }: FrontHatchPanelProps) => (
  <group position={[0, 0.46, DOME_FRONT_Z]} rotation={[-0.28, 0, 0]}>
    <mesh castShadow receiveShadow>
      <primitive attach="geometry" object={getBoxGeometry(0.62, 0.52, 0.075)} />
      {createMaterial(HATCHERY_PALETTE.bronze, 'gold')}
    </mesh>
    <mesh castShadow receiveShadow position={[0, 0, 0.034]}>
      <primitive attach="geometry" object={getBoxGeometry(0.5, 0.4, 0.04)} />
      <meshStandardMaterial color={HATCHERY_PALETTE.domeSilver} roughness={0.42} metalness={0.58} />
    </mesh>
    <mesh castShadow receiveShadow position={[0, 0, 0.058]} rotation={[Math.PI / 2, 0, 0]}>
      <primitive attach="geometry" object={getCylinderGeometry(0.095, 0.095, 0.05, 28)} />
      <meshStandardMaterial color={HATCHERY_PALETTE.visorVoid} roughness={0.35} metalness={0.65} />
    </mesh>
    <mesh castShadow receiveShadow position={[0, 0, 0.072]} rotation={[Math.PI / 2, 0, 0]}>
      <primitive attach="geometry" object={getTorusGeometry(0.095, 0.022, 12, 28)} />
      {createMaterial(HATCHERY_PALETTE.bronzeLight, 'gold')}
    </mesh>
    {PANEL_RIVET_OFFSETS.map((rivet, index) => (
      <mesh key={`hatch-rivet-${index}`} castShadow receiveShadow position={[rivet[0], rivet[1], 0.048]}>
        <primitive attach="geometry" object={getSphereGeometry(0.034, 14, 14)} />
        {createMaterial(HATCHERY_PALETTE.bronzeLight, 'gold')}
      </mesh>
    ))}
  </group>
);
