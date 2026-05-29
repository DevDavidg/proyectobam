import { useMemo, useRef, useState } from 'react';
import {
  getBuildingCapForTownHallLevel,
  getBuildingCount,
  getBuildingRequiredTownHallLevel,
  isBuildableType,
  isShopVisibleBuilding,
} from '../../../core/constants/build-rules';
import { ENHANCED_BUILDING_CATALOG } from '../../../core/constants/catalog';
import { BUILDING_TYPES, type BuildingCategory, type BuildingType } from '../../../core/types/building';
import { useGameStore } from '../../../state/game-store';
import { MAX_WORKERS, getWorkerShinyCost } from '../../../state/game-store/helpers';
import { ShopBuildingPreview } from './shop-building-preview';
import { ShopItemCard } from './shop-item-card';
import { ShopPreviewCanvas } from './shop-preview-canvas';
import { ShopUpgradePreviewStrip } from './shop-upgrade-preview-strip';
import { getShopTechnicalName } from './shop-technical-names';

type BuildableType = Exclude<
  BuildingType,
  'TOWN_HALL' | 'PREVIEW' | 'OBSTACLE_TREE' | 'OBSTACLE_ROCK' | 'OBSTACLE_MUSHROOM'
>;

const SHOP_TABS: Array<{ id: BuildingCategory; label: string }> = [
  { id: 'RESOURCES', label: 'btn_recursos' },
  { id: 'ARMY', label: 'btn_edificios' },
  { id: 'DEFENSES', label: 'btn_defensivo' },
  { id: 'DECORATION', label: 'btn_decoraciones' },
];

const ITEMS_PER_PAGE = 10;

const getLandExpansionCost = (nextLandLevel: number) => ({
  twigs: Math.round(260 * nextLandLevel),
  pebbles: Math.round(220 * nextLandLevel),
  putty: Math.round(140 * nextLandLevel),
  goo: Math.round(170 * nextLandLevel),
});

export const ShopModal = () => {
  const isDeveloperToolsAvailable = import.meta.env.VITE_DEVELOPER_MODE === 'true';
  const activeBuildTab = useGameStore((state) => state.activeBuildTab);
  const entities = useGameStore((state) => state.entities);
  const shiny = useGameStore((state) => state.shiny);
  const resources = useGameStore((state) => state.resources);
  const freeBuildMode = useGameStore((state) => state.freeBuildMode);
  const developerModeEnabled = useGameStore((state) => state.developerModeEnabled);
  const workersTotal = useGameStore((state) => state.workersTotal);
  const landLevel = useGameStore((state) => state.landLevel);
  const maxLandLevel = useGameStore((state) => state.maxLandLevel);
  const shopOpen = useGameStore((state) => state.shopOpen);
  const engine = useGameStore((state) => state.engine);
  const toggleFreeBuildMode = useGameStore((state) => state.toggleFreeBuildMode);
  const toggleDeveloperMode = useGameStore((state) => state.toggleDeveloperMode);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const buyWorker = useGameStore((state) => state.buyWorker);
  const startLandExpansionMode = useGameStore((state) => state.startLandExpansionMode);
  const setSelectedBuildingType = useGameStore((state) => state.setSelectedBuildingType);
  const setActiveBuildTab = useGameStore((state) => state.setActiveBuildTab);
  const toggleBattleMode = useGameStore((state) => state.toggleBattleMode);
  const startRaid = useGameStore((state) => state.startRaid);
  const setShopOpen = useGameStore((state) => state.setShopOpen);

  const [pageIndex, setPageIndex] = useState(0);
  const [selectedShopItemType, setSelectedShopItemType] = useState<BuildableType | null>(null);
  const previewSurfaceRef = useRef<HTMLDivElement>(null);

  const state = engine.getState();
  const townHall = state.buildings.find((building) => building.type === BUILDING_TYPES.TOWN_HALL);
  const townHallLevel = townHall?.level ?? 1;
  const unrestrictedMode = freeBuildMode || developerModeEnabled;

  const filteredCatalog = useMemo(
    () =>
      Object.values(ENHANCED_BUILDING_CATALOG)
        .filter(
          (definition) =>
            definition.category === activeBuildTab &&
            !definition.tags?.includes('obstacle') &&
            isBuildableType(definition.type) &&
            isShopVisibleBuilding(definition.type),
        )
        .map((definition) => definition as (typeof ENHANCED_BUILDING_CATALOG)[BuildableType]),
    [activeBuildTab, entities],
  );

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / ITEMS_PER_PAGE));
  const safePage = Math.min(pageIndex, totalPages - 1);
  const pageStart = safePage * ITEMS_PER_PAGE;
  const pagedCatalog = filteredCatalog.slice(pageStart, pageStart + ITEMS_PER_PAGE);

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
  const workerLimitReached = !unrestrictedMode && workersTotal >= MAX_WORKERS;
  const hasUnlimitedShiny = unrestrictedMode;
  const canAffordWorker = unrestrictedMode || shiny >= workerShinyCost;

  const canBuildItem = (buildableType: BuildableType): boolean => {
    const definition = ENHANCED_BUILDING_CATALOG[buildableType];
    const currentCount = getBuildingCount(state.buildings, buildableType);
    const maxAllowed = getBuildingCapForTownHallLevel(buildableType, townHallLevel);
    const requiredTownHallLevel = getBuildingRequiredTownHallLevel(buildableType);
    const hasEnoughTownHallLevel = unrestrictedMode || townHallLevel >= requiredTownHallLevel;
    const hasAvailableCap = unrestrictedMode || currentCount < maxAllowed;
    const canAfford =
      unrestrictedMode ||
      (resources.twigs.current >= definition.cost.twigs &&
        resources.pebbles.current >= definition.cost.pebbles &&
        resources.putty.current >= definition.cost.putty &&
        resources.goo.current >= definition.cost.goo);
    return hasEnoughTownHallLevel && hasAvailableCap && canAfford;
  };

  const handleSelectTab = (tab: BuildingCategory): void => {
    setActiveBuildTab(tab);
    setPageIndex(0);
    setSelectedShopItemType(null);
  };

  const handleSelectItem = (buildableType: BuildableType): void => {
    if (selectedShopItemType === buildableType && canBuildItem(buildableType)) {
      setSelectedBuildingType(buildableType);
      setShopOpen(false);
      return;
    }
    setSelectedShopItemType(buildableType);
  };

  const handleCloseShop = (): void => {
    setShopOpen(false);
    setSelectedShopItemType(null);
  };

  if (!shopOpen) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-30 flex items-start justify-center overflow-y-auto bg-black/55 p-4 md:p-8">
      <div className="bym-shop-frame relative flex h-[min(760px,90vh)] w-[min(980px,96vw)] flex-col">
        <button
          type="button"
          aria-label="Cerrar tienda"
          tabIndex={0}
          className="bym-shop-close"
          onClick={handleCloseShop}
        >
          <span aria-hidden className="text-lg font-bold leading-none">
            ×
          </span>
        </button>

        <div className="mb-4 flex shrink-0 justify-center gap-2 px-8 pt-2">
          {SHOP_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-label={`Filtrar por ${tab.label}`}
              tabIndex={0}
              onClick={() => handleSelectTab(tab.id)}
              className={`bym-shop-tab ${activeBuildTab === tab.id ? 'bym-shop-tab--active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div ref={previewSurfaceRef} className="relative mx-4 mb-3 flex min-h-0 flex-1 flex-col">
          <button
            type="button"
            aria-label="Pagina anterior"
            tabIndex={0}
            className="bym-shop-nav-arrow bym-shop-nav-arrow--prev"
            onClick={() => setPageIndex((currentPage) => Math.max(0, currentPage - 1))}
            disabled={safePage <= 0}
          >
            <span aria-hidden>‹</span>
          </button>

          <div className="bym-shop-catalog relative mx-12 h-full overflow-hidden p-3">
            <div className="grid h-full grid-cols-5 grid-rows-2 gap-2">
              {pagedCatalog.map((definition) => {
                const buildableType = definition.type as BuildableType;
                const currentCount = getBuildingCount(state.buildings, buildableType);
                const maxAllowed = getBuildingCapForTownHallLevel(buildableType, townHallLevel);
                const isDisabled = !canBuildItem(buildableType);
                return (
                  <ShopItemCard
                    key={definition.type}
                    technicalName={getShopTechnicalName(buildableType)}
                    currentCount={currentCount}
                    maxAllowed={maxAllowed}
                    isActive={selectedShopItemType === definition.type}
                    isDisabled={isDisabled}
                    onSelect={() => handleSelectItem(buildableType)}
                    previewSlot={
                      <ShopBuildingPreview type={buildableType} className="h-[88px] w-full bg-white" />
                    }
                  />
                );
              })}
            </div>
          </div>

          <button
            type="button"
            aria-label="Pagina siguiente"
            tabIndex={0}
            className="bym-shop-nav-arrow bym-shop-nav-arrow--next"
            onClick={() => setPageIndex((currentPage) => Math.min(totalPages - 1, currentPage + 1))}
            disabled={safePage >= totalPages - 1}
          >
            <span aria-hidden>›</span>
          </button>

          {selectedShopItemType ? (
            <>
              <ShopUpgradePreviewStrip type={selectedShopItemType} buildings={state.buildings} />
              {canBuildItem(selectedShopItemType) ? (
                <p className="-mt-1 mb-2 px-1 text-center font-mono text-[10px] font-semibold text-[#5c4a2d]">
                  Clic de nuevo en la tarjeta para colocar en el mapa
                </p>
              ) : null}
            </>
          ) : null}

          <ShopPreviewCanvas containerRef={previewSurfaceRef} />
        </div>

        <div className="mx-4 mb-4 flex shrink-0 flex-wrap items-center gap-2 border-t border-[#8b6914]/35 pt-3">
          <button
            type="button"
            aria-label="Comprar obrero"
            tabIndex={0}
            className="bym-button-cartoon bym-button-cartoon--gold px-3 py-1 text-[11px]"
            onClick={buyWorker}
            disabled={workerLimitReached || !canAffordWorker}
          >
            + OBRERO ({workersTotal}/{MAX_WORKERS})
            {workerLimitReached ? ' MAX' : hasUnlimitedShiny ? ' ∞' : ` ${workerShinyCost}⚡`}
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
          {!canAffordLandExpansion && landLevel < maxLandLevel ? (
            <span className="text-[11px] text-[#5c4a2d]">Terreno: recursos insuficientes</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
