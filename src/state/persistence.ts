import type { Building } from '../core/types/building';
import type { MonsterType } from '../core/constants/monster-catalog';
import type { GameResources } from '../core/types/resources';
import type { PenResident } from './game-store/types';
import type { GridPoint } from './game-store/types';

const STORAGE_KEY = 'backyard-tactics-save-v1';
const PERSIST_DEBOUNCE_MS = 300;
let pendingPersistData: PersistedGameData | null = null;
let persistTimerId: number | null = null;

const flushPersistedGameData = () => {
  if (!pendingPersistData) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingPersistData));
  } catch {
    // Ignore persistence write failures in restricted contexts.
  } finally {
    pendingPersistData = null;
    persistTimerId = null;
  }
};

export type PersistedGameData = {
  resources: GameResources;
  buildings: Building[];
  shiny?: number;
  monsterLevels?: Record<MonsterType, number>;
  penHousingSettings?: Record<string, { name: string; priority: 'ANY' | MonsterType }>;
  penResidents?: PenResident[];
  nextResidentId?: number;
  unlockedLandCells?: Record<string, true>;
  landExpansionPreview?: GridPoint[];
};

export const loadPersistedGameData = (): PersistedGameData | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PersistedGameData;
    if (!parsed.resources || !Array.isArray(parsed.buildings)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const savePersistedGameData = (data: PersistedGameData): void => {
  pendingPersistData = data;
  if (persistTimerId !== null) {
    return;
  }
  persistTimerId = window.setTimeout(() => {
    flushPersistedGameData();
  }, PERSIST_DEBOUNCE_MS);
};

export const clearPersistedGameData = (): void => {
  pendingPersistData = null;
  if (persistTimerId !== null) {
    window.clearTimeout(persistTimerId);
    persistTimerId = null;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures in restricted contexts.
  }
};
