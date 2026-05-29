import { PerspectiveCamera } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import type { PerspectiveCamera as ThreePerspectiveCamera } from 'three';
import { PerfCanvas } from '../../../app/perf-canvas';
import { ENHANCED_BUILDING_CATALOG } from '../../../core/constants/catalog';
import type { BuildingType } from '../../../core/types/building';
import { BuildingPreviewVisual } from '../../../render/entities/building-preview-visual';
import { CELL_SIZE } from '../../../utils/coordinates';

type PreviewableBuildingType = Exclude<BuildingType, 'PREVIEW'>;

type ShopBuildingPreviewProps = {
  type: PreviewableBuildingType;
  level?: number;
  className?: string;
  dimmed?: boolean;
};

export const ShopBuildingPreview = ({ type, level = 1, className, dimmed = false }: ShopBuildingPreviewProps) => {
  const safeLevel = Math.max(1, level);
  const definition = ENHANCED_BUILDING_CATALOG[type];
  const sizeX = definition?.size.x ?? 2;
  const sizeY = definition?.size.y ?? 2;
  const maxSpan = Math.max(sizeX, sizeY) * CELL_SIZE;
  const cameraDistance = Math.max(4.2, maxSpan * 1.65);
  const heroTargetY = 1.45;
  const cameraRef = useRef<ThreePerspectiveCamera | null>(null);

  useEffect(() => {
    if (!cameraRef.current) {
      return;
    }
    cameraRef.current.lookAt(0, heroTargetY, 0);
    cameraRef.current.updateProjectionMatrix();
  }, [cameraDistance, heroTargetY]);

  return (
    <div
      className={`${className ?? 'relative h-full w-full overflow-hidden bg-white'} ${dimmed ? 'bym-shop-preview--dimmed' : ''}`}
    >
      <PerfCanvas
        shadows={false}
        dpr={[1, 1.15]}
        frameloop="demand"
        gl={{
          antialias: false,
          powerPreference: 'low-power',
          stencil: false,
          depth: true,
          alpha: true,
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
        }}
        onCreated={({ invalidate }) => invalidate()}
      >
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          fov={32}
          near={0.1}
          far={200}
          position={[cameraDistance * 0.78, cameraDistance * 0.32, cameraDistance * 0.78]}
        />
        <color attach="background" args={['#ffffff']} />
        <ambientLight intensity={0.72} color="#ffffff" />
        <hemisphereLight intensity={0.28} color="#ffffff" groundColor="#e8e8e8" />
        <directionalLight position={[3.2, 4.5, 3.2]} intensity={1.15} color="#fff8ef" />
        <group position={[0, 0, 0]}>
          <BuildingPreviewVisual type={type} level={safeLevel} sizeX={sizeX} sizeY={sizeY} cellSize={CELL_SIZE} />
        </group>
      </PerfCanvas>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[8%] left-1/2 h-[10px] w-[58%] -translate-x-1/2 rounded-full bg-black/15 blur-[5px]"
      />
    </div>
  );
};
