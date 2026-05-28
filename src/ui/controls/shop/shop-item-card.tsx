type ShopItemCardProps = {
  name: string;
  description: string;
  sizeLabel: string;
  currentCount: number;
  maxAllowed: number;
  isSingleRow?: boolean;
  isActive: boolean;
  onSelect: () => void;
  previewSlot?: React.ReactNode;
};

export const ShopItemCard = ({
  name,
  description,
  sizeLabel,
  currentCount,
  maxAllowed,
  isSingleRow = false,
  isActive,
  onSelect,
  previewSlot,
}: ShopItemCardProps) => {
  const isAtCap = currentCount >= maxAllowed;
  const isLocked = maxAllowed <= 0;
  const stateClass = isActive
    ? 'ring-[3px] ring-yellow-300 ring-offset-2 ring-offset-[#3a2412]'
    : isAtCap
      ? 'opacity-95'
      : '';
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      aria-label={`Seleccionar ${name}`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={`bym-card-wood relative flex cursor-pointer flex-col items-center gap-2 p-3 text-left transition ${stateClass}`}
    >
      <p className="bym-cartoon-text w-full text-center text-[14px] leading-tight">{name}</p>
      <p className="line-clamp-2 min-h-[28px] w-full text-center text-[11px] leading-tight text-amber-100/90">
        {description}
      </p>
      <div
        className={`flex w-full items-center justify-center rounded-md border-2 border-[#1e1b18] bg-gradient-to-b from-[#3b2412] to-[#1e1308] shadow-[inset_0_3px_0_rgba(255,210,150,0.18)] ${
          isSingleRow ? 'h-[88px]' : 'h-[110px]'
        }`}
      >
        {previewSlot ?? <span className="bym-cartoon-text-sm text-[10px] text-amber-200/80">PREVIEW</span>}
      </div>
      <div className="flex w-full items-center justify-between gap-2">
        <span className="bym-cartoon-text-sm text-[11px]">{sizeLabel}</span>
        <span
          className={`bym-cartoon-text-sm rounded-md border-2 border-[#1e1b18] px-2 py-0.5 text-[12px] leading-none ${
            isLocked
              ? 'bg-stone-700 text-stone-300'
              : isAtCap
                ? 'bg-emerald-600 text-emerald-50'
                : 'bg-[#1d120a] text-amber-100'
          }`}
        >
          {currentCount}/{maxAllowed}
          {isAtCap && !isLocked ? ' ✓' : null}
        </span>
      </div>
    </div>
  );
};
