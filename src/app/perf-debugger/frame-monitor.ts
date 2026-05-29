import {
  FRAME_BUDGET_MS,
  HEALTH_AVG_DRAWS_WARN,
  HEALTH_CHECK_INTERVAL_MS,
  HEALTH_JANK_STREAK_WARN,
  HEALTH_LONG_TASK_RATIO_WARN_PCT,
  HEALTH_MAX_RAF_WARN_MS,
  HEALTH_MIN_RENDER_FPS,
  HEALTH_P95_RAF_CRITICAL_MS,
  HEALTH_P95_RAF_WARN_MS,
  WEBGL_CANVAS_LEAK_WARN,
} from './constants';
import type { FrameHealthIssue, FrameSnapshot, ReactCommitInfo } from './types';
import { computeAverage, computePercentile, formatMs } from './utils';

const frameSnapshots: FrameSnapshot[] = [];
let jankStreak = 0;
let maxJankStreakInWindow = 0;
let longTaskTotalMsInWindow = 0;
let longTaskCountInWindow = 0;
let lastReactCommitInfo: ReactCommitInfo | null = null;
let webglCanvasInstanceCount = 0;
let webglContextLostCount = 0;

export const setReactCommitInfo = (info: ReactCommitInfo): void => {
  lastReactCommitInfo = info;
};

export const getReactCommitInfo = (): ReactCommitInfo | null => lastReactCommitInfo;

export const recordFrameSnapshot = (snapshot: FrameSnapshot): void => {
  frameSnapshots.push(snapshot);
  if (snapshot.rafTotalMs > FRAME_BUDGET_MS) {
    jankStreak += 1;
    if (jankStreak > maxJankStreakInWindow) {
      maxJankStreakInWindow = jankStreak;
    }
  } else {
    jankStreak = 0;
  }
};

export const getJankStreak = (): number => jankStreak;

export const getLastFrameSnapshot = (): FrameSnapshot | null => {
  if (frameSnapshots.length === 0) {
    return null;
  }
  return frameSnapshots[frameSnapshots.length - 1];
};

export const addLongTaskToWindow = (durationMs: number): void => {
  longTaskCountInWindow += 1;
  longTaskTotalMsInWindow += durationMs;
};

export const setWebglCounts = (instances: number, lost: number): void => {
  webglCanvasInstanceCount = instances;
  webglContextLostCount = lost;
};

export const getWebglAliveApprox = (): number =>
  Math.max(0, webglCanvasInstanceCount - webglContextLostCount);

export const resetFrameMonitor = (): void => {
  frameSnapshots.length = 0;
  jankStreak = 0;
  maxJankStreakInWindow = 0;
  longTaskTotalMsInWindow = 0;
  longTaskCountInWindow = 0;
};

export const getFrameSnapshots = (): FrameSnapshot[] => frameSnapshots;

const evaluateHealth = (): FrameHealthIssue[] => {
  const issues: FrameHealthIssue[] = [];

  if (frameSnapshots.length > 0) {
    const totalsSorted = frameSnapshots.map((s) => s.rafTotalMs).slice().sort((a, b) => a - b);
    const p95Total = computePercentile(totalsSorted, 95);
    const p99Total = computePercentile(totalsSorted, 99);
    const maxTotal = totalsSorted[totalsSorted.length - 1] ?? 0;
    const renderFrames = frameSnapshots.filter((s) => s.drawCalls > 0 || s.glRenderMs > 0).length;
    const renderFps = renderFrames / (HEALTH_CHECK_INTERVAL_MS / 1000);
    const avgDraws = computeAverage(frameSnapshots.map((s) => s.drawCalls));

    if (p95Total >= HEALTH_P95_RAF_CRITICAL_MS) {
      issues.push({
        severity: 'critical',
        code: 'raf-p95-critical',
        detail: `p95 rAF=${formatMs(p95Total)}ms (budget ${FRAME_BUDGET_MS.toFixed(1)}ms, ~${Math.round(1000 / p95Total)}fps cap)`,
      });
    } else if (p95Total >= HEALTH_P95_RAF_WARN_MS) {
      issues.push({
        severity: 'warn',
        code: 'raf-p95-warn',
        detail: `p95 rAF=${formatMs(p95Total)}ms exceeds ${HEALTH_P95_RAF_WARN_MS}ms target`,
      });
    }

    if (p99Total >= HEALTH_MAX_RAF_WARN_MS) {
      issues.push({
        severity: 'warn',
        code: 'raf-p99-spike',
        detail: `p99 rAF=${formatMs(p99Total)}ms max=${formatMs(maxTotal)}ms`,
      });
    }

    if (renderFrames > 0 && renderFps < HEALTH_MIN_RENDER_FPS) {
      issues.push({
        severity: 'warn',
        code: 'render-fps-low',
        detail: `render ${renderFps.toFixed(1)} fps (${renderFrames} frames in window, min ${HEALTH_MIN_RENDER_FPS})`,
      });
    }

    if (avgDraws >= HEALTH_AVG_DRAWS_WARN) {
      issues.push({
        severity: 'warn',
        code: 'draw-calls-high',
        detail: `avg ${avgDraws.toFixed(0)} draw calls/frame (threshold ${HEALTH_AVG_DRAWS_WARN})`,
      });
    }
  }

  if (maxJankStreakInWindow >= HEALTH_JANK_STREAK_WARN) {
    issues.push({
      severity: 'warn',
      code: 'jank-streak',
      detail: `${maxJankStreakInWindow} consecutive frames over ${FRAME_BUDGET_MS.toFixed(1)}ms budget`,
    });
  }

  if (longTaskCountInWindow > 0) {
    const ratio = (longTaskTotalMsInWindow / HEALTH_CHECK_INTERVAL_MS) * 100;
    if (ratio >= HEALTH_LONG_TASK_RATIO_WARN_PCT) {
      issues.push({
        severity: ratio >= 15 ? 'critical' : 'warn',
        code: 'longtask-blocked',
        detail: `${longTaskCountInWindow} long tasks, ${longTaskTotalMsInWindow.toFixed(0)}ms blocked (${ratio.toFixed(0)}% main thread)`,
      });
    }
  }

  if (webglCanvasInstanceCount > WEBGL_CANVAS_LEAK_WARN) {
    issues.push({
      severity: 'warn',
      code: 'webgl-canvas-leak',
      detail: `${webglCanvasInstanceCount} canvases created, ~${getWebglAliveApprox()} alive, ${webglContextLostCount} disposed`,
    });
  }

  return issues;
};

export const dumpHealthSummaryIfNeeded = (): void => {
  const issues = evaluateHealth();
  if (issues.length === 0) {
    frameSnapshots.length = 0;
    maxJankStreakInWindow = 0;
    longTaskTotalMsInWindow = 0;
    longTaskCountInWindow = 0;
    return;
  }

  const hasCritical = issues.some((issue) => issue.severity === 'critical');
  const logFn = hasCritical ? console.error.bind(console) : console.warn.bind(console);

  if (frameSnapshots.length > 0) {
    const totalsSorted = frameSnapshots.map((s) => s.rafTotalMs).slice().sort((a, b) => a - b);
    const glSorted = frameSnapshots.map((s) => s.glRenderMs).slice().sort((a, b) => a - b);
    const useFrameSorted = frameSnapshots.map((s) => s.useFrameMs).slice().sort((a, b) => a - b);
    const avgTotal = computeAverage(totalsSorted);
    const avgGl = computeAverage(glSorted);
    const avgUf = computeAverage(useFrameSorted);
    const p95Total = computePercentile(totalsSorted, 95);
    const p95Gl = computePercentile(glSorted, 95);
    const p95Uf = computePercentile(useFrameSorted, 95);
    const avgDraws = computeAverage(frameSnapshots.map((s) => s.drawCalls));
    const avgTris = computeAverage(frameSnapshots.map((s) => s.triangles));
    const renderFrames = frameSnapshots.filter((s) => s.drawCalls > 0 || s.glRenderMs > 0).length;
    const renderFps = renderFrames / (HEALTH_CHECK_INTERVAL_MS / 1000);

    logFn(
      `[perf-debugger] ⚠ performance issues (${issues.length}) | ${frameSnapshots.length} rAF | render ${renderFps.toFixed(1)} fps | raf avg=${formatMs(avgTotal)} p95=${formatMs(p95Total)} | useFrame p95=${formatMs(p95Uf)} | gl p95=${formatMs(p95Gl)} | ${avgDraws.toFixed(0)} draws / ${(avgTris / 1000).toFixed(1)}k tris`,
    );
  }

  for (const issue of issues) {
    const prefix = issue.severity === 'critical' ? '🔴' : '🟡';
    logFn(`[perf-debugger] ${prefix} ${issue.code}: ${issue.detail}`);
  }

  if (lastReactCommitInfo && lastReactCommitInfo.actualDuration >= FRAME_BUDGET_MS) {
    logFn(
      `[perf-debugger] last react commit "${lastReactCommitInfo.id}" ${lastReactCommitInfo.actualDuration.toFixed(1)}ms phase=${lastReactCommitInfo.phase}`,
    );
  }

  frameSnapshots.length = 0;
  maxJankStreakInWindow = 0;
  longTaskTotalMsInWindow = 0;
  longTaskCountInWindow = 0;
};
