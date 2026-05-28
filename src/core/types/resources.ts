export type ResourceType = 'twigs' | 'pebbles' | 'putty' | 'goo';

export type ResourceData = {
  current: number;
  max: number;
};

export type GameResources = {
  twigs: ResourceData;
  pebbles: ResourceData;
  putty: ResourceData;
  goo: ResourceData;
};
