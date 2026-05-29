import { PER_ORIGIN_LOG_QUOTA, PER_ORIGIN_QUOTA_WINDOW_MS } from './constants';
import type { CallsiteAccumulator } from './types';

const callsiteAccumulators = new Map<string, CallsiteAccumulator>();
const originLogQuota = new Map<string, { count: number; windowStartMs: number }>();

export const trackCallsite = (source: string, origin: string, durationMs: number): void => {
  const key = `${source}::${origin}`;
  const existing = callsiteAccumulators.get(key);
  if (existing) {
    existing.callCount += 1;
    existing.totalMs += durationMs;
    if (durationMs > existing.maxMs) {
      existing.maxMs = durationMs;
    }
    return;
  }
  callsiteAccumulators.set(key, {
    origin,
    source,
    callCount: 1,
    totalMs: durationMs,
    maxMs: durationMs,
  });
};

export const shouldLogForOrigin = (originKey: string): boolean => {
  const now = performance.now();
  const entry = originLogQuota.get(originKey);
  if (!entry) {
    originLogQuota.set(originKey, { count: 1, windowStartMs: now });
    return true;
  }
  if (now - entry.windowStartMs > PER_ORIGIN_QUOTA_WINDOW_MS) {
    entry.count = 1;
    entry.windowStartMs = now;
    return true;
  }
  if (entry.count >= PER_ORIGIN_LOG_QUOTA) {
    return false;
  }
  entry.count += 1;
  return true;
};

export const resetCallsiteTracker = (): void => {
  callsiteAccumulators.clear();
  originLogQuota.clear();
};

export const getCallsiteAccumulators = (): Map<string, CallsiteAccumulator> => callsiteAccumulators;

export const dumpCallsiteSummary = (): void => {
  if (callsiteAccumulators.size === 0) {
    console.info('[perf-debugger] no slow callsites recorded yet');
    return;
  }
  const ranked = Array.from(callsiteAccumulators.values())
    .sort((a, b) => b.totalMs - a.totalMs)
    .slice(0, 10);
  console.group(`[perf-debugger] top ${ranked.length} slow callsites (since last reset)`);
  for (const entry of ranked) {
    const avg = entry.totalMs / entry.callCount;
    const pctBudget = ((avg / 16.67) * 100).toFixed(0);
    console.warn(
      `[${entry.source}] total=${entry.totalMs.toFixed(0)}ms calls=${entry.callCount} max=${entry.maxMs.toFixed(1)}ms avg=${avg.toFixed(1)}ms (${pctBudget}% frame budget)\n  origin: ${entry.origin}`,
    );
  }
  console.groupEnd();
};
