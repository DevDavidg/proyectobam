import { Profiler, type ProfilerOnRenderCallback, type ReactNode } from 'react';
import { COMMIT_WARN_THRESHOLD_MS, FRAME_BUDGET_MS } from './constants';
import { setReactCommitInfo } from './frame-monitor';

const handleReactCommit: ProfilerOnRenderCallback = (id, phase, actualDuration, _baseDuration, _startTime, commitTime) => {
  setReactCommitInfo({ id, phase, actualDuration, commitTime });
  if (actualDuration < COMMIT_WARN_THRESHOLD_MS) {
    return;
  }
  const pctBudget = ((actualDuration / FRAME_BUDGET_MS) * 100).toFixed(0);
  console.warn(
    `[perf-debugger] slow react commit ${actualDuration.toFixed(1)}ms (${pctBudget}% frame budget) | id="${id}" phase=${phase}`,
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
