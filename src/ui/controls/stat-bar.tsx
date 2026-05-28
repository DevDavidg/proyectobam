type StatBarProps = {
  label: string;
  currentValue: number;
  nextValue: number;
  maxPossibleValue: number;
  unit: string;
};

const clampPercent = (value: number): number => Math.max(0, Math.min(100, value));

export const StatBar = ({ label, currentValue, nextValue, maxPossibleValue, unit }: StatBarProps) => {
  const safeMax = Math.max(1, maxPossibleValue);
  const currentPct = clampPercent((currentValue / safeMax) * 100);
  const nextPct = clampPercent((nextValue / safeMax) * 100);
  const diffPct = nextPct - currentPct;

  return (
    <div className="my-2 flex flex-col gap-1 font-sans">
      <div className="text-xs font-bold text-slate-700">{label}</div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <div className="relative h-5 w-full overflow-hidden rounded border border-slate-400 bg-slate-200 shadow-inner">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${currentPct}%` }} />
            <span className="absolute inset-0 flex items-center pl-2 text-[11px] font-bold text-slate-900">
              {currentValue} {unit}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative h-5 w-full overflow-hidden rounded border border-slate-400 bg-slate-200 shadow-inner">
            <div className="absolute left-0 top-0 h-full bg-blue-400" style={{ width: `${currentPct}%` }} />
            <div
              className={`absolute top-0 h-full ${diffPct >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{
                left: `${diffPct >= 0 ? currentPct : nextPct}%`,
                width: `${Math.abs(diffPct)}%`,
              }}
            />
            <span className="absolute inset-0 z-10 flex items-center pl-2 text-[11px] font-bold text-slate-900">
              {nextValue} {unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
