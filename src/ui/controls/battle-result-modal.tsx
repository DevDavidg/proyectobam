import { useGameStore } from '../../state/game-store';

export const BattleResultModal = () => {
  const battleResult = useGameStore((state) => state.battleResult);
  const closeBattleResult = useGameStore((state) => state.closeBattleResult);
  const toggleBattleMode = useGameStore((state) => state.toggleBattleMode);

  if (!battleResult) {
    return null;
  }

  const isVictory = battleResult === 'VICTORY';

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="ui-panel w-[360px] p-5 text-slate-100">
        <h3 className={`ui-title text-xl ${isVictory ? 'text-emerald-300' : 'text-rose-300'}`}>
          {isVictory ? 'Victoria' : 'Derrota'}
        </h3>
        <p className="mt-2 text-sm text-slate-300">
          {isVictory ? 'Oleada repelida. Tu base resistio el ataque.' : 'El Ayuntamiento cayo. Reconstruye y vuelve a intentarlo.'}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded bg-indigo-600 px-3 py-2 text-sm font-semibold hover:bg-indigo-500"
            onClick={() => {
              closeBattleResult();
              toggleBattleMode();
            }}
          >
            Cerrar Batalla
          </button>
          <button
            type="button"
            className="flex-1 rounded bg-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-600"
            onClick={closeBattleResult}
          >
            Seguir Viendo
          </button>
        </div>
      </div>
    </div>
  );
};
