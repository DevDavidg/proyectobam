import { Fragment } from 'react';
import { PALETTE } from '../palette';
import type { MaterialFactory, TownHallDimensions } from '../types';

type ArmorBandsProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
  weight: number;
};

const FACES: Array<{ axis: 'x' | 'z'; sign: 1 | -1 }> = [
  { axis: 'z', sign: 1 },
  { axis: 'z', sign: -1 },
  { axis: 'x', sign: 1 },
  { axis: 'x', sign: -1 },
];

export const ArmorBands = ({ dim, createMaterial, weight }: ArmorBandsProps) => {
  if (weight <= 0.001) {
    return null;
  }

  const bandHeight = dim.bodyHeight * 0.075;
  const bandY = dim.baseLift + dim.bodyHeight * 0.52;
  const bandThickness = 0.045;
  const protrusion = 0.022;

  const bandWidthX = dim.halfX * 2 - 0.05;
  const bandWidthZ = dim.halfZ * 2 - 0.05;

  const bolts = 6;

  return (
    <group scale={[1, weight, 1]} position={[0, bandY * (1 - weight) * 0.5, 0]}>
      {FACES.map(({ axis, sign }, idx) => {
        const isFrontBack = axis === 'z';
        const widthArg = isFrontBack ? bandWidthX : bandWidthZ;
        const xPos = isFrontBack ? 0 : sign * (dim.halfX + protrusion / 2);
        const zPos = isFrontBack ? sign * (dim.halfZ + protrusion / 2) : 0;
        const sizeArgs: [number, number, number] = isFrontBack
          ? [widthArg, bandHeight, bandThickness]
          : [bandThickness, bandHeight, widthArg];

        return (
          <Fragment key={`armor-band-${axis}-${sign}-${idx}`}>
            <mesh castShadow receiveShadow position={[xPos, bandY, zPos]}>
              <boxGeometry args={sizeArgs} />
              {createMaterial(PALETTE.reinforcementSteel, 'iron')}
            </mesh>
            <mesh
              position={[
                xPos + (isFrontBack ? 0 : sign * 0.001),
                bandY + bandHeight / 2 - 0.005,
                zPos + (isFrontBack ? sign * 0.001 : 0),
              ]}
            >
              <boxGeometry
                args={
                  isFrontBack
                    ? [widthArg + 0.004, 0.012, bandThickness + 0.005]
                    : [bandThickness + 0.005, 0.012, widthArg + 0.004]
                }
              />
              {createMaterial(PALETTE.reinforcementSteelLight, 'iron')}
            </mesh>
            <mesh
              position={[
                xPos + (isFrontBack ? 0 : sign * 0.001),
                bandY - bandHeight / 2 + 0.005,
                zPos + (isFrontBack ? sign * 0.001 : 0),
              ]}
            >
              <boxGeometry
                args={
                  isFrontBack
                    ? [widthArg + 0.004, 0.01, bandThickness + 0.005]
                    : [bandThickness + 0.005, 0.01, widthArg + 0.004]
                }
              />
              {createMaterial(PALETTE.reinforcementSteelDark, 'iron')}
            </mesh>

            {Array.from({ length: bolts }).map((_, boltIdx) => {
              const tNorm = (boltIdx + 0.5) / bolts;
              const along = (tNorm - 0.5) * widthArg;
              const boltX = isFrontBack ? along : xPos + sign * (protrusion / 2 + 0.002);
              const boltZ = isFrontBack ? zPos + sign * (protrusion / 2 + 0.002) : along;
              const rotation: [number, number, number] = isFrontBack ? [Math.PI / 2, 0, 0] : [0, 0, Math.PI / 2];
              return (
                <mesh
                  key={`armor-band-bolt-${axis}-${sign}-${boltIdx}`}
                  castShadow
                  position={[boltX, bandY, boltZ]}
                  rotation={rotation}
                >
                  <cylinderGeometry args={[0.022, 0.022, 0.024, 8]} />
                  {createMaterial(PALETTE.boltDark, 'iron')}
                </mesh>
              );
            })}
          </Fragment>
        );
      })}
    </group>
  );
};
