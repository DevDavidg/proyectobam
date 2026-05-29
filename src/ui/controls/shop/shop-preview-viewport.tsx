import { PerspectiveCamera } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import type { PerspectiveCamera as ThreePerspectiveCamera } from 'three';
import { PerfCanvas } from '../../../app/perf-canvas';
import { ENHANCED_BUILDING_CATALOG } from '../../../core/constants/catalog';
import type { BuildingType } from '../../../core/types/building';
import { BuildingPreviewVisual } from '../../../render/entities/building-preview-visual';
import { CELL_SIZE } from '../../../utils/coordinates';

type PreviewableBuildingType = Exclude<BuildingType, 'PREVIEW'>;

type ShopPreviewSceneProps = {
  type: PreviewableBuildingType;
  level: number;
};

const ShopPreviewScene = ({ type, level }: ShopPreviewSceneProps) => {
  const safeLevel = Math.max(1, level);
  const definition = ENHANCED_BUILDING_CATALOG[type];
  const sizeX = definition?.size.x ?? 2;
  const sizeY = definition?.size.y ?? 2;
  const maxSpan = Math.max(sizeX, sizeY) * CELL_SIZE;
  const cameraDistance = Math.max(4.2, maxSpan * 1.65);
  const heroTargetY = 1.45;
  const cameraRef = useRef<ThreePerspectiveCamera | null>(null);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [invalidate, type, safeLevel]);

  useEffect(() => {
    if (!cameraRef.current) {
      return;
    }
    cameraRef.current.lookAt(0, heroTargetY, 0);
    cameraRef.current.updateProjectionMatrix();
    invalidate();
    const retryTimers = [120, 400, 900].map((delay) =>
      window.setTimeout(() => invalidate(), delay),
    );
    return () => {
      retryTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [cameraDistance, heroTargetY, invalidate, type, safeLevel]);

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={32}
        near={0.1}
        far={200}
        position={[cameraDistance * 0.78, cameraDistance * 0.32, cameraDistance * 0.78]}
      />
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={0.85} color="#ffffff" />
      <hemisphereLight intensity={0.35} color="#ffffff" groundColor="#f0f0f0" />
      <directionalLight position={[3.2, 4.5, 3.2]} intensity={1.25} color="#fff8ef" />
      <directionalLight position={[-2.5, 2.8, -2.2]} intensity={0.45} color="#e8f0ff" />
      <group position={[0, 0, 0]}>
        <Suspense fallback={null}>
          <BuildingPreviewVisual
            type={type}
            level={safeLevel}
            sizeX={sizeX}
            sizeY={sizeY}
            cellSize={CELL_SIZE}
          />
        </Suspense>
      </group>
    </>
  );
};

type ShopPreviewViewportProps = {
  type: PreviewableBuildingType;
  level?: number;
  className?: string;
  dimmed?: boolean;
};

export const ShopPreviewViewport = ({
  type,
  level = 1,
  className,
  dimmed = false,
}: ShopPreviewViewportProps) => {
  const safeLevel = Math.max(1, level);

  return (
    <div
      className={`relative overflow-hidden ${className ?? 'h-full w-full bg-white'} ${
        dimmed ? 'bym-shop-preview--dimmed' : ''
      }`}
    >
      <PerfCanvas
        className="absolute inset-0 h-full w-full"
        shadows={false}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'low-power',
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false,
        }}
      >
        <ShopPreviewScene type={type} level={safeLevel} />
      </PerfCanvas>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[8%] left-1/2 z-[1] h-[10px] w-[58%] -translate-x-1/2 rounded-full bg-black/12 blur-[5px]"
      />
    </div>
  );
};
