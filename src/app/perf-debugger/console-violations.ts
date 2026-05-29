import { SCHEDULER_VIOLATION_PATTERN } from './constants';
import { shouldLogForOrigin } from './callsite-tracker';
import { getReactCommitInfo } from './frame-monitor';

let consoleWarnPatched = false;
let consoleErrorPatched = false;

const buildReactContextSnippet = (): string => {
  const commit = getReactCommitInfo();
  if (!commit) {
    return 'no-react-commit';
  }
  return `react-last="${commit.id}" phase=${commit.phase} dur=${commit.actualDuration.toFixed(1)}ms`;
};

const formatViolationContext = (handlerName: string, duration: number, originalMessage: string): string => {
  const overBudgetPct = ((duration / 16.67) * 100).toFixed(0);
  return `[perf-debugger] violation ${handlerName} took ${duration}ms (${overBudgetPct}% frame budget) | ${buildReactContextSnippet()} | raw="${originalMessage.trim().slice(0, 120)}"`;
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
        if (duration >= 50 && shouldLogForOrigin(`violation::${handlerName}`)) {
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
