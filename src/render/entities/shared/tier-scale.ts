export type TierScaleTable = Readonly<Record<number, number>>;

export const COLLECTOR_TIER_SCALES = {
  gooFactory: { 2: 1.02, 3: 1.04, 6: 1.1, 10: 1.18 },
  pebbleShiner: { 2: 1.08, 3: 1.12, 6: 1.16, 10: 1.22 },
  puttySquisher: { 3: 1.05, 6: 1.1, 10: 1.18 },
  twigSnapper: { 3: 1.05, 6: 1.1, 10: 1.18 },
} as const satisfies Record<string, TierScaleTable>;

export const resolveTierScaleFromTable = (level: number, table: TierScaleTable): number => {
  const safeLevel = Math.max(1, Math.floor(level));
  const thresholds = Object.keys(table)
    .map(Number)
    .sort((a, b) => a - b);
  let scale = 1;
  for (const threshold of thresholds) {
    if (safeLevel >= threshold) {
      scale = table[threshold];
    }
  }
  return scale;
};
