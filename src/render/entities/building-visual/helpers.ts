import type { BuildingVisualFamily, PreviewableBuildingType } from './types';

export const getTypeFamily = (type: PreviewableBuildingType): BuildingVisualFamily => {
  if (type === 'TOWN_HALL') {
    return 'town-hall';
  }
  if (type === 'DEFENSE_WALL_WOOD' || type === 'DEFENSE_WALL_STONE' || type === 'DEFENSE_WALL_IRON') {
    return 'wall';
  }
  if (type === 'DEFENSE_TURRET_RAPID') {
    return 'turret';
  }
  if (type === 'DEFENSE_LASER_TOWER') {
    return 'turret';
  }
  if (type === 'DEFENSE_MORTAR') {
    return 'mortar';
  }
  if (type === 'ARMY_MONSTER_PEN') {
    return 'pen';
  }
  if (type === 'ARMY_HATCHERY') {
    return 'hatchery';
  }
  if (type === 'DECOR_MUSHROOM_TOTEM') {
    return 'decor';
  }
  return 'collector';
};

export const getCollectorColor = (type: PreviewableBuildingType): string => {
  if (type === 'RESOURCE_TWIG_COLLECTOR') return '#d9a13f';
  if (type === 'RESOURCE_GOO_COLLECTOR') return '#49b5c8';
  if (type === 'RESOURCE_PEBBLE_COLLECTOR') return '#98a3b8';
  if (type === 'RESOURCE_PUTTY_COLLECTOR') return '#8f6db8';
  if (type === 'RESOURCE_WOOD_SILO') return '#ad7f55';
  if (type === 'RESOURCE_STONE_SILO') return '#838c9f';
  return '#c08a56';
};
