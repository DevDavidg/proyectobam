import { useMemo, useState } from 'react';
import { ENHANCED_BUILDING_CATALOG } from '../../core/constants/catalog';
import type { ResourceType } from '../../core/types/resources';
import { useGameStore } from '../../state/game-store';

type HudResourceRow = {
  id: ResourceType;
  label: string;
  icon: string;
  barClassName: string;
};

const HUD_RESOURCES: HudResourceRow[] = [
  { id: 'twigs', label: 'Ramitas', icon: '🌿', barClassName: 'from-amber-300 via-yellow-300 to-amber-500' },
  { id: 'pebbles', label: 'Pebbles', icon: '🪨', barClassName: 'from-slate-300 via-slate-200 to-slate-400' },
  { id: 'putty', label: 'Putty', icon: '🧱', barClassName: 'from-rose-300 via-pink-300 to-rose-400' },
  { id: 'goo', label: 'Goo', icon: '🧪', barClassName: 'from-emerald-300 via-lime-300 to-emerald-500' },
];

const formatValue = (value: number): string => Math.floor(value).toLocaleString('en-US');

const toPercent = (current: number, max: number): number => {
  if (max <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, (current / max) * 100));
};

export const ResourceHud = () => {
  const resources = useGameStore((state) => state.resources);
  const shiny = useGameStore((state) => state.shiny);
  const developerModeEnabled = useGameStore((state) => state.developerModeEnabled);
  const freeBuildMode = useGameStore((state) => state.freeBuildMode);
  const unlimitedShiny = developerModeEnabled || freeBuildMode;
  const landLevel = useGameStore((state) => state.landLevel);
  const maxLandLevel = useGameStore((state) => state.maxLandLevel);
  const engine = useGameStore((state) => state.engine);
  const setShopOpen = useGameStore((state) => state.setShopOpen);
  const [hoveredResource, setHoveredResource] = useState<ResourceType | null>(null);

  const productionByHour = useMemo(() => {
    const perHour: Record<ResourceType, number> = {
      twigs: 0,
      pebbles: 0,
      putty: 0,
      goo: 0,
    };
    const buildings = engine.getState().buildings;

    for (const building of buildings) {
      if (building.status !== 'ACTIVE') {
        continue;
      }
      const productionDefinition = ENHANCED_BUILDING_CATALOG[building.type].production;
      if (!productionDefinition) {
        continue;
      }
      perHour[productionDefinition.type] += productionDefinition.ratePerMs * 1000 * 60 * 60;
    }

    return perHour;
  }, [engine, resources]);

  const hoveredData = hoveredResource
    ? {
        label: HUD_RESOURCES.find((resource) => resource.id === hoveredResource)?.label ?? hoveredResource,
        max: resources[hoveredResource].max,
        hourly: productionByHour[hoveredResource],
      }
    : null;

  return (
    <aside className="absolute left-4 top-4 z-20">
      <div className="relative">
        <div className="absolute -left-7 -top-7 z-10 grid h-16 w-16 place-items-center rounded-[35%] border-[3px] border-[#1e1b18] bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-700 shadow-[0_4px_0_#1a0f06,0_8px_18px_rgba(0,0,0,0.55)]">
          <span className="bym-cartoon-text text-2xl leading-none">{landLevel}</span>
        </div>

        <div className="bym-wood-frame w-[360px] pl-10">
          <div className="mb-3 flex items-center justify-between">
            <p className="bym-cartoon-text text-base">RECURSOS</p>
            <p className="bym-cartoon-text-sm text-[12px]">
              NIVEL {landLevel}/{maxLandLevel}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {HUD_RESOURCES.map((resource) => {
              const data = resources[resource.id];
              const fillPercent = toPercent(data.current, data.max);
              return (
                <div
                  key={resource.id}
                  className="bym-resource-chip relative overflow-hidden px-2.5 py-1.5"
                  onMouseEnter={() => setHoveredResource(resource.id)}
                  onMouseLeave={() => setHoveredResource(null)}
                >
                  <div
                    className={`pointer-events-none absolute inset-y-0 left-0 bg-gradient-to-r opacity-80 ${resource.barClassName}`}
                    style={{ width: `${fillPercent}%` }}
                  />
                  <div className="relative z-10 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-[10px] border-2 border-[#1e1b18] bg-[#2a180a] text-base shadow-[inset_0_2px_0_rgba(255,210,150,0.2)]">
                        {resource.icon}
                      </span>
                      <div className="leading-tight">
                        <p className="bym-cartoon-text-sm text-[11px] uppercase">{resource.label}</p>
                        <p className="bym-cartoon-text-sm text-[12px]">
                          {formatValue(data.current)} / {formatValue(data.max)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={`Abrir tienda de ${resource.label}`}
                      tabIndex={0}
                      className="bym-button-cartoon h-7 w-7 px-0 py-0 text-base"
                      onClick={() => setShopOpen(true)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="bym-resource-chip mt-1 flex items-center justify-between px-2.5 py-1.5">
              <span className="bym-cartoon-text-sm text-[12px]">SHINY</span>
              <span className="bym-cartoon-text-sm text-[12px]">{unlimitedShiny ? '∞' : formatValue(shiny)}</span>
            </div>
          </div>
        </div>

        {hoveredData ? (
          <div className="bym-parchment-card pointer-events-none absolute left-[374px] top-14 z-30 min-w-[230px] px-3 py-2 text-[11px]">
            <p className="bym-cartoon-text-dark text-[13px]">{hoveredData.label}</p>
            <p className="mt-1 font-semibold text-amber-950">Capacidad maxima: {formatValue(hoveredData.max)}</p>
            <p className="font-semibold text-amber-950">Por hora: {formatValue(hoveredData.hourly)}</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
};
