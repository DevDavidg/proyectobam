type ResourceState = {
  gold: number;
  goo: number;
};

type ResourceNode = {
  id: string;
  kind: 'gold' | 'goo';
  productionPerMs: number;
  lastHarvested: number;
};

export const runResourceTickSystem = (
  resources: ResourceState,
  now: number,
  nodes: ResourceNode[]
): { resources: ResourceState; nodes: ResourceNode[] } => {
  let nextGold = resources.gold;
  let nextGoo = resources.goo;

  const nextNodes = nodes.map((node) => {
    const deltaTime = Math.max(0, now - node.lastHarvested);
    const generated = deltaTime * node.productionPerMs;
    if (node.kind === 'gold') {
      nextGold += generated;
    } else {
      nextGoo += generated;
    }

    return {
      ...node,
      lastHarvested: now,
    };
  });

  return {
    resources: {
      gold: nextGold,
      goo: nextGoo,
    },
    nodes: nextNodes,
  };
};
