import {
  LONG_TASK_DETAIL_THRESHOLD_MS,
  LONG_TASK_THRESHOLD_MS,
} from './constants';
import { addLongTaskToWindow, getReactCommitInfo, getLastFrameSnapshot, getJankStreak, getWebglAliveApprox } from './frame-monitor';
import type { LongTaskEntry } from './types';
import { formatAttribution } from './utils';

let longTaskObserver: PerformanceObserver | null = null;

const buildContextSnippet = (): string => {
  const reactCommit = getReactCommitInfo();
  const lastFrame = getLastFrameSnapshot();
  const parts: string[] = [];
  if (reactCommit) {
    parts.push(`react="${reactCommit.id}" ${reactCommit.actualDuration.toFixed(1)}ms`);
  }
  if (lastFrame) {
    parts.push(`lastFrame=${lastFrame.rafTotalMs.toFixed(1)}ms`);
  }
  if (getJankStreak() > 0) {
    parts.push(`jankStreak=${getJankStreak()}`);
  }
  parts.push(`webglAlive~=${getWebglAliveApprox()}`);
  return parts.join(' | ');
};

export const installLongTaskObserver = (): void => {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return;
  }
  if (longTaskObserver) {
    return;
  }
  try {
    longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LongTaskEntry[]) {
        if (entry.duration < LONG_TASK_THRESHOLD_MS) {
          continue;
        }
        addLongTaskToWindow(entry.duration);

        if (entry.duration >= LONG_TASK_DETAIL_THRESHOLD_MS) {
          const attribution = formatAttribution(entry.attribution);
          console.warn(
            `[perf-debugger] longtask ${entry.duration.toFixed(0)}ms | attribution=${attribution} | ${buildContextSnippet()}`,
          );
        }
      }
    });
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    console.warn('[perf-debugger] longtask observer unsupported', error);
  }
};
