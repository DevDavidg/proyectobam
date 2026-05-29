import { getBoxGeometry, getCylinderGeometry, getTorusGeometry } from '../../building-visual/geometry-cache';
import {
  HATCH_PANEL_POSITION,
  HATCH_PANEL_ROTATION,
  PANEL_RIVET_OFFSETS,
} from '../constants';
import { HATCHERY_PALETTE } from '../palette';

export const FrontHatchPanel = () => (
  <group position={HATCH_PANEL_POSITION} rotation={HATCH_PANEL_ROTATION}>
    <mesh castShadow receiveShadow position={[0, 0, 0.008]}>
      <primitive attach="geometry" object={getBoxGeometry(0.66, 0.5, 0.075)} />
      <meshStandardMaterial color={HATCHERY_PALETTE.domeSilver} roughness={0.62} metalness={0.52} />
    </mesh>
    <mesh castShadow receiveShadow position={[0, 0, 0.048]}>
      <primitive attach="geometry" object={getBoxGeometry(0.72, 0.56, 0.02)} />
      <meshStandardMaterial color={HATCHERY_PALETTE.bronzeDark} roughness={0.46} metalness={0.72} />
    </mesh>
    <mesh castShadow receiveShadow position={[0, 0, 0.06]}>
      <primitive attach="geometry" object={getBoxGeometry(0.63, 0.47, 0.018)} />
      <meshStandardMaterial color={HATCHERY_PALETTE.bronzeLight} roughness={0.42} metalness={0.76} />
    </mesh>

    <mesh castShadow receiveShadow position={[0, 0, 0.078]} rotation={[Math.PI / 2, 0, 0]}>
      <primitive attach="geometry" object={getCylinderGeometry(0.112, 0.112, 0.058, 32)} />
      <meshStandardMaterial color={HATCHERY_PALETTE.visorVoid} roughness={0.96} metalness={0.08} />
    </mesh>
    <mesh castShadow receiveShadow position={[0, 0, 0.092]} rotation={[Math.PI / 2, 0, 0]}>
      <primitive attach="geometry" object={getTorusGeometry(0.112, 0.016, 12, 32)} />
      <meshStandardMaterial color={HATCHERY_PALETTE.bronze} roughness={0.58} metalness={0.5} />
    </mesh>

    {PANEL_RIVET_OFFSETS.map((rivet, index) => (
      <mesh
        key={`hatch-rivet-${index}`}
        castShadow
        receiveShadow
        position={[rivet[0], rivet[1], 0.061]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <primitive attach="geometry" object={getCylinderGeometry(0.028, 0.028, 0.018, 12)} />
        <meshStandardMaterial color={HATCHERY_PALETTE.rivetShine} roughness={0.52} metalness={0.68} />
      </mesh>
    ))}
    {PANEL_RIVET_OFFSETS.map((rivet, index) => (
      <mesh key={`hatch-rust-${index}`} position={[rivet[0] * 0.92, rivet[1] * 0.92, 0.045]}>
        <primitive attach="geometry" object={getCylinderGeometry(0.018, 0.018, 0.004, 10)} />
        <meshStandardMaterial color="#4f3822" roughness={0.96} metalness={0.04} transparent opacity={0.42} />
      </mesh>
    ))}
  </group>
);
