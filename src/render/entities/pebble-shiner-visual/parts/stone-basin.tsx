import { PALETTE } from '../palette';
import type { MaterialFactory, PebbleShinerDimensions } from '../types';

type StoneBasinProps = {
  dim: PebbleShinerDimensions;
  createMaterial: MaterialFactory;
};

const STONE_BRICK_ROWS = 3;

const cornerKeys = ['c-fl', 'c-fr', 'c-bl', 'c-br'] as const;

export const StoneBasin = ({ dim, createMaterial }: StoneBasinProps) => {
  const stoneSideLengthX = dim.halfX * 2 - dim.cornerWidth * 2;
  const stoneSideLengthZ = dim.halfZ * 2 - dim.cornerWidth * 2;
  const stoneBrickHeight = dim.stoneHeight / STONE_BRICK_ROWS;

  const cornerCenters = cornerKeys.map((id) => {
    const isLeft = id.endsWith('l');
    const isFront = id[2] === 'f';
    return {
      id,
      x: (isLeft ? -dim.halfX : dim.halfX) + (isLeft ? dim.cornerWidth / 2 : -dim.cornerWidth / 2),
      z: (isFront ? -dim.halfZ : dim.halfZ) + (isFront ? dim.cornerWidth / 2 : -dim.cornerWidth / 2),
    };
  });

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, dim.baseLift + 0.02, 0]}>
        <boxGeometry args={[dim.halfX * 2 + 0.05, 0.06, dim.halfZ * 2 + 0.05]} />
        {createMaterial(PALETTE.stoneWallDeep, 'stone')}
      </mesh>

      {cornerCenters.map((corner) => (
        <group key={corner.id} position={[corner.x, dim.baseLift + dim.cornerHeight / 2, corner.z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[dim.cornerWidth + dim.cornerExtra, dim.cornerHeight, dim.cornerWidth + dim.cornerExtra]} />
            {createMaterial(PALETTE.stoneCornerLight, 'stone')}
          </mesh>
          <mesh castShadow receiveShadow position={[0, dim.cornerHeight / 2 - 0.01, 0]}>
            <boxGeometry args={[dim.cornerWidth + dim.cornerExtra + 0.02, 0.04, dim.cornerWidth + dim.cornerExtra + 0.02]} />
            {createMaterial(PALETTE.stoneCornerMid, 'stone')}
          </mesh>
          <mesh receiveShadow position={[0, -dim.cornerHeight / 2 + 0.04, 0.01]}>
            <boxGeometry args={[dim.cornerWidth - 0.04, 0.02, dim.cornerWidth - 0.04]} />
            {createMaterial(PALETTE.stoneCornerShadow, 'stone')}
          </mesh>
        </group>
      ))}

      {Array.from({ length: STONE_BRICK_ROWS }).map((_, row) => {
        const yCenter = dim.baseLift + stoneBrickHeight * (row + 0.5);
        const offsetX = row % 2 === 0 ? 0 : stoneSideLengthX * 0.08;
        const isEven = row % 2 === 0;
        return (
          <group key={`row-x-${row}`}>
            <mesh
              castShadow
              receiveShadow
              position={[offsetX, yCenter, -dim.halfZ + dim.wallThickness / 2]}
            >
              <boxGeometry args={[stoneSideLengthX, stoneBrickHeight - 0.01, dim.wallThickness]} />
              {createMaterial(isEven ? PALETTE.stoneWall : PALETTE.stoneWallHighlight, 'stone')}
            </mesh>
            <mesh
              castShadow
              receiveShadow
              position={[-offsetX, yCenter, dim.halfZ - dim.wallThickness / 2]}
            >
              <boxGeometry args={[stoneSideLengthX, stoneBrickHeight - 0.01, dim.wallThickness]} />
              {createMaterial(isEven ? PALETTE.stoneWallHighlight : PALETTE.stoneWall, 'stone')}
            </mesh>
          </group>
        );
      })}

      {Array.from({ length: STONE_BRICK_ROWS }).map((_, row) => {
        const yCenter = dim.baseLift + stoneBrickHeight * (row + 0.5);
        const offsetZ = row % 2 === 0 ? 0 : stoneSideLengthZ * 0.08;
        const isEven = row % 2 === 0;
        return (
          <group key={`row-z-${row}`}>
            <mesh
              castShadow
              receiveShadow
              position={[-dim.halfX + dim.wallThickness / 2, yCenter, offsetZ]}
            >
              <boxGeometry args={[dim.wallThickness, stoneBrickHeight - 0.01, stoneSideLengthZ]} />
              {createMaterial(isEven ? PALETTE.stoneWallHighlight : PALETTE.stoneWall, 'stone')}
            </mesh>
            <mesh
              castShadow
              receiveShadow
              position={[dim.halfX - dim.wallThickness / 2, yCenter, -offsetZ]}
            >
              <boxGeometry args={[dim.wallThickness, stoneBrickHeight - 0.01, stoneSideLengthZ]} />
              {createMaterial(isEven ? PALETTE.stoneWall : PALETTE.stoneWallHighlight, 'stone')}
            </mesh>
          </group>
        );
      })}

      {Array.from({ length: STONE_BRICK_ROWS - 1 }).map((_, lineIdx) => {
        const yLine = dim.baseLift + stoneBrickHeight * (lineIdx + 1);
        return (
          <group key={`mortar-line-${lineIdx}`}>
            <mesh position={[0, yLine, -dim.halfZ + dim.wallThickness / 2 - 0.001]}>
              <boxGeometry args={[stoneSideLengthX + 0.02, 0.012, 0.005]} />
              {createMaterial(PALETTE.mortar, 'stone')}
            </mesh>
            <mesh position={[0, yLine, dim.halfZ - dim.wallThickness / 2 + 0.001]}>
              <boxGeometry args={[stoneSideLengthX + 0.02, 0.012, 0.005]} />
              {createMaterial(PALETTE.mortar, 'stone')}
            </mesh>
            <mesh position={[-dim.halfX + dim.wallThickness / 2 - 0.001, yLine, 0]}>
              <boxGeometry args={[0.005, 0.012, stoneSideLengthZ + 0.02]} />
              {createMaterial(PALETTE.mortar, 'stone')}
            </mesh>
            <mesh position={[dim.halfX - dim.wallThickness / 2 + 0.001, yLine, 0]}>
              <boxGeometry args={[0.005, 0.012, stoneSideLengthZ + 0.02]} />
              {createMaterial(PALETTE.mortar, 'stone')}
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
