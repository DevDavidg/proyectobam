import { Canvas } from '@react-three/fiber';
import { BasicShadowMap } from 'three';
import { GameScene } from './game-scene';

export const GameCanvas = () => (
  <Canvas
    gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
    dpr={[1, 1.25]}
    shadows={{ type: BasicShadowMap, enabled: true }}
    performance={{ min: 0.5 }}
  >
    <GameScene />
  </Canvas>
);
