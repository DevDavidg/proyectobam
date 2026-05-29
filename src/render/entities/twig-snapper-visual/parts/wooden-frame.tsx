import { PALETTE } from '../palette';
import type { MaterialFactory, TwigSnapperDimensions } from '../types';

type WoodenFrameProps = {
  dim: TwigSnapperDimensions;
  postScale: number;
  beamScale: number;
  railScale: number;
  createMaterial: MaterialFactory;
};

export const WoodenFrame = ({
  dim,
  postScale,
  beamScale,
  railScale,
  createMaterial,
}: WoodenFrameProps) => {
  const sidePostHalfHeight = (dim.frameCornerHeight * Math.max(postScale, 0.0001)) / 2;
  const sidePostCenterY = dim.platformTop + sidePostHalfHeight;
  const beamLengthX = dim.halfX * 2 - dim.frameInset * 2 - dim.frameCornerSize;
  const beamLengthZ = dim.halfZ * 2 - dim.frameInset * 2 - dim.frameCornerSize;
  const railLengthZ = dim.halfZ * 2 - dim.frameInset * 2 - dim.frameCornerSize;
  const showBeams = beamScale > 0.01;
  const showRails = railScale > 0.01;

  return (
    <group>
      {dim.frameCorners.map((corner) => (
        <group key={corner.id} position={[corner.x, sidePostCenterY, corner.z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[dim.frameCornerSize, sidePostHalfHeight * 2, dim.frameCornerSize]} />
            {createMaterial(PALETTE.frameWoodMid, 'wood')}
          </mesh>
          <mesh castShadow receiveShadow position={[dim.frameCornerSize / 2 - 0.004, 0, 0]}>
            <boxGeometry args={[0.008, sidePostHalfHeight * 2 - 0.04, dim.frameCornerSize - 0.02]} />
            {createMaterial(PALETTE.frameWoodLight, 'wood')}
          </mesh>
          <mesh castShadow receiveShadow position={[-dim.frameCornerSize / 2 + 0.004, 0, 0]}>
            <boxGeometry args={[0.008, sidePostHalfHeight * 2 - 0.04, dim.frameCornerSize - 0.02]} />
            {createMaterial(PALETTE.frameWoodDark, 'wood')}
          </mesh>
          <mesh castShadow receiveShadow position={[0, sidePostHalfHeight - 0.012, 0]}>
            <boxGeometry args={[dim.frameCornerSize + 0.012, 0.022, dim.frameCornerSize + 0.012]} />
            {createMaterial(PALETTE.frameWoodDark, 'wood')}
          </mesh>
        </group>
      ))}

      {showBeams ? (
        <group scale={[1, beamScale, 1]}>
          <mesh
            castShadow
            receiveShadow
            position={[0, dim.frameTopBeamY, dim.halfZ - dim.frameInset - dim.frameCornerSize / 2]}
          >
            <boxGeometry args={[beamLengthX, dim.frameTopBeamThickness, dim.frameTopBeamThickness]} />
            {createMaterial(PALETTE.frameWoodLight, 'wood')}
          </mesh>
          <mesh
            castShadow
            receiveShadow
            position={[0, dim.frameTopBeamY, -dim.halfZ + dim.frameInset + dim.frameCornerSize / 2]}
          >
            <boxGeometry args={[beamLengthX, dim.frameTopBeamThickness, dim.frameTopBeamThickness]} />
            {createMaterial(PALETTE.frameWoodMid, 'wood')}
          </mesh>
          <mesh
            castShadow
            receiveShadow
            position={[dim.halfX - dim.frameInset - dim.frameCornerSize / 2, dim.frameTopBeamY + 0.012, 0]}
          >
            <boxGeometry args={[dim.frameTopBeamThickness * 0.7, dim.frameTopBeamThickness * 0.7, beamLengthZ]} />
            {createMaterial(PALETTE.frameWoodDark, 'wood')}
          </mesh>
        </group>
      ) : null}

      {showRails ? (
        <group>
          {dim.frameRails.map((rail) => {
            const railScaleY = railScale;
            return (
              <group key={rail.id}>
                <mesh
                  castShadow
                  receiveShadow
                  position={[-dim.halfX + dim.frameInset + dim.frameCornerSize / 2, rail.y, 0]}
                  scale={[1, railScaleY, 1]}
                >
                  <boxGeometry args={[rail.thickness, rail.thickness, railLengthZ]} />
                  {createMaterial(PALETTE.frameRail, 'wood')}
                </mesh>
                <mesh
                  castShadow
                  receiveShadow
                  position={[dim.halfX - dim.frameInset - dim.frameCornerSize / 2, rail.y, 0]}
                  scale={[1, railScaleY, 1]}
                >
                  <boxGeometry args={[rail.thickness, rail.thickness, railLengthZ]} />
                  {createMaterial(PALETTE.frameRail, 'wood')}
                </mesh>
                <mesh
                  castShadow
                  receiveShadow
                  position={[0, rail.y, -dim.halfZ + dim.frameInset + dim.frameCornerSize / 2]}
                  scale={[1, railScaleY, 1]}
                >
                  <boxGeometry args={[beamLengthX, rail.thickness, rail.thickness]} />
                  {createMaterial(PALETTE.frameRail, 'wood')}
                </mesh>
              </group>
            );
          })}
        </group>
      ) : null}
    </group>
  );
};
