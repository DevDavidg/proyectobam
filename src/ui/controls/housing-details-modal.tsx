import { useEffect, useState } from 'react';
import { MONSTER_CATALOG, getMonsterHousingSpace, type MonsterType } from '../../core/constants/monster-catalog';
import { BUILDING_TYPES } from '../../core/types/building';
import { useGameStore } from '../../state/game-store';

const PEN_CAPACITY = 20;

export const HousingDetailsModal = () => {
  const housingDetailsPenId = useGameStore((state) => state.housingDetailsPenId);
  const closeHousingDetailsModal = useGameStore((state) => state.closeHousingDetailsModal);
  const openBuildingContextMenu = useGameStore((state) => state.openBuildingContextMenu);
  const upgradeSelectedBuilding = useGameStore((state) => state.upgradeSelectedBuilding);
  const startMovingBuilding = useGameStore((state) => state.startMovingBuilding);
  const setPenHousingSettings = useGameStore((state) => state.setPenHousingSettings);
  const penHousingSettings = useGameStore((state) => state.penHousingSettings);
  const penResidents = useGameStore((state) => state.penResidents);
  const engine = useGameStore((state) => state.engine);
  const maxArmySpace = useGameStore((state) => state.maxArmySpace);
  const armyInventory = useGameStore((state) => state.armyInventory);
  const monsterLevels = useGameStore((state) => state.monsterLevels);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [housingName, setHousingName] = useState('');
  const [housingPriority, setHousingPriority] = useState<'ANY' | MonsterType>('ANY');
  const savedHousingSettings = housingDetailsPenId ? penHousingSettings[housingDetailsPenId] : null;

  useEffect(() => {
    if (!housingDetailsPenId) {
      setShowAdvanced(false);
      setHousingName('');
      setHousingPriority('ANY');
      return;
    }
    setHousingName(savedHousingSettings?.name ?? '');
    setHousingPriority(savedHousingSettings?.priority ?? 'ANY');
  }, [housingDetailsPenId, savedHousingSettings?.name, savedHousingSettings?.priority]);

  if (!housingDetailsPenId) {
    return null;
  }

  const state = engine.getState();
  const pen = state.buildings.find((building) => building.id === housingDetailsPenId);
  if (!pen || pen.type !== BUILDING_TYPES.ARMY_MONSTER_PEN) {
    return null;
  }

  const residentsInPen = penResidents.filter((resident) => resident.penId === housingDetailsPenId);
  const housedInPen = residentsInPen.filter((resident) => resident.lifecycleState === 'HOUSED');
  const housedSpace = housedInPen.reduce((total, resident) => {
    const level = monsterLevels[resident.monsterType] || 1;
    return total + getMonsterHousingSpace(resident.monsterType, level);
  }, 0);
  const assignedSpace = residentsInPen.reduce((total, resident) => {
    const level = monsterLevels[resident.monsterType] || 1;
    return total + getMonsterHousingSpace(resident.monsterType, level);
  }, 0);
  const movingToPenCount = residentsInPen.filter((resident) => resident.lifecycleState !== 'HOUSED').length;
  const deckSpace = (Object.keys(armyInventory) as MonsterType[]).reduce(
    (total, monsterType) => {
      const level = monsterLevels[monsterType] || 1;
      return total + (armyInventory[monsterType] ?? 0) * getMonsterHousingSpace(monsterType, level);
    },
    0
  );
  const penResidentCountByType = housedInPen.reduce<Record<MonsterType, number>>(
    (acc, resident) => ({
      ...acc,
      [resident.monsterType]: (acc[resident.monsterType] ?? 0) + 1,
    }),
    { Pokey: 0, Rambot: 0 }
  );
  const monsterTypes = Object.keys(MONSTER_CATALOG) as MonsterType[];
  const canUpgrade = pen.status === 'ACTIVE';
  const displayHousingName = housingName.trim() || `Vivienda ${pen.id}`;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/55">
      <div className="w-[900px] max-w-[94vw] rounded-2xl border-2 border-amber-900/70 bg-amber-100 p-5 text-amber-950 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-4 flex items-center justify-between border-b border-amber-900/20 pb-3">
          <div>
            <h3 className="text-xl font-extrabold tracking-wide">Vivienda de Monstruos</h3>
            <p className="text-xs text-amber-900/80">
              {displayHousingName} - Nv.{pen.level} | Dentro del corral: {housedSpace} / {PEN_CAPACITY}
            </p>
            <p className="text-xs text-amber-950/70">
              Asignado a esta vivienda: {assignedSpace} / {PEN_CAPACITY} {movingToPenCount > 0 ? `| En camino: ${movingToPenCount}` : ''}
            </p>
            <p className="text-xs text-amber-950/70">
              Total ejercito en base: {deckSpace} / {maxArmySpace}
            </p>
          </div>
          <button
            type="button"
            className="rounded bg-amber-900 px-3 py-1 text-xs font-semibold text-amber-50 hover:bg-amber-800"
            onClick={closeHousingDetailsModal}
          >
            Cerrar
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            className={`rounded px-3 py-2 text-xs font-bold ${
              canUpgrade ? 'bg-emerald-700 text-emerald-50 hover:bg-emerald-600' : 'cursor-not-allowed bg-amber-900/30 text-amber-950/40'
            }`}
            disabled={!canUpgrade}
            onClick={() => {
              openBuildingContextMenu(housingDetailsPenId);
              upgradeSelectedBuilding();
            }}
          >
            Mejorar
          </button>
          <button
            type="button"
            className="rounded bg-amber-900/15 px-3 py-2 text-xs font-bold text-amber-900/70 hover:bg-amber-900/25"
            onClick={() => {
              startMovingBuilding(housingDetailsPenId);
              closeHousingDetailsModal();
            }}
          >
            Mover
          </button>
          <button
            type="button"
            className="rounded bg-amber-900/15 px-3 py-2 text-xs font-bold text-amber-900/70 hover:bg-amber-900/25"
            onClick={() => {
              setShowAdvanced((current) => !current);
            }}
          >
            Mas...
          </button>
        </div>

        {showAdvanced ? (
          <div className="mb-4 rounded border border-amber-900/20 bg-amber-50/80 p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-950/90">Configuracion de vivienda</p>
            <div className="grid grid-cols-[1fr_220px_120px] items-end gap-2">
              <label className="flex flex-col gap-1 text-xs">
                <span className="font-semibold text-amber-900/80">Nombre</span>
                <input
                  value={housingName}
                  onChange={(event) => setHousingName(event.target.value)}
                  className="rounded border border-amber-900/30 bg-amber-100 px-2 py-1 text-amber-950 outline-none focus:border-amber-700"
                  placeholder="Nombre de vivienda"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span className="font-semibold text-amber-900/80">Prioridad de alojamiento</span>
                <select
                  value={housingPriority}
                  onChange={(event) => setHousingPriority(event.target.value as 'ANY' | MonsterType)}
                  className="rounded border border-amber-900/30 bg-amber-100 px-2 py-1 text-amber-950 outline-none focus:border-amber-700"
                >
                  <option value="ANY">Cualquiera</option>
                  {monsterTypes.map((monsterType) => (
                    <option key={monsterType} value={monsterType}>
                      {MONSTER_CATALOG[monsterType].name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="rounded bg-indigo-700 px-3 py-1.5 text-xs font-bold text-indigo-50 hover:bg-indigo-600"
                onClick={() =>
                  setPenHousingSettings(housingDetailsPenId, {
                    name: displayHousingName,
                    priority: housingPriority,
                  })
                }
              >
                Guardar
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          {monsterTypes.map((monsterType) => {
            const def = MONSTER_CATALOG[monsterType];
            const housedCount = penResidentCountByType[monsterType] ?? 0;
            const usedSpace = housedCount * getMonsterHousingSpace(monsterType, monsterLevels[monsterType] || 1);
            return (
              <div key={monsterType} className="rounded border border-amber-900/20 bg-amber-50/70 p-3">
                <p className="text-sm font-semibold">{def.name}</p>
                <p className="mt-1 text-xs text-amber-900/80">{housedCount} Alojado</p>
                <p className="text-xs text-amber-900/70">Espacio usado: {usedSpace}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
