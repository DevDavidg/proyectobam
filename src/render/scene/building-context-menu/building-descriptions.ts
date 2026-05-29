import { BUILDING_TYPES } from '../../../core/types/building';

export const BUILDING_DESCRIPTIONS: Partial<Record<(typeof BUILDING_TYPES)[keyof typeof BUILDING_TYPES], string>> = {
  TOWN_HALL: 'Corazon de tu base. Subirlo desbloquea nuevas defensas, edificios y mejora global de progresion.',
  RESOURCE_TWIG_COLLECTOR: 'Produce ramitas (Twigs), recurso base para casi toda tu construccion y progreso temprano.',
  RESOURCE_PEBBLE_COLLECTOR: 'Produce Pebbles para construccion y upgrades de casi toda tu base.',
  RESOURCE_PUTTY_COLLECTOR: 'Produce Putty para desbloquear y mejorar monstruos, y para mejoras defensivas clave.',
  RESOURCE_GOO_COLLECTOR: 'Produce goo, recurso clave para tecnologia de monstruos y laboratorios.',
  RESOURCE_STONE_SILO: 'Aumenta la capacidad maxima total para Twigs, Pebbles, Putty y Goo.',
  RESOURCE_WOOD_SILO: 'Aumenta la capacidad maxima total para Twigs, Pebbles, Putty y Goo.',
  DEFENSE_TURRET_RAPID: 'Sniper Tower: altisimo dano por disparo y gran alcance, pero con recarga lenta.',
  DEFENSE_MORTAR: 'Cannon Tower: corto alcance, dano alto con explosion para grupos de monstruos.',
  DEFENSE_LASER_TOWER: 'Laser Tower: rayo continuo, ataque muy rapido en corto alcance.',
  ARMY_HATCHERY: 'Monster Academy: entrena e investiga monstruos para potenciar velocidad, dano y vida.',
  ARMY_MONSTER_PEN: 'Corral de monstruos: aloja criaturas entrenadas y desbloquea mejoras de la academia.',
  DECOR_MUSHROOM_TOTEM: 'Decoracion tribal que embellece tu base sin efecto de combate.',
  OBSTACLE_TREE: 'Arbol del mapa. Reciclarlo envia un obrero y otorga entre 0 y 50 shiny.',
  OBSTACLE_ROCK: 'Roca del mapa. Reciclarla envia un obrero y otorga entre 0 y 50 shiny.',
  OBSTACLE_MUSHROOM: 'Hongo del mapa. Reciclarlo envia un obrero y otorga entre 0 y 50 shiny.',
};
