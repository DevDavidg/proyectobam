import type { BuildingType } from '../../../core/types/building';

type BuildingIconProps = {
  type: Exclude<BuildingType, 'PREVIEW'>;
  className?: string;
};

type IconSpec = {
  emoji: string;
  gradientFrom: string;
  gradientTo: string;
};

const ICON_SPECS: Partial<Record<Exclude<BuildingType, 'PREVIEW'>, IconSpec>> = {
  TOWN_HALL: { emoji: '🏛️', gradientFrom: '#f5c95a', gradientTo: '#9a6628' },
  RESOURCE_TWIG_COLLECTOR: { emoji: '🌿', gradientFrom: '#c2d878', gradientTo: '#6b8f3a' },
  RESOURCE_PEBBLE_COLLECTOR: { emoji: '🪨', gradientFrom: '#cfd3da', gradientTo: '#6c757f' },
  RESOURCE_PUTTY_COLLECTOR: { emoji: '🧱', gradientFrom: '#f8a3a3', gradientTo: '#a23a3a' },
  RESOURCE_GOO_COLLECTOR: { emoji: '🧪', gradientFrom: '#a8eda4', gradientTo: '#3a8f3a' },
  RESOURCE_WOOD_SILO: { emoji: '🪵', gradientFrom: '#d4a373', gradientTo: '#6b4423' },
  RESOURCE_STONE_SILO: { emoji: '⛰️', gradientFrom: '#cfd3da', gradientTo: '#5a6068' },
  DEFENSE_WALL_WOOD: { emoji: '🪵', gradientFrom: '#a87651', gradientTo: '#5e3a1e' },
  DEFENSE_WALL_STONE: { emoji: '🧱', gradientFrom: '#bdc1c6', gradientTo: '#52585f' },
  DEFENSE_WALL_IRON: { emoji: '⚙️', gradientFrom: '#c4ccd7', gradientTo: '#3a4554' },
  DEFENSE_TURRET_RAPID: { emoji: '🔫', gradientFrom: '#8aa3c1', gradientTo: '#374a64' },
  DEFENSE_MORTAR: { emoji: '💣', gradientFrom: '#7e8a9e', gradientTo: '#2c3543' },
  DEFENSE_LASER_TOWER: { emoji: '⚡', gradientFrom: '#a5e1ff', gradientTo: '#1d4e8a' },
  ARMY_HATCHERY: { emoji: '🥚', gradientFrom: '#f1cca0', gradientTo: '#7e5331' },
  ARMY_MONSTER_PEN: { emoji: '🐾', gradientFrom: '#d4a373', gradientTo: '#5e3f1e' },
  DECOR_MUSHROOM_TOTEM: { emoji: '🍄', gradientFrom: '#f8a3a3', gradientTo: '#7e2424' },
};

const FALLBACK_SPEC: IconSpec = { emoji: '🏗️', gradientFrom: '#d4a373', gradientTo: '#5e3a1e' };

const getSpec = (type: Exclude<BuildingType, 'PREVIEW'>): IconSpec => ICON_SPECS[type] ?? FALLBACK_SPEC;

export const BuildingIcon = ({ type, className }: BuildingIconProps) => {
  const spec = getSpec(type);
  const containerClass = className ?? 'h-full w-full';
  return (
    <div
      className={`${containerClass} relative flex items-center justify-center overflow-hidden`}
      style={{ background: `linear-gradient(180deg, ${spec.gradientFrom} 0%, ${spec.gradientTo} 100%)` }}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 opacity-25" style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 60%)' }} />
      <div className="pointer-events-none absolute inset-0 mix-blend-multiply" style={{ background: 'radial-gradient(circle at 70% 95%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 65%)' }} />
      <span className="relative text-5xl leading-none drop-shadow-[3px_4px_0_rgba(0,0,0,0.55)]">{spec.emoji}</span>
    </div>
  );
};
