type ShopItemCardProps = {
  technicalName: string;
  currentCount?: number;
  maxAllowed?: number;
  footerLabel?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  isLocked?: boolean;
  isTerrainCurrent?: boolean;
  compact?: boolean;
  onSelect?: () => void;
  previewSlot?: React.ReactNode;
};

export const ShopItemCard = ({
  technicalName,
  currentCount,
  maxAllowed,
  footerLabel,
  isActive = false,
  isDisabled = false,
  isLocked = false,
  isTerrainCurrent = false,
  compact = false,
  onSelect,
  previewSlot,
}: ShopItemCardProps) => {
  const isInteractive = Boolean(onSelect) && !isLocked;
  const resolvedFooterLabel =
    footerLabel ?? (currentCount !== undefined && maxAllowed !== undefined ? `${currentCount} / ${maxAllowed}` : '');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (!isInteractive || !onSelect) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role={isInteractive ? 'button' : 'group'}
      tabIndex={isInteractive ? 0 : -1}
      aria-pressed={isInteractive ? isActive : undefined}
      aria-disabled={isDisabled || isLocked}
      aria-label={
        isLocked
          ? `${technicalName} bloqueado`
          : isTerrainCurrent
            ? `${technicalName} en terreno`
            : `Seleccionar ${technicalName}`
      }
      onClick={isInteractive ? onSelect : undefined}
      onKeyDown={handleKeyDown}
      className={`bym-shop-item-card flex flex-col overflow-hidden transition ${
        compact ? 'bym-shop-item-card--compact' : ''
      } ${isActive ? 'bym-shop-item-card--active' : ''} ${
        isTerrainCurrent ? 'bym-shop-item-card--terrain' : ''
      } ${isDisabled ? 'bym-shop-item-card--disabled' : ''} ${
        isLocked ? 'bym-shop-item-card--locked' : ''
      } ${isInteractive ? 'cursor-pointer' : ''}`}
    >
      <div className="border-b border-black/80 px-1 py-1">
        <p className="truncate text-center font-mono text-[10px] font-semibold uppercase tracking-tight text-[#1e1b18]">
          {technicalName}
        </p>
      </div>
      <div
        className={`relative flex flex-1 items-center justify-center bg-white px-1 py-1 ${
          compact ? 'min-h-[64px]' : 'min-h-[92px]'
        }`}
      >
        {previewSlot}
        {isLocked ? (
          <div className="bym-shop-item-card__lock-overlay" aria-hidden>
            <span className="bym-shop-item-card__lock-icon">🔒</span>
          </div>
        ) : null}
      </div>
      <div className="border-t border-black/80 px-1 py-2">
        <p
          className={`text-center font-mono font-bold leading-none text-[#1e1b18] ${
            compact ? 'text-[12px]' : 'text-[15px]'
          }`}
        >
          {resolvedFooterLabel}
        </p>
      </div>
    </div>
  );
};
