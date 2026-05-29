import {
  ERROR_DEDUP_WINDOW_MS,
  MAX_RECENT_ERRORS,
} from './constants';
import type { DebugContext, RecordedError } from './types';
import { buildErrorFingerprint, extractErrorMessage, extractErrorStack } from './utils';
import { getJankStreak, getLastFrameSnapshot, getReactCommitInfo, getWebglAliveApprox } from './frame-monitor';

let crashDetectorInstalled = false;
const recentErrors: RecordedError[] = [];
const errorDedup = new Map<string, { lastLoggedMs: number; record: RecordedError }>();

let getDebugContext: () => DebugContext = () => ({
  reactCommit: getReactCommitInfo(),
  lastFrame: getLastFrameSnapshot(),
  jankStreak: getJankStreak(),
  webglAliveApprox: getWebglAliveApprox(),
});

export const setDebugContextProvider = (provider: () => DebugContext): void => {
  getDebugContext = provider;
};

const buildContextSnippet = (): string => {
  const ctx = getDebugContext();
  const parts: string[] = [];
  if (ctx.reactCommit) {
    parts.push(
      `react="${ctx.reactCommit.id}" ${ctx.reactCommit.actualDuration.toFixed(1)}ms ${ctx.reactCommit.phase}`,
    );
  }
  if (ctx.lastFrame) {
    parts.push(
      `lastFrame rAF=${ctx.lastFrame.rafTotalMs.toFixed(1)}ms gl=${ctx.lastFrame.glRenderMs.toFixed(1)}ms draws=${ctx.lastFrame.drawCalls}`,
    );
  }
  if (ctx.jankStreak > 0) {
    parts.push(`jankStreak=${ctx.jankStreak}`);
  }
  parts.push(`webglAlive~=${ctx.webglAliveApprox}`);
  return parts.join(' | ');
};

const recordError = (
  kind: RecordedError['kind'],
  message: string,
  stack: string | undefined,
  forceLog: boolean,
): RecordedError | null => {
  const fingerprint = buildErrorFingerprint(message, stack);
  const now = performance.now();
  const dedupEntry = errorDedup.get(fingerprint);
  const context = buildContextSnippet();

  if (dedupEntry && now - dedupEntry.lastLoggedMs < ERROR_DEDUP_WINDOW_MS) {
    dedupEntry.record.count += 1;
    dedupEntry.lastLoggedMs = now;
    return null;
  }

  const record: RecordedError = {
    fingerprint,
    kind,
    message,
    stack,
    timestamp: now,
    count: dedupEntry ? dedupEntry.record.count + 1 : 1,
    context,
  };

  errorDedup.set(fingerprint, { lastLoggedMs: now, record });
  recentErrors.unshift(record);
  if (recentErrors.length > MAX_RECENT_ERRORS) {
    recentErrors.pop();
  }

  if (forceLog) {
    const repeatNote = record.count > 1 ? ` (×${record.count} in window)` : '';
    console.error(
      `[perf-debugger] 🐛 ${kind}${repeatNote}: ${message.slice(0, 300)}\n  context: ${context}${stack ? `\n  stack: ${stack.split('\n').slice(1, 5).join('\n        ')}` : ''}`,
    );
  }

  return record;
};

const isBenignConsoleNoise = (message: string): boolean => {
  if (message.includes('THREE.WebGLRenderer: Context Lost')) {
    return true;
  }
  if (message.includes('[perf-debugger]')) {
    return true;
  }
  if (message.includes('[Violation]')) {
    return true;
  }
  return false;
};

const isLikelyReactDevNoise = (message: string): boolean => {
  return (
    message.includes('Warning: ') ||
    message.includes('React does not recognize') ||
    message.includes('validateDOMNesting')
  );
};

export const getRecentErrors = (): readonly RecordedError[] => recentErrors;

export const resetCrashDetector = (): void => {
  recentErrors.length = 0;
  errorDedup.clear();
};

export const installCrashDetector = (): void => {
  if (crashDetectorInstalled || typeof window === 'undefined') {
    return;
  }
  crashDetectorInstalled = true;

  window.addEventListener('error', (event) => {
    const message = event.message || extractErrorMessage(event.error);
    const stack = event.error instanceof Error ? event.error.stack : undefined;
    recordError('error', message, stack, true);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const message = extractErrorMessage(event.reason);
    const stack = extractErrorStack(event.reason);
    recordError('unhandledrejection', message, stack, true);
  });

  const originalConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const firstArg = args[0];
    const message = typeof firstArg === 'string' ? firstArg : extractErrorMessage(firstArg);
    originalConsoleError(...args);
    if (isBenignConsoleNoise(message)) {
      return;
    }
    const stack = extractErrorStack(firstArg);
    const isBug =
      !isLikelyReactDevNoise(message) &&
      (message.includes('Error') ||
        message.includes('error') ||
        message.includes('failed') ||
        message.includes('Failed') ||
        message.includes('TypeError') ||
        message.includes('ReferenceError') ||
        firstArg instanceof Error);
    if (isBug) {
      const record = recordError('console', message, stack, false);
      if (record) {
        console.warn(`[perf-debugger] 🐛 console.error context: ${record.context}`);
      }
    }
  };
};
