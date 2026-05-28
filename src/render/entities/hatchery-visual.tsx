import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { ReactElement } from 'react';
import { Color, type Group, type Mesh, type MeshStandardMaterial } from 'three';
import { FluidFlowPipe } from '../fx/fluid-flow-pipe';
import { LowPolyParticles } from '../fx/low-poly-particles';
import {
  getBoxGeometry,
  getCircleGeometry,
  getConeGeometry,
  getCylinderGeometry,
  getSphereGeometry,
  getTorusGeometry,
} from './building-visual/geometry-cache';
import {
  HATCHERY_ARM_AXIS,
  HATCHERY_ARM_QUATERNION,
  HATCHERY_LEG_POSITIONS,
  HATCHERY_RIVET_POSITIONS,
  HATCHERY_ROTOR_AXIS,
  HATCHERY_ROTATION_QUATERNION,
} from './building-visual/hatchery.constants';
import { HATCHERY_GAUGE_TEXTURE } from './building-visual/materials';

type MaterialToken = 'gold' | 'iron' | 'wood' | 'goo' | 'stone';

type HatcheryVisualProps = {
  level: number;
  footprintX: number;
  footprintZ: number;
  hatcheryBusy: boolean;
  createMaterial: (fallbackColor: string, token: MaterialToken) => ReactElement;
};

const RED_HEAT_COLOR = new Color('#ff4b2a');
const BASE_DOME_COLOR = new Color('#cfd7e0');
const tempColor = new Color();

export const HatcheryVisual = ({
  level,
  footprintX,
  footprintZ,
  hatcheryBusy,
  createMaterial,
}: HatcheryVisualProps) => {
  const armRef = useRef<Group | null>(null);
  const rotorRef = useRef<Group | null>(null);
  const pulseRef = useRef<Group | null>(null);
  const topPanelRef = useRef<Group | null>(null);
  const innerCreatureRef = useRef<Mesh | null>(null);
  const baseRingRef = useRef<Mesh | null>(null);
  const domeRef = useRef<Mesh | null>(null);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const speedMultiplier = hatcheryBusy ? 3.8 : 1.2;
    if (rotorRef.current) {
      HATCHERY_ROTATION_QUATERNION.setFromAxisAngle(HATCHERY_ROTOR_AXIS, speedMultiplier * delta);
      rotorRef.current.quaternion.multiply(HATCHERY_ROTATION_QUATERNION);
    }
    if (armRef.current) {
      const targetAngle = Math.sin(elapsed * (hatcheryBusy ? 3.1 : 1.8)) * (hatcheryBusy ? 0.22 : 0.08);
      HATCHERY_ARM_QUATERNION.setFromAxisAngle(HATCHERY_ARM_AXIS, targetAngle);
      armRef.current.quaternion.slerp(HATCHERY_ARM_QUATERNION, Math.min(1, delta * 10));
    }
    if (pulseRef.current) {
      const pulse = hatcheryBusy ? 1 + Math.sin(elapsed * 7) * 0.08 : 1 + Math.sin(elapsed * 2.2) * 0.025;
      pulseRef.current.scale.setScalar(pulse);
    }
    if (topPanelRef.current) {
      const targetTilt = hatcheryBusy ? -0.55 + Math.sin(elapsed * 4.6) * 0.1 : 0;
      const currentTilt = topPanelRef.current.rotation.x;
      topPanelRef.current.rotation.x = currentTilt + (targetTilt - currentTilt) * Math.min(1, delta * 4);
      const targetLift = hatcheryBusy ? 0.05 + Math.sin(elapsed * 4.6) * 0.025 : 0;
      const currentLift = topPanelRef.current.position.y - 1.42;
      topPanelRef.current.position.y = 1.42 + currentLift + (targetLift - currentLift) * Math.min(1, delta * 4);
    }
    if (innerCreatureRef.current) {
      innerCreatureRef.current.visible = hatcheryBusy;
      if (hatcheryBusy) {
        const wobble = 0.85 + Math.sin(elapsed * 4.2) * 0.18;
        innerCreatureRef.current.scale.setScalar(wobble);
        innerCreatureRef.current.rotation.y += delta * 1.2;
        innerCreatureRef.current.rotation.z = Math.sin(elapsed * 2.4) * 0.18;
      }
    }
    if (baseRingRef.current) {
      const heatMaterial = baseRingRef.current.material as MeshStandardMaterial;
      if (hatcheryBusy) {
        const heatPulse = 0.55 + Math.sin(elapsed * 7.5) * 0.45;
        heatMaterial.emissiveIntensity = heatPulse;
        heatMaterial.emissive.copy(RED_HEAT_COLOR);
      } else {
        heatMaterial.emissiveIntensity = 0.05;
      }
    }
    if (domeRef.current) {
      const material = domeRef.current.material as MeshStandardMaterial;
      const targetColor = hatcheryBusy
        ? tempColor.copy(BASE_DOME_COLOR).lerp(new Color('#ffd3c8'), 0.45)
        : BASE_DOME_COLOR;
      material.color.lerp(targetColor, Math.min(1, delta * 3));
    }
  });

  const baseRadiusX = Math.max(0.7, footprintX * 0.28);
  const baseRadiusBottom = Math.max(0.84, footprintX * 0.34);
  const torusRadius = Math.max(0.58, footprintX * 0.24);
  const domeRadius = 0.62 + Math.min(0.2, level * 0.03);

  return (
    <group>
      <mesh
        ref={baseRingRef}
        castShadow
        receiveShadow
        position={[0, 0.06, 0]}
      >
        <primitive attach="geometry" object={getCylinderGeometry(baseRadiusBottom * 1.02, baseRadiusBottom * 1.04, 0.08, 24)} />
        <meshStandardMaterial color="#3a2a1a" emissive="#ff4b2a" emissiveIntensity={0.05} roughness={0.55} metalness={0.05} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.34, 0]}>
        <primitive attach="geometry" object={getCylinderGeometry(baseRadiusX, baseRadiusBottom, 0.42, 18)} />
        {createMaterial('#5e4635', 'wood')}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.58, 0]}>
        <primitive attach="geometry" object={getTorusGeometry(torusRadius, 0.08, 10, 30)} />
        {createMaterial('#d8a34a', 'gold')}
      </mesh>

      <mesh ref={domeRef} castShadow receiveShadow position={[0, 0.82, 0]}>
        <primitive
          attach="geometry"
          object={getSphereGeometry(domeRadius, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.66)}
        />
        <meshStandardMaterial
          color="#cfd7e0"
          transparent
          opacity={0.55}
          roughness={0.18}
          metalness={0.05}
          emissive="#bcd6ff"
          emissiveIntensity={0.18}
        />
      </mesh>

      <mesh ref={innerCreatureRef} castShadow={false} receiveShadow={false} position={[0, 0.78, 0]} visible={hatcheryBusy}>
        <primitive attach="geometry" object={getSphereGeometry(0.22, 14, 12)} />
        <meshStandardMaterial color="#9be3a4" emissive="#7fff5c" emissiveIntensity={0.85} transparent opacity={0.92} />
      </mesh>

      <group ref={pulseRef} position={[0, 0.92, 0]}>
        <mesh castShadow receiveShadow>
          <primitive attach="geometry" object={getSphereGeometry(0.18, 14, 14)} />
          {createMaterial('#f8fafc', 'gold')}
        </mesh>
      </group>

      <group ref={topPanelRef} position={[0, 1.42, 0]}>
        {level >= 3 ? (
          <mesh castShadow receiveShadow>
            <primitive attach="geometry" object={getConeGeometry(0.18, 0.4, 10)} />
            {createMaterial('#d6d3d1', 'stone')}
          </mesh>
        ) : null}
        {level >= 4 ? (
          <mesh castShadow receiveShadow position={[0.02, 0.2, 0]}>
            <primitive attach="geometry" object={getSphereGeometry(0.08, 10, 10)} />
            {createMaterial('#60a5fa', 'goo')}
          </mesh>
        ) : null}
        {level >= 5 ? (
          <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} position={[0.02, 0.2, 0]}>
            <primitive attach="geometry" object={getTorusGeometry(0.14, 0.02, 8, 20)} />
            {createMaterial('#cbd5e1', 'iron')}
          </mesh>
        ) : null}
      </group>

      <group ref={rotorRef} position={[0.58, 1.1, 0]}>
        <mesh castShadow receiveShadow>
          <primitive attach="geometry" object={getCylinderGeometry(0.12, 0.12, 0.28, 10)} />
          {createMaterial('#94a3b8', 'iron')}
        </mesh>
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 5]} position={[0, 0.2, 0]}>
          <primitive attach="geometry" object={getBoxGeometry(0.48, 0.04, 0.08)} />
          {createMaterial('#9ca3af', 'iron')}
        </mesh>
        <mesh castShadow receiveShadow rotation={[0, Math.PI / 2, Math.PI / 5]} position={[0, 0.2, 0]}>
          <primitive attach="geometry" object={getBoxGeometry(0.48, 0.04, 0.08)} />
          {createMaterial('#9ca3af', 'iron')}
        </mesh>
      </group>

      <group ref={armRef} position={[-0.68, 0.72, -0.15]}>
        <mesh castShadow receiveShadow>
          <primitive attach="geometry" object={getCylinderGeometry(0.11, 0.11, 0.48, 10)} />
          {createMaterial('#78716c', 'iron')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
          <primitive attach="geometry" object={getSphereGeometry(0.12, 12, 12)} />
          {createMaterial('#fcd34d', 'gold')}
        </mesh>
      </group>

      <mesh castShadow receiveShadow position={[0.82, 0.8, 0]} rotation={[0, Math.PI / 2, 0]}>
        <primitive attach="geometry" object={getCylinderGeometry(0.11, 0.11, 0.05, 20)} />
        <meshMatcapMaterial color="#f5f5f4" map={HATCHERY_GAUGE_TEXTURE} />
      </mesh>

      <mesh castShadow receiveShadow position={[0.26, 0.38, 0.62]} rotation={[0, 0, Math.PI / 2]}>
        <primitive attach="geometry" object={getTorusGeometry(0.24, 0.06, 8, 20, Math.PI / 2)} />
        {createMaterial('#d5a247', 'gold')}
      </mesh>

      <FluidFlowPipe
        origin={[-baseRadiusBottom - 0.08, 0.34, 0.18]}
        length={0.46}
        radius={0.05}
        pipeColor="#5b4a3a"
        fluidColor="#5fbb45"
        fluidEmissive="#9bff7e"
        fluidEmissiveIntensity={0.95}
        active={hatcheryBusy}
        speed={hatcheryBusy ? 0.95 : 0.18}
        bubbleCount={4}
      />
      <FluidFlowPipe
        origin={[baseRadiusBottom + 0.08, 0.34, -0.18]}
        length={0.46}
        radius={0.05}
        pipeColor="#5b4a3a"
        fluidColor="#5fbb45"
        fluidEmissive="#9bff7e"
        fluidEmissiveIntensity={0.95}
        active={hatcheryBusy}
        speed={hatcheryBusy ? 0.95 : 0.18}
        bubbleCount={4}
      />

      {HATCHERY_RIVET_POSITIONS.map((rivet, index) => (
        <mesh
          key={`hatchery-rivet-${index}`}
          castShadow
          receiveShadow
          position={[rivet[0], rivet[1], rivet[2]]}
          scale={[1, 1, 0.1]}
        >
          <primitive attach="geometry" object={getSphereGeometry(0.035, 8, 8)} />
          {createMaterial('#6b7280', 'iron')}
        </mesh>
      ))}

      {HATCHERY_LEG_POSITIONS.map((leg, index) => (
        <group key={`hatchery-leg-${index}`} position={[leg[0], leg[1], leg[2]]}>
          <mesh castShadow receiveShadow rotation={[Math.PI / 6, 0, 0]}>
            <primitive attach="geometry" object={getCylinderGeometry(0.04, 0.07, 0.26, 8)} />
            {createMaterial('#7c2d12', 'wood')}
          </mesh>
          <mesh castShadow receiveShadow position={[0, -0.14, 0]}>
            <primitive attach="geometry" object={getSphereGeometry(0.07, 10, 10)} />
            {createMaterial('#f59e0b', 'gold')}
          </mesh>
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <primitive attach="geometry" object={getCircleGeometry(Math.max(0.9, footprintX * 0.44), 30)} />
        {createMaterial('#3f2a1a', 'wood')}
      </mesh>

      <LowPolyParticles
        enabled={hatcheryBusy}
        count={hatcheryBusy ? 6 : 0}
        shape="octahedron"
        color="#9bff7e"
        emissive="#7fff5c"
        emissiveIntensity={0.9}
        size={0.045}
        sizeVariance={0.55}
        radius={0.18}
        upwardSpeed={0.4}
        horizontalSpeed={0.12}
        rotationSpeed={3.6}
        lifetimeSeconds={1.4}
        origin={[0, 1.05, 0]}
        gravity={-0.1}
      />
    </group>
  );
};
