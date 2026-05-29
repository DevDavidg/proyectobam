import { useMemo } from 'react';
import { CanvasTexture, MultiplyBlending } from 'three';
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
  const gradient = context.createRadialGradient(center, center, center * 0.12, center, center, center);
  gradient.addColorStop(0, 'rgba(13, 36, 3, 0.86)');
  gradient.addColorStop(0.58, 'rgba(13, 36, 3, 0.52)');
  gradient.addColorStop(0.84, 'rgba(13, 36, 3, 0.16)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, SHADOW_TEXTURE_RESOLUTION, SHADOW_TEXTURE_RESOLUTION);
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

let SHARED_SHADOW_TEXTURE: CanvasTexture | null = null;
const getSharedShadowTexture = (): CanvasTexture | null => {
  SHARED_SHADOW_TEXTURE ??= createShadowTexture();
  return SHARED_SHADOW_TEXTURE;
};

export const BuildingContactShadow = ({ sizeX, sizeY, status }: BuildingContactShadowProps) => {
  const texture = useMemo(() => getSharedShadowTexture(), []);
  if (status !== 'ACTIVE' || !texture) {
    return null;
  }
  const shadowScaleX = sizeX * CELL_SIZE * 1.62;
  const shadowScaleY = sizeY * CELL_SIZE * 1.38;
  const castOffsetX = Math.max(sizeX, sizeY) * CELL_SIZE * 0.12;
  const castOffsetZ = Math.max(sizeX, sizeY) * CELL_SIZE * 0.14;
  const contactScale = Math.max(sizeX, sizeY) * CELL_SIZE * 0.96;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[castOffsetX, 0.012, castOffsetZ]}>
        <planeGeometry args={[shadowScaleX, shadowScaleY]} />
        <meshBasicMaterial
          map={texture}
          color="#0d2403"
          transparent
          depthWrite={false}
          opacity={0.5}
          blending={MultiplyBlending}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.013, 0]}>
        <planeGeometry args={[contactScale, contactScale]} />
        <meshBasicMaterial
          map={texture}
          color="#050a02"
          transparent
          depthWrite={false}
          opacity={0.42}
          blending={MultiplyBlending}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>
    </group>
  );
};
