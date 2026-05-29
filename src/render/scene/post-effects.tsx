import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  SMAA,
  Vignette,
} from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import { OrthographicCamera } from 'three';
import { getDayNightCycleState } from '../../core/constants/day-night-cycle';
import { useGameStore } from '../../state/game-store';
import {
  computeAtmosphereStrength,
  type AtmosphereStrength,
} from './dynamic-atmosphere';

export const PostEffects = () => {
  const shopOpen = useGameStore((state) => state.shopOpen);
  const { gl, camera } = useThree();
  const [atmosphere, setAtmosphere] = useState<AtmosphereStrength>(() =>
    computeAtmosphereStrength((camera as OrthographicCamera).zoom ?? 26, 0),
  );

  const canUseComposer = useMemo(() => {
    try {
      const context = gl.getContext();
      return Boolean(context?.getContextAttributes?.());
    } catch {
      return false;
    }
  }, [gl]);

  useFrame(({ clock }) => {
    const ortho = camera as OrthographicCamera;
    const cycle = getDayNightCycleState(clock.getElapsedTime());
    const next = computeAtmosphereStrength(ortho.zoom, cycle.nightFactor);
    setAtmosphere((current) =>
      Math.abs(current.bloomIntensity - next.bloomIntensity) < 0.008 &&
      Math.abs(current.fogFactor - next.fogFactor) < 0.02
        ? current
        : next,
    );
  });

  if (!canUseComposer || shopOpen) {
    return null;
  }

  if (atmosphere.fogFactor < 0.03 && atmosphere.bloomIntensity < 0.12) {
    return (
      <EffectComposer multisampling={2}>
        <SMAA />
        <BrightnessContrast brightness={0} contrast={0.12} />
        <Vignette eskil={false} offset={0.22} darkness={0.18} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={2}>
      <SMAA />
      <Bloom
        intensity={atmosphere.bloomIntensity}
        luminanceThreshold={atmosphere.bloomThreshold}
        luminanceSmoothing={atmosphere.bloomSmoothing}
        mipmapBlur
      />
      <BrightnessContrast brightness={0} contrast={0.15} />
      <Vignette eskil={false} offset={0.25} darkness={0.28} />
    </EffectComposer>
  );
};
