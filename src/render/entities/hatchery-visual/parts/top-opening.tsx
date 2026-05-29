import { getCylinderGeometry } from '../../building-visual/geometry-cache';
import { HATCHERY_PALETTE } from '../palette';
import { OPENING_RADIUS, OPENING_Y } from '../constants';

export const TopOpening = () => (
  <group position={[0, OPENING_Y, 0]}>
    <mesh castShadow receiveShadow position={[0, -0.08, 0]}>
      <primitive
        attach="geometry"
        object={getCylinderGeometry(OPENING_RADIUS + 0.16, OPENING_RADIUS + 0.22, 0.16, 32)}
      />
      <meshStandardMaterial color={HATCHERY_PALETTE.domeSilver} roughness={0.68} metalness={0.42} />
    </mesh>
    <mesh castShadow receiveShadow position={[0, -0.01, 0]}>
      <primitive
        attach="geometry"
        object={getCylinderGeometry(OPENING_RADIUS + 0.1, OPENING_RADIUS + 0.14, 0.1, 32)}
      />
      <meshStandardMaterial color={HATCHERY_PALETTE.bronze} roughness={0.58} metalness={0.48} />
    </mesh>
    <mesh castShadow position={[0, -0.18, 0]}>
      <primitive
        attach="geometry"
        object={getCylinderGeometry(OPENING_RADIUS * 0.92, OPENING_RADIUS * 0.28, 0.44, 28)}
      />
      <meshStandardMaterial color={HATCHERY_PALETTE.domeShadow} roughness={0.86} metalness={0.14} />
    </mesh>
    <mesh position={[0, -0.39, 0]}>
      <primitive
        attach="geometry"
        object={getCylinderGeometry(OPENING_RADIUS * 0.36, OPENING_RADIUS * 0.1, 0.2, 24)}
      />
      <meshStandardMaterial color={HATCHERY_PALETTE.visorVoid} roughness={1} metalness={0} />
    </mesh>
  </group>
);
