import { PerfCanvas } from '../../app/perf-canvas';
import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace } from 'three';
import { GameScene } from './game-scene';
import { PostEffects } from './post-effects';

export const GameCanvas = () => (
  <PerfCanvas
    gl={{
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      toneMapping: ACESFilmicToneMapping,
      toneMappingExposure: 1.12,
      outputColorSpace: SRGBColorSpace,
    }}
    dpr={[1, 1.25]}
    shadows={{ type: PCFSoftShadowMap, enabled: true }}
    flat={false}
    performance={{ min: 0.5 }}
  >
    <GameScene />
    <PostEffects />
  </PerfCanvas>
);
