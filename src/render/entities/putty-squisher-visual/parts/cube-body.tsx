import { PALETTE } from '../palette';
import { GroundDecal } from '../../shared/ground-decal';
import type { BoltCorner, MaterialFactory, PuttySquisherDimensions } from '../types';

type CubeBodyProps = {
  dim: PuttySquisherDimensions;
  bolts: BoltCorner[];
  showRecessedTop: boolean;
  createMaterial: MaterialFactory;
};

type VerticalCorner = { id: string; x: number; z: number };
type HorizontalEdge = { id: string; axis: 'x' | 'z'; x: number; z: number };
type FaceRivet = { id: string; x: number; y: number; z: number; rotY: number };

export const CubeBody = ({ dim, bolts, showRecessedTop, createMaterial }: CubeBodyProps) => {
  const {
    cubeSize,
    cubeBaseY,
    cubeCenterY,
    cubeTopY,
    half,
    boltRadius,
    screwSocketSize,
    screwSocketDepth,
  } = dim;

  const postThickness = cubeSize * 0.055;
  const postLength = cubeSize * 0.96;
  const verticalCorners: VerticalCorner[] = [
    { id: 'fr', x: half, z: half },
    { id: 'fl', x: -half, z: half },
    { id: 'br', x: half, z: -half },
    { id: 'bl', x: -half, z: -half },
  ];

  const trimThickness = cubeSize * 0.045;
  const horizontalEdges: HorizontalEdge[] = [
    { id: 'tf', axis: 'x', x: 0, z: half },
    { id: 'tb', axis: 'x', x: 0, z: -half },
    { id: 'tr', axis: 'z', x: half, z: 0 },
    { id: 'tl', axis: 'z', x: -half, z: 0 },
  ];

  const rivetRadius = boltRadius * 0.32;
  const rivetCapRadius = rivetRadius * 0.55;
  const facePoke = 0.0035;
  const faceRivetPositions: FaceRivet[] = [
    { id: 'front-tl', x: -half * 0.62, y: cubeTopY - cubeSize * 0.16, z: half + facePoke, rotY: 0 },
    { id: 'front-tr', x: half * 0.62, y: cubeTopY - cubeSize * 0.16, z: half + facePoke, rotY: 0 },
    { id: 'front-bl', x: -half * 0.62, y: cubeBaseY + cubeSize * 0.16, z: half + facePoke, rotY: 0 },
    { id: 'front-br', x: half * 0.62, y: cubeBaseY + cubeSize * 0.16, z: half + facePoke, rotY: 0 },
    { id: 'right-tf', x: half + facePoke, y: cubeTopY - cubeSize * 0.16, z: half * 0.62, rotY: Math.PI / 2 },
    { id: 'right-tb', x: half + facePoke, y: cubeTopY - cubeSize * 0.16, z: -half * 0.62, rotY: Math.PI / 2 },
    { id: 'right-bf', x: half + facePoke, y: cubeBaseY + cubeSize * 0.16, z: half * 0.62, rotY: Math.PI / 2 },
    { id: 'right-bb', x: half + facePoke, y: cubeBaseY + cubeSize * 0.16, z: -half * 0.62, rotY: Math.PI / 2 },
    { id: 'left-tf', x: -half - facePoke, y: cubeTopY - cubeSize * 0.16, z: half * 0.62, rotY: -Math.PI / 2 },
    { id: 'left-tb', x: -half - facePoke, y: cubeTopY - cubeSize * 0.16, z: -half * 0.62, rotY: -Math.PI / 2 },
    { id: 'left-bf', x: -half - facePoke, y: cubeBaseY + cubeSize * 0.16, z: half * 0.62, rotY: -Math.PI / 2 },
    { id: 'left-bb', x: -half - facePoke, y: cubeBaseY + cubeSize * 0.16, z: -half * 0.62, rotY: -Math.PI / 2 },
  ];
  return (
    <group>
      <GroundDecal
        radius={cubeSize * 0.95}
        color={PALETTE.groundDecal}
        createMaterial={createMaterial}
        token="goo"
        segments={24}
        position={[cubeSize * 0.45, 0.012, 0]}
      />

      <mesh castShadow receiveShadow position={[0, cubeBaseY - 0.012, 0]} material={createMaterial(PALETTE.bodyEdge, 'goo')}>
        <boxGeometry args={[cubeSize * 1.04, 0.04, cubeSize * 1.04]} /></mesh>

      <mesh castShadow receiveShadow position={[0, cubeCenterY, 0]} material={createMaterial(PALETTE.bodyMid, 'goo')}>
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} /></mesh>

      <mesh castShadow receiveShadow position={[0, cubeTopY - 0.005, 0]} material={createMaterial(PALETTE.bodyTop, 'goo')}>
        <boxGeometry args={[cubeSize * 0.995, 0.02, cubeSize * 0.995]} /></mesh>

      <mesh castShadow receiveShadow position={[half - 0.005, cubeCenterY, 0]} rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.bodyShadow, 'goo')}>
        <boxGeometry args={[cubeSize * 0.995, 0.02, cubeSize * 0.995]} /></mesh>

      <mesh castShadow receiveShadow position={[0, cubeCenterY, half - 0.005]} material={createMaterial(PALETTE.bodyMid, 'goo')}>
        <boxGeometry args={[cubeSize * 0.995, cubeSize * 0.995, 0.02]} /></mesh>

      {showRecessedTop ? (
        <group>
          <mesh receiveShadow position={[0, cubeTopY + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.bodyRecess, 'goo')}>
            <planeGeometry args={[screwSocketSize, screwSocketSize]} /></mesh>
          <mesh receiveShadow position={[0, cubeTopY - screwSocketDepth * 0.5, 0]} material={createMaterial(PALETTE.bodyRecessDark, 'goo')}>
            <boxGeometry args={[screwSocketSize * 0.94, screwSocketDepth, screwSocketSize * 0.94]} /></mesh>
          <mesh receiveShadow position={[0, cubeTopY - screwSocketDepth + 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.bodyRecess, 'goo')}>
            <planeGeometry args={[screwSocketSize * 0.86, screwSocketSize * 0.86]} /></mesh>
        </group>
      ) : null}

      {verticalCorners.map((corner) => (
        <group key={`corner-post-${corner.id}`} position={[corner.x, cubeCenterY, corner.z]}>
          <mesh castShadow receiveShadow material={createMaterial(PALETTE.bodyEdge, 'goo')}>
            <boxGeometry args={[postThickness, postLength, postThickness]} /></mesh>
          <mesh castShadow receiveShadow position={[0, postLength * 0.5 - postThickness * 0.5, 0]} material={createMaterial(PALETTE.bodyRecessDark, 'goo')}>
            <boxGeometry args={[postThickness * 1.05, postThickness * 0.6, postThickness * 1.05]} /></mesh>
          <mesh castShadow receiveShadow position={[0, -postLength * 0.5 + postThickness * 0.5, 0]} material={createMaterial(PALETTE.bodyRecessDark, 'goo')}>
            <boxGeometry args={[postThickness * 1.05, postThickness * 0.6, postThickness * 1.05]} /></mesh>
        </group>
      ))}

      {horizontalEdges.map((edge) => {
        const isAxisX = edge.axis === 'x';
        return (
          <group key={`top-trim-${edge.id}`} position={[edge.x, cubeTopY - trimThickness * 0.5, edge.z]}>
            <mesh castShadow receiveShadow material={createMaterial(PALETTE.bodyEdge, 'goo')}>
              <boxGeometry
                args={[
                  isAxisX ? cubeSize * 0.94 : trimThickness,
                  trimThickness,
                  isAxisX ? trimThickness : cubeSize * 0.94,
                ]}
              /></mesh>
          </group>
        );
      })}

      {faceRivetPositions.map((rivet) => (
        <group
          key={`face-rivet-${rivet.id}`}
          position={[rivet.x, rivet.y, rivet.z]}
          rotation={[0, rivet.rotY, 0]}
        >
          <mesh castShadow receiveShadow material={createMaterial(PALETTE.bolt, 'iron')}>
            <sphereGeometry args={[rivetRadius, 8, 6]} /></mesh>
          <mesh castShadow receiveShadow position={[0, 0, rivetRadius * 0.35]} material={createMaterial(PALETTE.boltShine, 'iron')}>
            <sphereGeometry args={[rivetCapRadius, 6, 6]} /></mesh>
        </group>
      ))}

      {bolts.map(({ id, pos }) => (
        <group key={`putty-bolt-${id}`} position={pos}>
          <mesh castShadow receiveShadow material={createMaterial(PALETTE.bolt, 'iron')}>
            <sphereGeometry args={[boltRadius, 10, 8]} /></mesh>
          <mesh castShadow receiveShadow position={[0, boltRadius * 0.3, 0]} material={createMaterial(PALETTE.boltShine, 'iron')}>
            <sphereGeometry args={[boltRadius * 0.45, 8, 6]} /></mesh>
          <mesh position={[0, boltRadius * 0.55, 0]} rotation={[Math.PI / 2, 0, 0]} material={createMaterial(PALETTE.boltDark, 'iron')}>
            <boxGeometry args={[boltRadius * 1.2, 0.005, boltRadius * 0.18]} /></mesh>
          <mesh position={[0, boltRadius * 0.55, 0]} rotation={[Math.PI / 2, Math.PI / 2, 0]} material={createMaterial(PALETTE.boltDark, 'iron')}>
            <boxGeometry args={[boltRadius * 1.2, 0.005, boltRadius * 0.18]} /></mesh>
        </group>
      ))}
    </group>
  );
};
