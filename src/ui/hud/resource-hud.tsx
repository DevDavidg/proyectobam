import { useMemo, useState } from "react";
import { ENHANCED_BUILDING_CATALOG } from "../../core/constants/catalog";
import type { ResourceType } from "../../core/types/resources";
import { useGameStore } from "../../state/game-store";

type HudResourceRow = {
  id: ResourceType;
  label: string;
  icon: string;
  barClassName: string;
};

const HUD_RESOURCES: HudResourceRow[] = [
  {
    id: "twigs",
    label: "Ramitas",
    icon: "🌿",
    barClassName: "from-amber-300 via-yellow-300 to-amber-500",
  },
  {
    id: "pebbles",
    label: "Pebbles",
    icon: "🪨",
    barClassName: "from-slate-300 via-slate-200 to-slate-400",
  },
  {
    id: "putty",
    label: "Putty",
    icon: "🧱",
    barClassName: "from-rose-300 via-pink-300 to-rose-400",
  },
  {
    id: "goo",
    label: "Goo",
    icon: "🧪",
    barClassName: "from-emerald-300 via-lime-300 to-emerald-500",
  },
];

const formatValue = (value: number): string =>
  Math.floor(value).toLocaleString("en-US");

const toPercent = (current: number, max: number): number => {
  if (max <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, (current / max) * 100));
};

export const ResourceHud = () => {
  const resources = useGameStore((state) => state.resources);
  const shiny = useGameStore((state) => state.shiny);
  const developerModeEnabled = useGameStore(
    (state) => state.developerModeEnabled,
  );
  const freeBuildMode = useGameStore((state) => state.freeBuildMode);
  const unlimitedShiny = developerModeEnabled || freeBuildMode;
  const landLevel = useGameStore((state) => state.landLevel);
  const maxLandLevel = useGameStore((state) => state.maxLandLevel);
  const engine = useGameStore((state) => state.engine);
  const setShopOpen = useGameStore((state) => state.setShopOpen);
  const [hoveredResource, setHoveredResource] = useState<ResourceType | null>(
    null,
  );

  const productionByHour = useMemo(() => {
    const perHour: Record<ResourceType, number> = {
      twigs: 0,
      pebbles: 0,
      putty: 0,
      goo: 0,
    };
    const buildings = engine.getState().buildings;

    for (const building of buildings) {
      if (building.status !== "ACTIVE") {
        continue;
      }
      const productionDefinition =
        ENHANCED_BUILDING_CATALOG[building.type].production;
      if (!productionDefinition) {
        continue;
      }
      perHour[productionDefinition.type] +=
        productionDefinition.ratePerMs * 1000 * 60 * 60;
    }

    return perHour;
  }, [engine, resources]);

  const hoveredData = hoveredResource
    ? {
        label:
          HUD_RESOURCES.find((resource) => resource.id === hoveredResource)
            ?.label ?? hoveredResource,
        max: resources[hoveredResource].max,
        hourly: productionByHour[hoveredResource],
      }
    : null;

  return (
    <aside className="absolute left-3 top-3 z-20 origin-top-left scale-[0.78]">
      <div className="relative">
        <div className="absolute -left-5 -top-5 z-10 grid h-11 w-11 place-items-center rounded-[35%] border-2 border-[#1e1b18] bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-700 shadow-[0_3px_0_#1a0f06,0_5px_12px_rgba(0,0,0,0.5)]">
          <span className="bym-cartoon-text text-lg leading-none">
            {landLevel}
          </span>
        </div>

        <div className="bym-wood-frame w-[268px] pl-7">
          <div className="mb-2 flex items-center justify-between">
            <p className="bym-cartoon-text text-sm">RECURSOS</p>
            <p className="bym-cartoon-text-sm text-[10px]">
              NIVEL {landLevel}/{maxLandLevel}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            {HUD_RESOURCES.map((resource) => {
              const data = resources[resource.id];
              const fillPercent = toPercent(data.current, data.max);
              return (
                <div
                  key={resource.id}
                  className="bym-resource-chip relative overflow-hidden px-2 py-1"
                  onMouseEnter={() => setHoveredResource(resource.id)}
                  onMouseLeave={() => setHoveredResource(null)}
                >
                  <div
                    className={`pointer-events-none absolute inset-y-0 left-0 bg-gradient-to-r opacity-80 ${resource.barClassName}`}
                    style={{ width: `${fillPercent}%` }}
                  />
                  <div className="relative z-10 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-[8px] border-2 border-[#1e1b18] bg-[#2a180a] text-sm shadow-[inset_0_2px_0_rgba(255,210,150,0.2)]">
                        {resource.icon}
                      </span>
                      <div className="leading-tight">
                        <p className="bym-cartoon-text-sm text-[10px] uppercase">
                          {resource.label}
                        </p>
                        <p className="bym-cartoon-text-sm text-[10px]">
                          {formatValue(data.current)} / {formatValue(data.max)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={`Abrir tienda de ${resource.label}`}
                      tabIndex={0}
                      className="bym-button-cartoon h-6 w-6 px-0 py-0 text-sm"
                      onClick={() => setShopOpen(true)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="bym-resource-chip mt-0.5 flex items-center justify-between px-2 py-1">
              <span className="bym-cartoon-text-sm text-[10px]">SHINY</span>
              <span className="bym-cartoon-text-sm text-[10px]">
                {unlimitedShiny ? "∞" : formatValue(shiny)}
              </span>
            </div>
          </div>
        </div>

        {hoveredData ? (
          <div className="bym-parchment-card pointer-events-none absolute left-[278px] top-10 z-30 min-w-[190px] px-2.5 py-1.5 text-[10px]">
            <p className="bym-cartoon-text-dark text-[11px]">
              {hoveredData.label}
            </p>
            <p className="mt-1 font-semibold text-amber-950">
              Capacidad maxima: {formatValue(hoveredData.max)}
            </p>
            <p className="font-semibold text-amber-950">
              Por hora: {formatValue(hoveredData.hourly)}
            </p>
          </div>
        ) : null}
      </div>
    </aside>
  );
};
