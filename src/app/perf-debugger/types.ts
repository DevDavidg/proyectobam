export type LongTaskAttribution = {
  containerType?: string;
  containerName?: string;
  containerSrc?: string;
  containerId?: string;
  name?: string;
};

export type LongTaskEntry = PerformanceEntry & {
  attribution?: LongTaskAttribution[];
};

export type CallsiteAccumulator = {
  origin: string;
  source: string;
  callCount: number;
  totalMs: number;
  maxMs: number;
};

export type FrameSnapshot = {
  rafTotalMs: number;
  glRenderMs: number;
  useFrameMs: number;
  drawCalls: number;
  triangles: number;
};

export type ReactCommitInfo = {
  id: string;
  phase: string;
  actualDuration: number;
  commitTime: number;
};

export type RecordedError = {
  fingerprint: string;
  kind: 'error' | 'unhandledrejection' | 'console';
  message: string;
  stack?: string;
  timestamp: number;
  count: number;
  context: string;
};

export type FrameHealthIssue = {
  severity: 'warn' | 'critical';
  code: string;
  detail: string;
};

export type DebugContext = {
  reactCommit: ReactCommitInfo | null;
  lastFrame: FrameSnapshot | null;
  jankStreak: number;
  webglAliveApprox: number;
};
