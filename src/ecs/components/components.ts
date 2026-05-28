export const EntityType = {
  TOWN_HALL: 1,
  WALL: 2,
  TURRET: 3,
  PREVIEW: 4,
  GOLD_COLLECTOR: 5,
  GOO_COLLECTOR: 6,
  ENEMY: 7,
  PEBBLE_COLLECTOR: 8,
  PUTTY_COLLECTOR: 9,
  STORAGE: 10,
  HATCHERY: 11,
  PEN: 12,
  DECOR: 13,
  OBSTACLE: 14,
  MORTAR: 15,
} as const;

export type EntityTypeValue = (typeof EntityType)[keyof typeof EntityType];

export type EcsEntity = {
  id: number;
  sourceId?: string;
  sourceType?: string;
  level?: number;
  status?: string;
  constructionProgress?: number;
  kind: EntityTypeValue;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
  hp?: number;
  maxHp?: number;
  range?: number;
  damage?: number;
  valid?: boolean;
};
