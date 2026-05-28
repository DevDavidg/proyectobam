import { useGameStore } from '../../state/game-store';

export const ArmyDeck = () => {
  const armyInventory = useGameStore((state) => state.armyInventory);
  const selectedArmyMonster = useGameStore((state) => state.selectedArmyMonster);
  const setSelectedArmyMonster = useGameStore((state) => state.setSelectedArmyMonster);
  const toggleBattleMode = useGameStore((state) => state.toggleBattleMode);

  const cards: Array<{ type: 'Pokey' | 'Rambot'; label: string }> = [
    { type: 'Pokey', label: 'Pokey' },
    { type: 'Rambot', label: 'Rambot' },
  ];

  return (
    <div className="ui-panel absolute bottom-4 left-1/2 z-10 flex w-[680px] -translate-x-1/2 items-center gap-3 p-3 text-sm text-slate-100 backdrop-blur-md">
      <button
        type="button"
        className="rounded bg-rose-600 px-3 py-2 text-xs font-bold hover:bg-rose-500"
        onClick={toggleBattleMode}
      >
        Salir Batalla
      </button>
      <div className="flex flex-1 gap-2">
        {cards.map((card) => {
          const amount = armyInventory[card.type];
          const active = selectedArmyMonster === card.type;
          return (
            <button
              key={card.type}
              type="button"
              className={`flex-1 rounded border px-3 py-2 text-left ${
                active ? 'border-emerald-400 bg-emerald-600/20' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
              }`}
              disabled={amount <= 0}
              onClick={() => setSelectedArmyMonster(active ? null : card.type)}
            >
              <p className="font-semibold">{card.label}</p>
              <p className="text-xs text-slate-300">x{amount}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
