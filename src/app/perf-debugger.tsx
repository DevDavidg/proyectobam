import { Profiler, type ProfilerOnRenderCallback, type ReactNode } from 'react';
import type { WebGLRenderer } from 'three';

const LONG_TASK_THRESHOLD_MS = 50;
const COMMIT_WARN_THRESHOLD_MS = 50;
const SLOW_CALLBACK_THRESHOLD_MS = 32;
const SLOW_GL_RENDER_THRESHOLD_MS = 12;
const PER_ORIGIN_LOG_QUOTA = 4;
const PER_ORIGIN_QUOTA_WINDOW_MS = 60_000;
const STATS_DUMP_INTERVAL_MS = 3_000;
const STACK_TRIM_REGEX = /\s*at\s+/;
const SCHEDULER_VIOLATION_PATTERN = /\[Violation\][^']*'(message|requestAnimationFrame|setInterval|setTimeout|click|keydown|keyup|input|wheel|scroll|pointer|mouse|touch)' handler took (\d+)ms/;

type LongTaskAttribution = {
  containerType?: string;
  containerName?: string;
  containerSrc?: string;
  containerId?: string;
  name?: string;
};

type LongTaskEntry = PerformanceEntry & {
  attribution?: LongTaskAttribution[];
};

type CallsiteAccumulator = {
  origin: string;
  source: string;
  callCount: number;
  totalMs: number;
  maxMs: number;
};

type FrameSnapshot = {
  rafTotalMs: number;
  glRenderMs: number;
  useFrameMs: number;
  drawCalls: number;
  triangles: number;
};

const NATIVE_SET_INTERVAL: typeof globalThis.setInterval =
  typeof globalThis !== 'undefined' && typeof globalThis.setInterval === 'function'
    ? globalThis.setInterval.bind(globalThis)
    : ((() => 0) as unknown as typeof globalThis.setInterval);

let longTaskObserver: PerformanceObserver | null = null;
let consoleWarnPatched = false;
let consoleErrorPatched = false;
let timersPatched = false;
let keyDumpInstalled = false;
let statsDumperInstalled = false;
let webglContextTrackerInstalled = false;
let webglCanvasInstanceCount = 0;
let webglContextLostCount = 0;
let webglContextRestoredCount = 0;
let lastReactCommitInfo: {
  id: string;
  phase: string;
  actualDuration: number;
  commitTime: number;
} | null = null;

const callsiteAccumulators = new Map<string, CallsiteAccumulator>();
const originLogQuota = new Map<string, { count: number; windowStartMs: number }>();
const frameSnapshots: FrameSnapshot[] = [];

let currentFrameGlRenderMs = 0;
let currentFrameDrawCalls = 0;
let currentFrameTriangles = 0;
let renderHappenedThisFrame = false;
let longTaskTotalMsInWindow = 0;
let longTaskCountInWindow = 0;

const captureCallsite = (skipFrames: number): string => {
  const error = new Error('perf-origin');
  const stack = error.stack ?? '';
  const lines = stack.split('\n').slice(skipFrames, skipFrames + 5);
  const trimmed = lines
    .map((line) => line.replace(STACK_TRIM_REGEX, '').trim())
    .filter((line) => line.length > 0 && !line.includes('perf-debugger'));
  if (trimmed.length === 0) {
    return 'unknown';
  }
  return trimmed.join(' <- ');
};

const trackCallsite = (source: string, origin: string, durationMs: number): void => {
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

const shouldLogForOrigin = (originKey: string): boolean => {
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

const resetAccumulators = (): void => {
  callsiteAccumulators.clear();
  originLogQuota.clear();
  frameSnapshots.length = 0;
  longTaskTotalMsInWindow = 0;
  longTaskCountInWindow = 0;
};

const computePercentile = (sortedValues: number[], percentile: number): number => {
  if (sortedValues.length === 0) {
    return 0;
  }
  const index = Math.min(sortedValues.length - 1, Math.floor((percentile / 100) * sortedValues.length));
  return sortedValues[index];
};

const computeAverage = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }
  let total = 0;
  for (const value of values) {
    total += value;
  }
  return total / values.length;
};

const formatMs = (value: number): string => value.toFixed(1);

const dumpPeriodicSummary = (): void => {
  if (frameSnapshots.length === 0 && longTaskCountInWindow === 0) {
    return;
  }
  if (frameSnapshots.length > 0) {
    const totalsSorted = frameSnapshots.map((snapshot) => snapshot.rafTotalMs).slice().sort((a, b) => a - b);
    const glSorted = frameSnapshots.map((snapshot) => snapshot.glRenderMs).slice().sort((a, b) => a - b);
    const useFrameSorted = frameSnapshots.map((snapshot) => snapshot.useFrameMs).slice().sort((a, b) => a - b);
    const avgTotal = computeAverage(totalsSorted);
    const avgGl = computeAverage(glSorted);
    const avgUf = computeAverage(useFrameSorted);
    const p95Total = computePercentile(totalsSorted, 95);
    const p95Gl = computePercentile(glSorted, 95);
    const p95Uf = computePercentile(useFrameSorted, 95);
    const avgDraws = computeAverage(frameSnapshots.map((snapshot) => snapshot.drawCalls));
    const avgTris = computeAverage(frameSnapshots.map((snapshot) => snapshot.triangles));
    const renderFrames = frameSnapshots.filter((snapshot) => snapshot.drawCalls > 0 || snapshot.glRenderMs > 0).length;
    const renderFps = renderFrames / (STATS_DUMP_INTERVAL_MS / 1000);
    console.warn(
      `[perf-debugger] last ${STATS_DUMP_INTERVAL_MS / 1000}s | ${frameSnapshots.length} rAF (${(frameSnapshots.length / (STATS_DUMP_INTERVAL_MS / 1000)).toFixed(1)} hz) | render ${renderFrames} (${renderFps.toFixed(1)} fps) | raf avg=${formatMs(avgTotal)}ms p95=${formatMs(p95Total)}ms | useFrame avg=${formatMs(avgUf)}ms p95=${formatMs(p95Uf)}ms | gl.render avg=${formatMs(avgGl)}ms p95=${formatMs(p95Gl)}ms | avg ${avgDraws.toFixed(0)} draws / ${(avgTris / 1000).toFixed(1)}k tris`,
    );
  }
  if (longTaskCountInWindow > 0) {
    const ratio = (longTaskTotalMsInWindow / STATS_DUMP_INTERVAL_MS) * 100;
    console.warn(
      `[perf-debugger] longtasks in window | count=${longTaskCountInWindow} total=${longTaskTotalMsInWindow.toFixed(0)}ms (${ratio.toFixed(0)}% wall blocked)`,
    );
  }
  if (webglCanvasInstanceCount > 6) {
    console.warn(
      `[perf-debugger] webgl | canvas ever=${webglCanvasInstanceCount} alive~=${Math.max(0, webglCanvasInstanceCount - webglContextLostCount)} disposed=${webglContextLostCount} restored=${webglContextRestoredCount}`,
    );
  }
  frameSnapshots.length = 0;
  longTaskTotalMsInWindow = 0;
  longTaskCountInWindow = 0;
};

const dumpCallsiteSummary = (): void => {
  if (callsiteAccumulators.size === 0) {
    console.info('[perf-debugger] no slow callsites recorded yet');
    return;
  }
  const ranked = Array.from(callsiteAccumulators.values())
    .sort((a, b) => b.totalMs - a.totalMs)
    .slice(0, 8);
  console.group(`[perf-debugger] top ${ranked.length} slow callsites (since last reset)`);
  for (const entry of ranked) {
    console.warn(
      `${entry.source} total=${entry.totalMs.toFixed(0)}ms calls=${entry.callCount} max=${entry.maxMs.toFixed(0)}ms avg=${(entry.totalMs / entry.callCount).toFixed(1)}ms\n  origin: ${entry.origin}`,
    );
  }
  console.groupEnd();
};

const formatAttribution = (attributions: LongTaskAttribution[] | undefined): string => {
  if (!attributions || attributions.length === 0) {
    return '-';
  }
  return attributions
    .map((entry) => {
      const type = entry.containerType ?? 'unknown';
      const name = entry.containerName ?? entry.containerSrc ?? entry.containerId ?? '-';
      return `${type}:${name}`;
    })
    .join(', ');
};

const buildReactContextSnippet = (): string => {
  if (!lastReactCommitInfo) {
    return 'no-react-commit';
  }
  return `react-last="${lastReactCommitInfo.id}" phase=${lastReactCommitInfo.phase} dur=${lastReactCommitInfo.actualDuration.toFixed(0)}ms`;
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
        longTaskCountInWindow += 1;
        longTaskTotalMsInWindow += entry.duration;
      }
    });
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    console.warn('[perf-debugger] longtask observer unsupported', error);
  }
};

const formatViolationContext = (handlerName: string, duration: number, originalMessage: string): string => {
  return `[perf-debugger] violation ${handlerName} took ${duration}ms | ${buildReactContextSnippet()} | raw="${originalMessage.trim().slice(0, 160)}"`;
};

const wrapConsoleMethod = (methodName: 'warn' | 'error'): void => {
  if (methodName === 'warn' && consoleWarnPatched) {
    return;
  }
  if (methodName === 'error' && consoleErrorPatched) {
    return;
  }
  const original = console[methodName].bind(console);
  const patched = (...args: unknown[]): void => {
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      const match = firstArg.match(SCHEDULER_VIOLATION_PATTERN);
      if (match) {
        const handlerName = match[1];
        const duration = Number(match[2]);
        if (shouldLogForOrigin(`violation::${handlerName}`)) {
          original(formatViolationContext(handlerName, duration, firstArg));
        }
        return;
      }
    }
    original(...args);
  };
  console[methodName] = patched as typeof console.warn;
  if (methodName === 'warn') {
    consoleWarnPatched = true;
  } else {
    consoleErrorPatched = true;
  }
};

export const installSchedulerViolationDebugger = (): void => {
  if (typeof console === 'undefined') {
    return;
  }
  wrapConsoleMethod('warn');
  wrapConsoleMethod('error');
};

type WindowTimerHost = typeof globalThis & {
  setInterval: typeof setInterval;
  setTimeout: typeof setTimeout;
  requestAnimationFrame: typeof requestAnimationFrame;
};

const wrapSetInterval = (host: WindowTimerHost): void => {
  const original = host.setInterval;
  host.setInterval = ((handler: TimerHandler, timeoutMs?: number, ...rest: unknown[]) => {
    if (typeof handler !== 'function') {
      return original(handler, timeoutMs as number, ...(rest as []));
    }
    const origin = captureCallsite(3);
    const callback = handler as (...inner: unknown[]) => unknown;
    const wrappedCallback = (...callbackArgs: unknown[]): unknown => {
      const start = performance.now();
      try {
        return callback.apply(undefined, callbackArgs);
      } finally {
        const duration = performance.now() - start;
        if (duration >= SLOW_CALLBACK_THRESHOLD_MS) {
          trackCallsite('setInterval', origin, duration);
          if (shouldLogForOrigin(`setInterval::${origin}`)) {
            console.warn(
              `[perf-debugger] slow setInterval ${duration.toFixed(0)}ms (every ${timeoutMs ?? '?'}ms) origin: ${origin}`,
            );
          }
        }
      }
    };
    return original(wrappedCallback as TimerHandler, timeoutMs as number, ...(rest as []));
  }) as typeof setInterval;
};

const wrapSetTimeout = (host: WindowTimerHost): void => {
  const original = host.setTimeout;
  host.setTimeout = ((handler: TimerHandler, timeoutMs?: number, ...rest: unknown[]) => {
    if (typeof handler !== 'function') {
      return original(handler, timeoutMs as number, ...(rest as []));
    }
    const origin = captureCallsite(3);
    const callback = handler as (...inner: unknown[]) => unknown;
    const wrappedCallback = (...callbackArgs: unknown[]): unknown => {
      const start = performance.now();
      try {
        return callback.apply(undefined, callbackArgs);
      } finally {
        const duration = performance.now() - start;
        if (duration >= SLOW_CALLBACK_THRESHOLD_MS) {
          trackCallsite('setTimeout', origin, duration);
          if (shouldLogForOrigin(`setTimeout::${origin}`)) {
            console.warn(
              `[perf-debugger] slow setTimeout ${duration.toFixed(0)}ms (after ${timeoutMs ?? 0}ms) origin: ${origin}`,
            );
          }
        }
      }
    };
    return original(wrappedCallback as TimerHandler, timeoutMs as number, ...(rest as []));
  }) as typeof setTimeout;
};

const wrapRequestAnimationFrame = (host: WindowTimerHost): void => {
  const original = host.requestAnimationFrame;
  host.requestAnimationFrame = ((callback: FrameRequestCallback): number => {
    if (typeof callback !== 'function') {
      return original(callback);
    }
    const origin = captureCallsite(3);
    const wrappedCallback: FrameRequestCallback = (time) => {
      currentFrameGlRenderMs = 0;
      currentFrameDrawCalls = 0;
      currentFrameTriangles = 0;
      renderHappenedThisFrame = false;
      const start = performance.now();
      try {
        callback(time);
      } finally {
        const duration = performance.now() - start;
        const useFrameDuration = Math.max(0, duration - currentFrameGlRenderMs);
        if (renderHappenedThisFrame) {
          frameSnapshots.push({
            rafTotalMs: duration,
            glRenderMs: currentFrameGlRenderMs,
            useFrameMs: useFrameDuration,
            drawCalls: currentFrameDrawCalls,
            triangles: currentFrameTriangles,
          });
        }
        if (duration >= SLOW_CALLBACK_THRESHOLD_MS) {
          trackCallsite('requestAnimationFrame', origin, duration);
          if (duration >= SLOW_CALLBACK_THRESHOLD_MS * 3) {
            if (shouldLogForOrigin(`raf::${origin}`)) {
              console.warn(
                `[perf-debugger] slow rAF ${duration.toFixed(0)}ms = useFrame ${useFrameDuration.toFixed(0)}ms + gl.render ${currentFrameGlRenderMs.toFixed(0)}ms | origin: ${origin}`,
              );
            }
          }
        }
      }
    };
    return original(wrappedCallback);
  }) as typeof requestAnimationFrame;
};

export const installTimerOriginTracker = (): void => {
  if (timersPatched) {
    return;
  }
  if (typeof globalThis === 'undefined') {
    return;
  }
  const host = globalThis as WindowTimerHost;
  wrapSetInterval(host);
  wrapSetTimeout(host);
  wrapRequestAnimationFrame(host);
  timersPatched = true;
};

type PerfWrappedRenderer = WebGLRenderer & { __perfRenderWrapped?: boolean };

export const wrapRendererInstance = (renderer: WebGLRenderer): void => {
  const marked = renderer as PerfWrappedRenderer;
  if (marked.__perfRenderWrapped) {
    return;
  }
  marked.__perfRenderWrapped = true;

  const originalRender = renderer.render.bind(renderer);
  renderer.render = (scene, camera) => {
    const start = performance.now();
    originalRender(scene, camera);
    const duration = performance.now() - start;
    renderHappenedThisFrame = true;
    currentFrameGlRenderMs += duration;
    currentFrameDrawCalls += renderer.info.render.calls;
    currentFrameTriangles += renderer.info.render.triangles;
    if (duration >= SLOW_GL_RENDER_THRESHOLD_MS) {
      const programsCount = renderer.info.programs?.length ?? 0;
      trackCallsite(
        'gl.render',
        `draws=${renderer.info.render.calls} tris=${renderer.info.render.triangles} programs=${programsCount}`,
        duration,
      );
    }
  };
};

const handleKeyboardShortcut = (event: KeyboardEvent): void => {
  if (event.key === 'F8') {
    event.preventDefault();
    dumpCallsiteSummary();
    return;
  }
  if (event.key === 'F9') {
    event.preventDefault();
    resetAccumulators();
    console.info('[perf-debugger] accumulators reset');
  }
};

export const installWebGLRenderTimer = (): void => {
  // Render timing attaches per Canvas via PerfCanvas onCreated → wrapRendererInstance().
};

export const installKeyboardDump = (): void => {
  if (keyDumpInstalled || typeof window === 'undefined') {
    return;
  }
  window.addEventListener('keydown', handleKeyboardShortcut);
  keyDumpInstalled = true;
};

export const installPeriodicStatsDumper = (): void => {
  if (statsDumperInstalled) {
    return;
  }
  NATIVE_SET_INTERVAL(dumpPeriodicSummary, STATS_DUMP_INTERVAL_MS);
  statsDumperInstalled = true;
};

const trackWebGLCanvas = (canvas: HTMLCanvasElement): void => {
  webglCanvasInstanceCount += 1;
  const canvasInstanceId = webglCanvasInstanceCount;
  console.info(
    '[perf-debugger] webgl canvas #%d created (total alive ~%d, lost so far=%d)',
    canvasInstanceId,
    webglCanvasInstanceCount - webglContextLostCount,
    webglContextLostCount,
  );

  const handleContextLost = (event: Event): void => {
    webglContextLostCount += 1;
    event.preventDefault();
    const isBenignUnmount = !canvas.isConnected;
    if (isBenignUnmount) {
      console.info(
        '[perf-debugger] webgl benign dispose on canvas #%d (unmount) | total disposes=%d',
        canvasInstanceId,
        webglContextLostCount,
      );
      return;
    }
    console.warn(
      '[perf-debugger] webgl REAL CONTEXT LOST on canvas #%d (still attached!) | total losses=%d | parent=%s',
      canvasInstanceId,
      webglContextLostCount,
      canvas.parentElement?.tagName ?? 'detached',
    );
    if (typeof console.trace === 'function') {
      console.trace('[perf-debugger] real context lost stack trace');
    }
  };

  const handleContextRestored = (): void => {
    webglContextRestoredCount += 1;
    console.info(
      '[perf-debugger] webgl context RESTORED on canvas #%d | total restores=%d',
      canvasInstanceId,
      webglContextRestoredCount,
    );
  };

  canvas.addEventListener('webglcontextlost', handleContextLost as EventListener, { passive: false });
  canvas.addEventListener('webglcontextrestored', handleContextRestored as EventListener, { passive: true });
};

const silenceBenignContextLostLogs = (): void => {
  const originalConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const firstArg = args[0];
    if (typeof firstArg === 'string' && firstArg.includes('THREE.WebGLRenderer: Context Lost')) {
      return;
    }
    originalConsoleError(...args);
  };
  const originalConsoleLog = console.log.bind(console);
  console.log = (...args: unknown[]) => {
    const firstArg = args[0];
    if (typeof firstArg === 'string' && firstArg.includes('THREE.WebGLRenderer: Context Lost')) {
      return;
    }
    originalConsoleLog(...args);
  };
};

export const installWebGLContextTracker = (): void => {
  if (webglContextTrackerInstalled || typeof HTMLCanvasElement === 'undefined') {
    return;
  }
  webglContextTrackerInstalled = true;
  silenceBenignContextLostLogs();

  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function patchedGetContext(
    this: HTMLCanvasElement,
    contextType: string,
    ...rest: unknown[]
  ): RenderingContext | null {
    const result = originalGetContext.call(this, contextType as never, ...(rest as never[]));
    const isWebgl =
      contextType === 'webgl' || contextType === 'webgl2' || contextType === 'experimental-webgl';
    if (isWebgl && result) {
      const alreadyTracked = (this as unknown as { __perfTracked?: boolean }).__perfTracked === true;
      if (!alreadyTracked) {
        (this as unknown as { __perfTracked?: boolean }).__perfTracked = true;
        trackWebGLCanvas(this);
      }
    }
    return result as RenderingContext | null;
  } as typeof HTMLCanvasElement.prototype.getContext;
};

const handleReactCommit: ProfilerOnRenderCallback = (id, phase, actualDuration, _baseDuration, _startTime, commitTime) => {
  lastReactCommitInfo = { id, phase, actualDuration, commitTime };
  if (actualDuration < COMMIT_WARN_THRESHOLD_MS) {
    return;
  }
  console.warn(
    `[perf-debugger] react commit ${actualDuration.toFixed(0)}ms | id="${id}" phase=${phase} committedAt=${commitTime.toFixed(0)}ms`,
  );
};

type RenderProfilerProps = {
  id: string;
  children: ReactNode;
};

export const RenderProfiler = ({ id, children }: RenderProfilerProps) => {
  return (
    <Profiler id={id} onRender={handleReactCommit}>
      {children}
    </Profiler>
  );
};

export const exposeGlobalSnapshotApi = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  (window as unknown as Record<string, unknown>).__perf = {
    dump: dumpCallsiteSummary,
    reset: resetAccumulators,
    snapshots: frameSnapshots,
    accumulators: callsiteAccumulators,
    get webglStats() {
      return {
        canvasInstancesEver: webglCanvasInstanceCount,
        contextLostCount: webglContextLostCount,
        contextRestoredCount: webglContextRestoredCount,
        canvasAliveApprox: Math.max(0, webglCanvasInstanceCount - webglContextLostCount),
      };
    },
  };
};

export const installPerformanceDebugger = (): void => {
  installWebGLContextTracker();
  installTimerOriginTracker();
  installLongTaskObserver();
  installSchedulerViolationDebugger();
  installWebGLRenderTimer();
  installKeyboardDump();
  installPeriodicStatsDumper();
  exposeGlobalSnapshotApi();
  if (typeof console !== 'undefined') {
    console.info(
      '[perf-debugger] active | longtask>=%dms commits>=%dms cb>=%dms gl>=%dms | stats every %ds | F8 dump, F9 reset, window.__perf',
      LONG_TASK_THRESHOLD_MS,
      COMMIT_WARN_THRESHOLD_MS,
      SLOW_CALLBACK_THRESHOLD_MS,
      SLOW_GL_RENDER_THRESHOLD_MS,
      STATS_DUMP_INTERVAL_MS / 1000,
    );
  }
};
