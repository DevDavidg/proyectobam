import { dumpCallsiteSummary, getCallsiteAccumulators, resetCallsiteTracker } from './callsite-tracker';
import {
  COMMIT_WARN_THRESHOLD_MS,
  FRAME_BUDGET_MS,
  HEALTH_CHECK_INTERVAL_MS,
  LONG_TASK_THRESHOLD_MS,
  SLOW_CALLBACK_THRESHOLD_MS,
  SLOW_GL_RENDER_THRESHOLD_MS,
} from './constants';
import { getRecentErrors, installCrashDetector, resetCrashDetector } from './crash-detector';
import { installSchedulerViolationDebugger } from './console-violations';
import {
  dumpHealthSummaryIfNeeded,
  getFrameSnapshots,
  getJankStreak,
  getLastFrameSnapshot,
  getReactCommitInfo,
  resetFrameMonitor,
} from './frame-monitor';
import { installLongTaskObserver } from './long-task-observer';
import {
  installKeyboardDump,
  installPeriodicHealthCheck,
  installTimerOriginTracker,
  wrapRendererInstance,
} from './timer-patcher';
import { getWebglStats, installWebGLContextTracker } from './webgl-tracker';

export { RenderProfiler } from './react-profiler';
export { wrapRendererInstance };

export const resetAll = (): void => {
  resetCallsiteTracker();
  resetFrameMonitor();
  resetCrashDetector();
  console.info('[perf-debugger] accumulators + error history reset');
};

const exposeGlobalSnapshotApi = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  (window as unknown as Record<string, unknown>).__perf = {
    dump: dumpCallsiteSummary,
    reset: resetAll,
    snapshots: getFrameSnapshots(),
    accumulators: getCallsiteAccumulators(),
    errors: getRecentErrors(),
    get webglStats() {
      return getWebglStats();
    },
    get health() {
      return {
        jankStreak: getJankStreak(),
        lastFrame: getLastFrameSnapshot(),
        lastReactCommit: getReactCommitInfo(),
        recentErrorCount: getRecentErrors().length,
      };
    },
  };
};

export const installPerformanceDebugger = (): void => {
  installWebGLContextTracker();
  installCrashDetector();
  installTimerOriginTracker();
  installLongTaskObserver();
  installSchedulerViolationDebugger();
  installKeyboardDump(resetAll);
  installPeriodicHealthCheck(dumpHealthSummaryIfNeeded);
  exposeGlobalSnapshotApi();

  if (typeof console !== 'undefined') {
    console.info(
      '[perf-debugger] silent-until-problem | budget=%sms | longtask≥%dms commits≥%dms cb≥%dms gl≥%dms | health every %ds | F8 dump F9 reset | window.__perf',
      FRAME_BUDGET_MS.toFixed(1),
      LONG_TASK_THRESHOLD_MS,
      COMMIT_WARN_THRESHOLD_MS,
      SLOW_CALLBACK_THRESHOLD_MS,
      SLOW_GL_RENDER_THRESHOLD_MS,
      HEALTH_CHECK_INTERVAL_MS / 1000,
    );
  }
};
