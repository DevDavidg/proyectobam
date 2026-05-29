import { PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useReducer, useRef, useState } from 'react';
import type { PerspectiveCamera as ThreePerspectiveCamera } from 'three';
import { PerfCanvas } from '../../../app/perf-canvas';
import { ENHANCED_BUILDING_CATALOG } from '../../../core/constants/catalog';
import { BuildingPreviewVisual } from '../../../render/entities/building-preview-visual';
import { CELL_SIZE } from '../../../utils/coordinates';
import {
  completeShopThumbnailJob,
  peekShopThumbnailJob,
  setShopThumbnail,
  subscribeShopThumbnailQueue,
  type ShopThumbnailJob,
} from './shop-thumbnail-cache';

const THUMBNAIL_WIDTH = 256;
const THUMBNAIL_HEIGHT = 192;
const CAPTURE_FRAME_DELAY = 3;

const ThumbnailCaptureRig = ({
  job,
  onCaptured,
}: {
  job: ShopThumbnailJob;
  onCaptured: (dataUrl: string) => void;
}) => {
  const definition = ENHANCED_BUILDING_CATALOG[job.type];
  const sizeX = definition?.size.x ?? 2;
  const sizeY = definition?.size.y ?? 2;
  const maxSpan = Math.max(sizeX, sizeY) * CELL_SIZE;
  const cameraDistance = Math.max(4.2, maxSpan * 1.65);
  const heroTargetY = 1.45;
  const cameraRef = useRef<ThreePerspectiveCamera | null>(null);
  const frameCountRef = useRef(0);
  const capturedRef = useRef(false);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    frameCountRef.current = 0;
    capturedRef.current = false;
    invalidate();
  }, [job.type, job.level, invalidate]);

  useEffect(() => {
    if (!cameraRef.current) {
      return;
    }
    cameraRef.current.lookAt(0, heroTargetY, 0);
    cameraRef.current.updateProjectionMatrix();
    invalidate();
  }, [cameraDistance, heroTargetY, invalidate]);

  useFrame(() => {
    if (capturedRef.current) {
      return;
    }
    frameCountRef.current += 1;
    if (frameCountRef.current < CAPTURE_FRAME_DELAY) {
      return;
    }
    capturedRef.current = true;
    gl.render(scene, camera);
    try {
      onCaptured(gl.domElement.toDataURL('image/png'));
    } catch {
      onCaptured('');
    }
  });

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
      <ambientLight intensity={0.72} color="#ffffff" />
      <hemisphereLight intensity={0.28} color="#ffffff" groundColor="#e8e8e8" />
      <directionalLight position={[3.2, 4.5, 3.2]} intensity={1.15} color="#fff8ef" />
      <group>
        <BuildingPreviewVisual
          type={job.type}
          level={job.level}
          sizeX={sizeX}
          sizeY={sizeY}
          cellSize={CELL_SIZE}
        />
      </group>
    </>
  );
};

export const ShopThumbnailStudio = () => {
  const [queueVersion, bumpQueue] = useReducer((count) => count + 1, 0);
  const [activeJob, setActiveJob] = useState<ShopThumbnailJob | null>(null);

  useEffect(() => subscribeShopThumbnailQueue(() => bumpQueue()), []);

  useEffect(() => {
    if (activeJob) {
      return;
    }
    const nextJob = peekShopThumbnailJob();
    if (nextJob) {
      setActiveJob(nextJob);
    }
  }, [activeJob, queueVersion]);

  const handleCaptured = (dataUrl: string): void => {
    if (!activeJob) {
      return;
    }
    setShopThumbnail(activeJob.type, activeJob.level, dataUrl);
    completeShopThumbnailJob(activeJob.type, activeJob.level);
    setActiveJob(null);
  };

  if (!activeJob) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-[-9999px] top-0 overflow-hidden opacity-0"
      style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_HEIGHT }}
    >
      <PerfCanvas
        style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_HEIGHT }}
        shadows={false}
        dpr={1}
        frameloop="always"
        gl={{
          antialias: false,
          powerPreference: 'low-power',
          stencil: false,
          depth: true,
          alpha: false,
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: false,
        }}
      >
        <ThumbnailCaptureRig
          key={`${activeJob.type}-${activeJob.level}`}
          job={activeJob}
          onCaptured={handleCaptured}
        />
      </PerfCanvas>
    </div>
  );
};
