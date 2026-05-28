import { useMemo } from 'react';
import { CanvasTexture } from 'three';
import { CELL_SIZE } from '../../utils/coordinates';

type BuildingContactShadowProps = {
  sizeX: number;
  sizeY: number;
  status?: string;
};

const SHADOW_TEXTURE_RESOLUTION = 128;

const createShadowTexture = (): CanvasTexture | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = SHADOW_TEXTURE_RESOLUTION;
  canvas.height = SHADOW_TEXTURE_RESOLUTION;
  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }
  const center = SHADOW_TEXTURE_RESOLUTION / 2;
  const gradient = context.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
  gradient.addColorStop(0.55, 'rgba(0, 0, 0, 0.35)');
  gradient.addColorStop(0.85, 'rgba(0, 0, 0, 0.08)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, SHADOW_TEXTURE_RESOLUTION, SHADOW_TEXTURE_RESOLUTION);
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

let SHARED_SHADOW_TEXTURE: CanvasTexture | null = null;
const getSharedShadowTexture = (): CanvasTexture | null => {
  if (!SHARED_SHADOW_TEXTURE) {
    SHARED_SHADOW_TEXTURE = createShadowTexture();
  }
  return SHARED_SHADOW_TEXTURE;
};

export const BuildingContactShadow = ({ sizeX, sizeY, status }: BuildingContactShadowProps) => {
  const texture = useMemo(() => getSharedShadowTexture(), []);
  if (status !== 'ACTIVE' || !texture) {
    return null;
  }
  const shadowScale = Math.max(sizeX, sizeY) * CELL_SIZE * 1.55;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
      <planeGeometry args={[shadowScale, shadowScale]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} opacity={0.72} polygonOffset polygonOffsetFactor={-1} />
    </mesh>
  );
};
