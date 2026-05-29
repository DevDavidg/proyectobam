import { formatDurationMs } from '../../../core/constants/build-rules';
import type { AcademyResearch } from '../../../state/game-store/types';

type ConstructionStatusPanelProps = {
  remainingMs: number;
  instantFinishCost: number;
  hasUnlimitedShiny: boolean;
  canInstantFinish: boolean;
  buildingId: string;
  instantFinishBuildingWithShiny: (buildingId: string) => void;
};

export const ConstructionStatusPanel = ({
  remainingMs,
  instantFinishCost,
  hasUnlimitedShiny,
  canInstantFinish,
  buildingId,
  instantFinishBuildingWithShiny,
}: ConstructionStatusPanelProps) => (
  <div className="mt-2 rounded bg-slate-900/55 p-2 text-[11px]">
    <p className="text-slate-200">En construccion: {formatDurationMs(remainingMs)}</p>
    <button
      type="button"
      className={`mt-1 w-full rounded px-2 py-1 text-[11px] font-semibold ${
        canInstantFinish
          ? 'bg-emerald-700 text-emerald-50 hover:bg-emerald-600'
          : 'cursor-not-allowed bg-slate-700 text-slate-400'
      }`}
      onClick={() => instantFinishBuildingWithShiny(buildingId)}
      disabled={!canInstantFinish}
    >
      Finalizar al instante ({hasUnlimitedShiny ? '\u221E' : instantFinishCost} shiny)
    </button>
  </div>
);

type ResearchStatusPanelProps = {
  labResearch: AcademyResearch;
  researchRemainingMs: number;
  canFinishResearch: boolean;
  hasUnlimitedShiny: boolean;
  researchFinishCost: number;
  instantFinishMonsterResearch: () => void;
};

export const ResearchStatusPanel = ({
  labResearch,
  researchRemainingMs,
  canFinishResearch,
  hasUnlimitedShiny,
  researchFinishCost,
  instantFinishMonsterResearch,
}: ResearchStatusPanelProps) => (
  <div className="mt-2 rounded bg-indigo-950/55 p-2 text-[11px]">
    <p className="text-indigo-100">
      Investigando {labResearch?.monsterType} Nv.{labResearch?.targetLevel}
    </p>
    <p className="text-indigo-200">Tiempo restante: {formatDurationMs(researchRemainingMs)}</p>
    <button
      type="button"
      className={`mt-1 w-full rounded px-2 py-1 font-semibold ${
        canFinishResearch
          ? 'bg-emerald-700 text-emerald-50 hover:bg-emerald-600'
          : 'cursor-not-allowed bg-slate-700 text-slate-400'
      }`}
      onClick={instantFinishMonsterResearch}
      disabled={!canFinishResearch}
    >
      Finalizar investigacion ({hasUnlimitedShiny ? '\u221E' : researchFinishCost} shiny)
    </button>
  </div>
);
