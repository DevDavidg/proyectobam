import { PALETTE } from '../palette';
import type { MaterialFactory, TownHallDimensions } from '../types';

type SidePipesProps = {
  dim: TownHallDimensions;
  createMaterial: MaterialFactory;
};

type PipeSpec = {
  id: string;
  zCenter: number;
  length: number;
  radius: number;
};

export const SidePipes = ({ dim, createMaterial }: SidePipesProps) => {
  const pipes: PipeSpec[] = [
    {
      id: 'pipe-front',
      zCenter: dim.halfZ * 0.6,
      length: 0.5,
      radius: dim.pipeRadius,
    },
    {
      id: 'pipe-rear',
      zCenter: dim.halfZ * 0.05,
      length: 0.36,
      radius: dim.pipeRadius * 0.85,
    },
  ];

  return (
    <group>
      {pipes.map((pipe) => {
        const baseX = dim.halfX + 0.015;
        const tipX = baseX + pipe.length;

        return (
          <group key={pipe.id} position={[0, dim.pipeY, pipe.zCenter]}>
            <mesh
              castShadow
              receiveShadow
              position={[(baseX + tipX) / 2, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
             material={createMaterial(PALETTE.pipeMetal, 'iron')}>
              <cylinderGeometry args={[pipe.radius, pipe.radius, pipe.length, 14]} /></mesh>

            <mesh
              castShadow
              receiveShadow
              position={[baseX + 0.04, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
             material={createMaterial(PALETTE.pipeMetalShadow, 'iron')}>
              <cylinderGeometry args={[pipe.radius * 1.18, pipe.radius * 1.18, 0.06, 14]} /></mesh>

            <mesh
              castShadow
              receiveShadow
              position={[tipX, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
             material={createMaterial(PALETTE.pipeRim, 'iron')}>
              <cylinderGeometry args={[pipe.radius * 1.16, pipe.radius * 1.05, 0.05, 14]} /></mesh>

            <mesh position={[tipX + 0.001, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.pipeInside, 'iron')}>
              <cylinderGeometry args={[pipe.radius * 0.78, pipe.radius * 0.78, 0.012, 12]} /></mesh>

            <mesh
              position={[(baseX + tipX) / 2, pipe.radius * 0.55, 0]}
              rotation={[0, 0, Math.PI / 2]}
             material={createMaterial(PALETTE.pipeMetalLight, 'iron')}>
              <cylinderGeometry
                args={[pipe.radius * 0.18, pipe.radius * 0.18, pipe.length * 0.9, 8]}
              /></mesh>

            <mesh receiveShadow position={[(baseX + tipX) / 2, -pipe.radius - 0.005, 0]} material={createMaterial(PALETTE.cornerCapShadow, 'stone')}>
              <boxGeometry args={[pipe.length * 0.95, 0.018, pipe.radius * 1.6]} /></mesh>
          </group>
        );
      })}
    </group>
  );
};
