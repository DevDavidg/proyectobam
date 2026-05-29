import { ENHANCED_BUILDING_CATALOG } from '../../../core/constants/catalog';
import { BUILDING_TYPES } from '../../../core/types/building';
import type { BuildingContextData } from './use-building-context-data';

export type BuildingInfoDetailRow = {
  label: string;
  value: string;
};

const formatNum = (value: number): string => Math.round(value).toLocaleString('es-ES');

const formatCost = (cost: { twigs: number; pebbles: number; putty: number; goo: number }): string => {
  const parts: string[] = [];
  if (cost.twigs > 0) parts.push(`${formatNum(cost.twigs)} ramitas`);
  if (cost.pebbles > 0) parts.push(`${formatNum(cost.pebbles)} pebbles`);
  if (cost.putty > 0) parts.push(`${formatNum(cost.putty)} putty`);
  if (cost.goo > 0) parts.push(`${formatNum(cost.goo)} goo`);
  return parts.length ? parts.join(' · ') : 'Gratis';
};

export const buildBuildingInfoDetails = (data: BuildingContextData): BuildingInfoDetailRow[] => {
  const { building } = data;
  const catalog = ENHANCED_BUILDING_CATALOG[building.type];
  const rows: BuildingInfoDetailRow[] = [
    { label: 'Nombre', value: data.buildingName },
    { label: 'Nivel', value: `${building.level}` },
    {
      label: 'Tamano',
      value: `${building.sizeX}×${building.sizeY} celdas`,
    },
    {
      label: 'Vida',
      value: `${formatNum(building.hp)} / ${formatNum(building.maxHp)}`,
    },
    {
      label: 'Estado',
      value:
        building.status === 'ACTIVE'
          ? 'Activo'
          : building.status === 'UNDER_CONSTRUCTION'
            ? 'En construccion'
            : building.status === 'PENDING'
              ? 'Pendiente'
              : building.status,
    },
  ];

  if (catalog?.category) {
    rows.push({
      label: 'Categoria',
      value:
        catalog.category === 'RESOURCES'
          ? 'Recursos'
          : catalog.category === 'DEFENSES'
            ? 'Defensas'
            : catalog.category === 'ARMY'
              ? 'Ejercito'
              : 'Decoracion',
    });
  }

  if (data.isFixedHarvester || catalog?.production) {
    rows.push({
      label: 'Produccion',
      value: `${formatNum(data.currentProductionPerHour)} / hora`,
    });
    if (data.currentCapacity) {
      rows.push({
        label: 'Capacidad interna',
        value: formatNum(data.currentCapacity),
      });
    }
    rows.push({
      label: 'Siguiente nivel (prod.)',
      value: `${formatNum(data.nextProductionPerHour)} / hora`,
    });
  }

  if (data.isStorageSilo) {
    rows.push({
      label: 'Capacidad por recurso',
      value: formatNum(data.currentStorageCapacity ?? 0),
    });
    rows.push({
      label: 'Capacidad total',
      value: formatNum((data.currentStorageCapacity ?? 0) * 4),
    });
  }

  if (building.range) {
    rows.push({ label: 'Alcance', value: `${building.range} celdas` });
  }
  if (building.damage) {
    rows.push({ label: 'Dano', value: formatNum(building.damage) });
  }
  if (building.splashRadius) {
    rows.push({ label: 'Radio de explosion', value: `${building.splashRadius} celdas` });
  }

  if (building.type === BUILDING_TYPES.TOWN_HALL) {
    rows.push({
      label: 'Fortificacion',
      value: `Nivel ${data.fortificationLevel} / 3`,
    });
  }

  if (data.requiredTownHallLevel > 1) {
    rows.push({
      label: 'Ayuntamiento requerido',
      value: `Nivel ${data.requiredTownHallLevel} (actual: ${data.townHall.level})`,
    });
  }

  if (data.requiredMonsterPenLevel) {
    rows.push({
      label: 'Corral requerido',
      value: `Nivel ${data.requiredMonsterPenLevel} (max. base: ${data.highestMonsterPenLevel})`,
    });
  }

  rows.push({
    label: 'Coste mejora',
    value: formatCost(data.upgradeCost),
  });

  if (data.isObstacle) {
    rows.push({
      label: 'Recompensa',
      value: '0–50 shiny al reciclar (envia un obrero)',
    });
  }

  return rows;
};
