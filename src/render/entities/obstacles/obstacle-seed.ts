export const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

export const seeded = (seed: number, offset: number): number => {
  const value = Math.sin((seed + offset) * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

export const mapSeeded = (seed: number, offset: number, min: number, max: number): number =>
  min + seeded(seed, offset) * (max - min);

export const resolveObstacleVariantIndex = (seed: number): number => seed % 3;

export const resolveObstacleScale = (seed: number): number => mapSeeded(seed, 1, 0.92, 1.25) * 0.5;

export const resolveObstacleRotationY = (seed: number): number => mapSeeded(seed, 9, 0, Math.PI * 2);
