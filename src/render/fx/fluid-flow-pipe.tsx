import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group, Mesh } from 'three';
import { getCylinderGeometry, getSphereGeometry, getTorusGeometry } from '../entities/building-visual/geometry-cache';

type FluidFlowPipeProps = {
  origin: [number, number, number];
  rotation?: [number, number, number];
  length?: number;
  radius?: number;
  pipeColor?: string;
  fluidColor?: string;
  fluidEmissive?: string;
  fluidEmissiveIntensity?: number;
  active?: boolean;
  speed?: number;
  bubbleCount?: number;
};

export const FluidFlowPipe = ({
  origin,
  rotation = [0, 0, 0],
  length = 0.7,
  radius = 0.055,
  pipeColor = '#6f5037',
  fluidColor = '#5fbb45',
  fluidEmissive = '#7fff5c',
  fluidEmissiveIntensity = 0.8,
  active = true,
  speed = 0.55,
  bubbleCount = 4,
}: FluidFlowPipeProps) => {
  const bubblesRef = useRef<Group | null>(null);
  const offsetsRef = useRef<number[]>([]);

  if (offsetsRef.current.length !== bubbleCount) {
    offsetsRef.current = Array.from({ length: bubbleCount }, (_, index) => index / bubbleCount);
  }

  useFrame((_, delta) => {
    if (!bubblesRef.current) {
      return;
    }
    const offsets = offsetsRef.current;
    const speedFactor = active ? speed : speed * 0.18;
    bubblesRef.current.children.forEach((child, index) => {
      const mesh = child as Mesh;
      offsets[index] = (offsets[index] + delta * speedFactor) % 1;
      const positionAlongPipe = offsets[index] * length - length / 2;
      mesh.position.y = positionAlongPipe;
      const lifeRatio = offsets[index];
      const fade = lifeRatio < 0.1 ? lifeRatio / 0.1 : lifeRatio > 0.9 ? (1 - lifeRatio) / 0.1 : 1;
      mesh.scale.setScalar(radius * 0.82 * Math.max(0.15, fade));
    });
  });

  return (
    <group position={origin} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <primitive attach="geometry" object={getCylinderGeometry(radius, radius, length, 12)} />
        <meshToonMaterial color={pipeColor} />
      </mesh>

      <mesh castShadow={false} receiveShadow={false}>
        <primitive attach="geometry" object={getCylinderGeometry(radius * 0.78, radius * 0.78, length * 0.98, 12)} />
        <meshStandardMaterial
          color={fluidColor}
          emissive={fluidEmissive}
          emissiveIntensity={active ? fluidEmissiveIntensity : fluidEmissiveIntensity * 0.35}
          transparent
          opacity={0.85}
          roughness={0.25}
          metalness={0}
        />
      </mesh>

      <mesh castShadow receiveShadow position={[0, length / 2, 0]}>
        <primitive attach="geometry" object={getTorusGeometry(radius * 1.25, radius * 0.32, 8, 14)} />
        <meshToonMaterial color="#caa15a" />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -length / 2, 0]}>
        <primitive attach="geometry" object={getTorusGeometry(radius * 1.25, radius * 0.32, 8, 14)} />
        <meshToonMaterial color="#caa15a" />
      </mesh>

      <group ref={bubblesRef}>
        {Array.from({ length: bubbleCount }).map((_, index) => (
          <mesh key={`fluid-bubble-${index}`}>
            <primitive attach="geometry" object={getSphereGeometry(1, 10, 10)} />
            <meshStandardMaterial
              color={fluidColor}
              emissive={fluidEmissive}
              emissiveIntensity={active ? fluidEmissiveIntensity * 1.4 : fluidEmissiveIntensity * 0.4}
              transparent
              opacity={0.92}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
