import type { Building } from '../../../core/types/building';
import {
  getBuildingMaxUpgradeLevel,
  getHighestTerrainLevel,
  getLockedUpgradeLevels,
  hasPlacedBuildingOfType,
} from './building-upgrade-levels';
import { ShopBuildingPreview } from './shop-building-preview';
import { ShopItemCard } from './shop-item-card';
import { getShopTechnicalName } from './shop-technical-names';

type BuildableType = Parameters<typeof getShopTechnicalName>[0];

type ShopUpgradePreviewStripProps = {
  type: BuildableType;
  buildings: Building[];
};

export const ShopUpgradePreviewStrip = ({ type, buildings }: ShopUpgradePreviewStripProps) => {
  const maxLevel = getBuildingMaxUpgradeLevel(type);
  if (!maxLevel || maxLevel <= 1) {
    return null;
  }

  const terrainLevel = getHighestTerrainLevel(buildings, type);
  const hasOnTerrain = hasPlacedBuildingOfType(buildings, type);
  const lockedLevels = getLockedUpgradeLevels(terrainLevel, maxLevel);
  const technicalName = getShopTechnicalName(type);

  return (
    <div className="mx-4 mb-3 shrink-0">
      <p className="mb-2 px-1 font-mono text-[10px] font-bold uppercase tracking-wide text-[#5c4a2d]">
        Evoluciones · coloca y mejora en el mapa
      </p>
      <div className="bym-shop-upgrade-strip overflow-x-auto p-2">
        <div className="flex min-w-min gap-2">
          <div className="w-[108px] shrink-0">
            <ShopItemCard
              technicalName={technicalName}
              footerLabel={hasOnTerrain ? `Lv. ${terrainLevel} · MAPA` : `Lv. ${terrainLevel} · NUEVO`}
              isTerrainCurrent
              isActive
              compact
              previewSlot={
                <ShopBuildingPreview
                  type={type}
                  level={terrainLevel}
                  className="h-[64px] w-full bg-white"
                />
              }
            />
          </div>

          {lockedLevels.map((level) => (
            <div key={level} className="w-[108px] shrink-0">
              <ShopItemCard
                technicalName={technicalName}
                footerLabel={`Lv. ${level} · LOCK`}
                isLocked
                compact
                previewSlot={
                  <ShopBuildingPreview
                    type={type}
                    level={level}
                    dimmed
                    className="h-[64px] w-full bg-white"
                  />
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
