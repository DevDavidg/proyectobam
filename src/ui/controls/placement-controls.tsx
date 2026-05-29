import { formatDurationMs } from "../../core/constants/build-rules";
import { useGameStore } from "../../state/game-store";
import { ShopModal } from "./shop/shop-modal";

const getLandExpansionCost = (nextLandLevel: number) => ({
  twigs: Math.round(260 * nextLandLevel),
  pebbles: Math.round(220 * nextLandLevel),
  putty: Math.round(140 * nextLandLevel),
  goo: Math.round(170 * nextLandLevel),
});

export const PlacementControls = () => {
  const placementEnabled = useGameStore((state) => state.placementEnabled);
  const resources = useGameStore((state) => state.resources);
  const shiny = useGameStore((state) => state.shiny);
  const freeBuildMode = useGameStore((state) => state.freeBuildMode);
  const developerModeEnabled = useGameStore(
    (state) => state.developerModeEnabled,
  );
  const workers = useGameStore((state) => state.workers);
  const workersTotal = useGameStore((state) => state.workersTotal);
  const landLevel = useGameStore((state) => state.landLevel);
  const maxLandLevel = useGameStore((state) => state.maxLandLevel);
  const landExpansionMode = useGameStore((state) => state.landExpansionMode);
  const movingBuildingId = useGameStore((state) => state.movingBuildingId);
  const activeCell = useGameStore((state) => state.activeCell);
  const placementValid = useGameStore((state) => state.placementValid);
  const workerBusyModal = useGameStore((state) => state.workerBusyModal);
  const setShopOpen = useGameStore((state) => state.setShopOpen);
  const dismissWorkerBusyModal = useGameStore(
    (state) => state.dismissWorkerBusyModal,
  );
  const instantFinishBuildingWithShiny = useGameStore(
    (state) => state.instantFinishBuildingWithShiny,
  );
  const cancelMovingBuilding = useGameStore(
    (state) => state.cancelMovingBuilding,
  );
  const cancelLandExpansionMode = useGameStore(
    (state) => state.cancelLandExpansionMode,
  );

  const busyWorkers = workers.filter(
    (worker) => worker.state !== "IDLE",
  ).length;
  const unrestrictedMode = freeBuildMode || developerModeEnabled;
  const nextLandLevel = Math.min(maxLandLevel, landLevel + 1);
  const nextLandCost = getLandExpansionCost(nextLandLevel);
  const canAffordLandExpansion =
    freeBuildMode ||
    (resources.twigs.current >= nextLandCost.twigs &&
      resources.pebbles.current >= nextLandCost.pebbles &&
      resources.putty.current >= nextLandCost.putty &&
      resources.goo.current >= nextLandCost.goo);
  const hasUnlimitedShiny = unrestrictedMode;

  return (
    <>
      <div className="bym-wood-frame absolute right-4 top-4 z-20 flex w-[320px] flex-col gap-2 text-amber-50">
        <p className="bym-cartoon-text text-base">PANEL DE ALDEA</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            aria-label="Misiones"
            tabIndex={0}
            className="bym-button-cartoon bym-button-cartoon--gold px-2 py-2 text-[11px] opacity-80"
          >
            MISIONES
          </button>
          <button
            type="button"
            aria-label="Abrir tienda"
            tabIndex={0}
            className="bym-button-cartoon bym-button-cartoon--blue px-2 py-2 text-[11px]"
            onClick={() => setShopOpen(true)}
          >
            TIENDA
          </button>
          <button
            type="button"
            aria-label="Expandir terreno"
            tabIndex={0}
            className="bym-button-cartoon px-2 py-2 text-[11px]"
            onClick={() => setShopOpen(true)}
            disabled={landLevel >= maxLandLevel}
          >
            MAPA {landLevel}/{maxLandLevel}
          </button>
        </div>
        <div className="bym-resource-chip px-2.5 py-1.5">
          <p className="bym-cartoon-text-sm text-[11px]">
            OBREROS: {busyWorkers}/{workersTotal} · SHINY:{" "}
            {hasUnlimitedShiny ? "∞" : shiny}
          </p>
        </div>
        <div className="bym-resource-chip px-2.5 py-1.5">
          <p className="bym-cartoon-text-sm text-[11px]">
            CONSTRUCCION:{" "}
            {placementEnabled ? "ACTIVA (ESC PARA CANCELAR)" : "INACTIVA"}
          </p>
        </div>
      </div>

      {movingBuildingId ? (
        <div className="bym-wood-frame absolute bottom-4 left-1/2 z-30 flex w-[min(680px,94vw)] -translate-x-1/2 items-center justify-between gap-3 text-amber-50">
          <p className="bym-cartoon-text-sm text-[12px]">
            MODO MOVER ACTIVO: haz click en una celda valida para confirmar la
            reubicacion.
            {activeCell
              ? ` Objetivo ${activeCell.x},${activeCell.y}${placementValid ? " (valido)" : " (ocupado)"}.`
              : ""}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Cancelar reubicacion"
              tabIndex={0}
              className="bym-button-cartoon bym-button-cartoon--red px-3 py-1.5 text-[11px]"
              onClick={cancelMovingBuilding}
            >
              CANCELAR
            </button>
          </div>
        </div>
      ) : null}

      {landExpansionMode ? (
        <div className="bym-wood-frame absolute bottom-4 left-1/2 z-30 flex w-[min(780px,96vw)] -translate-x-1/2 items-center justify-between gap-3 text-amber-50">
          <div>
            <p className="bym-cartoon-text-sm text-[12px]">
              MODO EXPANSION ACTIVO: mueve el mouse al borde y confirma con
              click izquierdo.
            </p>
            <p className="text-[11px] text-amber-100/85">
              Costo: T {nextLandCost.twigs} | P {nextLandCost.pebbles} | Pu{" "}
              {nextLandCost.putty} | G {nextLandCost.goo}
              {canAffordLandExpansion ? "" : " (recursos insuficientes)"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cancelar expansion"
            tabIndex={0}
            className="bym-button-cartoon bym-button-cartoon--red px-3 py-1.5 text-[11px]"
            onClick={cancelLandExpansionMode}
          >
            CANCELAR
          </button>
        </div>
      ) : null}

      <ShopModal />

      {workerBusyModal ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/65">
          <div className="bym-wood-frame w-[460px] text-amber-50">
            <p className="bym-cartoon-text text-xl">OBREROS OCUPADOS</p>
            <p className="mt-2 text-[12px] text-amber-100">
              Tu nueva construccion queda en cola. Puedes finalizar una tarea
              activa al instante para liberar un obrero.
            </p>
            <p className="bym-cartoon-text-sm mt-2 text-[12px]">
              TIEMPO RESTANTE: {formatDurationMs(workerBusyModal.remainingMs)} ·
              COSTO: {workerBusyModal.shinyCost}⚡
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                aria-label="Finalizar tarea ahora con shiny"
                tabIndex={0}
                className="bym-button-cartoon bym-button-cartoon--gold flex-1 px-3 py-2 text-[12px]"
                onClick={() =>
                  instantFinishBuildingWithShiny(
                    workerBusyModal.activeTaskBuildingId,
                  )
                }
                disabled={
                  !hasUnlimitedShiny && shiny < workerBusyModal.shinyCost
                }
              >
                FINALIZAR AHORA (
                {hasUnlimitedShiny ? "∞" : workerBusyModal.shinyCost})
              </button>
              <button
                type="button"
                aria-label="Dejar en cola"
                tabIndex={0}
                className="bym-button-cartoon flex-1 px-3 py-2 text-[12px]"
                onClick={dismissWorkerBusyModal}
              >
                DEJAR EN COLA
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
