import { useGameStore } from '../../../state/game-store';
import type { ResourceOrbResourceType } from '../../../state/game-store/types';

type ResourceBuffer = {
  amount: number;
  capacity: number;
  ratio: number;
};

type BufferPanelProps = {
  buffer: ResourceBuffer;
  canCollect: boolean;
  collectorId: string;
  resourceType: ResourceOrbResourceType;
};

const PANEL_THEME: Record<
  ResourceOrbResourceType,
  {
    containerClass: string;
    titleLabel: string;
    barTrackClass: string;
    barFillClass: string;
    buttonActiveClass: string;
    buttonInactiveLabel: string;
    buttonActiveLabel: (amount: number) => string;
    ariaLabel: string;
  }
> = {
  twigs: {
    containerClass: 'bg-amber-950/45 text-amber-100',
    titleLabel: 'Ramitas acumuladas',
    barTrackClass: 'bg-amber-950/70',
    barFillClass: 'bg-amber-400',
    buttonActiveClass: 'bg-amber-500 text-amber-950 hover:bg-amber-400',
    buttonInactiveLabel: 'Sin ramitas para recolectar',
    buttonActiveLabel: (amount) => `Recolectar (+${Math.floor(amount).toLocaleString()} ramitas)`,
    ariaLabel: 'Recolectar ramitas acumuladas',
  },
  pebbles: {
    containerClass: 'bg-slate-900/55 text-slate-100',
    titleLabel: 'Pebbles acumulados',
    barTrackClass: 'bg-slate-950/60',
    barFillClass: 'bg-slate-300',
    buttonActiveClass: 'bg-slate-200 text-slate-900 hover:bg-white',
    buttonInactiveLabel: 'Sin pebbles para recolectar',
    buttonActiveLabel: (amount) => `Recolectar (+${Math.floor(amount).toLocaleString()} pebbles)`,
    ariaLabel: 'Recolectar pebbles acumulados',
  },
  putty: {
    containerClass: 'bg-violet-950/45 text-violet-100',
    titleLabel: 'Putty acumulado',
    barTrackClass: 'bg-violet-950/70',
    barFillClass: 'bg-violet-400',
    buttonActiveClass: 'bg-violet-500 text-violet-50 hover:bg-violet-400',
    buttonInactiveLabel: 'Sin putty para recolectar',
    buttonActiveLabel: (amount) => `Recolectar (+${Math.floor(amount).toLocaleString()} putty)`,
    ariaLabel: 'Recolectar putty acumulado',
  },
  goo: {
    containerClass: 'bg-emerald-950/40 text-emerald-100',
    titleLabel: 'Goo acumulado',
    barTrackClass: 'bg-emerald-950/60',
    barFillClass: 'bg-emerald-400',
    buttonActiveClass: 'bg-emerald-600 text-emerald-50 hover:bg-emerald-500',
    buttonInactiveLabel: 'Sin goo para recolectar',
    buttonActiveLabel: (amount) => `Recolectar (+${Math.floor(amount).toLocaleString()} goo)`,
    ariaLabel: 'Recolectar goo acumulado',
  },
};

export const CollectBufferPanel = ({ buffer, canCollect, collectorId, resourceType }: BufferPanelProps) => {
  const collectFromCollector = useGameStore((state) => state.collectFromCollector);
  const theme = PANEL_THEME[resourceType];

  const handleCollect = (): void => {
    if (!canCollect) {
      return;
    }
    collectFromCollector(collectorId);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCollect();
    }
  };

  return (
    <div className={`mb-2 rounded p-2 text-[11px] ${theme.containerClass}`}>
      <div className="mb-1 flex items-center justify-between">
        <span className="font-semibold">{theme.titleLabel}</span>
        <span className="tabular-nums">
          {Math.floor(buffer.amount).toLocaleString()} / {buffer.capacity.toLocaleString()}
        </span>
      </div>
      <div className={`mb-2 h-2 w-full overflow-hidden rounded ${theme.barTrackClass}`}>
        <div
          className={`h-full rounded transition-[width] duration-200 ${theme.barFillClass}`}
          style={{ width: `${Math.round(buffer.ratio * 100)}%` }}
        />
      </div>
      <button
        type="button"
        tabIndex={0}
        aria-label={theme.ariaLabel}
        onClick={handleCollect}
        onKeyDown={handleKeyDown}
        disabled={!canCollect}
        className={`w-full rounded px-2 py-1.5 text-[11px] font-semibold ${
          canCollect ? theme.buttonActiveClass : 'cursor-not-allowed bg-slate-700 text-slate-400'
        }`}
      >
        {canCollect ? theme.buttonActiveLabel(buffer.amount) : theme.buttonInactiveLabel}
      </button>
    </div>
  );
};

type CollectAllSummary = {
  twigs: number;
  pebbles: number;
  putty: number;
  goo: number;
};

type CollectAllButtonProps = {
  summary: CollectAllSummary;
};

export const CollectAllButton = ({ summary }: CollectAllButtonProps) => {
  const collectAllCollectors = useGameStore((state) => state.collectAllCollectors);
  const total = summary.twigs + summary.pebbles + summary.putty + summary.goo;
  const canCollectAny = total > 0;

  const handleClick = (): void => {
    if (!canCollectAny) {
      return;
    }
    collectAllCollectors();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      tabIndex={0}
      aria-label="Recolectar todos los recursos pendientes"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={!canCollectAny}
      className={`mb-2 w-full rounded px-2 py-1.5 text-[11px] font-semibold transition ${
        canCollectAny
          ? 'border border-amber-400/70 bg-gradient-to-r from-amber-500 via-emerald-500 to-violet-500 text-slate-950 shadow hover:brightness-110'
          : 'cursor-not-allowed border border-slate-700 bg-slate-800/70 text-slate-400'
      }`}
    >
      {canCollectAny
        ? `Recolectar todo (${Math.floor(total).toLocaleString()})`
        : 'Recolectar todo (sin recursos pendientes)'}
    </button>
  );
};
