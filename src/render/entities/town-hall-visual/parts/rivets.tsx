import { Fragment } from 'react';
import { PALETTE } from '../palette';
import type { MaterialFactory, TownHallDimensions } from '../types';

type RivetsProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
};

const FACE_AXES = ['front', 'back', 'left', 'right'] as const;
type FaceAxis = (typeof FACE_AXES)[number];

const orientFace = (face: FaceAxis): { rotationY: number; positionFactor: [number, number] } => {
  if (face === 'front') return { rotationY: 0, positionFactor: [0, 1] };
  if (face === 'back') return { rotationY: Math.PI, positionFactor: [0, -1] };
  if (face === 'left') return { rotationY: -Math.PI / 2, positionFactor: [-1, 0] };
  return { rotationY: Math.PI / 2, positionFactor: [1, 0] };
};

const rivetRadius = 0.038;
const rivetDepth = 0.022;

export const Rivets = ({ dim, createMaterial }: RivetsProps) => {
  const topRowY = dim.bodyTop - dim.trimHeight / 2;
  const bottomRowY = dim.baseLift + dim.trimHeight / 2;

  return (
    <group>
      {FACE_AXES.map((face) => {
        const orientation = orientFace(face);
        const rivetXs = Array.from({ length: dim.panelCount }, (_, idx) => {
          return -dim.halfX + dim.panelWidth * (idx + 0.5);
        });

        return (
          <group
            key={`rivet-face-${face}`}
            position={[
              orientation.positionFactor[0] * (dim.halfX + 0.08),
              0,
              orientation.positionFactor[1] * (dim.halfZ + 0.08),
            ]}
            rotation={[0, orientation.rotationY, 0]}
          >
            {rivetXs.map((localX, idx) => (
              <Fragment key={`rivet-${face}-${idx}`}>
                <mesh castShadow position={[localX, topRowY, 0]} rotation={[Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.boltDark, 'iron')}>
                  <cylinderGeometry args={[rivetRadius, rivetRadius * 0.94, rivetDepth, 8]} /></mesh>
                <mesh position={[localX - rivetRadius * 0.32, topRowY + rivetRadius * 0.32, rivetDepth / 2 + 0.001]} material={createMaterial(PALETTE.boltShine, 'iron')}>
                  <sphereGeometry args={[rivetRadius * 0.32, 6, 6]} /></mesh>

                <mesh castShadow position={[localX, bottomRowY, 0]} rotation={[Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.boltDark, 'iron')}>
                  <cylinderGeometry args={[rivetRadius, rivetRadius * 0.94, rivetDepth, 8]} /></mesh>
                <mesh position={[localX - rivetRadius * 0.32, bottomRowY + rivetRadius * 0.32, rivetDepth / 2 + 0.001]} material={createMaterial(PALETTE.boltShine, 'iron')}>
                  <sphereGeometry args={[rivetRadius * 0.32, 6, 6]} /></mesh>
              </Fragment>
            ))}
          </group>
        );
      })}
    </group>
  );
};
