import { PALETTE } from '../palette';
import type { MaterialFactory, TownHallDimensions } from '../types';

type IronWallsProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
  chamferWeight?: number;
};

const FACE_AXES = ['front', 'back', 'left', 'right'] as const;
type FaceAxis = (typeof FACE_AXES)[number];

const grooveWidth = 0.018;
const grooveDepth = 0.014;
const trimProtrusion = 0.028;
const cornerProtrusion = 0.04;
const cornerThickness = 0.085;
const panelHighlightDepth = 0.008;
const panelHighlightWidth = 0.026;

const orientFace = (face: FaceAxis): { rotationY: number; positionFactor: [number, number] } => {
  if (face === 'front') return { rotationY: 0, positionFactor: [0, 1] };
  if (face === 'back') return { rotationY: Math.PI, positionFactor: [0, -1] };
  if (face === 'left') return { rotationY: -Math.PI / 2, positionFactor: [-1, 0] };
  return { rotationY: Math.PI / 2, positionFactor: [1, 0] };
};

export const IronWalls = ({ dim, createMaterial, chamferWeight = 0 }: IronWallsProps) => {
  const interiorBodyHeight = dim.bodyHeight - dim.trimHeight * 2;
  const interiorBodyCenterY = dim.baseLift + dim.trimHeight + interiorBodyHeight / 2;
  const useChamferedRoof = chamferWeight > 0.5;

  return (
    <group>
      <mesh
        castShadow
        receiveShadow
        position={[0, dim.baseLift + dim.bodyHeight / 2, 0]}
      >
        <boxGeometry args={[dim.halfX * 2, dim.bodyHeight, dim.halfZ * 2]} />
        {createMaterial(PALETTE.bodyShell, 'iron')}
      </mesh>

      <mesh
        castShadow
        receiveShadow
        position={[0, dim.baseLift + dim.trimHeight / 2, 0]}
      >
        <boxGeometry
          args={[
            dim.halfX * 2 + trimProtrusion * 2,
            dim.trimHeight,
            dim.halfZ * 2 + trimProtrusion * 2,
          ]}
        />
        {createMaterial(PALETTE.trimMid, 'iron')}
      </mesh>
      <mesh
        position={[0, dim.baseLift + dim.trimHeight - 0.005, 0]}
      >
        <boxGeometry
          args={[
            dim.halfX * 2 + trimProtrusion * 2 + 0.002,
            0.014,
            dim.halfZ * 2 + trimProtrusion * 2 + 0.002,
          ]}
        />
        {createMaterial(PALETTE.trimDark, 'iron')}
      </mesh>

      <mesh
        castShadow
        receiveShadow
        position={[0, dim.bodyTop - dim.trimHeight / 2, 0]}
      >
        <boxGeometry
          args={[
            dim.halfX * 2 + trimProtrusion * 2,
            dim.trimHeight,
            dim.halfZ * 2 + trimProtrusion * 2,
          ]}
        />
        {createMaterial(PALETTE.trimLight, 'iron')}
      </mesh>
      <mesh position={[0, dim.bodyTop - dim.trimHeight + 0.005, 0]}>
        <boxGeometry
          args={[
            dim.halfX * 2 + trimProtrusion * 2 + 0.002,
            0.014,
            dim.halfZ * 2 + trimProtrusion * 2 + 0.002,
          ]}
        />
        {createMaterial(PALETTE.trimDark, 'iron')}
      </mesh>

      {FACE_AXES.map((face) => {
        const orientation = orientFace(face);
        const grooveCount = dim.panelCount - 1;
        const grooves = Array.from({ length: grooveCount }, (_, idx) => {
          const localX = -dim.halfX + dim.panelWidth * (idx + 1);
          return localX;
        });

        const highlightStripes = Array.from({ length: dim.panelCount }, (_, idx) => {
          const localX = -dim.halfX + dim.panelWidth * (idx + 0.5);
          return localX;
        });

        return (
          <group
            key={`face-${face}`}
            position={[
              orientation.positionFactor[0] * (dim.halfX + 0.001),
              interiorBodyCenterY,
              orientation.positionFactor[1] * (dim.halfZ + 0.001),
            ]}
            rotation={[0, orientation.rotationY, 0]}
          >
            {grooves.map((localX, idx) => (
              <mesh key={`groove-${face}-${idx}`} position={[localX, 0, grooveDepth / 2]}>
                <boxGeometry args={[grooveWidth, interiorBodyHeight, grooveDepth]} />
                {createMaterial(PALETTE.panelGroove, 'iron')}
              </mesh>
            ))}

            {highlightStripes.map((localX, idx) => (
              <mesh
                key={`hi-${face}-${idx}`}
                position={[localX, 0, panelHighlightDepth / 2 + 0.0005]}
              >
                <boxGeometry
                  args={[
                    panelHighlightWidth,
                    interiorBodyHeight * 0.92,
                    panelHighlightDepth,
                  ]}
                />
                {createMaterial(PALETTE.panelHighlight, 'iron')}
              </mesh>
            ))}
          </group>
        );
      })}

      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], idx) => (
        <mesh
          key={`corner-${idx}`}
          castShadow
          receiveShadow
          position={[
            sx * (dim.halfX + cornerProtrusion * 0.5),
            interiorBodyCenterY,
            sz * (dim.halfZ + cornerProtrusion * 0.5),
          ]}
        >
          <boxGeometry args={[cornerThickness, interiorBodyHeight, cornerThickness]} />
          {createMaterial(PALETTE.cornerCap, 'iron')}
        </mesh>
      ))}

      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], idx) => (
        <mesh
          key={`corner-shadow-${idx}`}
          position={[
            sx * (dim.halfX + cornerProtrusion * 0.5 - 0.001),
            interiorBodyCenterY,
            sz * (dim.halfZ + cornerProtrusion * 0.5 - 0.001),
          ]}
        >
          <boxGeometry args={[cornerThickness * 0.4, interiorBodyHeight - 0.06, cornerThickness * 0.4]} />
          {createMaterial(PALETTE.cornerCapShadow, 'iron')}
        </mesh>
      ))}

      {useChamferedRoof ? (
        <ChamferedRoof dim={dim} createMaterial={createMaterial} />
      ) : (
        <FlatRoof dim={dim} createMaterial={createMaterial} />
      )}

      <mesh
        receiveShadow
        position={[0, dim.baseLift + 0.005, 0]}
      >
        <boxGeometry args={[dim.halfX * 2 + 0.18, 0.05, dim.halfZ * 2 + 0.18]} />
        {createMaterial(PALETTE.cornerCapShadow, 'stone')}
      </mesh>
    </group>
  );
};

type RoofPartProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
};

const FlatRoof = ({ dim, createMaterial }: RoofPartProps) => (
  <>
    <mesh
      castShadow
      receiveShadow
      position={[0, dim.bodyTop + dim.roofHeight / 2, 0]}
    >
      <boxGeometry
        args={[
          dim.halfX * 2 + trimProtrusion * 1.6,
          dim.roofHeight,
          dim.halfZ * 2 + trimProtrusion * 1.6,
        ]}
      />
      {createMaterial(PALETTE.roofTop, 'iron')}
    </mesh>
    <mesh
      receiveShadow
      position={[0, dim.bodyTop + dim.roofHeight + 0.001, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry
        args={[
          dim.halfX * 2 + trimProtrusion * 1.55,
          dim.halfZ * 2 + trimProtrusion * 1.55,
        ]}
      />
      {createMaterial(PALETTE.roofTopHighlight, 'iron')}
    </mesh>
  </>
);

const ChamferedRoof = ({ dim, createMaterial }: RoofPartProps) => {
  const sqrt2 = Math.SQRT2;
  const bottomHalf = dim.halfX + trimProtrusion;
  const topHalf = bottomHalf * 0.62;

  const bottomRadius = bottomHalf * sqrt2;
  const topRadius = topHalf * sqrt2;

  const chamferHeight = dim.roofHeight * 0.7;
  const capHeight = dim.roofHeight * 0.3;

  const chamferBottomY = dim.bodyTop;
  const chamferCenterY = chamferBottomY + chamferHeight / 2;
  const chamferTopY = chamferBottomY + chamferHeight;

  const capCenterY = chamferTopY + capHeight / 2;
  const capTopY = chamferTopY + capHeight;

  return (
    <>
      <mesh
        castShadow
        receiveShadow
        position={[0, chamferCenterY, 0]}
        rotation={[0, Math.PI / 4, 0]}
      >
        <cylinderGeometry args={[topRadius, bottomRadius, chamferHeight, 4, 1, false]} />
        {createMaterial(PALETTE.roofTop, 'iron')}
      </mesh>

      <mesh
        position={[0, chamferBottomY + 0.012, 0]}
        rotation={[0, Math.PI / 4, 0]}
      >
        <cylinderGeometry args={[bottomRadius * 0.998, bottomRadius * 0.998, 0.018, 4, 1, true]} />
        {createMaterial(PALETTE.trimDark, 'iron')}
      </mesh>

      <mesh
        position={[0, chamferTopY - 0.008, 0]}
        rotation={[0, Math.PI / 4, 0]}
      >
        <cylinderGeometry args={[topRadius * 1.01, topRadius * 1.01, 0.014, 4, 1, true]} />
        {createMaterial(PALETTE.trimLight, 'iron')}
      </mesh>

      <mesh castShadow receiveShadow position={[0, capCenterY, 0]}>
        <boxGeometry args={[topHalf * 2, capHeight, topHalf * 2]} />
        {createMaterial(PALETTE.roofTop, 'iron')}
      </mesh>

      <mesh
        receiveShadow
        position={[0, capTopY + 0.001, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[topHalf * 2 - 0.005, topHalf * 2 - 0.005]} />
        {createMaterial(PALETTE.roofTopHighlight, 'iron')}
      </mesh>

      {[
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].map(([sx, sz], idx) => (
        <mesh
          key={`chamfer-bolt-${idx}`}
          castShadow
          position={[sx * (topHalf - 0.04), capTopY - 0.005, sz * (topHalf - 0.04)]}
        >
          <cylinderGeometry args={[0.018, 0.018, 0.018, 8]} />
          {createMaterial(PALETTE.boltDark, 'iron')}
        </mesh>
      ))}
    </>
  );
};
