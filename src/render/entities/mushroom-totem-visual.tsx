import { type ReactElement } from 'react';

type MaterialToken = 'gold' | 'iron' | 'wood' | 'goo' | 'stone';

type MushroomTotemVisualProps = {
  level: number;
  footprintX: number;
  footprintZ: number;
  createMaterial: (fallbackColor: string, token: MaterialToken) => ReactElement;
};

const CAP_SPOT_POSITIONS: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, 1.58, 0.12, 0.2],
  [0.28, 1.5, -0.1, 0.14],
  [-0.24, 1.52, -0.14, 0.16],
  [0.12, 1.44, -0.28, 0.12],
];

const ROOT_POSITIONS: ReadonlyArray<readonly [number, number, number, number]> = [
  [-0.24, 0.21, -0.22, Math.PI / 9],
  [0.26, 0.2, -0.16, -Math.PI / 8],
  [-0.2, 0.2, 0.24, Math.PI / 7],
  [0.24, 0.2, 0.2, -Math.PI / 7],
];

export const MushroomTotemVisual = ({ level, footprintX, footprintZ, createMaterial }: MushroomTotemVisualProps) => {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.58, 0.72, 0.32, 8]} />
        {createMaterial('#5b3d2a', 'wood')}
      </mesh>
      {ROOT_POSITIONS.map((root, index) => (
        <mesh key={`totem-root-${index}`} receiveShadow position={[root[0], root[1], root[2]]} rotation={[root[3], 0, 0]}>
          <coneGeometry args={[0.09, 0.26, 5]} />
          {createMaterial('#6d4428', 'wood')}
        </mesh>
      ))}
      <mesh castShadow receiveShadow position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.24, 0.3, 1.12, 9]} />
        {createMaterial('#f5c985', 'stone')}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.42, 0]}>
        <sphereGeometry args={[0.58, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        {createMaterial('#ef4444', 'gold')}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.18, 0]}>
        <torusGeometry args={[0.33, 0.07, 7, 16]} />
        {createMaterial('#f97316', 'gold')}
      </mesh>
      {CAP_SPOT_POSITIONS.map((spot, index) => (
        <mesh key={`totem-cap-spot-${index}`} receiveShadow position={[spot[0], spot[1], spot[2]]}>
          <sphereGeometry args={[spot[3], 8, 7]} />
          {createMaterial('#fff7ed', 'stone')}
        </mesh>
      ))}
      <group position={[0, 1.02, 0]}>
        <mesh receiveShadow>
          <sphereGeometry args={[0.11 + Math.min(0.06, level * 0.012), 8, 8]} />
          {createMaterial('#60a5fa', 'goo')}
        </mesh>
      </group>
      <group position={[0, 1.14, 0]}>
        {[0, 1, 2, 3].map((sporeIndex) => (
          <mesh
            key={`totem-spore-${sporeIndex}`}
            receiveShadow
            position={[Math.cos((Math.PI / 2) * sporeIndex) * 0.34, 0.05, Math.sin((Math.PI / 2) * sporeIndex) * 0.34]}
          >
            <sphereGeometry args={[0.055, 7, 7]} />
            {createMaterial('#bfdbfe', 'goo')}
          </mesh>
        ))}
      </group>
      {level >= 3 ? (
        <mesh receiveShadow rotation={[0, 0, Math.PI / 2]} position={[0, 1.02, 0]}>
          <torusGeometry args={[0.22, 0.03, 6, 14]} />
          {createMaterial('#cbd5e1', 'iron')}
        </mesh>
      ) : null}
      {level >= 5 ? (
        <mesh castShadow receiveShadow position={[0, 1.86, 0]}>
          <coneGeometry args={[0.12, 0.26, 6]} />
          {createMaterial('#fde68a', 'gold')}
        </mesh>
      ) : null}
      <group position={[0, 0.86, 0]} scale={1 + Math.min(0.2, level * 0.02)}>
        {[0, 1, 2].map((leafIndex) => {
          const angle = (Math.PI * 2 * leafIndex) / 3;
          const leafRadius = 0.22 + (leafIndex % 2) * 0.03;
          const leafX = Math.cos(angle) * leafRadius;
          const leafZ = Math.sin(angle) * leafRadius;
          return (
            <group key={`totem-leaf-${leafIndex}`} position={[leafX, 0.14, leafZ]} rotation={[Math.PI * 0.08, -angle + Math.PI / 2, 0]}>
              <mesh receiveShadow>
                <coneGeometry args={[0.13, 0.45, 5]} />
                {createMaterial('#65a30d', 'goo')}
              </mesh>
              <mesh receiveShadow position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.22, 5]} />
                {createMaterial('#3f6212', 'wood')}
              </mesh>
            </group>
          );
        })}
        <mesh receiveShadow position={[0, 0.16, 0]}>
          <sphereGeometry args={[0.12, 8, 7]} />
          {createMaterial('#86efac', 'goo')}
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[Math.max(0.58, Math.min(footprintX, footprintZ) * 0.45), 18]} />
        {createMaterial('#3f2a1a', 'wood')}
      </mesh>
    </group>
  );
};
