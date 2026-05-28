import { Bloom, BrightnessContrast, EffectComposer, Outline } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import { Mesh, Object3D } from 'three';

const collectOutlinedObjects = (root: Object3D): Object3D[] => {
  const result: Object3D[] = [];
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) {
      return;
    }
    if (object.userData.ignoreOutline) {
      return;
    }
    result.push(object);
  });
  return result;
};

export const PostEffects = () => {
  const { gl, scene } = useThree();
  const [selection, setSelection] = useState<Object3D[]>([]);
  const visibleEdgeColor = useMemo(() => 0x0f0f0f, []);
  const hiddenEdgeColor = useMemo(() => 0x020202, []);
  const ticker = useMemo(() => ({ elapsed: 0 }), []);
  const canUseComposer = useMemo(() => {
    try {
      const context = gl.getContext();
      return Boolean(context?.getContextAttributes?.());
    } catch {
      return false;
    }
  }, [gl]);

  if (!canUseComposer) {
    return null;
  }

  useFrame((_, delta) => {
    ticker.elapsed += delta;
    if (ticker.elapsed < 0.4) {
      return;
    }
    ticker.elapsed = 0;
    setSelection(collectOutlinedObjects(scene));
  });

  return (
    <EffectComposer multisampling={4}>
      <Bloom intensity={0.25} luminanceThreshold={0.55} luminanceSmoothing={0.25} mipmapBlur={true} />
      <BrightnessContrast brightness={-0.01} contrast={0.11} />
      <Outline
        selection={selection}
        edgeStrength={2.2}
        pulseSpeed={0}
        blur={false}
        visibleEdgeColor={visibleEdgeColor}
        hiddenEdgeColor={hiddenEdgeColor}
      />
    </EffectComposer>
  );
};
