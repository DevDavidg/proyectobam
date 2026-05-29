import type { Ref } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { MaterialFactory, RollerSpike, TwigSnapperDimensions } from '../types';

type SpikedRollersProps = {
  dim: TwigSnapperDimensions;
  scale: number;
  createMaterial: MaterialFactory;
  rollerFrontRef: Ref<Group>;
  rollerBackRef: Ref<Group>;
};

type SingleRollerProps = {
  dim: TwigSnapperDimensions;
  z: number;
  rollerRef: Ref<Group>;
  createMaterial: MaterialFactory;
  scale: number;
};

const SpikeMesh = ({
  spike,
  rollerRadius,
  spikeLength,
  spikeRadius,
  createMaterial,
}: {
  spike: RollerSpike;
  rollerRadius: number;
  spikeLength: number;
  spikeRadius: number;
  createMaterial: MaterialFactory;
}) => {
  const reach = rollerRadius + spikeLength / 2 - 0.004;
  const y = Math.cos(spike.angle) * reach;
  const z = Math.sin(spike.angle) * reach;
  return (
    <group position={[spike.x, y, z]} rotation={[spike.angle - Math.PI / 2, 0, 0]}>
      <mesh castShadow receiveShadow material={createMaterial(PALETTE.rollerSpike, 'iron')}>
        <coneGeometry args={[spikeRadius, spikeLength, 8]} /></mesh>
      <mesh castShadow={false} receiveShadow position={[0, -spikeLength / 2 + 0.004, 0]} material={createMaterial(PALETTE.rollerSpikeDark, 'iron')}>
        <cylinderGeometry args={[spikeRadius * 1.05, spikeRadius * 1.05, 0.008, 10]} /></mesh>
    </group>
  );
};

const Roller = ({ dim, z, rollerRef, createMaterial, scale }: SingleRollerProps) => {
  const applied = Math.max(0.0001, scale);
  return (
    <group ref={rollerRef} position={[0, dim.rollerY, z]} scale={[1, applied, applied]}>
      <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} material={createMaterial(PALETTE.rollerSteel, 'iron')}>
        <cylinderGeometry args={[dim.rollerRadius, dim.rollerRadius, dim.rollerLength, 18]} /></mesh>
      <mesh
        castShadow={false}
        receiveShadow
        position={[0, 0, dim.rollerRadius - 0.012]}
        rotation={[0, 0, Math.PI / 2]}
       material={createMaterial(PALETTE.rollerSteelHighlight, 'iron')}>
        <cylinderGeometry args={[dim.rollerRadius * 0.96, dim.rollerRadius * 0.96, dim.rollerLength - 0.04, 18]} /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[-dim.rollerLength / 2 - 0.012, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
       material={createMaterial(PALETTE.rollerSteelDark, 'iron')}>
        <cylinderGeometry args={[dim.rollerRadius * 1.08, dim.rollerRadius * 1.08, 0.024, 14]} /></mesh>
      <mesh
        castShadow
        receiveShadow
        position={[dim.rollerLength / 2 + 0.012, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
       material={createMaterial(PALETTE.rollerSteelDark, 'iron')}>
        <cylinderGeometry args={[dim.rollerRadius * 1.08, dim.rollerRadius * 1.08, 0.024, 14]} /></mesh>

      {dim.rollerSpikes.map((spike) => (
        <SpikeMesh
          key={spike.id}
          spike={spike}
          rollerRadius={dim.rollerRadius}
          spikeLength={dim.rollerSpikeLength}
          spikeRadius={dim.rollerSpikeRadius}
          createMaterial={createMaterial}
        />
      ))}

      <mesh
        castShadow={false}
        receiveShadow
        position={[0, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
       material={createMaterial(PALETTE.rollerAxle, 'iron')}>
        <cylinderGeometry args={[dim.rollerRadius * 0.32, dim.rollerRadius * 0.32, dim.rollerLength + 0.08, 12]} /></mesh>
    </group>
  );
};

export const SpikedRollers = ({
  dim,
  scale,
  createMaterial,
  rollerFrontRef,
  rollerBackRef,
}: SpikedRollersProps) => {
  if (scale < 0.01) return null;
  return (
    <group>
      <Roller
        dim={dim}
        z={dim.rollerFrontZ}
        rollerRef={rollerFrontRef}
        createMaterial={createMaterial}
        scale={scale}
      />
      <Roller
        dim={dim}
        z={dim.rollerBackZ}
        rollerRef={rollerBackRef}
        createMaterial={createMaterial}
        scale={scale}
      />
    </group>
  );
};
