export type RaidWaveConfig = {
  wavePoints: number;
  minMobs: number;
  spawnStaggerMs: number;
};

export const getRaidWaveConfig = (townHallLevel: number): RaidWaveConfig => {
  const level = Math.max(1, townHallLevel);
  return {
    wavePoints: level * 8 + 4 + Math.floor(Math.random() * 6),
    minMobs: Math.min(24, 2 + level * 2),
    spawnStaggerMs: 320,
  };
};
