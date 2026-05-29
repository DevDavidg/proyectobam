import { PALETTE } from '../palette';
import type { CrateWallPlank, MaterialFactory, TwigSnapperDimensions } from '../types';

type CrateWallsProps = {
  dim: TwigSnapperDimensions;
  scale: number;
  createMaterial: MaterialFactory;
};

const toneColor = (tone: CrateWallPlank['tone']): string => {
  if (tone === 'light') return PALETTE.crateWallLight;
  if (tone === 'dark') return PALETTE.crateWallDark;
  return PALETTE.crateWallMid;
};

type SinglePanelProps = {
  spanX: number;
  spanZ: number;
  axis: 'x' | 'z';
  positionX: number;
  positionZ: number;
  dim: TwigSnapperDimensions;
  createMaterial: MaterialFactory;
};

const WallPanel = ({ spanX, spanZ, axis, positionX, positionZ, dim, createMaterial }: SinglePanelProps) => {
  const thickness = dim.crateWallThickness;
  const isX = axis === 'x';
  const innerSpan = isX ? spanX : spanZ;
  const sizeX = isX ? innerSpan : thickness;
  const sizeZ = isX ? thickness : innerSpan;
  const nailOffsets = [-innerSpan * 0.36, innerSpan * 0.36];
  return (
    <group position={[positionX, 0, positionZ]}>
      {dim.crateWallPlanks.map((plank) => (
        <group key={plank.id} position={[0, plank.y, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[sizeX, plank.height, sizeZ]} />
            {createMaterial(toneColor(plank.tone), 'wood')}
          </mesh>
          <mesh
            castShadow={false}
            receiveShadow
            position={[isX ? 0 : thickness / 2 + 0.001, plank.height / 2 - 0.004, isX ? thickness / 2 + 0.001 : 0]}
          >
            <boxGeometry args={[isX ? innerSpan - 0.04 : 0.003, 0.006, isX ? 0.003 : innerSpan - 0.04]} />
            {createMaterial(PALETTE.crateWallShadow, 'wood')}
          </mesh>
          {nailOffsets.map((offset, idx) => (
            <mesh
              key={`nail-${plank.id}-${idx}`}
              castShadow={false}
              receiveShadow
              position={[isX ? offset : thickness / 2 + 0.002, 0, isX ? thickness / 2 + 0.002 : offset]}
              rotation={isX ? [Math.PI / 2, 0, 0] : [0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.008, 0.008, 0.006, 8]} />
              {createMaterial(PALETTE.crateWallNail, 'iron')}
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

export const CrateWalls = ({ dim, scale, createMaterial }: CrateWallsProps) => {
  if (scale < 0.01) return null;
  const applied = Math.max(0.0001, scale);
  const sideSpan = dim.halfZ * 2 - dim.frameInset * 2 - dim.crateWallThickness * 2 - dim.frameCornerSize * 0.4;
  const frontBackSpan = dim.halfX * 2 - dim.frameInset * 2 - dim.crateWallThickness * 2 - dim.frameCornerSize * 0.4;

  return (
    <group scale={[1, applied, 1]}>
      <WallPanel
        axis="x"
        spanX={frontBackSpan}
        spanZ={0}
        positionX={0}
        positionZ={dim.crateFrontZ}
        dim={dim}
        createMaterial={createMaterial}
      />
      <WallPanel
        axis="x"
        spanX={frontBackSpan}
        spanZ={0}
        positionX={0}
        positionZ={dim.crateBackZ}
        dim={dim}
        createMaterial={createMaterial}
      />
      <WallPanel
        axis="z"
        spanX={0}
        spanZ={sideSpan}
        positionX={dim.crateLeftX}
        positionZ={0}
        dim={dim}
        createMaterial={createMaterial}
      />
      <WallPanel
        axis="z"
        spanX={0}
        spanZ={sideSpan}
        positionX={dim.crateRightX}
        positionZ={0}
        dim={dim}
        createMaterial={createMaterial}
      />
    </group>
  );
};
