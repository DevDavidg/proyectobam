import { installPerformanceDebugger } from './perf-debugger';

if (import.meta.env.DEV) {
  installPerformanceDebugger();
}
