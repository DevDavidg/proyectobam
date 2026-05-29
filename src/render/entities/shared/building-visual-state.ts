import type { BuildingStatus } from '../../../core/types/building';

export const HP_DESTROYED_RATIO = 0.12;
export const HP_DAMAGED_RATIO = 0.55;

export type BuildingVisualState = 'in-action' | 'normal' | 'damaged' | 'destroyed';
export type StaticBuildingVisualState = Exclude<BuildingVisualState, 'in-action'>;

type ResolveHpVisualStateOptions = {
  includeInAction?: boolean;
};

export const resolveHpRatio = (hp?: number, maxHp?: number): number =>
  maxHp && maxHp > 0 ? (hp ?? maxHp) / maxHp : 1;

export function resolveHpVisualState(
  status: BuildingStatus | undefined,
  hp: number | undefined,
  maxHp: number | undefined,
  options: { includeInAction: false },
): StaticBuildingVisualState;
export function resolveHpVisualState(
  status: BuildingStatus | undefined,
  hp: number | undefined,
  maxHp: number | undefined,
  options?: ResolveHpVisualStateOptions,
): BuildingVisualState;
export function resolveHpVisualState(
  status: BuildingStatus | undefined,
  hp: number | undefined,
  maxHp: number | undefined,
  options: ResolveHpVisualStateOptions = { includeInAction: true },
): BuildingVisualState {
  const ratio = resolveHpRatio(hp, maxHp);
  if (ratio <= HP_DESTROYED_RATIO) return 'destroyed';
  if (ratio < HP_DAMAGED_RATIO) return 'damaged';
  if (options.includeInAction && status === 'ACTIVE') return 'in-action';
  return 'normal';
}
