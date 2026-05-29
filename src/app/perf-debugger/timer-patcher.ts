import {
  FRAME_BUDGET_MS,
  HEALTH_CHECK_INTERVAL_MS,
  SLOW_CALLBACK_THRESHOLD_MS,
  SLOW_GL_RENDER_THRESHOLD_MS,
  SLOW_RAF_LOG_THRESHOLD_MS,
} from './constants';
import { dumpCallsiteSummary, shouldLogForOrigin, trackCallsite } from './callsite-tracker';
import { recordFrameSnapshot } from './frame-monitor';
import { captureCallsite } from './utils';
import type { WebGLRenderer } from 'three';

const NATIVE_SET_INTERVAL: typeof globalThis.setInterval =
  typeof globalThis !== 'undefined' && typeof globalThis.setInterval === 'function'
    ? globalThis.setInterval.bind(globalThis)
    : ((() => 0) as unknown as typeof globalThis.setInterval);

let timersPatched = false;
let statsDumperInstalled = false;
let keyDumpInstalled = false;

let currentFrameGlRenderMs = 0;
let currentFrameDrawCalls = 0;
let currentFrameTriangles = 0;
let renderHappenedThisFrame = false;

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
              `[perf-debugger] slow setInterval ${duration.toFixed(1)}ms (${((duration / FRAME_BUDGET_MS) * 100).toFixed(0)}% budget, every ${timeoutMs ?? '?'}ms)\n  origin: ${origin}`,
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
              `[perf-debugger] slow setTimeout ${duration.toFixed(1)}ms (${((duration / FRAME_BUDGET_MS) * 100).toFixed(0)}% budget, after ${timeoutMs ?? 0}ms)\n  origin: ${origin}`,
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
          recordFrameSnapshot({
            rafTotalMs: duration,
            glRenderMs: currentFrameGlRenderMs,
            useFrameMs: useFrameDuration,
            drawCalls: currentFrameDrawCalls,
            triangles: currentFrameTriangles,
          });
        }
        if (duration >= SLOW_CALLBACK_THRESHOLD_MS) {
          trackCallsite('requestAnimationFrame', origin, duration);
        }
        if (duration >= SLOW_RAF_LOG_THRESHOLD_MS && shouldLogForOrigin(`raf::${origin}`)) {
          const glPct = duration > 0 ? ((currentFrameGlRenderMs / duration) * 100).toFixed(0) : '0';
          console.warn(
            `[perf-debugger] slow rAF ${duration.toFixed(1)}ms (${((duration / FRAME_BUDGET_MS) * 100).toFixed(0)}% budget) = useFrame ${useFrameDuration.toFixed(1)}ms + gl ${currentFrameGlRenderMs.toFixed(1)}ms (${glPct}%)\n  origin: ${origin}`,
          );
        }
      }
    };
    return original(wrappedCallback);
  }) as typeof requestAnimationFrame;
};

export const installTimerOriginTracker = (): void => {
  if (timersPatched || typeof globalThis === 'undefined') {
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
      const origin = `draws=${renderer.info.render.calls} tris=${renderer.info.render.triangles} programs=${programsCount}`;
      trackCallsite('gl.render', origin, duration);
      if (duration >= FRAME_BUDGET_MS * 0.5 && shouldLogForOrigin(`gl::${origin}`)) {
        console.warn(
          `[perf-debugger] slow gl.render ${duration.toFixed(1)}ms (${((duration / FRAME_BUDGET_MS) * 100).toFixed(0)}% budget) | ${origin}`,
        );
      }
    }
  };
};

export const installKeyboardDump = (onReset: () => void): void => {
  if (keyDumpInstalled || typeof window === 'undefined') {
    return;
  }
  const handleKeyboardShortcut = (event: KeyboardEvent): void => {
    if (event.key === 'F8') {
      event.preventDefault();
      dumpCallsiteSummary();
      return;
    }
    if (event.key === 'F9') {
      event.preventDefault();
      onReset();
    }
  };
  window.addEventListener('keydown', handleKeyboardShortcut);
  keyDumpInstalled = true;
};

export const installPeriodicHealthCheck = (dumpFn: () => void): void => {
  if (statsDumperInstalled) {
    return;
  }
  NATIVE_SET_INTERVAL(dumpFn, HEALTH_CHECK_INTERVAL_MS);
  statsDumperInstalled = true;
};
