import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  Color,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  OctahedronGeometry,
  TetrahedronGeometry,
} from 'three';

export type LowPolyParticleShape = 'octahedron' | 'tetrahedron' | 'icosahedron';

type LowPolyParticleConfig = {
  count: number;
  shape?: LowPolyParticleShape;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  size?: number;
  sizeVariance?: number;
  radius?: number;
  spreadY?: number;
  upwardSpeed?: number;
  horizontalSpeed?: number;
  rotationSpeed?: number;
  lifetimeSeconds?: number;
  enabled?: boolean;
  origin?: [number, number, number];
  gravity?: number;
};

type LowPolyParticleHandle = {
  mesh: Mesh;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  rotationAxisX: number;
  rotationAxisY: number;
  rotationAxisZ: number;
  rotationSpeed: number;
  baseScale: number;
  age: number;
  lifetime: number;
};

const GEOMETRY_CACHE = new Map<LowPolyParticleShape, OctahedronGeometry | TetrahedronGeometry | IcosahedronGeometry>();

const getParticleGeometry = (
  shape: LowPolyParticleShape
): OctahedronGeometry | TetrahedronGeometry | IcosahedronGeometry => {
  const cached = GEOMETRY_CACHE.get(shape);
  if (cached) {
    return cached;
  }
  if (shape === 'tetrahedron') {
    const geometry = new TetrahedronGeometry(1, 0);
    GEOMETRY_CACHE.set(shape, geometry);
    return geometry;
  }
  if (shape === 'icosahedron') {
    const geometry = new IcosahedronGeometry(1, 0);
    GEOMETRY_CACHE.set(shape, geometry);
    return geometry;
  }
  const geometry = new OctahedronGeometry(1, 0);
  GEOMETRY_CACHE.set(shape, geometry);
  return geometry;
};

const randomInRange = (min: number, max: number): number => min + Math.random() * (max - min);

const resetParticle = (handle: LowPolyParticleHandle, config: LowPolyParticleConfig): void => {
  const angle = Math.random() * Math.PI * 2;
  const radius = config.radius ?? 0.12;
  const distance = Math.random() * radius;
  const horizontalSpeed = config.horizontalSpeed ?? 0.18;
  const upwardSpeed = config.upwardSpeed ?? 0.45;
  const sizeBase = config.size ?? 0.06;
  const variance = config.sizeVariance ?? 0.6;
  handle.mesh.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
  handle.velocityX = Math.cos(angle) * horizontalSpeed * randomInRange(0.4, 1);
  handle.velocityZ = Math.sin(angle) * horizontalSpeed * randomInRange(0.4, 1);
  handle.velocityY = upwardSpeed * randomInRange(0.7, 1.1);
  handle.baseScale = sizeBase * randomInRange(1 - variance, 1 + variance);
  handle.mesh.scale.setScalar(handle.baseScale);
  handle.rotationAxisX = randomInRange(-1, 1);
  handle.rotationAxisY = randomInRange(-1, 1);
  handle.rotationAxisZ = randomInRange(-1, 1);
  handle.rotationSpeed = (config.rotationSpeed ?? 3.2) * randomInRange(0.4, 1.4);
  handle.age = Math.random() * (handle.lifetime * 0.6);
  handle.mesh.visible = true;
};

export const LowPolyParticles = ({
  count,
  shape = 'octahedron',
  color,
  emissive,
  emissiveIntensity = 0.4,
  size = 0.06,
  sizeVariance = 0.6,
  radius = 0.12,
  spreadY = 0,
  upwardSpeed = 0.45,
  horizontalSpeed = 0.18,
  rotationSpeed = 3.2,
  lifetimeSeconds = 1.4,
  enabled = true,
  origin = [0, 0, 0],
  gravity = -0.18,
}: LowPolyParticleConfig) => {
  const groupRef = useRef<Group | null>(null);
  const handlesRef = useRef<LowPolyParticleHandle[] | null>(null);

  const sharedMaterial = useMemo(() => {
    const material = new MeshStandardMaterial({
      color: new Color(color),
      transparent: true,
      opacity: 1,
      roughness: 0.78,
      metalness: 0.05,
    });
    if (emissive) {
      material.emissive = new Color(emissive);
      material.emissiveIntensity = emissiveIntensity;
    }
    return material;
  }, [color, emissive, emissiveIntensity]);

  useFrame((_, delta) => {
    if (!groupRef.current || !enabled) {
      return;
    }
    if (!handlesRef.current) {
      handlesRef.current = groupRef.current.children
        .filter((child): child is Mesh => (child as Mesh).isMesh === true)
        .map((mesh) => ({
          mesh,
          velocityX: 0,
          velocityY: 0,
          velocityZ: 0,
          rotationAxisX: 0,
          rotationAxisY: 1,
          rotationAxisZ: 0,
          rotationSpeed: 1,
          baseScale: size,
          age: 0,
          lifetime: lifetimeSeconds,
        }));
      handlesRef.current.forEach((handle) =>
        resetParticle(handle, {
          count,
          shape,
          color,
          radius,
          spreadY,
          upwardSpeed,
          horizontalSpeed,
          rotationSpeed,
          lifetimeSeconds,
          size,
          sizeVariance,
        })
      );
    }
    const handles = handlesRef.current;
    if (!handles) {
      return;
    }
    for (const handle of handles) {
      handle.age += delta;
      if (handle.age >= handle.lifetime) {
        resetParticle(handle, {
          count,
          shape,
          color,
          radius,
          spreadY,
          upwardSpeed,
          horizontalSpeed,
          rotationSpeed,
          lifetimeSeconds,
          size,
          sizeVariance,
        });
        continue;
      }
      handle.velocityY += gravity * delta;
      handle.mesh.position.x += handle.velocityX * delta;
      handle.mesh.position.y += handle.velocityY * delta;
      handle.mesh.position.z += handle.velocityZ * delta;
      handle.mesh.rotation.x += handle.rotationAxisX * handle.rotationSpeed * delta;
      handle.mesh.rotation.y += handle.rotationAxisY * handle.rotationSpeed * delta;
      handle.mesh.rotation.z += handle.rotationAxisZ * handle.rotationSpeed * delta;
      const lifeRatio = handle.age / handle.lifetime;
      const fadeScale = lifeRatio < 0.15 ? lifeRatio / 0.15 : 1 - (lifeRatio - 0.15) / 0.85;
      const targetScale = handle.baseScale * Math.max(0.05, fadeScale);
      handle.mesh.scale.setScalar(targetScale);
    }
  });

  if (!enabled || count <= 0) {
    return null;
  }

  return (
    <group ref={groupRef} position={origin}>
      {Array.from({ length: count }).map((_, index) => (
        <mesh key={`particle-${index}`} castShadow={false} receiveShadow={false} material={sharedMaterial}>
          <primitive attach="geometry" object={getParticleGeometry(shape)} />
        </mesh>
      ))}
    </group>
  );
};
