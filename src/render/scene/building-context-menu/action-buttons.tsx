import type { DetailMode } from './types';

type ActionButtonsProps = {
  canUpgradeTownHall: boolean;
  canUseFortify: boolean;
  canFortifyMore: boolean;
  canMoveBuilding: boolean;
  setDetailMode: (mode: DetailMode) => void;
  onOpenInfo: () => void;
  handleMoveBuilding: () => void;
};

export const ActionButtons = ({
  canUpgradeTownHall,
  canUseFortify,
  canFortifyMore,
  canMoveBuilding,
  setDetailMode,
  onOpenInfo,
  handleMoveBuilding,
}: ActionButtonsProps) => {
  const handleMoveKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMoveBuilding();
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
      <button
        type="button"
        className={`ui-button px-2 py-1 ${
          canUseFortify && canFortifyMore ? 'border-violet-600 bg-violet-700/70 text-violet-100' : 'text-slate-500'
        }`}
        onClick={() => setDetailMode('FORTIFY')}
        disabled={!canUseFortify || !canFortifyMore}
      >
        Fortificar
      </button>
      <button
        type="button"
        tabIndex={0}
        aria-label="Mover este edificio"
        className={`ui-button px-2 py-1 ${
          canMoveBuilding ? 'border-amber-600 bg-amber-700/70 text-amber-50' : 'text-slate-500'
        }`}
        onClick={handleMoveBuilding}
        onKeyDown={handleMoveKeyDown}
        disabled={!canMoveBuilding}
      >
        Mover
      </button>
      </div>
    </div>
  );
};
