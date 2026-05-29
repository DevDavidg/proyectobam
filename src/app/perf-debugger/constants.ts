/** Target 60fps frame budget. */
export const FRAME_BUDGET_MS = 16.67;

export const LONG_TASK_THRESHOLD_MS = 50;
/** Log individual long tasks with attribution above this threshold. */
export const LONG_TASK_DETAIL_THRESHOLD_MS = 80;

export const COMMIT_WARN_THRESHOLD_MS = 16;
export const SLOW_CALLBACK_THRESHOLD_MS = 16;
export const SLOW_GL_RENDER_THRESHOLD_MS = 8;
/** Only log slow rAF when exceeding ~2 frames. */
export const SLOW_RAF_LOG_THRESHOLD_MS = 33;

export const PER_ORIGIN_LOG_QUOTA = 4;
export const PER_ORIGIN_QUOTA_WINDOW_MS = 60_000;
export const HEALTH_CHECK_INTERVAL_MS = 3_000;

export const STACK_TRIM_REGEX = /\s*at\s+/;
export const SCHEDULER_VIOLATION_PATTERN =
  /\[Violation\][^']*'(message|requestAnimationFrame|setInterval|setTimeout|click|keydown|keyup|input|wheel|scroll|pointer|mouse|touch)' handler took (\d+)ms/;

/** Periodic health — only emit summary when at least one threshold is breached. */
export const HEALTH_P95_RAF_WARN_MS = 20;
export const HEALTH_P95_RAF_CRITICAL_MS = 33;
export const HEALTH_MAX_RAF_WARN_MS = 50;
export const HEALTH_LONG_TASK_RATIO_WARN_PCT = 5;
export const HEALTH_MIN_RENDER_FPS = 45;
export const HEALTH_JANK_STREAK_WARN = 3;
export const HEALTH_AVG_DRAWS_WARN = 600;
export const WEBGL_CANVAS_LEAK_WARN = 6;

export const MAX_RECENT_ERRORS = 24;
export const ERROR_DEDUP_WINDOW_MS = 4_000;
