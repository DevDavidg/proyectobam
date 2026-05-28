import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { ReactElement } from 'react';
import type { Group, Mesh } from 'three';
import type { BuildingStatus } from '../../core/types/building';
import { FluidFlowPipe } from '../fx/fluid-flow-pipe';
import { LowPolyParticles } from '../fx/low-poly-particles';

type MaterialToken = 'gold' | 'iron' | 'wood' | 'goo' | 'stone';

type TwigSnapperVisualProps = {
  level: number;
  footprintX: number;
  footprintZ: number;
  status?: BuildingStatus;
  hp?: number;
  maxHp?: number;
  createMaterial: (fallbackColor: string, token: MaterialToken) => ReactElement;
};

type TwigTier = 'L1_2' | 'L3_5' | 'L6_9' | 'L10';
type TwigState = 'in-action' | 'normal' | 'damaged' | 'destroyed';

const resolveTier = (level: number): TwigTier => {
  if (level >= 10) return 'L10';
  if (level >= 6) return 'L6_9';
  if (level >= 3) return 'L3_5';
  return 'L1_2';
};

const resolveState = (status?: BuildingStatus, hp?: number, maxHp?: number): TwigState => {
  const ratio = maxHp && maxHp > 0 ? (hp ?? maxHp) / maxHp : 1;
  if (ratio <= 0.12) return 'destroyed';
  if (ratio < 0.55) return 'damaged';
  if (status === 'ACTIVE') return 'in-action';
  return 'normal';
};

export const TwigSnapperVisual = ({
  level,
  footprintX,
  footprintZ,
  status,
  hp,
  maxHp,
  createMaterial,
}: TwigSnapperVisualProps) => {
  const spinnerRef = useRef<Group | null>(null);
  const gaugeRef = useRef<Group | null>(null);
  const twigFlowRef = useRef<Group | null>(null);
  const capRef = useRef<Group | null>(null);
  const pistonLeftRef = useRef<Mesh | null>(null);
  const pistonRightRef = useRef<Mesh | null>(null);
  const tier = resolveTier(level);
  const visualState = resolveState(status, hp, maxHp);
  const isActive = visualState === 'in-action';
  const baseRadius = Math.max(0.32, Math.min(0.5, Math.min(footprintX, footprintZ) * 0.24));
  const tierScale = tier === 'L10' ? 1.25 : tier === 'L6_9' ? 1.14 : tier === 'L3_5' ? 1.06 : 1;
  const hasPistons = tier !== 'L1_2';
  const hasFluidPipes = tier === 'L6_9' || tier === 'L10';

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    if (spinnerRef.current) {
      spinnerRef.current.rotation.y += delta * (isActive ? 2.4 : 0.2);
    }
    if (gaugeRef.current) {
      gaugeRef.current.rotation.z = isActive
        ? Math.sin(elapsed * 2.8) * 0.22
        : Math.sin(elapsed * 0.8) * 0.06;
    }
    if (twigFlowRef.current) {
      const pulse = isActive
        ? 1 + Math.sin(elapsed * 5.5) * 0.08
        : 1 + Math.sin(elapsed * 1.4) * 0.02;
      twigFlowRef.current.scale.setScalar(pulse);
    }
    if (capRef.current) {
      const baseY = 0.74;
      const swayAmplitude = isActive ? 0.06 : 0.018;
      const swayTilt = isActive ? 0.09 : 0.025;
      capRef.current.position.y = baseY + Math.sin(elapsed * (isActive ? 4.2 : 1.4)) * swayAmplitude;
      capRef.current.rotation.z = Math.sin(elapsed * (isActive ? 4.2 : 1.4)) * swayTilt;
      capRef.current.rotation.x = Math.cos(elapsed * (isActive ? 3.6 : 1.1)) * swayTilt * 0.5;
    }
    if (pistonLeftRef.current && pistonRightRef.current) {
      const cycle = (Math.sin(elapsed * (isActive ? 6 : 1.6)) + 1) * 0.5;
      const stroke = isActive ? 0.14 : 0.02;
      const baseLeftX = -baseRadius - 0.18;
      const baseRightX = baseRadius + 0.18;
      pistonLeftRef.current.position.x = baseLeftX + cycle * stroke;
      pistonRightRef.current.position.x = baseRightX - cycle * stroke;
      const compress = 1 - cycle * 0.35;
      pistonLeftRef.current.scale.x = compress;
      pistonRightRef.current.scale.x = compress;
    }
  });

  if (visualState === 'destroyed') {
    return (
      <group position={[0, 0.04, 0]} rotation={[0.14, 0.3, -0.24]}>
        <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[0.9, 0.14, 0.9]} />
          {createMaterial('#6f4f37', 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[0.1, 0.15, -0.12]} rotation={[0.2, 0.4, 0.3]}>
          <torusGeometry args={[0.16, 0.04, 8, 14]} />
          {createMaterial('#d2a24b', 'gold')}
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[baseRadius + 0.2, baseRadius + 0.24, 0.2, 14]} />
        {createMaterial('#7e5638', 'wood')}
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.44, 0]}>
        <cylinderGeometry args={[baseRadius * tierScale, (baseRadius + 0.05) * tierScale, 0.56, 12]} />
        {createMaterial('#8e5f3b', 'wood')}
      </mesh>

      <group ref={capRef} position={[0, 0.74, 0]}>
        <mesh castShadow receiveShadow>
          <coneGeometry args={[0.28 * tierScale, 0.34, 5]} />
          {createMaterial('#c6a67e', 'wood')}
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />
          {createMaterial('#7c5b3b', 'wood')}
        </mesh>
      </group>

      <LowPolyParticles
        enabled={isActive}
        count={isActive ? 12 : 0}
        shape="tetrahedron"
        color="#e8c98b"
        emissive="#c98a3c"
        emissiveIntensity={0.35}
        size={0.045}
        sizeVariance={0.6}
        radius={0.1}
        upwardSpeed={0.6}
        horizontalSpeed={0.22}
        rotationSpeed={4.5}
        lifetimeSeconds={1.2}
        origin={[0, 0.94, 0]}
        gravity={-0.35}
      />

      <group ref={spinnerRef} position={[0.22 * tierScale, 0.64, 0]}>
        <mesh castShadow receiveShadow rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.14 + level * 0.01, 0.03, 8, 16]} />
          {createMaterial('#a5b0bf', 'iron')}
        </mesh>
        <mesh castShadow receiveShadow rotation={[0, Math.PI / 2, Math.PI / 3]}>
          <boxGeometry args={[0.3, 0.03, 0.06]} />
          {createMaterial('#9aa5b3', 'iron')}
        </mesh>
        <mesh castShadow receiveShadow rotation={[0, Math.PI / 2, -Math.PI / 3]}>
          <boxGeometry args={[0.3, 0.03, 0.06]} />
          {createMaterial('#9aa5b3', 'iron')}
        </mesh>
      </group>

      <group ref={gaugeRef} position={[-0.22, 0.52, 0.16]}>
        <mesh castShadow receiveShadow rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 14]} />
          {createMaterial('#d9dce1', 'stone')}
        </mesh>
        <mesh castShadow receiveShadow position={[0.04, 0.01, 0]}>
          <boxGeometry args={[0.1, 0.01, 0.02]} />
          {createMaterial('#5f6674', 'iron')}
        </mesh>
      </group>

      <group ref={twigFlowRef} position={[0, 0.4, -0.2]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.08 + level * 0.004, 10, 10]} />
          {createMaterial('#d59f45', 'gold')}
        </mesh>
      </group>

      {hasPistons ? (
        <>
          <mesh
            ref={pistonLeftRef}
            castShadow
            receiveShadow
            position={[-baseRadius - 0.18, 0.42, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.045, 0.045, 0.32, 10]} />
            {createMaterial('#b8a08b', 'iron')}
          </mesh>
          <mesh castShadow receiveShadow position={[-baseRadius - 0.34, 0.42, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.12, 12]} />
            {createMaterial('#6f5b48', 'iron')}
          </mesh>
          <mesh
            ref={pistonRightRef}
            castShadow
            receiveShadow
            position={[baseRadius + 0.18, 0.42, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.045, 0.045, 0.32, 10]} />
            {createMaterial('#b8a08b', 'iron')}
          </mesh>
          <mesh castShadow receiveShadow position={[baseRadius + 0.34, 0.42, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.12, 12]} />
            {createMaterial('#6f5b48', 'iron')}
          </mesh>
        </>
      ) : null}

      {tier !== 'L1_2' ? (
        <mesh castShadow receiveShadow position={[-0.28, 0.42, -0.14]} rotation={[0, Math.PI / 4, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.32 + level * 0.01, 8]} />
          {createMaterial('#c8923c', 'gold')}
        </mesh>
      ) : null}

      {hasFluidPipes ? (
        <>
          <FluidFlowPipe
            origin={[baseRadius + 0.36, 0.26, -0.04]}
            rotation={[0, 0, 0]}
            length={0.5}
            radius={0.045}
            pipeColor="#7c5832"
            fluidColor="#d6a14a"
            fluidEmissive="#f4c66a"
            fluidEmissiveIntensity={0.6}
            active={isActive}
            speed={isActive ? 0.7 : 0.18}
            bubbleCount={3}
          />
          <FluidFlowPipe
            origin={[-baseRadius - 0.36, 0.26, 0.06]}
            rotation={[0, 0, 0]}
            length={0.5}
            radius={0.045}
            pipeColor="#7c5832"
            fluidColor="#d6a14a"
            fluidEmissive="#f4c66a"
            fluidEmissiveIntensity={0.6}
            active={isActive}
            speed={isActive ? 0.7 : 0.18}
            bubbleCount={3}
          />
        </>
      ) : null}

      {tier === 'L6_9' || tier === 'L10' ? (
        <mesh castShadow receiveShadow position={[0.26, 0.84, -0.06]} rotation={[0.15, 0.2, 0.3]}>
          <boxGeometry args={[0.12, 0.28, 0.08]} />
          {createMaterial('#b7bfca', 'iron')}
        </mesh>
      ) : null}

      {tier === 'L10' ? (
        <mesh castShadow receiveShadow position={[0, 1.04, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.18, 0.022, 8, 18]} />
          {createMaterial('#e0b45c', 'gold')}
        </mesh>
      ) : null}

      {visualState === 'damaged' ? (
        <>
          <group rotation={[0.08, 0, -0.09]}>
            <mesh castShadow receiveShadow position={[-0.18, 0.52, 0.12]} rotation={[0.2, 0.6, 0.1]}>
              <boxGeometry args={[0.18, 0.08, 0.11]} />
              {createMaterial('#6b7280', 'iron')}
            </mesh>
            <mesh castShadow receiveShadow position={[0.16, 0.12, -0.14]} rotation={[0.15, 0.3, 0.5]}>
              <cylinderGeometry args={[0.025, 0.025, 0.2, 8]} />
              {createMaterial('#7a4a2d', 'wood')}
            </mesh>
          </group>
          <LowPolyParticles
            enabled
            count={6}
            shape="octahedron"
            color="#4a4a4a"
            size={0.06}
            sizeVariance={0.5}
            radius={0.12}
            upwardSpeed={0.32}
            horizontalSpeed={0.12}
            rotationSpeed={2.4}
            lifetimeSeconds={1.6}
            origin={[0.1, 0.6, 0.05]}
            gravity={-0.05}
          />
        </>
      ) : null}
    </group>
  );
};
