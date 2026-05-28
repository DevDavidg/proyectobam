import { PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { Group, PerspectiveCamera as ThreePerspectiveCamera } from 'three';
import { ENHANCED_BUILDING_CATALOG } from '../../core/constants/catalog';
import type { BuildingType } from '../../core/types/building';
import { BuildingPreviewVisual } from '../../render/entities/building-preview-visual';
import { CELL_SIZE } from '../../utils/coordinates';

type PreviewableBuildingType = Exclude<BuildingType, 'PREVIEW'>;

type BuildingPreviewProps = {
  type: PreviewableBuildingType;
  level: number;
  className?: string;
};

const HeroicCameraRig = ({
  cameraDistance,
  targetY,
}: {
  cameraDistance: number;
  targetY: number;
}) => {
  const cameraRef = useRef<ThreePerspectiveCamera | null>(null);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!cameraRef.current) {
      return;
    }
    cameraRef.current.lookAt(0, targetY, 0);
    cameraRef.current.updateProjectionMatrix();
    invalidate();
  }, [cameraDistance, targetY, invalidate]);

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={32}
      near={0.1}
      far={200}
      position={[cameraDistance * 0.78, cameraDistance * 0.32, cameraDistance * 0.78]}
    />
  );
};

const SpinningPreview = ({
  type,
  level,
  sizeX,
  sizeY,
}: {
  type: PreviewableBuildingType;
  level: number;
  sizeX: number;
  sizeY: number;
}) => {
  const groupRef = useRef<Group | null>(null);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [type, level, invalidate]);

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }
    groupRef.current.rotation.y += delta * 0.35;
    invalidate();
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <BuildingPreviewVisual type={type} level={level} sizeX={sizeX} sizeY={sizeY} cellSize={CELL_SIZE} />
    </group>
  );
};

export const BuildingPreview = ({ type, level, className }: BuildingPreviewProps) => {
  const definition = ENHANCED_BUILDING_CATALOG[type];
  const safeLevel = Math.max(1, level);
  const sizeX = definition?.size.x ?? 2;
  const sizeY = definition?.size.y ?? 2;
  const maxSpan = Math.max(sizeX, sizeY) * CELL_SIZE;
  const cameraDistance = Math.max(4.2, maxSpan * 1.7);
  const heroTargetY = 1.55;
  const groundRadius = Math.max(sizeX, sizeY) * CELL_SIZE * 0.95;

  return (
    <div
      className={
        className ??
        'h-[300px] w-[300px] overflow-hidden rounded-xl border border-amber-900/35 bg-gradient-to-b from-amber-950/40 via-stone-900/30 to-slate-950/55'
      }
    >
      <Canvas
        shadows={false}
        dpr={[1, 1.25]}
        frameloop='demand'
        gl={{
          antialias: false,
          powerPreference: 'low-power',
          stencil: false,
          depth: true,
          alpha: false,
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
        }}
      >
        <HeroicCameraRig cameraDistance={cameraDistance} targetY={heroTargetY} />
        <color attach='background' args={['#2c1a10']} />
        <ambientLight intensity={0.45} color='#fff1d6' />
        <hemisphereLight intensity={0.35} color='#ffd9a0' groundColor='#1c1009' />
        <directionalLight
          position={[3.6, 4.2, 3.4]}
          intensity={1.6}
          color='#fff4e0'
        />
        <pointLight
          position={[-3.2, 2.4, -3.6]}
          intensity={2.4}
          distance={14}
          decay={1.8}
          color='#88b4ff'
        />
        <pointLight
          position={[2.2, 0.4, 1.8]}
          intensity={0.55}
          distance={8}
          decay={2}
          color='#ffd9a0'
        />
        <SpinningPreview type={type} level={safeLevel} sizeX={sizeX} sizeY={sizeY} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]} receiveShadow={false}>
          <circleGeometry args={[groundRadius, 28]} />
          <meshStandardMaterial color='#2a190f' roughness={0.95} metalness={0.05} />
        </mesh>
      </Canvas>
    </div>
  );
};
