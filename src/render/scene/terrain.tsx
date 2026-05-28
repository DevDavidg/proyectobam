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

const fade = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const buildPermutationTable = (seed: number): number[] => {
  const random = createSeededRandom(seed);
  const permutation: number[] = [];
  for (let index = 0; index < 256; index += 1) {
    permutation.push(index);
  }
  for (let index = permutation.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const temporary = permutation[index];
    permutation[index] = permutation[swap];
    permutation[swap] = temporary;
  }
  const doubled = new Array<number>(512);
  for (let index = 0; index < 512; index += 1) {
    doubled[index] = permutation[index & 255];
  }
  return doubled;
};

const gradient2d = (hash: number, x: number, y: number): number => {
  const h = hash & 7;
  const u = h < 4 ? x : y;
  const v = h < 4 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
};

const perlinNoise2D = (permutation: number[], x: number, y: number): number => {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);
  const aa = permutation[permutation[xi] + yi];
  const ab = permutation[permutation[xi] + yi + 1];
  const ba = permutation[permutation[xi + 1] + yi];
  const bb = permutation[permutation[xi + 1] + yi + 1];
  const x1 = lerp(gradient2d(aa, xf, yf), gradient2d(ba, xf - 1, yf), u);
  const x2 = lerp(gradient2d(ab, xf, yf - 1), gradient2d(bb, xf - 1, yf - 1), u);
  return lerp(x1, x2, v);
};

const fbmNoise = (permutation: number[], x: number, y: number, octaves = 5, persistence = 0.55, lacunarity = 2.1): number => {
  let total = 0;
  let amplitude = 1;
  let frequency = 1;
  let normalisation = 0;
  for (let octave = 0; octave < octaves; octave += 1) {
    total += perlinNoise2D(permutation, x * frequency, y * frequency) * amplitude;
    normalisation += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  return total / normalisation;
};

type RgbColor = { red: number; green: number; blue: number };

const hexToRgb = (hex: string): RgbColor => {
  const normalised = hex.replace('#', '');
  const value = parseInt(normalised, 16);
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

const GRASS_LIGHT = hexToRgb('#90b65b');
const GRASS_BASE = hexToRgb('#6f9540');
const GRASS_DARK = hexToRgb('#4f7325');
const DIRT_LIGHT = hexToRgb('#a07e4f');
const DIRT_BASE = hexToRgb('#7d5c34');
const DIRT_DARK = hexToRgb('#523a1e');

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  const ratio = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return ratio * ratio * (3 - 2 * ratio);
};

const TEXTURE_RESOLUTION = 1024;
const NOISE_SCALE = 0.012;
const DETAIL_NOISE_SCALE = 0.07;

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
  const macroPermutation = buildPermutationTable(2323);
  const detailPermutation = buildPermutationTable(8891);
  const speckPermutation = buildPermutationTable(4421);
  const imageData = context.createImageData(TEXTURE_RESOLUTION, TEXTURE_RESOLUTION);
  for (let row = 0; row < TEXTURE_RESOLUTION; row += 1) {
    for (let column = 0; column < TEXTURE_RESOLUTION; column += 1) {
      const x = column * NOISE_SCALE;
      const y = row * NOISE_SCALE;
      const macro = fbmNoise(macroPermutation, x, y, 5, 0.55, 2.1);
      const detail = fbmNoise(detailPermutation, x * 1.8 + 13, y * 1.8 - 7, 3, 0.5, 2.3);
      const speck = fbmNoise(speckPermutation, column * DETAIL_NOISE_SCALE, row * DETAIL_NOISE_SCALE, 2, 0.5, 2.2);
      const grassMix = smoothstep(-0.18, 0.55, macro * 0.55 + detail * 0.15);
      const grassColor = grassMix > 0.55
        ? mixColors(GRASS_BASE, GRASS_LIGHT, smoothstep(0.55, 1.0, grassMix))
        : mixColors(GRASS_DARK, GRASS_BASE, smoothstep(0.0, 0.55, grassMix));
      const dirtMix = smoothstep(0.0, 0.6, macro * 0.35 + detail * 0.2);
      const dirtColor = dirtMix > 0.5
        ? mixColors(DIRT_BASE, DIRT_LIGHT, smoothstep(0.5, 1.0, dirtMix))
        : mixColors(DIRT_DARK, DIRT_BASE, smoothstep(0.0, 0.5, dirtMix));
      const dirtMask = smoothstep(0.22, 0.7, macro * 0.8 + detail * 0.4);
      const blended = mixColors(grassColor, dirtColor, dirtMask);
      const speckShade = 1 + speck * 0.16;
      const finalRed = Math.max(0, Math.min(255, Math.round(blended.red * speckShade)));
      const finalGreen = Math.max(0, Math.min(255, Math.round(blended.green * speckShade)));
      const finalBlue = Math.max(0, Math.min(255, Math.round(blended.blue * speckShade)));
      const pixelIndex = (row * TEXTURE_RESOLUTION + column) * 4;
      imageData.data[pixelIndex] = finalRed;
      imageData.data[pixelIndex + 1] = finalGreen;
      imageData.data[pixelIndex + 2] = finalBlue;
      imageData.data[pixelIndex + 3] = 255;
    }
  }
  context.putImageData(imageData, 0, 0);

  const grassBladeRandom = createSeededRandom(7177);
  context.globalAlpha = 0.45;
  for (let index = 0; index < 4200; index += 1) {
    const x = grassBladeRandom() * TEXTURE_RESOLUTION;
    const y = grassBladeRandom() * TEXTURE_RESOLUTION;
    const macro = fbmNoise(macroPermutation, x * NOISE_SCALE, y * NOISE_SCALE, 4, 0.55, 2.1);
    if (macro > 0.05) {
      continue;
    }
    const length = 2 + grassBladeRandom() * 4;
    context.strokeStyle = `rgba(58, 92, 30, ${0.35 + grassBladeRandom() * 0.35})`;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + (grassBladeRandom() - 0.5) * 1.2, y - length);
    context.stroke();
  }
  context.globalAlpha = 1;

  const speckleRandom = createSeededRandom(9941);
  context.globalAlpha = 0.5;
  for (let index = 0; index < 1800; index += 1) {
    const x = speckleRandom() * TEXTURE_RESOLUTION;
    const y = speckleRandom() * TEXTURE_RESOLUTION;
    const macro = fbmNoise(macroPermutation, x * NOISE_SCALE, y * NOISE_SCALE, 4, 0.55, 2.1);
    if (macro < 0.2) {
      continue;
    }
    const radius = 0.8 + speckleRandom() * 2.4;
    context.fillStyle = speckleRandom() > 0.4 ? '#3f2912' : '#8a6a3f';
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;

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
  texture.repeat.set(2.5, 2.5);
  texture.needsUpdate = true;
  return texture;
};

export const Terrain = ({ worldSize }: TerrainProps) => {
  const terrainTexture = useMemo(() => createTerrainTexture(), []);

  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[worldSize, worldSize]} />
      <meshStandardMaterial map={terrainTexture} color="#d4e5af" roughness={0.94} metalness={0.01} />
    </mesh>
  );
};
