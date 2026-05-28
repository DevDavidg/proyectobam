import { World } from 'miniplex';
import type { EcsEntity } from '../components/components';

export type EcsWorld = World<EcsEntity>;

export const createEcsWorld = (): EcsWorld => new World<EcsEntity>();
