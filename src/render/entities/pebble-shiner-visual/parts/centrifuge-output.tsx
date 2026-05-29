import type { Ref } from 'react';
import { useMemo } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { MaterialFactory, PebbleShinerDimensions } from '../types';

type CentrifugeOutputProps = {
  dim: PebbleShinerDimensions;
  createMaterial: MaterialFactory;
  hopperDustRef: Ref<Group>;
  endDustRef: Ref<Group>;
};

const buildDrops = (count: number, seedBase: number) => {
  let seed = seedBase;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: count }, (_, index) => ({
    id: `drop-${index}`,
    x: (rand() - 0.5) * 0.05,
    z: (rand() - 0.5) * 0.05,
    phaseOffset: rand(),
    size: 0.014 + rand() * 0.01,
  }));
};

type SandMoundProps = {
  x: number;
  z: number;
  scale: number;
  createMaterial: MaterialFactory;
};

const SandMound = ({ x, z, scale, createMaterial }: SandMoundProps) => (
  <group position={[x, 0, z]} scale={scale}>
    <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
      <coneGeometry args={[0.24, 0.13, 16, 1, false]} />
      {createMaterial(PALETTE.dustPileBase, 'stone')}
    </mesh>
    <mesh receiveShadow position={[-0.05, 0.06, -0.03]}>
      <coneGeometry args={[0.15, 0.1, 12]} />
      {createMaterial(PALETTE.dustPileLight, 'stone')}
    </mesh>
    <mesh receiveShadow position={[0.07, 0.04, 0.05]}>
      <coneGeometry args={[0.11, 0.06, 12]} />
      {createMaterial(PALETTE.dustPileShadow, 'stone')}
    </mesh>
    {/* Scattered grains at the base */}
    <mesh receiveShadow position={[0.18, 0.012, 0.06]}>
      <sphereGeometry args={[0.025, 6, 5]} />
      {createMaterial(PALETTE.dustPileBase, 'stone')}
    </mesh>
    <mesh receiveShadow position={[-0.2, 0.01, -0.04]}>
      <sphereGeometry args={[0.02, 6, 5]} />
      {createMaterial(PALETTE.dustPileShadow, 'stone')}
    </mesh>
    <mesh receiveShadow position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.0, 0.3, 18]} />
      {createMaterial(PALETTE.dustPileShadow, 'stone')}
    </mesh>
  </group>
);

export const CentrifugeOutput = ({
  dim,
  createMaterial,
  hopperDustRef,
  endDustRef,
}: CentrifugeOutputProps) => {
  const hopperDrops = useMemo(() => buildDrops(6, 12.7), []);
  const endDrops = useMemo(() => buildDrops(5, 31.4), []);

  const hopperDustTopY = dim.hopperBottomY - 0.13;
  const endDustTopY = dim.frameTopY - 0.04;

  return (
    <group>
      {/* Sand mound + falling filter sand directly under the hopper neck */}
      <SandMound x={dim.hopperCenterX + 0.02} z={dim.dustPileZ} scale={1.0} createMaterial={createMaterial} />
      <group ref={hopperDustRef} position={[dim.hopperCenterX + 0.02, hopperDustTopY, dim.dustPileZ - 0.04]}>
        {hopperDrops.map((drop) => (
          <mesh key={drop.id} position={[drop.x, 0, drop.z]}>
            <sphereGeometry args={[drop.size, 6, 4]} />
            {createMaterial(PALETTE.dustPileLight, 'stone')}
          </mesh>
        ))}
      </group>

      {/* Residue sand mound + falling sand at the discharge end of the machine */}
      <SandMound x={dim.outputRocksX} z={dim.dustPileZ * 0.4} scale={0.8} createMaterial={createMaterial} />
      <group ref={endDustRef} position={[dim.outputRocksX, endDustTopY, dim.dustPileZ * 0.4 - 0.03]}>
        {endDrops.map((drop) => (
          <mesh key={drop.id} position={[drop.x, 0, drop.z]}>
            <sphereGeometry args={[drop.size, 6, 4]} />
            {createMaterial(PALETTE.dustPileBase, 'stone')}
          </mesh>
        ))}
      </group>
    </group>
  );
};
