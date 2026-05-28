import { useMemo } from 'react';
import { CanvasTexture, DoubleSide } from 'three';
import { CELL_SIZE } from '../../utils/coordinates';

type BuildingDirtDecalProps = {
  sizeX: number;
  sizeY: number;
  status?: string;
  intensity?: number;
};

const createSeededRandom = (seed: number) => {
  let currentSeed = seed;
  return () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };
};

const TEXTURE_RESOLUTION = 256;

const createDirtDecalCanvas = (seed: number): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_RESOLUTION;
  canvas.height = TEXTURE_RESOLUTION;
  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }
  const random = createSeededRandom(seed);
  const center = TEXTURE_RESOLUTION / 2;

  context.clearRect(0, 0, TEXTURE_RESOLUTION, TEXTURE_RESOLUTION);

  const baseRadius = TEXTURE_RESOLUTION * 0.42;
  const baseGradient = context.createRadialGradient(center, center, baseRadius * 0.18, center, center, baseRadius);
  baseGradient.addColorStop(0, 'rgba(48, 30, 18, 0.92)');
  baseGradient.addColorStop(0.55, 'rgba(74, 51, 30, 0.78)');
  baseGradient.addColorStop(0.85, 'rgba(96, 70, 45, 0.32)');
  baseGradient.addColorStop(1, 'rgba(96, 70, 45, 0)');

  context.save();
  context.beginPath();
  const segments = 28;
  for (let index = 0; index <= segments; index += 1) {
    const angle = (Math.PI * 2 * index) / segments;
    const wobble = 0.78 + random() * 0.32;
    const radius = baseRadius * wobble;
    const px = center + Math.cos(angle) * radius;
    const py = center + Math.sin(angle) * radius;
    if (index === 0) {
      context.moveTo(px, py);
    } else {
      context.lineTo(px, py);
    }
  }
  context.closePath();
  context.fillStyle = baseGradient;
  context.fill();
  context.restore();

  const pebblePalette = ['#3f2a17', '#6b4a2a', '#8b6a3f', '#2d1b0c'];
  for (let index = 0; index < 90; index += 1) {
    const angle = random() * Math.PI * 2;
    const distance = random() * baseRadius * 0.95;
    const px = center + Math.cos(angle) * distance;
    const py = center + Math.sin(angle) * distance;
    const speckSize = 1.2 + random() * 3.4;
    context.fillStyle = pebblePalette[Math.floor(random() * pebblePalette.length)];
    context.globalAlpha = 0.45 + random() * 0.45;
    context.beginPath();
    context.arc(px, py, speckSize, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;

  for (let index = 0; index < 6; index += 1) {
    const angle = random() * Math.PI * 2;
    const distance = baseRadius * (0.4 + random() * 0.5);
    const px = center + Math.cos(angle) * distance;
    const py = center + Math.sin(angle) * distance;
    const stoneSize = 3 + random() * 4;
    context.fillStyle = '#94785a';
    context.globalAlpha = 0.85;
    context.beginPath();
    context.arc(px, py, stoneSize, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#cdb592';
    context.globalAlpha = 0.55;
    context.beginPath();
    context.arc(px - stoneSize * 0.3, py - stoneSize * 0.3, stoneSize * 0.45, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;

  return canvas;
};

const buildDirtTexture = (seed: number): CanvasTexture | null => {
  const canvas = createDirtDecalCanvas(seed);
  if (!canvas) {
    return null;
  }
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const TEXTURE_CACHE = new Map<number, CanvasTexture>();

const getCachedDirtTexture = (seed: number): CanvasTexture | null => {
  const cached = TEXTURE_CACHE.get(seed);
  if (cached) {
    return cached;
  }
  const texture = buildDirtTexture(seed);
  if (texture) {
    TEXTURE_CACHE.set(seed, texture);
  }
  return texture;
};

export const BuildingDirtDecal = ({ sizeX, sizeY, status, intensity = 1 }: BuildingDirtDecalProps) => {
  const seed = useMemo(() => Math.round((sizeX * 91 + sizeY * 47) * 13) + 17, [sizeX, sizeY]);
  const dirtTexture = useMemo(() => getCachedDirtTexture(seed), [seed]);

  if (status && status !== 'ACTIVE' && status !== 'UNDER_CONSTRUCTION') {
    return null;
  }
  if (!dirtTexture) {
    return null;
  }

  const decalScale = Math.max(sizeX, sizeY) * CELL_SIZE * 1.55;
  const opacity = Math.max(0, Math.min(1, intensity)) * (status === 'UNDER_CONSTRUCTION' ? 0.55 : 0.85);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <planeGeometry args={[decalScale, decalScale]} />
      <meshBasicMaterial
        map={dirtTexture}
        transparent
        opacity={opacity}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
        side={DoubleSide}
      />
    </mesh>
  );
};
