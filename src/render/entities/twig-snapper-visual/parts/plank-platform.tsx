import { buildPlanks } from '../geometry';
import { tonePalettePlank } from '../helpers';
import { PALETTE } from '../palette';
import type { MaterialFactory, TwigSnapperDimensions } from '../types';

type PlankPlatformProps = {
  dim: TwigSnapperDimensions;
  createMaterial: MaterialFactory;
};

export const PlankPlatform = ({ dim, createMaterial }: PlankPlatformProps) => {
  const planks = buildPlanks(
    dim.halfX,
    dim.halfZ,
    dim.plankCount,
    dim.plankSpacing,
    dim.plankInsetZ,
    dim.platformExtensionX,
  );

  const supportInsetX = dim.halfX - dim.footSize / 2 - 0.04;
  const supportInsetZ = dim.halfZ - dim.footSize / 2 - 0.02;
  const supportPositions: Array<{ id: string; x: number; z: number }> = [
    { id: 'foot-fl', x: -supportInsetX, z: supportInsetZ },
    { id: 'foot-fr', x: supportInsetX, z: supportInsetZ },
    { id: 'foot-bl', x: -supportInsetX, z: -supportInsetZ },
    { id: 'foot-br', x: supportInsetX, z: -supportInsetZ },
  ];

  return (
    <group>
      {supportPositions.map((foot) => (
        <mesh
          key={foot.id}
          castShadow
          receiveShadow
          position={[foot.x, dim.baseLift + dim.footHeight / 2, foot.z]}
        >
          <boxGeometry args={[dim.footSize, dim.footHeight, dim.footSize]} />
          {createMaterial(PALETTE.plankShadow, 'wood')}
        </mesh>
      ))}

      <mesh
        castShadow
        receiveShadow
        position={[0, dim.baseLift + dim.platformHeight - 0.02, 0]}
      >
        <boxGeometry
          args={[
            dim.halfX * 2 + dim.platformExtensionX * 2 + 0.02,
            0.04,
            dim.halfZ * 2 + 0.02,
          ]}
        />
        {createMaterial(PALETTE.plankShadow, 'wood')}
      </mesh>

      {planks.map((plank) => (
        <group key={plank.id} position={[0, dim.platformTop - 0.04, plank.z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[plank.width, 0.08, plank.depth]} />
            {createMaterial(tonePalettePlank(plank.tone), 'wood')}
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.045, 0]}>
            <boxGeometry args={[plank.width - 0.04, 0.005, plank.depth - 0.02]} />
            {createMaterial(PALETTE.plankLight, 'wood')}
          </mesh>
          <mesh
            castShadow={false}
            receiveShadow
            position={[-plank.width / 2 + 0.06, 0.046, 0]}
          >
            <cylinderGeometry args={[0.012, 0.012, 0.014, 8]} />
            {createMaterial(PALETTE.plankNail, 'iron')}
          </mesh>
          <mesh
            castShadow={false}
            receiveShadow
            position={[plank.width / 2 - 0.06, 0.046, 0]}
          >
            <cylinderGeometry args={[0.012, 0.012, 0.014, 8]} />
            {createMaterial(PALETTE.plankNail, 'iron')}
          </mesh>
        </group>
      ))}

      <mesh
        castShadow
        receiveShadow
        position={[-dim.halfX - 0.12, dim.baseLift + 0.05, 0.42]}
        rotation={[0, 0.4, 0.05]}
      >
        <boxGeometry args={[0.18, 0.1, 0.16]} />
        {createMaterial(PALETTE.plankDark, 'wood')}
      </mesh>
    </group>
  );
};
