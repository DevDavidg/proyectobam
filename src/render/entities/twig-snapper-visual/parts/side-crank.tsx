import type { Ref } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { MaterialFactory, TwigSnapperDimensions } from '../types';

type SideCrankProps = {
  dim: TwigSnapperDimensions;
  extension: number;
  createMaterial: MaterialFactory;
  crankRef: Ref<Group>;
};

export const SideCrank = ({ dim, extension, createMaterial, crankRef }: SideCrankProps) => {
  if (extension < 0.01) return null;
  const clamped = Math.max(0.0001, Math.min(1, extension));
  const direction = Math.sign(dim.crankAxleEndX - dim.crankAxleStartX) || -1;
  const axleSpan = Math.abs(dim.crankAxleEndX - dim.crankAxleStartX) * clamped;
  const endX = dim.crankAxleStartX + direction * axleSpan;
  const axleCenterX = (dim.crankAxleStartX + endX) / 2;
  const handleOffset = direction * (dim.crankHandleLength / 2 + 0.04);
  const knobOffset = direction * (dim.crankHandleLength + 0.04 + dim.crankKnobRadius * 0.6);
  const armOffset = direction * 0.025;

  return (
    <group>
      <mesh
        castShadow
        receiveShadow
        position={[axleCenterX, dim.crankAxleY, dim.crankAxleZ]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[dim.gearAxleRadius * 0.9, dim.gearAxleRadius * 0.9, axleSpan, 12]} />
        {createMaterial(PALETTE.crankShaft, 'wood')}
      </mesh>

      <group ref={crankRef} position={[endX, dim.crankAxleY, dim.crankAxleZ]}>
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[dim.gearAxleRadius * 1.4, dim.gearAxleRadius * 1.4, 0.05, 14]} />
          {createMaterial(PALETTE.crankKnob, 'wood')}
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[armOffset, -dim.crankArmLength / 2, 0]}
        >
          <boxGeometry args={[0.05, dim.crankArmLength, 0.04]} />
          {createMaterial(PALETTE.crankShaft, 'wood')}
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[handleOffset, -dim.crankArmLength, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.022, 0.022, dim.crankHandleLength, 10]} />
          {createMaterial(PALETTE.crankShaft, 'wood')}
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[knobOffset, -dim.crankArmLength, 0]}
        >
          <sphereGeometry args={[dim.crankKnobRadius, 12, 10]} />
          {createMaterial(PALETTE.crankKnob, 'wood')}
        </mesh>
      </group>
    </group>
  );
};
