import { Html } from '@react-three/drei';

type HealthBarProps = {
  hp: number;
  maxHp: number;
  visible: boolean;
};

export const HealthBar = ({ hp, maxHp, visible }: HealthBarProps) => {
  if (!visible) {
    return null;
  }

  const progress = Math.max(0, Math.min(1, hp / maxHp));

  return (
    <Html center>
      <div className="w-16 rounded border border-slate-900 bg-slate-950/80 p-[1px]">
        <div
          className={`h-1.5 rounded ${progress > 0.5 ? 'bg-emerald-400' : progress > 0.25 ? 'bg-amber-400' : 'bg-rose-500'}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </Html>
  );
};
