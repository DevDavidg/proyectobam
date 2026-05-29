import type { DetailMode } from './types';

type MonsterAcademyActionButtonsProps = {
  canMoveBuilding: boolean;
  canRecycleBuilding: boolean;
  canOpenAcademy: boolean;
  canUpgradeTownHall: boolean;
  setDetailMode: (mode: DetailMode) => void;
  onOpenInfo: () => void;
  handleMoveBuilding: () => void;
  handleRecycleBuilding: () => void;
  handleOpenAcademy: () => void;
};

export const MonsterAcademyActionButtons = ({
  canMoveBuilding,
  canRecycleBuilding,
  canOpenAcademy,
  canUpgradeTownHall,
  setDetailMode,
  onOpenInfo,
  handleMoveBuilding,
  handleRecycleBuilding,
  handleOpenAcademy,
}: MonsterAcademyActionButtonsProps) => {
  const handleMoveKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMoveBuilding();
    }
  };

  const handleRecycleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRecycleBuilding();
    }
  };

  const handleOpenKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenAcademy();
    }
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        tabIndex={0}
        aria-label="Ver informacion del edificio"
        className="ui-button w-full border-sky-600 bg-sky-800/80 px-2 py-1 text-sky-50"
        onClick={onOpenInfo}
      >
        Info
      </button>
      <button
        type="button"
        tabIndex={0}
        aria-label="Abrir academia de monstruos"
        className={`ui-button w-full px-2 py-1 ${
          canOpenAcademy ? 'border-emerald-600 bg-emerald-700/80 text-emerald-50' : 'text-slate-500'
        }`}
        onClick={handleOpenAcademy}
        onKeyDown={handleOpenKeyDown}
        disabled={!canOpenAcademy}
      >
        Abrir academia de monstruos
      </button>
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          tabIndex={0}
          aria-label="Mover academia de monstruos"
          className={`ui-button px-2 py-1 ${
            canMoveBuilding ? 'border-amber-600 bg-amber-700/70 text-amber-50' : 'text-slate-500'
          }`}
          onClick={handleMoveBuilding}
          onKeyDown={handleMoveKeyDown}
          disabled={!canMoveBuilding}
        >
          Mover
        </button>
        <button
          type="button"
          tabIndex={0}
          aria-label="Reciclar academia de monstruos"
          className={`ui-button px-2 py-1 ${
            canRecycleBuilding ? 'border-rose-600 bg-rose-800/70 text-rose-50' : 'text-slate-500'
          }`}
          onClick={handleRecycleBuilding}
          onKeyDown={handleRecycleKeyDown}
          disabled={!canRecycleBuilding}
        >
          Reciclar
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          className={`ui-button px-2 py-1 ${
            canUpgradeTownHall ? 'border-emerald-600 bg-emerald-700/80 text-emerald-50' : 'text-slate-400'
          }`}
          onClick={() => setDetailMode('UPGRADE')}
          disabled={!canUpgradeTownHall}
        >
          Mejorar
        </button>
        <button
          type="button"
          className="ui-button border-amber-700 bg-amber-800/80 px-2 py-1 text-amber-100"
          onClick={() => setDetailMode('REPAIR')}
        >
          Reparar
        </button>
      </div>
    </div>
  );
};
