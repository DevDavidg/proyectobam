type ShopCost = {
  twigs: number;
  pebbles: number;
  putty: number;
  goo: number;
};

type ShopResourceState = {
  current: number;
};

type ShopCostBlocksProps = {
  cost: ShopCost;
  resources: {
    twigs: ShopResourceState;
    pebbles: ShopResourceState;
    putty: ShopResourceState;
    goo: ShopResourceState;
  };
  freeBuildMode?: boolean;
};

type CostBlockSpec = {
  id: keyof ShopCost;
  label: string;
  icon: string;
  baseClass: string;
  missingClass: string;
};

const COST_BLOCKS: CostBlockSpec[] = [
  {
    id: 'twigs',
    label: 'Ramitas',
    icon: '🌿',
    baseClass: 'bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600',
    missingClass: 'bg-gradient-to-b from-stone-400 via-stone-500 to-stone-700',
  },
  {
    id: 'pebbles',
    label: 'Piedritas',
    icon: '🪨',
    baseClass: 'bg-gradient-to-b from-slate-200 via-slate-300 to-slate-500',
    missingClass: 'bg-gradient-to-b from-stone-400 via-stone-500 to-stone-700',
  },
  {
    id: 'putty',
    label: 'Putty',
    icon: '🧱',
    baseClass: 'bg-gradient-to-b from-rose-300 via-rose-400 to-rose-700',
    missingClass: 'bg-gradient-to-b from-stone-400 via-stone-500 to-stone-700',
  },
  {
    id: 'goo',
    label: 'Goo',
    icon: '🧪',
    baseClass: 'bg-gradient-to-b from-emerald-300 via-emerald-400 to-emerald-700',
    missingClass: 'bg-gradient-to-b from-stone-400 via-stone-500 to-stone-700',
  },
];

export const ShopCostBlocks = ({ cost, resources, freeBuildMode = false }: ShopCostBlocksProps) => {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {COST_BLOCKS.map((block) => {
        const value = cost[block.id];
        const available = resources[block.id].current;
        const hasEnough = freeBuildMode || available >= value;
        const blockClass = hasEnough ? block.baseClass : block.missingClass;
        return (
          <div
            key={block.id}
            className={`relative flex flex-col items-center justify-center rounded-md border-[3px] border-[#1e1b18] px-1.5 py-2 shadow-[inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-3px_0_rgba(0,0,0,0.45),0_3px_0_#1a0f06] ${blockClass}`}
            title={`${block.label}: ${value}`}
          >
            <span className="bym-cartoon-text-sm text-base leading-none" aria-hidden>
              {block.icon}
            </span>
            <span
              className={`bym-cartoon-text-sm mt-0.5 text-[12px] leading-none ${hasEnough ? 'text-white' : 'text-rose-100'}`}
            >
              {value}
            </span>
            {!hasEnough ? (
              <span
                aria-label="recurso insuficiente"
                className="bym-cartoon-text-sm absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-[#1e1b18] bg-rose-600 text-[10px] leading-none text-white"
              >
                !
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
