import { useGameStore } from '../../state/game-store';
import {
  MONSTER_CATALOG,
  getMonsterLevelSpec,
  getMonsterMaxLevel,
  getMonsterStatCap,
  type MonsterType,
} from '../../core/constants/monster-catalog';
import { BUILDING_TYPES } from '../../core/types/building';
import { formatDurationMs, getInstantFinishShinyCost } from '../../core/constants/build-rules';
import { StatBar } from './stat-bar';
import { MonsterPreviewCanvas } from '../modals/monster-preview-canvas';

const OPTIONS = Object.keys(MONSTER_CATALOG) as MonsterType[];

export const HatcheryModal = () => {
  const hatcheryModalBuildingId = useGameStore((state) => state.hatcheryModalBuildingId);
  const hatcheryTrainingQueues = useGameStore((state) => state.hatcheryTrainingQueues);
  const closeHatcheryModal = useGameStore((state) => state.closeHatcheryModal);
  const queueMonsterTraining = useGameStore((state) => state.queueMonsterTraining);
  const startMonsterUpgrade = useGameStore((state) => state.startMonsterUpgrade);
  const instantFinishMonsterResearch = useGameStore((state) => state.instantFinishMonsterResearch);
  const monsterLevels = useGameStore((state) => state.monsterLevels);
  const activeResearch = useGameStore((state) => state.activeResearch);
  const shiny = useGameStore((state) => state.shiny);
  const developerModeEnabled = useGameStore((state) => state.developerModeEnabled);
  const freeBuildMode = useGameStore((state) => state.freeBuildMode);
  const resources = useGameStore((state) => state.resources);
  const armySpaceUsed = useGameStore((state) => state.armySpaceUsed);
  const maxArmySpace = useGameStore((state) => state.maxArmySpace);
  const engine = useGameStore((state) => state.engine);

  if (!hatcheryModalBuildingId) {
    return null;
  }

  const state = engine.getState();
  const lab = state.buildings.find((building) => building.id === hatcheryModalBuildingId);
  const townHall = state.buildings.find((building) => building.type === BUILDING_TYPES.TOWN_HALL);
  const labLevel = lab?.level ?? 1;
  const townHallLevel = townHall?.level ?? 1;
  const queue = hatcheryTrainingQueues[hatcheryModalBuildingId] ?? [];
  const researchRemainingMs = activeResearch.endTime ? Math.max(0, activeResearch.endTime - Date.now()) : 0;
  const instantResearchCost = getInstantFinishShinyCost(researchRemainingMs);
  const hasUnlimitedShiny = developerModeEnabled || freeBuildMode;
  const hpCap = getMonsterStatCap('hp');
  const damageCap = getMonsterStatCap('damage');
  const speedCap = getMonsterStatCap('speed');

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55">
      <div className="bym-wood-frame max-h-[90vh] w-[1120px] overflow-y-auto p-4 text-slate-100">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="bym-cartoon-text text-2xl">Monster Academy</h3>
          <button
            type="button"
            aria-label="Cerrar modal"
            tabIndex={0}
            className="bym-button-cartoon bym-button-cartoon--red px-3 py-1 text-xs"
            onClick={closeHatcheryModal}
          >
            CERRAR
          </button>
        </div>
        <p className="bym-cartoon-text-sm mb-3 text-[12px] text-amber-50">
          Goo: {Math.floor(resources.goo.current)} | Pebbles: {Math.floor(resources.pebbles.current)} | Putty:{' '}
          {Math.floor(resources.putty.current)} | Army Space: {armySpaceUsed}/{maxArmySpace}
        </p>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {OPTIONS.map((monsterType) => {
            const monsterDef = MONSTER_CATALOG[monsterType];
            const currentLevel = monsterLevels[monsterType] ?? 0;
            const unlocked = currentLevel > 0;
            const shownCurrentLevel = Math.max(1, currentLevel);
            const levelSpec = getMonsterLevelSpec(monsterType, shownCurrentLevel);
            const canTrain = unlocked && (hasUnlimitedShiny || resources.goo.current >= levelSpec.gooCost);
            const nextResearchLevel = unlocked ? currentLevel + 1 : 1;
            const maxLevel = getMonsterMaxLevel(monsterType);
            const canResearch = hasUnlimitedShiny || nextResearchLevel <= maxLevel;
            const nextLevelPreview = canResearch ? monsterDef.levels[nextResearchLevel] ?? null : null;
            const canMeetTownHall = hasUnlimitedShiny || (nextLevelPreview ? townHallLevel >= nextLevelPreview.requiredTownHallLevel : false);
            const canMeetLab = hasUnlimitedShiny || (nextLevelPreview ? labLevel >= nextLevelPreview.requiredLaboratoryLevel : false);
            const hasResearchResources = hasUnlimitedShiny ||
              (nextLevelPreview
                ? resources.pebbles.current >= nextLevelPreview.researchCost.pebbles &&
                  resources.putty.current >= nextLevelPreview.researchCost.putty
                : false);
            const isResearchingThisMonster = activeResearch.monsterType === monsterType;
            const researchButtonEnabled =
              !activeResearch.monsterType && !!nextLevelPreview && canResearch && canMeetTownHall && canMeetLab && hasResearchResources;
            return (
              <div key={monsterType} className="bym-card-wood p-3 text-left text-amber-50">
                <div className="grid grid-cols-[300px_1fr] gap-4">
                  <div className="flex flex-col gap-2">
                    <p className="bym-cartoon-text text-lg">
                      {monsterDef.name} - Nv.{shownCurrentLevel}
                    </p>
                    <p className="bym-cartoon-text-sm text-[11px] text-amber-100/95">{monsterDef.description}</p>
                    <p className="bym-cartoon-text-sm text-[11px] text-amber-100/95">Objetivo favorito: {monsterDef.favoriteTarget}</p>
                    <MonsterPreviewCanvas monsterType={monsterType} animationState={isResearchingThisMonster ? 'attack' : 'idle'} />
                    <button
                      type="button"
                      aria-label={`Entrenar ${monsterDef.name}`}
                      tabIndex={0}
                      className="bym-button-cartoon mt-2 w-full px-2 py-1 text-[11px]"
                      onClick={() => queueMonsterTraining(monsterType)}
                      disabled={!canTrain}
                    >
                      ENTRENAR (GOO {levelSpec.gooCost} / {Math.ceil(levelSpec.trainingTimeMs / 1000)}S)
                    </button>
                  </div>
                  <div className="bym-parchment-card p-3 text-amber-950">
                    <p className="bym-cartoon-text-dark text-[12px] uppercase">Comparador de niveles</p>
                    {nextLevelPreview ? (
                      <>
                        <StatBar label="HP" currentValue={levelSpec.hp} nextValue={nextLevelPreview.hp} maxPossibleValue={hpCap} unit="HP" />
                        <StatBar
                          label="Dano"
                          currentValue={levelSpec.damage}
                          nextValue={nextLevelPreview.damage}
                          maxPossibleValue={damageCap}
                          unit="DMG"
                        />
                        <StatBar
                          label="Velocidad"
                          currentValue={Number(levelSpec.speed.toFixed(2))}
                          nextValue={Number(nextLevelPreview.speed.toFixed(2))}
                          maxPossibleValue={speedCap}
                          unit="kph"
                        />
                      </>
                    ) : (
                      <p className="mt-3 text-xs text-amber-900/85">Esta criatura ya alcanzo el nivel maximo.</p>
                    )}
                    <div className="mt-3 rounded-md border-2 border-amber-900/50 bg-amber-50/65 p-2 text-[11px] text-amber-950">
                      {nextLevelPreview ? (
                        <>
                          <p>
                            Siguiente investigacion: Nv.{nextResearchLevel} ({formatDurationMs(nextLevelPreview.researchTimeMs)})
                          </p>
                          <p>
                            Requiere TH {nextLevelPreview.requiredTownHallLevel}, Lab {nextLevelPreview.requiredLaboratoryLevel}
                          </p>
                          <p>
                            Costo: Pebbles {nextLevelPreview.researchCost.pebbles}, Putty {nextLevelPreview.researchCost.putty}
                          </p>
                        </>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      aria-label={!unlocked ? 'Desbloquear monstruo' : `Investigar nivel ${nextResearchLevel}`}
                      tabIndex={0}
                      className="bym-button-cartoon bym-button-cartoon--blue mt-2 w-full px-2 py-1 text-[11px]"
                      disabled={!researchButtonEnabled}
                      onClick={() => startMonsterUpgrade(monsterType)}
                    >
                      {!unlocked
                        ? 'DESBLOQUEAR'
                        : canResearch
                          ? `INVESTIGAR NV.${nextResearchLevel}`
                          : 'NIVEL MAXIMO'}
                    </button>
                    {isResearchingThisMonster ? <p className="mt-1 text-[11px] font-semibold text-amber-900">Investigando ahora...</p> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {activeResearch.monsterType ? (
          <div className="bym-card-wood mt-3 p-3 text-amber-50">
            <p className="bym-cartoon-text-sm text-[12px]">
              Monster Academy investigando {activeResearch.monsterType} a Nv.{activeResearch.targetLevel}
            </p>
            <p className="text-[11px] text-amber-100/95">Tiempo restante: {formatDurationMs(researchRemainingMs)}</p>
            <button
              type="button"
              aria-label="Finalizar investigacion al instante"
              tabIndex={0}
              className="bym-button-cartoon bym-button-cartoon--gold mt-2 w-full px-2 py-1 text-[11px]"
              disabled={!hasUnlimitedShiny && shiny < instantResearchCost}
              onClick={instantFinishMonsterResearch}
            >
              FINALIZAR AL INSTANTE ({hasUnlimitedShiny ? '∞' : instantResearchCost} SHINY)
            </button>
          </div>
        ) : null}
        <div className="bym-parchment-card mt-3 p-3 text-amber-950">
          <p className="bym-cartoon-text-dark mb-1 text-[13px]">COLA</p>
          {queue.length ? (
            queue.map((item, index) => (
              <p key={`${item.monsterType}-${index}`} className="text-[12px] font-semibold">
                {index + 1}. {item.monsterType} - {(item.timeRemainingMs / 1000).toFixed(1)}s
              </p>
            ))
          ) : (
            <p className="text-[12px] italic text-amber-900/75">Sin entrenamientos.</p>
          )}
        </div>
      </div>
    </div>
  );
};
