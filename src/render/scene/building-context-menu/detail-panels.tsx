import { formatDurationMs } from '../../../core/constants/build-rules';
import type { BuildingType } from '../../../core/types/building';
import type { PreviewableBuildingType } from '../../entities/building-visual/types';
import { BuildingPreview } from '../../../ui/controls/building-preview';
import type { ResourceCostTuple } from './types';

type UpgradePanelProps = {
  buildingType: BuildingType;
  nextLevel: number;
  canUpgradeTownHall: boolean;
  canUpgradeResources: boolean;
  hasCatalogEntry: boolean;
  requiredTownHallLevel: number;
  townHallLevel: number;
  isFixedHarvester: boolean;
  isStorageSilo: boolean;
  isMaxTownHallLevel: boolean;
  isTwigSnapperMaxLevel: boolean;
  isGooFactoryMaxLevel: boolean;
  isPebbleShinerMaxLevel: boolean;
  isPuttySquisherMaxLevel: boolean;
  isStorageSiloMaxLevel: boolean;
  isSniperTowerMaxLevel: boolean;
  isLaserTowerMaxLevel: boolean;
  isCannonTowerMaxLevel: boolean;
  isMonsterAcademyMaxLevel: boolean;
  requiredMonsterPenLevel: number | null;
  highestMonsterPenLevel: number;
  meetsMonsterPenRequirement: boolean;
  currentProductionPerHour: number;
  nextProductionPerHour: number;
  nextCapacity: number | null;
  currentStorageCapacity: number | null;
  nextStorageCapacity: number | null;
  description: string;
  estimatedUpgradeDurationMs: number;
  upgradeCost: ResourceCostTuple;
  unrestrictedMode: boolean;
  upgradeSelectedBuilding: () => void;
  onClose: () => void;
};

export const UpgradePanel = (props: UpgradePanelProps) => {
  const {
    buildingType,
    nextLevel,
    canUpgradeTownHall,
    canUpgradeResources,
    hasCatalogEntry,
    requiredTownHallLevel,
    townHallLevel,
    isFixedHarvester,
    isStorageSilo,
    isMaxTownHallLevel,
    isTwigSnapperMaxLevel,
    isGooFactoryMaxLevel,
    isPebbleShinerMaxLevel,
    isPuttySquisherMaxLevel,
    isStorageSiloMaxLevel,
    isSniperTowerMaxLevel,
    isLaserTowerMaxLevel,
    isCannonTowerMaxLevel,
    isMonsterAcademyMaxLevel,
    requiredMonsterPenLevel,
    highestMonsterPenLevel,
    meetsMonsterPenRequirement,
    currentProductionPerHour,
    nextProductionPerHour,
    nextCapacity,
    currentStorageCapacity,
    nextStorageCapacity,
    description,
    estimatedUpgradeDurationMs,
    upgradeCost,
    unrestrictedMode,
    upgradeSelectedBuilding,
    onClose,
  } = props;

  const handleConfirmUpgrade = (): void => {
    upgradeSelectedBuilding();
    onClose();
  };

  const isDisabled =
    !unrestrictedMode && (!hasCatalogEntry || !canUpgradeTownHall || !canUpgradeResources);

  return (
    <div className="mt-2 rounded bg-slate-900/55 p-2 text-[11px]">
      <p className="font-semibold text-slate-100">Confirmar mejora</p>
      {unrestrictedMode ? (
        <p className="text-emerald-300">MODO GRATIS: sin requisitos de nivel, recursos ni limites.</p>
      ) : null}
      {buildingType !== 'PREVIEW' ? (
        <BuildingPreview
          type={buildingType as PreviewableBuildingType}
          level={nextLevel}
          className="mt-2 h-[180px] w-full overflow-hidden rounded-md border border-slate-700 bg-slate-950/55"
        />
      ) : null}
      <p className={canUpgradeTownHall ? 'text-emerald-300' : 'text-rose-300'}>
        Ayuntamiento requerido: Nv.{requiredTownHallLevel} ({townHallLevel}/{requiredTownHallLevel})
      </p>
      {requiredMonsterPenLevel ? (
        <p className={meetsMonsterPenRequirement ? 'text-emerald-300' : 'text-rose-300'}>
          Corral requerido: Nv.{requiredMonsterPenLevel} ({highestMonsterPenLevel}/{requiredMonsterPenLevel})
        </p>
      ) : null}
      {!unrestrictedMode && isMaxTownHallLevel ? (
        <p className="text-amber-300">Nivel maximo del Ayuntamiento alcanzado (20).</p>
      ) : null}
      {!unrestrictedMode && isTwigSnapperMaxLevel ? (
        <p className="text-amber-300">Nivel maximo del Twig Snapper alcanzado (10).</p>
      ) : null}
      {!unrestrictedMode && isGooFactoryMaxLevel ? (
        <p className="text-amber-300">Nivel maximo de la Goo Factory alcanzado (10).</p>
      ) : null}
      {!unrestrictedMode && isPebbleShinerMaxLevel ? (
        <p className="text-amber-300">Nivel maximo del Pebble Shiner alcanzado (10).</p>
      ) : null}
      {!unrestrictedMode && isPuttySquisherMaxLevel ? (
        <p className="text-amber-300">Nivel maximo del Putty Squisher alcanzado (10).</p>
      ) : null}
      {!unrestrictedMode && isStorageSiloMaxLevel ? (
        <p className="text-amber-300">Nivel maximo del Storage Silo alcanzado (10).</p>
      ) : null}
      {!unrestrictedMode && isSniperTowerMaxLevel ? (
        <p className="text-amber-300">Nivel maximo del Sniper Tower alcanzado (10).</p>
      ) : null}
      {!unrestrictedMode && isLaserTowerMaxLevel ? (
        <p className="text-amber-300">Nivel maximo del Laser Tower alcanzado (8).</p>
      ) : null}
      {!unrestrictedMode && isCannonTowerMaxLevel ? (
        <p className="text-amber-300">Nivel maximo del Cannon Tower alcanzado (10).</p>
      ) : null}
      {!unrestrictedMode && isMonsterAcademyMaxLevel ? (
        <p className="text-amber-300">Nivel maximo de la Monster Academy alcanzado (5).</p>
      ) : null}
      <p className={canUpgradeResources ? 'text-emerald-300' : 'text-rose-300'}>Recursos suficientes para mejora</p>
      {isFixedHarvester ? (
        <p className="mt-1 text-amber-200">
          Produccion: {currentProductionPerHour.toLocaleString()} {'->'} {nextProductionPerHour.toLocaleString()} / hora
          {nextCapacity ? ` | Capacidad: ${nextCapacity.toLocaleString()}` : ''}
        </p>
      ) : null}
      {isStorageSilo ? (
        <p className="mt-1 text-cyan-200">
          Capacidad: {(currentStorageCapacity ?? 0).toLocaleString()} {'->'} {(nextStorageCapacity ?? 0).toLocaleString()} por recurso
        </p>
      ) : null}
      <p className="mt-1 text-slate-300">{description}</p>
      <p className="mt-1 text-slate-300">Duracion estimada: {formatDurationMs(estimatedUpgradeDurationMs)}</p>
      <div className="mt-1 text-slate-300">
        T:{upgradeCost.twigs} P:{upgradeCost.pebbles} Pu:{upgradeCost.putty} G:{upgradeCost.goo}
      </div>
      <button
        type="button"
        className={`mt-2 w-full rounded px-2 py-1 font-semibold ${
          isDisabled ? 'cursor-not-allowed bg-slate-700 text-slate-400' : 'bg-emerald-700 text-emerald-50 hover:bg-emerald-600'
        }`}
        onClick={handleConfirmUpgrade}
        disabled={isDisabled}
      >
        Confirmar mejora
      </button>
    </div>
  );
};

type RepairPanelProps = {
  damageRatio: number;
  isBuildingDamaged: boolean;
  canRepairResources: boolean;
  estimatedRepairDurationMs: number;
  repairCost: ResourceCostTuple;
  repairSelectedBuilding: () => void;
  onClose: () => void;
};

export const RepairPanel = ({
  damageRatio,
  isBuildingDamaged,
  canRepairResources,
  estimatedRepairDurationMs,
  repairCost,
  repairSelectedBuilding,
  onClose,
}: RepairPanelProps) => {
  const handleConfirm = (): void => {
    repairSelectedBuilding();
    onClose();
  };
  const isDisabled = !isBuildingDamaged || !canRepairResources;

  return (
    <div className="mt-2 rounded bg-slate-900/55 p-2 text-[11px]">
      <p className="font-semibold text-slate-100">Confirmar reparacion</p>
      <p className={isBuildingDamaged ? 'text-emerald-300' : 'text-rose-300'}>
        Estado de dano: {Math.round(damageRatio * 100)}%
      </p>
      <p className={canRepairResources ? 'text-emerald-300' : 'text-rose-300'}>
        Recursos suficientes para reparar
      </p>
      <p className="mt-1 text-slate-300">Duracion estimada: {formatDurationMs(estimatedRepairDurationMs)}</p>
      <div className="mt-1 text-slate-300">
        T:{repairCost.twigs} P:{repairCost.pebbles} Pu:{repairCost.putty} G:{repairCost.goo}
      </div>
      <button
        type="button"
        className={`mt-2 w-full rounded px-2 py-1 font-semibold ${
          isDisabled ? 'cursor-not-allowed bg-slate-700 text-slate-400' : 'bg-amber-700 text-amber-50 hover:bg-amber-600'
        }`}
        onClick={handleConfirm}
        disabled={isDisabled}
      >
        Confirmar reparacion
      </button>
    </div>
  );
};

type FortifyPanelProps = {
  canUseFortify: boolean;
  canFortifyMore: boolean;
  canFortifyResources: boolean;
  townHallLevel: number;
  fortificationLevel: number;
  fortifyCost: ResourceCostTuple;
  fortifySelectedBuilding: () => void;
  onClose: () => void;
};

export const FortifyPanel = ({
  canUseFortify,
  canFortifyMore,
  canFortifyResources,
  townHallLevel,
  fortificationLevel,
  fortifyCost,
  fortifySelectedBuilding,
  onClose,
}: FortifyPanelProps) => {
  const handleConfirm = (): void => {
    fortifySelectedBuilding();
    onClose();
  };
  const isDisabled = !canUseFortify || !canFortifyMore || !canFortifyResources;

  return (
    <div className="mt-2 rounded bg-slate-900/55 p-2 text-[11px]">
      <p className="font-semibold text-slate-100">Fortificar Ayuntamiento</p>
      <p className={canUseFortify ? 'text-emerald-300' : 'text-rose-300'}>
        Requisito: Ayuntamiento nivel 5 ({townHallLevel}/5)
      </p>
      <p className={canFortifyMore ? 'text-emerald-300' : 'text-amber-300'}>
        Nivel de fortificacion: {fortificationLevel}/3
      </p>
      <p className={canFortifyResources ? 'text-emerald-300' : 'text-rose-300'}>
        Recursos suficientes para fortificar
      </p>
      <p className="mt-1 text-slate-300">
        Agrega puas/enredaderas defensivas y sube la durabilidad del ayuntamiento.
      </p>
      <div className="mt-1 text-slate-300">
        T:{fortifyCost.twigs} P:{fortifyCost.pebbles} Pu:{fortifyCost.putty} G:{fortifyCost.goo}
      </div>
      <button
        type="button"
        className={`mt-2 w-full rounded px-2 py-1 font-semibold ${
          isDisabled ? 'cursor-not-allowed bg-slate-700 text-slate-400' : 'bg-violet-700 text-violet-50 hover:bg-violet-600'
        }`}
        onClick={handleConfirm}
        disabled={isDisabled}
      >
        Aplicar fortificacion
      </button>
    </div>
  );
};
