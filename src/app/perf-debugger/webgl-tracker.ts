import { WEBGL_CANVAS_LEAK_WARN } from './constants';
import { setWebglCounts } from './frame-monitor';

let webglContextTrackerInstalled = false;
let webglCanvasInstanceCount = 0;
let webglContextLostCount = 0;
let webglContextRestoredCount = 0;

export const getWebglStats = () => ({
  canvasInstancesEver: webglCanvasInstanceCount,
  contextLostCount: webglContextLostCount,
  contextRestoredCount: webglContextRestoredCount,
  canvasAliveApprox: Math.max(0, webglCanvasInstanceCount - webglContextLostCount),
});

const syncCounts = (): void => {
  setWebglCounts(webglCanvasInstanceCount, webglContextLostCount);
};

const trackWebGLCanvas = (canvas: HTMLCanvasElement): void => {
  webglCanvasInstanceCount += 1;
  syncCounts();
  const canvasInstanceId = webglCanvasInstanceCount;

  if (webglCanvasInstanceCount > WEBGL_CANVAS_LEAK_WARN) {
    console.warn(
      '[perf-debugger] webgl canvas leak? #%d created | alive~=%d | disposes=%d',
      canvasInstanceId,
      webglCanvasInstanceCount - webglContextLostCount,
      webglContextLostCount,
    );
  }

  const handleContextLost = (event: Event): void => {
    webglContextLostCount += 1;
    syncCounts();
    event.preventDefault();
    const isBenignUnmount = !canvas.isConnected;
    if (isBenignUnmount) {
      return;
    }
    console.error(
      '[perf-debugger] 🔴 webgl CONTEXT LOST on canvas #%d (still attached!) | parent=%s | total=%d',
      canvasInstanceId,
      canvas.parentElement?.tagName ?? 'detached',
      webglContextLostCount,
    );
    if (typeof console.trace === 'function') {
      console.trace('[perf-debugger] context lost stack');
    }
  };

  const handleContextRestored = (): void => {
    webglContextRestoredCount += 1;
    console.warn(
      '[perf-debugger] webgl context restored on canvas #%d | total restores=%d',
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
