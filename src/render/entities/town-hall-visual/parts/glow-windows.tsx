import { Fragment } from 'react';
import { PALETTE } from '../palette';
import type { MaterialFactory, TownHallDimensions } from '../types';

type GlowWindowsProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
  weight: number;
};

type WindowSlot = {
  axis: 'x' | 'z';
  sign: 1 | -1;
  along: number;
  height: number;
  width: number;
  tall: number;
};

export const GlowWindows = ({ dim, createMaterial, weight }: GlowWindowsProps) => {
  if (weight <= 0.001) {
    return null;
  }

  const yMid = dim.baseLift + dim.bodyHeight * 0.6;

  const slots: WindowSlot[] = [
    { axis: 'x', sign: 1, along: -dim.halfZ * 0.05, height: yMid, width: 0.4, tall: 0.22 },
    { axis: 'z', sign: 1, along: dim.halfX * 0.42, height: yMid, width: 0.34, tall: 0.2 },
  ];

  const frameDepth = 0.07;
  const frameOuterPad = 0.05;
  const innerInset = 0.05;
  const glassDepth = 0.018;

  return (
    <group>
      {slots.map((slot, idx) => {
        const isFrontBack = slot.axis === 'z';
        const surfaceX = isFrontBack ? slot.along : slot.sign * dim.halfX;
        const surfaceZ = isFrontBack ? slot.sign * dim.halfZ : slot.along;
        const outwardX = isFrontBack ? 0 : slot.sign;
        const outwardZ = isFrontBack ? slot.sign : 0;

        const outerW = slot.width + frameOuterPad * 2;
        const outerH = slot.tall + frameOuterPad * 2;

        const frameSize: [number, number, number] = isFrontBack
          ? [outerW, outerH, frameDepth]
          : [frameDepth, outerH, outerW];
        const frameLitSize: [number, number, number] = isFrontBack
          ? [outerW, 0.014, frameDepth + 0.006]
          : [frameDepth + 0.006, 0.014, outerW];
        const frameShadowSize: [number, number, number] = isFrontBack
          ? [outerW, 0.012, frameDepth + 0.006]
          : [frameDepth + 0.006, 0.012, outerW];
        const innerSize: [number, number, number] = isFrontBack
          ? [slot.width - innerInset, slot.tall - innerInset, frameDepth + 0.002]
          : [frameDepth + 0.002, slot.tall - innerInset, slot.width - innerInset];
        const glassSize: [number, number, number] = isFrontBack
          ? [slot.width - innerInset - 0.02, slot.tall - innerInset - 0.02, glassDepth]
          : [glassDepth, slot.tall - innerInset - 0.02, slot.width - innerInset - 0.02];

        const frameOffset = frameDepth / 2 + 0.001;
        const glassOffset = frameDepth / 2 + 0.012;

        const horizontalSash = isFrontBack
          ? ([slot.width - innerInset - 0.02, 0.012, glassDepth + 0.001] as [number, number, number])
          : ([glassDepth + 0.001, 0.012, slot.width - innerInset - 0.02] as [number, number, number]);

        const cornerBolts: Array<[number, number]> = [
          [outerW / 2 - 0.04, outerH / 2 - 0.04],
          [-(outerW / 2 - 0.04), outerH / 2 - 0.04],
          [outerW / 2 - 0.04, -(outerH / 2 - 0.04)],
          [-(outerW / 2 - 0.04), -(outerH / 2 - 0.04)],
        ];

        return (
          <Fragment key={`glow-window-${idx}`}>
            <mesh
              castShadow
              receiveShadow
              position={[
                surfaceX + outwardX * frameOffset,
                slot.height,
                surfaceZ + outwardZ * frameOffset,
              ]}
            >
              <boxGeometry args={frameSize} />
              {createMaterial(PALETTE.windowFrame, 'iron')}
            </mesh>

            <mesh
              position={[
                surfaceX + outwardX * frameOffset,
                slot.height + outerH / 2 - 0.007,
                surfaceZ + outwardZ * frameOffset,
              ]}
            >
              <boxGeometry args={frameLitSize} />
              {createMaterial(PALETTE.windowFrameLight, 'iron')}
            </mesh>

            <mesh
              position={[
                surfaceX + outwardX * frameOffset,
                slot.height - outerH / 2 + 0.006,
                surfaceZ + outwardZ * frameOffset,
              ]}
            >
              <boxGeometry args={frameShadowSize} />
              {createMaterial(PALETTE.windowFrameShadow, 'iron')}
            </mesh>

            <mesh
              position={[
                surfaceX + outwardX * (frameOffset + 0.0005),
                slot.height,
                surfaceZ + outwardZ * (frameOffset + 0.0005),
              ]}
            >
              <boxGeometry args={innerSize} />
              {createMaterial(PALETTE.windowGlassDark, 'iron')}
            </mesh>

            <mesh
              position={[
                surfaceX + outwardX * glassOffset,
                slot.height,
                surfaceZ + outwardZ * glassOffset,
              ]}
            >
              <boxGeometry args={glassSize} />
              <meshBasicMaterial color={PALETTE.windowGlassGlow} toneMapped={false} />
            </mesh>

            <mesh
              position={[
                surfaceX + outwardX * (glassOffset + 0.001),
                slot.height,
                surfaceZ + outwardZ * (glassOffset + 0.001),
              ]}
            >
              <boxGeometry args={horizontalSash} />
              {createMaterial(PALETTE.windowFrameShadow, 'iron')}
            </mesh>

            {cornerBolts.map(([bx, by], boltIdx) => {
              const boltX = isFrontBack ? bx : 0;
              const boltZ = isFrontBack ? 0 : -bx;
              return (
                <mesh
                  key={`glow-window-bolt-${idx}-${boltIdx}`}
                  castShadow
                  position={[
                    surfaceX + outwardX * (frameOffset + 0.001) + boltX,
                    slot.height + by,
                    surfaceZ + outwardZ * (frameOffset + 0.001) + boltZ,
                  ]}
                  rotation={isFrontBack ? [Math.PI / 2, 0, 0] : [0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.013, 0.013, 0.014, 8]} />
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
