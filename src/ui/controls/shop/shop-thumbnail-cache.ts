import type { BuildingType } from '../../../core/types/building';

type PreviewableBuildingType = Exclude<BuildingType, 'PREVIEW'>;
export type ShopThumbnailJob = { type: PreviewableBuildingType; level: number };

type ThumbnailKey = `${PreviewableBuildingType}:${number}`;

const thumbnailCache = new Map<ThumbnailKey, string>();
const pendingJobs: ShopThumbnailJob[] = [];
const cacheListeners = new Set<() => void>();
const queueListeners = new Set<() => void>();

const getThumbnailKey = (type: PreviewableBuildingType, level: number): ThumbnailKey =>
  `${type}:${level}`;

const notifyCacheListeners = (): void => {
  cacheListeners.forEach((listener) => listener());
};

const notifyQueueListeners = (): void => {
  queueListeners.forEach((listener) => listener());
};

export const getShopThumbnail = (
  type: PreviewableBuildingType,
  level: number,
): string | undefined => thumbnailCache.get(getThumbnailKey(type, level));

export const setShopThumbnail = (
  type: PreviewableBuildingType,
  level: number,
  dataUrl: string,
): void => {
  if (!dataUrl) {
    return;
  }
  thumbnailCache.set(getThumbnailKey(type, level), dataUrl);
  notifyCacheListeners();
};

export const subscribeShopThumbnails = (listener: () => void): (() => void) => {
  cacheListeners.add(listener);
  return () => cacheListeners.delete(listener);
};

export const enqueueShopThumbnail = (type: PreviewableBuildingType, level: number): void => {
  const safeLevel = Math.max(1, level);
  const key = getThumbnailKey(type, safeLevel);
  if (thumbnailCache.has(key)) {
    return;
  }
  if (pendingJobs.some((job) => job.type === type && job.level === safeLevel)) {
    return;
  }
  pendingJobs.push({ type, level: safeLevel });
  notifyQueueListeners();
};

export const peekShopThumbnailJob = (): ShopThumbnailJob | undefined => pendingJobs[0];

export const completeShopThumbnailJob = (type: PreviewableBuildingType, level: number): void => {
  const safeLevel = Math.max(1, level);
  const index = pendingJobs.findIndex((job) => job.type === type && job.level === safeLevel);
  if (index >= 0) {
    pendingJobs.splice(index, 1);
  }
  notifyQueueListeners();
};

export const subscribeShopThumbnailQueue = (listener: () => void): (() => void) => {
  queueListeners.add(listener);
  return () => queueListeners.delete(listener);
};
