export const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

export const easeInOut = (t: number): number => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

export const stagedProgress = (progress: number, start: number, end: number): number => {
  if (end <= start) return progress >= start ? 1 : 0;
  return clamp01((progress - start) / (end - start));
};
