import type { BuildingType } from '../../core/types/building';
import { buildBuildingInfoDetails } from '../../render/scene/building-context-menu/building-info-details';
import type { BuildingContextData } from '../../render/scene/building-context-menu/use-building-context-data';
import { BUILDING_INFO_PREVIEW_BG, BuildingInfoPreview } from './building-info-preview';

type PreviewableBuildingType = Exclude<BuildingType, 'PREVIEW'>;

type BuildingInfoPanelProps = {
  data: BuildingContextData;
  onClose: () => void;
};

const isPreviewableType = (type: BuildingType): type is PreviewableBuildingType => type !== 'PREVIEW';

export const BuildingInfoPanel = ({ data, onClose }: BuildingInfoPanelProps) => {
  const detailRows = buildBuildingInfoDetails(data);
  const canShowPreview = isPreviewableType(data.building.type);

  const handleBackdropKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="building-info-title"
      onClick={onClose}
      onKeyDown={handleBackdropKeyDown}
    >
      <div
        className="pointer-events-auto flex max-h-[92vh] w-[min(520px,96vw)] flex-col overflow-hidden rounded-xl border border-amber-700/50 bg-slate-950/95 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-700/80 px-4 py-3">
          <h2 id="building-info-title" className="ui-title text-base">
            {data.buildingName} · Informacion
          </h2>
          <p className="mt-1 text-[11px] text-slate-400">Nivel {data.building.level}</p>
        </div>

        {canShowPreview ? (
          <div
            className="border-b border-emerald-900/30 px-3 pb-3 pt-3"
            style={{ backgroundColor: BUILDING_INFO_PREVIEW_BG }}
          >
            <BuildingInfoPreview type={data.building.type} level={data.building.level} className="w-full" />
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <p className="mb-3 text-[12px] leading-relaxed text-slate-200">{data.description}</p>
          <dl className="space-y-2">
            {detailRows.map((row) => (
              <div key={row.label} className="rounded bg-slate-900/60 px-2.5 py-1.5">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-amber-400/90">
                  {row.label}
                </dt>
                <dd className="mt-0.5 text-[11px] leading-snug text-slate-200">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="border-t border-slate-700/80 p-3">
          <button
            type="button"
            tabIndex={0}
            aria-label="Cerrar informacion del edificio"
            className="ui-button w-full px-3 py-2"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
