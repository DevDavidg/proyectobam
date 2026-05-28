import type { Building } from './building';
import type { Cell } from './cell';
import type { Enemy } from './enemy';
import type { GameResources } from './resources';

export type GameState = {
  gridSize: number;
  cells: Cell[][];
  buildings: Building[];
  enemies: Enemy[];
  resources: GameResources;
};
