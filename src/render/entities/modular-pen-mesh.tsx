import { useMemo } from 'react';
import { CELL_SIZE } from '../../utils/coordinates';

type ModularPenMeshProps = {
  level: number;
  sizeXCells: number;
  sizeYCells: number;
};

type FenceSegment = {
  x: number;
  z: number;
  width: number;
  depth: number;
  y: number;
};

type FencePost = {
  x: number;
  z: number;
};

const toFixedKey = (value: number): string => value.toFixed(3);

export const ModularPenMesh = ({ level, sizeXCells, sizeYCells }: ModularPenMeshProps) => {
  const width = sizeXCells * CELL_SIZE;
  const depth = sizeYCells * CELL_SIZE;
  const minX = -width / 2;
  const maxX = width / 2;
  const minZ = -depth / 2;
  const maxZ = depth / 2;
  const fenceInset = 0.08;
  const postHeight = 0.9 + Math.min(0.4, Math.max(0, level - 1) * 0.18);
  const postWidth = 0.12;
  const railThickness = 0.09;

  const posts = useMemo(() => {
    const postMap = new Map<string, FencePost>();
    for (let col = 0; col <= sizeXCells; col += 1) {
      const x = minX + col * CELL_SIZE;
      postMap.set(`${toFixedKey(x)}:${toFixedKey(minZ + fenceInset)}`, { x, z: minZ + fenceInset });
      postMap.set(`${toFixedKey(x)}:${toFixedKey(maxZ - fenceInset)}`, { x, z: maxZ - fenceInset });
    }
    for (let row = 0; row <= sizeYCells; row += 1) {
      const z = minZ + row * CELL_SIZE;
      postMap.set(`${toFixedKey(minX + fenceInset)}:${toFixedKey(z)}`, { x: minX + fenceInset, z });
      postMap.set(`${toFixedKey(maxX - fenceInset)}:${toFixedKey(z)}`, { x: maxX - fenceInset, z });
    }
    return [...postMap.values()];
  }, [maxX, maxZ, minX, minZ, sizeXCells, sizeYCells]);

  const rails = useMemo(() => {
    const segments: FenceSegment[] = [];
    const railRows = level >= 2 ? [0.34, 0.58] : [0.44];
    for (let col = 0; col < sizeXCells; col += 1) {
      const x = minX + (col + 0.5) * CELL_SIZE;
      for (const railY of railRows) {
        segments.push({ x, z: minZ + fenceInset, width: CELL_SIZE * 0.9, depth: railThickness, y: railY });
        segments.push({ x, z: maxZ - fenceInset, width: CELL_SIZE * 0.9, depth: railThickness, y: railY });
      }
    }
    for (let row = 0; row < sizeYCells; row += 1) {
      const z = minZ + (row + 0.5) * CELL_SIZE;
      for (const railY of railRows) {
        segments.push({ x: minX + fenceInset, z, width: railThickness, depth: CELL_SIZE * 0.9, y: railY });
        segments.push({ x: maxX - fenceInset, z, width: railThickness, depth: CELL_SIZE * 0.9, y: railY });
      }
    }
    return segments;
  }, [level, maxX, maxZ, minX, minZ, sizeXCells, sizeYCells]);

  const cornerSpikes = useMemo(() => {
    if (level < 3) {
      return [];
    }
    return [
      { x: minX + 0.18, z: minZ + 0.18 },
      { x: maxX - 0.18, z: minZ + 0.18 },
      { x: minX + 0.18, z: maxZ - 0.18 },
      { x: maxX - 0.18, z: maxZ - 0.18 },
    ];
  }, [level, maxX, maxZ, minX, minZ]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#4a5d3e" roughness={0.88} metalness={0.04} />
      </mesh>
      {posts.map((post) => (
        <mesh key={`post-${toFixedKey(post.x)}-${toFixedKey(post.z)}`} castShadow receiveShadow position={[post.x, postHeight / 2, post.z]}>
          <boxGeometry args={[postWidth, postHeight, postWidth]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.82} metalness={0.06} />
        </mesh>
      ))}
      {rails.map((rail, index) => (
        <mesh key={`rail-${index}-${toFixedKey(rail.x)}-${toFixedKey(rail.z)}-${toFixedKey(rail.y)}`} castShadow receiveShadow position={[rail.x, rail.y, rail.z]}>
          <boxGeometry args={[rail.width, railThickness, rail.depth]} />
          <meshStandardMaterial color={level >= 2 ? '#5c3a21' : '#9a5b2b'} roughness={0.8} metalness={0.05} />
        </mesh>
      ))}
      {cornerSpikes.map((corner, index) => (
        <group key={`corner-${index}-${toFixedKey(corner.x)}-${toFixedKey(corner.z)}`} position={[corner.x, 0, corner.z]}>
          <mesh castShadow receiveShadow position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.2, 8]} />
            <meshStandardMaterial color="#6b7280" roughness={0.74} metalness={0.28} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.58, 0]}>
            <coneGeometry args={[0.1, 0.65, 6]} />
            <meshStandardMaterial color="#e0dbcd" roughness={0.72} metalness={0.08} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
