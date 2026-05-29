import { useMemo } from 'react';
import { CanvasTexture, RepeatWrapping } from 'three';

type TerrainProps = {
  worldSize: number;
};

const createSeededRandom = (seed: number) => {
  let currentSeed = seed;
  return () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };
};

type RgbColor = { red: number; green: number; blue: number };

const hexToRgb = (hex: string): RgbColor => {
  const normalised = hex.replace('#', '');
  const value = Number.parseInt(normalised, 16);
  return {
    red: (value >> 16) & 255,
    green: (value >> 8) & 255,
    blue: value & 255,
  };
};

const mixColors = (colorA: RgbColor, colorB: RgbColor, ratio: number): RgbColor => {
  const clamped = Math.max(0, Math.min(1, ratio));
  return {
    red: Math.round(colorA.red * (1 - clamped) + colorB.red * clamped),
    green: Math.round(colorA.green * (1 - clamped) + colorB.green * clamped),
    blue: Math.round(colorA.blue * (1 - clamped) + colorB.blue * clamped),
  };
};

const GRASS_BASE = hexToRgb('#5aab1c');
const GRASS_LIGHT = hexToRgb('#84c626');
const GRASS_SHADE = hexToRgb('#3f7f14');
const BLADE_LIGHT = hexToRgb('#a2dd57');
const BLADE_DARK = hexToRgb('#4f8f1a');
const GRID_COLOR = 'rgba(255, 255, 255, 0.14)';

const TEXTURE_RESOLUTION = 1024;
const GRID_TEXTURE_RESOLUTION = 1024;
const GRID_CELL_PX = 64;
const GRID_LINE_PX = 1;

const createTerrainCanvas = (): HTMLCanvasElement | null => {
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
  context.fillStyle = `rgb(${GRASS_BASE.red}, ${GRASS_BASE.green}, ${GRASS_BASE.blue})`;
  context.fillRect(0, 0, TEXTURE_RESOLUTION, TEXTURE_RESOLUTION);

  const random = createSeededRandom(5227);
  const drawBladeCluster = (x: number, y: number, density: number): void => {
    for (let blade = 0; blade < density; blade += 1) {
      const tilt = (random() - 0.5) * 1.1;
      const length = 3 + random() * 6;
      const xOffset = (random() - 0.5) * 8;
      const yOffset = (random() - 0.5) * 7;
      const mix = random();
      const bladeColor = mixColors(BLADE_DARK, BLADE_LIGHT, mix);
      context.strokeStyle = `rgba(${bladeColor.red}, ${bladeColor.green}, ${bladeColor.blue}, ${0.24 + random() * 0.36})`;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x + xOffset, y + yOffset);
      context.lineTo(x + xOffset + tilt, y + yOffset - length);
      context.stroke();
    }
  };

  for (let index = 0; index < 5600; index += 1) {
    const x = random() * TEXTURE_RESOLUTION;
    const y = random() * TEXTURE_RESOLUTION;
    const density = 2 + Math.floor(random() * 5);
    drawBladeCluster(x, y, density);
  }

  context.globalAlpha = 0.2;
  for (let pass = 0; pass < 2; pass += 1) {
    const highlight = pass === 0 ? GRASS_LIGHT : GRASS_SHADE;
    context.fillStyle = `rgb(${highlight.red}, ${highlight.green}, ${highlight.blue})`;
    for (let patch = 0; patch < 120; patch += 1) {
      const x = random() * TEXTURE_RESOLUTION;
      const y = random() * TEXTURE_RESOLUTION;
      const width = 18 + random() * 40;
      const height = 10 + random() * 24;
      context.beginPath();
      context.ellipse(x, y, width, height, random() * Math.PI, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.globalAlpha = 1;

  return canvas;
};

const createGridCanvas = (): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = GRID_TEXTURE_RESOLUTION;
  canvas.height = GRID_TEXTURE_RESOLUTION;
  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }
  context.clearRect(0, 0, GRID_TEXTURE_RESOLUTION, GRID_TEXTURE_RESOLUTION);
  context.strokeStyle = GRID_COLOR;
  context.lineWidth = GRID_LINE_PX;

  for (let position = 0; position <= GRID_TEXTURE_RESOLUTION; position += GRID_CELL_PX) {
    context.beginPath();
    context.moveTo(position + 0.5, 0);
    context.lineTo(position + 0.5, GRID_TEXTURE_RESOLUTION);
    context.stroke();

    context.beginPath();
    context.moveTo(0, position + 0.5);
    context.lineTo(GRID_TEXTURE_RESOLUTION, position + 0.5);
    context.stroke();
  }
  return canvas;
};

const createTerrainTexture = (): CanvasTexture => {
  const canvas = createTerrainCanvas();
  if (!canvas) {
    const fallbackCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    if (fallbackCanvas) {
      fallbackCanvas.width = 4;
      fallbackCanvas.height = 4;
    }
    const fallback = new CanvasTexture(fallbackCanvas as HTMLCanvasElement);
    fallback.wrapS = RepeatWrapping;
    fallback.wrapT = RepeatWrapping;
    fallback.needsUpdate = true;
    return fallback;
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = 8;
  texture.repeat.set(2.15, 2.15);
  texture.needsUpdate = true;
  return texture;
};

const createGridTexture = (): CanvasTexture | null => {
  const canvas = createGridCanvas();
  if (!canvas) {
    return null;
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;
  return texture;
};

export const Terrain = ({ worldSize }: TerrainProps) => {
  const terrainTexture = useMemo(() => createTerrainTexture(), []);
  const gridTexture = useMemo(() => createGridTexture(), []);
  const extendedWorldSize = worldSize * 2.6;

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.011, 0]}>
        <planeGeometry args={[extendedWorldSize, extendedWorldSize]} />
        <meshStandardMaterial map={terrainTexture} color="#9ad94e" roughness={0.9} metalness={0.01} />
      </mesh>
      {gridTexture ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, 0]}>
          <planeGeometry args={[worldSize, worldSize]} />
          <meshBasicMaterial
            map={gridTexture}
            transparent
            opacity={0.75}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.018, 0]}>
        <planeGeometry args={[extendedWorldSize, extendedWorldSize]} />
        <meshBasicMaterial color="#5aab1c" />
      </mesh>
    </group>
  );
};
