import { useMemo, useState } from 'react';
import {
  formatDurationMs,
  getBuildingCapForTownHallLevel,
  getBuildingCount,
  getBuildingRequiredTownHallLevel,
  isBuildableType,
} from '../../core/constants/build-rules';
import { ENHANCED_BUILDING_CATALOG } from '../../core/constants/catalog';
import { BUILDING_TYPES, type BuildingCategory, type BuildingType } from '../../core/types/building';
import { useGameStore } from '../../state/game-store';
import { MAX_WORKERS, getWorkerShinyCost } from '../../state/game-store/helpers';
import { BuildingPreview } from './building-preview';
import { BuildingIcon } from './shop/building-icon';
import { ShopCostBlocks } from './shop/shop-cost-blocks';
import { ShopItemCard } from './shop/shop-item-card';

type BuildableType = Exclude<
  BuildingType,
  'TOWN_HALL' | 'PREVIEW' | 'OBSTACLE_TREE' | 'OBSTACLE_ROCK' | 'OBSTACLE_MUSHROOM'
>;

const SHOP_TABS: Array<{ id: BuildingCategory; label: string }> = [
  { id: 'RESOURCES', label: 'Recursos' },
  { id: 'ARMY', label: 'Edificios' },
  { id: 'DEFENSES', label: 'Defensivo' },
  { id: 'DECORATION', label: 'Decoraciones' },
];

const ITEMS_PER_PAGE = 6;
const getLandExpansionCost = (nextLandLevel: number) => ({
  twigs: Math.round(260 * nextLandLevel),
  pebbles: Math.round(220 * nextLandLevel),
  putty: Math.round(140 * nextLandLevel),
  goo: Math.round(170 * nextLandLevel),
});

const getShopItemDescription = (type: BuildableType): string => {
  const definition = ENHANCED_BUILDING_CATALOG[type];
  if (definition.production) {
    if (definition.production.type === 'twigs') {
      return 'Produce ramas de forma constante para construcciones basicas.';
    }
    if (definition.production.type === 'pebbles') {
      return 'Refina piedras para defensas y mejoras de aldea.';
    }
    if (definition.production.type === 'putty') {
      return 'Genera masilla para estructuras avanzadas y blindajes.';
    }
    return 'Destila goo para tecnologia, evolucion y unidades especiales.';
  }
  if (definition.storage) {
    return 'Aumenta el limite maximo de recursos para sostener crecimiento.';
  }
  if (definition.tags?.includes('wall')) {
    return 'Bloquea el paso enemigo y protege zonas clave de tu base.';
  }
  if (definition.tags?.includes('turret') || definition.damageType === 'SINGLE' || definition.damageType === 'AOE') {
    return 'Defensa automatica con alcance para frenar ataques enemigos.';
  }
  if (type === 'ARMY_HATCHERY') {
    return 'Entrena y mejora monstruos para fortalecer tu ejercito.';
  }
  if (type === 'ARMY_MONSTER_PEN') {
    return 'Aloja monstruos listos para despliegue y combate.';
  }
  if (type === 'DECOR_MUSHROOM_TOTEM') {
    return 'Decoracion tematica para personalizar y dar vida a la base.';
  }
  return 'Estructura esencial para el desarrollo de la aldea.';
};

export const PlacementControls = () => {
  const isDeveloperToolsAvailable = import.meta.env.VITE_DEVELOPER_MODE === 'true';
  const placementEnabled = useGameStore((state) => state.placementEnabled);
  const activeBuildTab = useGameStore((state) => state.activeBuildTab);
  const entities = useGameStore((state) => state.entities);
  const shiny = useGameStore((state) => state.shiny);
  const resources = useGameStore((state) => state.resources);
  const freeBuildMode = useGameStore((state) => state.freeBuildMode);
  const developerModeEnabled = useGameStore((state) => state.developerModeEnabled);
  const workers = useGameStore((state) => state.workers);
  const workersTotal = useGameStore((state) => state.workersTotal);
  const landLevel = useGameStore((state) => state.landLevel);
  const maxLandLevel = useGameStore((state) => state.maxLandLevel);
  const landExpansionMode = useGameStore((state) => state.landExpansionMode);
  const shopOpen = useGameStore((state) => state.shopOpen);
  const movingBuildingId = useGameStore((state) => state.movingBuildingId);
  const activeCell = useGameStore((state) => state.activeCell);
  const placementValid = useGameStore((state) => state.placementValid);
  const workerBusyModal = useGameStore((state) => state.workerBusyModal);
  const engine = useGameStore((state) => state.engine);
  const toggleFreeBuildMode = useGameStore((state) => state.toggleFreeBuildMode);
  const toggleDeveloperMode = useGameStore((state) => state.toggleDeveloperMode);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const buyWorker = useGameStore((state) => state.buyWorker);
  const startLandExpansionMode = useGameStore((state) => state.startLandExpansionMode);
  const cancelLandExpansionMode = useGameStore((state) => state.cancelLandExpansionMode);
  const setSelectedBuildingType = useGameStore((state) => state.setSelectedBuildingType);
  const setActiveBuildTab = useGameStore((state) => state.setActiveBuildTab);
  const toggleBattleMode = useGameStore((state) => state.toggleBattleMode);
  const startRaid = useGameStore((state) => state.startRaid);
  const setShopOpen = useGameStore((state) => state.setShopOpen);
  const dismissWorkerBusyModal = useGameStore((state) => state.dismissWorkerBusyModal);
  const instantFinishBuildingWithShiny = useGameStore((state) => state.instantFinishBuildingWithShiny);
  const confirmMovingBuilding = useGameStore((state) => state.confirmMovingBuilding);
  const cancelMovingBuilding = useGameStore((state) => state.cancelMovingBuilding);

  const [selectedShopItemType, setSelectedShopItemType] = useState<BuildableType | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  const busyWorkers = workers.filter((worker) => worker.state !== 'IDLE').length;
  const state = engine.getState();
  const townHall = state.buildings.find((building) => building.type === BUILDING_TYPES.TOWN_HALL);
  const townHallLevel = townHall?.level ?? 1;

  const filteredCatalog = useMemo(
    () =>
      Object.values(ENHANCED_BUILDING_CATALOG)
        .filter(
          (definition) =>
            definition.category === activeBuildTab &&
            !definition.tags?.includes('obstacle') &&
            isBuildableType(definition.type)
        )
        .map((definition) => definition as (typeof ENHANCED_BUILDING_CATALOG)[BuildableType]),
    [activeBuildTab, entities]
  );

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / ITEMS_PER_PAGE));
  const safePage = Math.min(pageIndex, totalPages - 1);
  const pageStart = safePage * ITEMS_PER_PAGE;
  const pagedCatalog = filteredCatalog.slice(pageStart, pageStart + ITEMS_PER_PAGE);
  const selectedItem = selectedShopItemType ? ENHANCED_BUILDING_CATALOG[selectedShopItemType] : null;

  const selectedCurrentCount = selectedShopItemType ? getBuildingCount(state.buildings, selectedShopItemType) : 0;
  const selectedMaxCount = selectedShopItemType ? getBuildingCapForTownHallLevel(selectedShopItemType, townHallLevel) : 0;
  const selectedRequiredTownHallLevel = selectedShopItemType ? getBuildingRequiredTownHallLevel(selectedShopItemType) : 1;
  const selectedDescription = selectedShopItemType ? getShopItemDescription(selectedShopItemType) : '';
  const hasEnoughTownHallLevel = townHallLevel >= selectedRequiredTownHallLevel;
  const hasAvailableCap = selectedCurrentCount < selectedMaxCount;
  const canAffordSelected =
    freeBuildMode ||
    !selectedItem ||
    (resources.twigs.current >= selectedItem.cost.twigs &&
      resources.pebbles.current >= selectedItem.cost.pebbles &&
      resources.putty.current >= selectedItem.cost.putty &&
      resources.goo.current >= selectedItem.cost.goo);
  const nextLandLevel = Math.min(maxLandLevel, landLevel + 1);
  const nextLandCost = getLandExpansionCost(nextLandLevel);
  const canAffordLandExpansion =
    freeBuildMode ||
    (resources.twigs.current >= nextLandCost.twigs &&
      resources.pebbles.current >= nextLandCost.pebbles &&
      resources.putty.current >= nextLandCost.putty &&
      resources.goo.current >= nextLandCost.goo);
  const nextWorkerNumber = workersTotal + 1;
  const workerShinyCost = getWorkerShinyCost(nextWorkerNumber);
  const workerLimitReached = workersTotal >= MAX_WORKERS;
  const hasUnlimitedShiny = developerModeEnabled;
  const canAffordWorker = freeBuildMode || hasUnlimitedShiny || shiny >= workerShinyCost;

  const handleSelectTab = (tab: BuildingCategory): void => {
    setActiveBuildTab(tab);
    setPageIndex(0);
    setSelectedShopItemType(null);
  };

  const handleConfirmBuildSelection = (): void => {
    if (!selectedShopItemType || !hasEnoughTownHallLevel || !hasAvailableCap || !canAffordSelected) {
      return;
    }
    setSelectedBuildingType(selectedShopItemType);
    setShopOpen(false);
  };

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
            OBREROS: {busyWorkers}/{workersTotal} · SHINY: {hasUnlimitedShiny ? '∞' : shiny}
          </p>
        </div>
        <div className="bym-resource-chip px-2.5 py-1.5">
          <p className="bym-cartoon-text-sm text-[11px]">
            CONSTRUCCION: {placementEnabled ? 'ACTIVA (ESC PARA CANCELAR)' : 'INACTIVA'}
          </p>
        </div>
      </div>

      {movingBuildingId ? (
        <div className="bym-wood-frame absolute bottom-4 left-1/2 z-30 flex w-[min(680px,94vw)] -translate-x-1/2 items-center justify-between gap-3 text-amber-50">
          <p className="bym-cartoon-text-sm text-[12px]">
            MODO MOVER ACTIVO: selecciona una celda valida para reubicar el corral.
            {activeCell ? ` Objetivo ${activeCell.x},${activeCell.y}.` : ''}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Confirmar reubicacion"
              tabIndex={0}
              className="bym-button-cartoon px-3 py-1.5 text-[11px]"
              disabled={!placementValid}
              onClick={confirmMovingBuilding}
            >
              CONFIRMAR
            </button>
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
              MODO EXPANSION ACTIVO: mueve el mouse al borde y confirma con click izquierdo.
            </p>
            <p className="text-[11px] text-amber-100/85">
              Costo: T {nextLandCost.twigs} | P {nextLandCost.pebbles} | Pu {nextLandCost.putty} | G {nextLandCost.goo}
              {canAffordLandExpansion ? '' : ' (recursos insuficientes)'}
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

      {shopOpen ? (
        <div className="absolute inset-0 z-30 flex items-start justify-center overflow-y-auto bg-black/65 p-4 md:p-6">
          <div className="bym-wood-frame relative flex h-[min(900px,92vh)] w-[min(1200px,96vw)] flex-col overflow-hidden">
            <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
              <div>
                <p className="bym-cartoon-text-sm text-[11px] text-amber-200/95">TIENDA</p>
                <h3 className="bym-cartoon-text text-2xl">MERCADO PRINCIPAL</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="bym-resource-chip px-2.5 py-1.5">
                  <span className="bym-cartoon-text-sm text-[12px]">AYUNTAMIENTO NV.{townHallLevel}</span>
                </span>
                <button
                  type="button"
                  aria-label="Cerrar tienda"
                  tabIndex={0}
                  className="bym-button-cartoon bym-button-cartoon--red px-3 py-1.5 text-xs"
                  onClick={() => setShopOpen(false)}
                >
                  CERRAR
                </button>
              </div>
            </div>

            <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
              {SHOP_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-label={`Filtrar por ${tab.label}`}
                  tabIndex={0}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`bym-button-cartoon px-3 py-1.5 text-[11px] ${
                    activeBuildTab === tab.id ? 'bym-button-cartoon--gold' : 'bym-button-cartoon--blue'
                  }`}
                >
                  {tab.label.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
              <div className="flex min-h-0 flex-col">
                <div className="mb-2 flex shrink-0 items-center justify-between">
                  <p className="bym-cartoon-text text-[14px]">CATALOGO</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Pagina anterior"
                      tabIndex={0}
                      className="bym-button-cartoon px-2 py-1 text-[12px]"
                      onClick={() => setPageIndex((currentPage) => Math.max(0, currentPage - 1))}
                      disabled={safePage <= 0}
                    >
                      ◀
                    </button>
                    <span className="bym-cartoon-text-sm text-[12px]">
                      {safePage + 1}/{totalPages}
                    </span>
                    <button
                      type="button"
                      aria-label="Pagina siguiente"
                      tabIndex={0}
                      className="bym-button-cartoon px-2 py-1 text-[12px]"
                      onClick={() => setPageIndex((currentPage) => Math.min(totalPages - 1, currentPage + 1))}
                      disabled={safePage >= totalPages - 1}
                    >
                      ▶
                    </button>
                  </div>
                </div>
                <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
                  {pagedCatalog.map((definition) => {
                    const buildableType = definition.type as BuildableType;
                    const currentCount = getBuildingCount(state.buildings, buildableType);
                    const maxAllowed = getBuildingCapForTownHallLevel(buildableType, townHallLevel);
                    return (
                      <ShopItemCard
                        key={definition.type}
                        name={definition.name}
                        description={getShopItemDescription(buildableType)}
                        sizeLabel={`${definition.size.x}x${definition.size.y}`}
                        currentCount={currentCount}
                        maxAllowed={maxAllowed}
                        isSingleRow={definition.size.y === 1}
                        isActive={selectedShopItemType === definition.type}
                        onSelect={() => setSelectedShopItemType(buildableType)}
                        previewSlot={<BuildingIcon type={definition.type} />}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="bym-parchment-card min-h-0 overflow-y-auto p-4 text-amber-950">
                {selectedItem ? (
                  <>
                    <p className="bym-cartoon-text-dark text-[18px]">{selectedItem.name.toUpperCase()}</p>
                    <p className="text-[12px] font-semibold text-amber-900/95">
                      Construccion: {formatDurationMs(selectedItem.constructionMs)}
                    </p>
                    <p className="mt-1 text-[12px] text-amber-900/90">{selectedDescription}</p>
                    <BuildingPreview
                      type={selectedItem.type}
                      level={1}
                      className="mt-3 h-[220px] w-full rounded-md border-[3px] border-[#1e1b18] bg-[#2a1a0c] shadow-[inset_0_3px_0_rgba(255,200,140,0.18)]"
                    />
                    <p className="bym-cartoon-text-dark mt-3 text-[14px]">
                      Disponibilidad: {selectedCurrentCount}/{selectedMaxCount}
                      {selectedCurrentCount >= selectedMaxCount && selectedMaxCount > 0 ? ' ✓' : ''}
                    </p>

                    <div className="mt-3 space-y-1 text-[12px]">
                      <p className="bym-cartoon-text-dark text-[13px]">REQUISITOS</p>
                      <p className={`font-semibold ${hasEnoughTownHallLevel ? 'text-emerald-800' : 'text-rose-700'}`}>
                        Ayuntamiento nivel {selectedRequiredTownHallLevel} ({townHallLevel}/{selectedRequiredTownHallLevel})
                      </p>
                      <p className={`font-semibold ${hasAvailableCap ? 'text-emerald-800' : 'text-rose-700'}`}>
                        Capacidad disponible ({selectedCurrentCount}/{selectedMaxCount})
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="bym-cartoon-text-dark mb-1.5 text-[13px]">COSTOS</p>
                      <ShopCostBlocks
                        cost={selectedItem.cost}
                        resources={resources}
                        freeBuildMode={freeBuildMode}
                      />
                    </div>

                    <button
                      type="button"
                      aria-label="Confirmar seleccion"
                      tabIndex={0}
                      className="bym-button-cartoon mt-4 w-full px-3 py-2 text-xs"
                      onClick={handleConfirmBuildSelection}
                      disabled={!hasEnoughTownHallLevel || !hasAvailableCap || !canAffordSelected}
                    >
                      CONFIRMAR SELECCION
                    </button>
                    <p className="mt-2 text-[11px] text-amber-900/80">
                      Luego coloca en el terreno con click izquierdo o cancela con ESC.
                    </p>
                  </>
                ) : (
                  <p className="bym-cartoon-text-dark text-[14px]">
                    Selecciona un item para ver costos, requisitos y confirmar.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 flex shrink-0 flex-wrap items-center gap-2 border-t-2 border-[#1e1b18]/75 pt-3">
              <button
                type="button"
                aria-label="Comprar obrero"
                tabIndex={0}
                className="bym-button-cartoon bym-button-cartoon--gold px-3 py-1 text-[11px]"
                onClick={buyWorker}
                disabled={workerLimitReached || !canAffordWorker}
              >
                + OBRERO ({workersTotal}/{MAX_WORKERS})
                {workerLimitReached
                  ? ' MAX'
                  : hasUnlimitedShiny
                    ? ' ∞'
                    : ` ${workerShinyCost}⚡`}
              </button>
              <button
                type="button"
                aria-label="Expandir terreno"
                tabIndex={0}
                className="bym-button-cartoon bym-button-cartoon--blue px-3 py-1 text-[11px]"
                onClick={startLandExpansionMode}
                disabled={landLevel >= maxLandLevel}
              >
                EXPANDIR TERRENO ({landLevel}/{maxLandLevel})
              </button>
              <button
                type="button"
                aria-label="Modo gratis"
                tabIndex={0}
                className="bym-button-cartoon px-3 py-1 text-[11px]"
                onClick={toggleFreeBuildMode}
              >
                {freeBuildMode ? 'MODO GRATIS ON' : 'MODO GRATIS OFF'}
              </button>
              {isDeveloperToolsAvailable ? (
                <>
                  <button
                    type="button"
                    aria-label="Modo desarrollador"
                    tabIndex={0}
                    className={`bym-button-cartoon px-3 py-1 text-[11px] ${developerModeEnabled ? 'bym-button-cartoon--gold' : ''}`}
                    onClick={toggleDeveloperMode}
                  >
                    {developerModeEnabled ? 'DEV MODE ON' : 'DEV MODE OFF'}
                  </button>
                  {developerModeEnabled ? (
                    <button
                      type="button"
                      aria-label="Resetear progreso"
                      tabIndex={0}
                      className="bym-button-cartoon bym-button-cartoon--red px-3 py-1 text-[11px]"
                      onClick={resetProgress}
                    >
                      RESET PROGRESO
                    </button>
                  ) : null}
                </>
              ) : null}
              <button
                type="button"
                aria-label="Entrar en modo batalla"
                tabIndex={0}
                className="bym-button-cartoon bym-button-cartoon--red px-3 py-1 text-[11px]"
                onClick={toggleBattleMode}
              >
                ENTRAR BATALLA
              </button>
              <button
                type="button"
                aria-label="Iniciar raid"
                tabIndex={0}
                className="bym-button-cartoon bym-button-cartoon--red px-3 py-1 text-[11px]"
                onClick={startRaid}
              >
                BUSCAR PROBLEMAS
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {workerBusyModal ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/65">
          <div className="bym-wood-frame w-[460px] text-amber-50">
            <p className="bym-cartoon-text text-xl">OBREROS OCUPADOS</p>
            <p className="mt-2 text-[12px] text-amber-100">
              Tu nueva construccion queda en cola. Puedes finalizar una tarea activa al instante para liberar un obrero.
            </p>
            <p className="bym-cartoon-text-sm mt-2 text-[12px]">
              TIEMPO RESTANTE: {formatDurationMs(workerBusyModal.remainingMs)} · COSTO: {workerBusyModal.shinyCost}⚡
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                aria-label="Finalizar tarea ahora con shiny"
                tabIndex={0}
                className="bym-button-cartoon bym-button-cartoon--gold flex-1 px-3 py-2 text-[12px]"
                onClick={() => instantFinishBuildingWithShiny(workerBusyModal.activeTaskBuildingId)}
                disabled={!hasUnlimitedShiny && shiny < workerBusyModal.shinyCost}
              >
                FINALIZAR AHORA ({hasUnlimitedShiny ? '∞' : workerBusyModal.shinyCost})
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
