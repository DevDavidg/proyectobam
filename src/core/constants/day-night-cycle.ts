const DAY_DURATION_SECONDS = 10 * 60;
const NIGHT_DURATION_SECONDS = 10 * 60;
const TWILIGHT_PORTION = 0.2;

export const DAY_NIGHT_CYCLE_SECONDS = DAY_DURATION_SECONDS + NIGHT_DURATION_SECONDS;

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  if (edge1 <= edge0) {
    return value >= edge1 ? 1 : 0;
  }

  const normalized = clamp01((value - edge0) / (edge1 - edge0));
  return normalized * normalized * (3 - 2 * normalized);
};

export type DayNightCycleState = {
  cycleProgress: number;
  isNight: boolean;
  daylight: number;
  nightFactor: number;
};

/**
 * Ciclo global:
 * - 10 minutos de día
 * - 10 minutos de noche
 * Incluye transición suave al final del día y al inicio del día siguiente.
 */
export const getDayNightCycleState = (
  elapsedSeconds: number,
): DayNightCycleState => {
  const safeElapsed = Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0;
  const normalizedElapsed =
    ((safeElapsed % DAY_NIGHT_CYCLE_SECONDS) + DAY_NIGHT_CYCLE_SECONDS) %
    DAY_NIGHT_CYCLE_SECONDS;

  const dayToNightTransitionStart = DAY_DURATION_SECONDS * (1 - TWILIGHT_PORTION);
  const nightToDayTransitionEnd = NIGHT_DURATION_SECONDS * TWILIGHT_PORTION;
  const isNight = normalizedElapsed >= DAY_DURATION_SECONDS;

  let daylight = 1;

  if (isNight) {
    const nightElapsed = normalizedElapsed - DAY_DURATION_SECONDS;
    daylight = smoothstep(0, nightToDayTransitionEnd, nightElapsed);
  } else {
    daylight = 1 - smoothstep(dayToNightTransitionStart, DAY_DURATION_SECONDS, normalizedElapsed);
  }

  const clampedDaylight = clamp01(daylight);

  return {
    cycleProgress: normalizedElapsed / DAY_NIGHT_CYCLE_SECONDS,
    isNight,
    daylight: clampedDaylight,
    nightFactor: 1 - clampedDaylight,
  };
};
