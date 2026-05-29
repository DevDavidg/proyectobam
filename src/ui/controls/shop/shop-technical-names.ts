import type { BuildingType } from '../../../core/types/building';

type BuildableType = Exclude<
  BuildingType,
  'TOWN_HALL' | 'PREVIEW' | 'OBSTACLE_TREE' | 'OBSTACLE_ROCK' | 'OBSTACLE_MUSHROOM'
>;

const SHOP_TECHNICAL_NAMES: Partial<Record<BuildableType, string>> = {
  RESOURCE_TWIG_COLLECTOR: '#b_twigsnapper#',
  RESOURCE_PEBBLE_COLLECTOR: '#b_pebbleshiner#',
  RESOURCE_PUTTY_COLLECTOR: '#b_puttysquisher#',
  RESOURCE_GOO_COLLECTOR: '#b_goofactory#',
  RESOURCE_STONE_SILO: '#b_storagesilo#',
  DEFENSE_WALL_WOOD: '#b_woodenblock#',
  DEFENSE_WALL_STONE: '#b_stoneblock#',
  DEFENSE_WALL_IRON: '#b_ironblock#',
  DEFENSE_TURRET_RAPID: '#b_snipertower#',
  DEFENSE_MORTAR: '#b_cannontower#',
  DEFENSE_LASER_TOWER: '#b_lasertower#',
  ARMY_HATCHERY: '#b_monsteracademy#',
  ARMY_MONSTER_PEN: '#b_monsterpen#',
  DECOR_MUSHROOM_TOTEM: '#b_mushroomtotem#',
};

export const getShopTechnicalName = (type: BuildableType): string =>
  SHOP_TECHNICAL_NAMES[type] ?? `#b_${type.toLowerCase()}#`;
