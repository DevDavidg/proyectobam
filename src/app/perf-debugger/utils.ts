import { STACK_TRIM_REGEX } from './constants';

export const captureCallsite = (skipFrames: number): string => {
  const error = new Error('perf-origin');
  const stack = error.stack ?? '';
  const lines = stack.split('\n').slice(skipFrames, skipFrames + 6);
  const trimmed = lines
    .map((line) => line.replace(STACK_TRIM_REGEX, '').trim())
    .filter((line) => line.length > 0 && !line.includes('perf-debugger'));
  if (trimmed.length === 0) {
    return 'unknown';
  }
  return trimmed.join(' <- ');
};

export const computePercentile = (sortedValues: number[], percentile: number): number => {
  if (sortedValues.length === 0) {
    return 0;
  }
  const index = Math.min(sortedValues.length - 1, Math.floor((percentile / 100) * sortedValues.length));
  return sortedValues[index];
};

export const computeAverage = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }
  let total = 0;
  for (const value of values) {
    total += value;
  }
  return total / values.length;
};

export const formatMs = (value: number): string => value.toFixed(1);

export const formatAttribution = (
  attributions: import('./types').LongTaskAttribution[] | undefined,
): string => {
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

export const buildErrorFingerprint = (message: string, stack?: string): string => {
  const firstStackLine = stack?.split('\n').find((line) => line.trim().startsWith('at ')) ?? '';
  return `${message.slice(0, 120)}::${firstStackLine.slice(0, 120)}`;
};

export const extractErrorMessage = (value: unknown): string => {
  if (value instanceof Error) {
    return value.message;
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const extractErrorStack = (value: unknown): string | undefined => {
  if (value instanceof Error) {
    return value.stack;
  }
  return undefined;
};
