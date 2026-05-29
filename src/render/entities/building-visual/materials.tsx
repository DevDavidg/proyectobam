import {
  CanvasTexture,
  Color,
  DataTexture,
  MeshStandardMaterial,
  MeshToonMaterial,
  NearestFilter,
  RepeatWrapping,
  SRGBColorSpace,
  type Material,
} from 'three';
import type { BuildingVisualMaterialMode, MaterialToken } from './types';

type BuildingMaterialConfig = {
  color: string;
};

type MetalConfig = {
  metalness: number;
  roughness: number;
  envMapIntensity: number;
  emissive?: string;
  emissiveIntensity?: number;
};

const MATCAP_BY_TOKEN = {
  gold: '#d6a34f',
  iron: '#8ca0b7',
  wood: '#9a6239',
  goo: '#5f8cab',
  stone: '#a4a1a0',
} as const;

const METAL_CONFIG_BY_TOKEN: Partial<Record<MaterialToken, MetalConfig>> = {
  iron: { metalness: 0.8, roughness: 0.46, envMapIntensity: 0.72 },
  gold: { metalness: 0.9, roughness: 0.32, envMapIntensity: 1.05 },
  goo: {
    metalness: 0.62,
    roughness: 0.5,
    envMapIntensity: 0.55,
    emissive: '#3b82f6',
    emissiveIntensity: 0.08,
  },
};

const createNoiseTexture = () => {
  const size = 32;
  const data = new Uint8Array(size * size * 4);
  for (let index = 0; index < size * size; index += 1) {
    const x = index % size;
    const y = Math.floor(index / size);
    const noise = Math.floor((((x * 37 + y * 73) % 100) / 100) * 255);
    const dataIndex = index * 4;
    data[dataIndex] = noise;
    data[dataIndex + 1] = noise;
    data[dataIndex + 2] = noise;
    data[dataIndex + 3] = 255;
  }
  const texture = new DataTexture(data, size, size);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
};

const NOISE_TEXTURE = createNoiseTexture();

const createFallbackTexture = (color: string) => {
  const data = new Uint8Array(4);
  const parsed = new Color(color);
  data[0] = Math.round(parsed.r * 255);
  data[1] = Math.round(parsed.g * 255);
  data[2] = Math.round(parsed.b * 255);
  data[3] = 255;
  const texture = new DataTexture(data, 1, 1);
  texture.needsUpdate = true;
  return texture;
};

const createProceduralMatcapTexture = (baseColor: string) => {
  if (typeof document === 'undefined') {
    return createFallbackTexture(baseColor);
  }
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) {
    return createFallbackTexture(baseColor);
  }

  context.fillStyle = '#121212';
  context.fillRect(0, 0, size, size);

  context.fillStyle = baseColor;
  context.beginPath();
  context.arc(size / 2, size / 2, size * 0.48, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = 'rgba(255,255,255,0.22)';
  context.beginPath();
  context.arc(size * 0.36, size * 0.32, size * 0.16, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = 'rgba(0,0,0,0.55)';
  context.lineWidth = size * 0.06;
  context.beginPath();
  context.arc(size / 2, size / 2, size * 0.45, 0, Math.PI * 2);
  context.stroke();

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const createGaugeTexture = () => {
  if (typeof document === 'undefined') {
    return createFallbackTexture('#f5f5f4');
  }
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) {
    return createFallbackTexture('#f5f5f4');
  }
  context.fillStyle = '#f5f5f4';
  context.fillRect(0, 0, size, size);
  context.strokeStyle = '#1f2937';
  context.lineWidth = 6;
  context.beginPath();
  context.arc(size / 2, size / 2, 52, 0, Math.PI * 2);
  context.stroke();
  for (let index = 0; index < 7; index += 1) {
    const angle = Math.PI + (index * Math.PI) / 6;
    const fromX = size / 2 + Math.cos(angle) * 34;
    const fromY = size / 2 + Math.sin(angle) * 34;
    const toX = size / 2 + Math.cos(angle) * 46;
    const toY = size / 2 + Math.sin(angle) * 46;
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.stroke();
  }
  context.strokeStyle = '#111827';
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(size / 2, size / 2);
  context.lineTo(size / 2 + 24, size / 2 - 18);
  context.stroke();
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const MATCAP_TEXTURE_BY_TOKEN = {
  gold: createProceduralMatcapTexture(MATCAP_BY_TOKEN.gold),
  iron: createProceduralMatcapTexture(MATCAP_BY_TOKEN.iron),
  wood: createProceduralMatcapTexture(MATCAP_BY_TOKEN.wood),
  goo: createProceduralMatcapTexture(MATCAP_BY_TOKEN.goo),
  stone: createProceduralMatcapTexture(MATCAP_BY_TOKEN.stone),
} as const;

const createToonGradientTexture = (): DataTexture => {
  const data = new Uint8Array([
    60, 60, 60, 255, 150, 150, 150, 255, 245, 245, 245, 255,
  ]);
  const texture = new DataTexture(data, 3, 1);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

export const TOON_GRADIENT_TEXTURE = createToonGradientTexture();

const BUILDING_MATERIAL_CACHE = new Map<string, Material>();

const getMaterialConfig = (
  materialMode: BuildingVisualMaterialMode,
  fallbackColor: string,
): BuildingMaterialConfig => {
  if (materialMode === 'ghost-valid') {
    return { color: '#60a5fa' };
  }
  if (materialMode === 'ghost-invalid') {
    return { color: '#ef4444' };
  }
  if (materialMode === 'highlight') {
    return { color: '#facc15' };
  }
  return { color: fallbackColor };
};

const buildMaterialCacheKey = (
  materialMode: BuildingVisualMaterialMode,
  isGhost: boolean,
  opacity: number,
  color: string,
  token: MaterialToken,
  variant: 'metal' | 'toon',
): string => `${materialMode}|${isGhost}|${opacity}|${color}|${token}|${variant}`;

const getCachedToonMaterial = (
  materialMode: BuildingVisualMaterialMode,
  isGhost: boolean,
  opacity: number,
  color: string,
  token: MaterialToken,
): MeshToonMaterial => {
  const key = buildMaterialCacheKey(materialMode, isGhost, opacity, color, token, 'toon');
  const cached = BUILDING_MATERIAL_CACHE.get(key);
  if (cached instanceof MeshToonMaterial) {
    return cached;
  }

  const material = new MeshToonMaterial({
    color,
    gradientMap: TOON_GRADIENT_TEXTURE,
    transparent: isGhost,
    opacity,
  });
  BUILDING_MATERIAL_CACHE.set(key, material);
  return material;
};

const getCachedMetalMaterial = (
  materialMode: BuildingVisualMaterialMode,
  isGhost: boolean,
  opacity: number,
  color: string,
  token: MaterialToken,
  metalConfig: MetalConfig,
): MeshStandardMaterial => {
  const key = buildMaterialCacheKey(materialMode, isGhost, opacity, color, token, 'metal');
  const cached = BUILDING_MATERIAL_CACHE.get(key);
  if (cached instanceof MeshStandardMaterial) {
    return cached;
  }

  const material = new MeshStandardMaterial({
    color,
    metalness: metalConfig.metalness,
    roughness: metalConfig.roughness,
    envMapIntensity: metalConfig.envMapIntensity,
    emissive: metalConfig.emissive ?? '#000000',
    emissiveIntensity: metalConfig.emissiveIntensity ?? 0,
    transparent: isGhost,
    opacity,
  });
  BUILDING_MATERIAL_CACHE.set(key, material);
  return material;
};

export const HATCHERY_GAUGE_TEXTURE = createGaugeTexture();

export const createMaterialFactory = (
  materialMode: BuildingVisualMaterialMode,
  isGhost: boolean,
  opacity: number,
) => {
  return (fallbackColor: string, token: MaterialToken): Material => {
    const config = getMaterialConfig(materialMode, fallbackColor);
    const metalConfig = METAL_CONFIG_BY_TOKEN[token];
    const useMetalMaterial = !isGhost && materialMode === 'default' && !!metalConfig;

    if (useMetalMaterial && metalConfig) {
      return getCachedMetalMaterial(materialMode, isGhost, opacity, config.color, token, metalConfig);
    }

    return getCachedToonMaterial(materialMode, isGhost, opacity, config.color, token);
  };
};

export { MATCAP_TEXTURE_BY_TOKEN, NOISE_TEXTURE };
