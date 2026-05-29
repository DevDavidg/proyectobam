import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { useGameStore } from "../../state/game-store";

export const PostEffects = () => {
  const shopOpen = useGameStore((state) => state.shopOpen);
  const { gl } = useThree();
  const canUseComposer = useMemo(() => {
    try {
      const context = gl.getContext();
      return Boolean(context?.getContextAttributes?.());
    } catch {
      return false;
    }
  }, [gl]);

  if (!canUseComposer || shopOpen) {
    return null;
  }

  return (
    <EffectComposer multisampling={4}>
      <SMAA />
      <Bloom
        intensity={0.2}
        luminanceThreshold={0.92}
        luminanceSmoothing={0.14}
        mipmapBlur={true}
      />
      <BrightnessContrast brightness={0} contrast={0.15} />
      <Vignette eskil={false} offset={0.25} darkness={0.28} />
    </EffectComposer>
  );
};
