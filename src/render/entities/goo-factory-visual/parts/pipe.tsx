import { forwardRef } from 'react';
import type { Group } from 'three';
import { PALETTE } from '../palette';
import type { GooFactoryDimensions } from '../geometry';
import type { CreateMaterial } from '../types';

const VALVE_SPOKE_COUNT = 4;

type PipeProps = {
  dim: GooFactoryDimensions;
  createMaterial: CreateMaterial;
  side?: 1 | -1;
  showValve?: boolean;
};

const renderValve = (
  x: number,
  y: number,
  createMaterial: CreateMaterial,
) => (
  <group position={[x, y, 0]}>
    <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
      <cylinderGeometry args={[0.022, 0.022, 0.06, 10]} />
      {createMaterial(PALETTE.pipeShadow, 'gold')}
    </mesh>
    <mesh
      castShadow
      receiveShadow
      position={[0, 0.11, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <torusGeometry args={[0.072, 0.012, 8, 18]} />
      {createMaterial(PALETTE.valveHandle, 'gold')}
    </mesh>
    {Array.from({ length: VALVE_SPOKE_COUNT }, (_, index) => {
      const angle = (index / VALVE_SPOKE_COUNT) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      return (
        <mesh
          key={`valve-spoke-${angle.toFixed(3)}`}
          castShadow
          receiveShadow
          position={[cosA * 0.034, 0.11, sinA * 0.034]}
          rotation={[0, -angle + Math.PI / 2, 0]}
        >
          <boxGeometry args={[0.068, 0.012, 0.012]} />
          {createMaterial(PALETTE.valveSpoke, 'gold')}
        </mesh>
      );
    })}
    <mesh castShadow receiveShadow position={[0, 0.115, 0]}>
      <sphereGeometry args={[0.018, 10, 8]} />
      {createMaterial(PALETTE.valveHandle, 'gold')}
    </mesh>
  </group>
);

export const Pipe = ({ dim, createMaterial, side = 1, showValve = false }: PipeProps) => {
  const s = side;
  const outletX = s * (dim.tankRadius - 0.02);
  const flangeX = s * (dim.tankRadius + 0.02);
  const stubStartX = s * dim.pipeOutletX;
  const stubEndX = s * dim.pipeCornerX;
  const cornerSphereX = s * dim.pipeCornerX;
  const groundEndX = s * dim.pipeGroundEndX;
  const nozzleX = s * (dim.pipeGroundEndX + 0.05);
  const nozzleHoleX = s * (dim.pipeGroundEndX + 0.101);
  return (
    <group>
      <mesh castShadow receiveShadow position={[outletX, dim.pipeOutletY, 0]}>
        <boxGeometry args={[0.06, 0.18, 0.18]} />
        {createMaterial(PALETTE.metalBand, 'iron')}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[flangeX, dim.pipeOutletY, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.07, 0.07, 0.04, 14]} />
        {createMaterial(PALETTE.pipeShadow, 'gold')}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[(stubStartX + stubEndX) / 2, dim.pipeOutletY, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.058, 0.058, Math.abs(stubEndX - stubStartX), 12]} />
        {createMaterial(PALETTE.pipe, 'gold')}
      </mesh>
      <mesh castShadow receiveShadow position={[cornerSphereX, dim.pipeOutletY, 0]}>
        <sphereGeometry args={[0.07, 14, 12]} />
        {createMaterial(PALETTE.pipe, 'gold')}
      </mesh>
      {showValve
        ? renderValve(
            s * (dim.pipeOutletX + (dim.pipeCornerX - dim.pipeOutletX) * 0.45),
            dim.pipeOutletY,
            createMaterial,
          )
        : null}
      <mesh
        castShadow
        receiveShadow
        position={[cornerSphereX, (dim.pipeOutletY + dim.pipeBottomY) / 2, 0]}
      >
        <cylinderGeometry args={[0.058, 0.058, dim.pipeOutletY - dim.pipeBottomY, 12]} />
        {createMaterial(PALETTE.pipe, 'gold')}
      </mesh>
      <mesh castShadow receiveShadow position={[cornerSphereX, dim.pipeBottomY, 0]}>
        <sphereGeometry args={[0.07, 14, 12]} />
        {createMaterial(PALETTE.pipe, 'gold')}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[(cornerSphereX + groundEndX) / 2, dim.pipeBottomY, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.058, 0.058, Math.abs(groundEndX - cornerSphereX), 12]} />
        {createMaterial(PALETTE.pipe, 'gold')}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[(cornerSphereX + groundEndX) / 2, dim.pipeBottomY, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <torusGeometry args={[0.06, 0.012, 6, 14]} />
        {createMaterial(PALETTE.pipeRing, 'gold')}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[nozzleX, dim.pipeBottomY, 0]}
        rotation={[0, 0, s * Math.PI / 2]}
      >
        <cylinderGeometry args={[0.058, 0.085, 0.1, 14]} />
        {createMaterial(PALETTE.pipeShadow, 'gold')}
      </mesh>
      <mesh
        position={[nozzleHoleX, dim.pipeBottomY, 0]}
        rotation={[0, s * Math.PI / 2, 0]}
      >
        <circleGeometry args={[0.07, 16]} />
        {createMaterial(PALETTE.pump, 'iron')}
      </mesh>
    </group>
  );
};

type GaugeProps = {
  dim: GooFactoryDimensions;
  createMaterial: CreateMaterial;
};

export const Gauge = forwardRef<Group, GaugeProps>(({ dim, createMaterial }, needleRef) => {
  const cx = dim.pipeCornerX + 0.06;
  const cy = dim.pipeOutletY + 0.06;
  return (
    <group position={[cx, cy, 0]}>
      <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.075, 0.075, 0.035, 18]} />
        {createMaterial(PALETTE.gaugeBezel, 'iron')}
      </mesh>
      <mesh castShadow receiveShadow position={[0.005, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.082, 0.082, 0.018, 18]} />
        {createMaterial(PALETTE.gaugeRing, 'gold')}
      </mesh>
      <mesh receiveShadow position={[0.02, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.066, 20]} />
        {createMaterial(PALETTE.gaugeFace, 'iron')}
      </mesh>
      {[0, 1, 2, 3, 4].map((step) => {
        const stepAngle = -Math.PI * 0.75 + (step / 4) * Math.PI * 1.5;
        const ty = Math.cos(stepAngle) * 0.052;
        const tz = Math.sin(stepAngle) * 0.052;
        return (
          <mesh
            key={`gauge-tick-${step}`}
            position={[0.022, ty, tz]}
            rotation={[stepAngle, 0, 0]}
          >
            <boxGeometry args={[0.004, 0.014, 0.005]} />
            {createMaterial(PALETTE.gaugeMark, 'iron')}
          </mesh>
        );
      })}
      <group ref={needleRef} position={[0.026, 0, 0]}>
        <mesh receiveShadow position={[0, 0.026, 0]}>
          <boxGeometry args={[0.006, 0.052, 0.004]} />
          {createMaterial(PALETTE.gaugeNeedle, 'iron')}
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.011, 0.011, 0.01, 12]} />
          {createMaterial(PALETTE.gaugeBezel, 'iron')}
        </mesh>
      </group>
    </group>
  );
});

Gauge.displayName = 'Gauge';

type SuctionProps = {
  dim: GooFactoryDimensions;
  createMaterial: CreateMaterial;
  groundPuddleBase: number;
  side?: 1 | -1;
};

export const Suction = forwardRef<
  Group,
  SuctionProps & { puddleRef: React.RefObject<Group | null> }
>(({ dim, createMaterial, groundPuddleBase, puddleRef, side = 1 }, suctionPulseRef) => {
  const px = side * (dim.pipeGroundEndX + 0.08);
  return (
    <group position={[px, dim.groundY, 0]}>
      <group ref={suctionPulseRef}>
        <mesh receiveShadow position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.14, 20]} />
          {createMaterial(PALETTE.gooDeep, 'goo')}
        </mesh>
      </group>
      <group ref={puddleRef} position={[0, -0.01, 0]}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[groundPuddleBase + 0.18, 20]} />
          {createMaterial(PALETTE.gooDeep, 'goo')}
        </mesh>
        <mesh receiveShadow position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[groundPuddleBase + 0.12, 20]} />
          {createMaterial(PALETTE.goo, 'goo')}
        </mesh>
        <mesh receiveShadow position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[groundPuddleBase + 0.05, 18]} />
          {createMaterial(PALETTE.gooBright, 'goo')}
        </mesh>
        <mesh castShadow receiveShadow position={[side * 0.16, 0.02, 0.05]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          {createMaterial(PALETTE.goo, 'goo')}
        </mesh>
        <mesh castShadow receiveShadow position={[-side * 0.12, 0.025, -0.07]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          {createMaterial(PALETTE.gooBright, 'goo')}
        </mesh>
      </group>
    </group>
  );
});

Suction.displayName = 'Suction';

type FlowParticleProps = {
  createMaterial: CreateMaterial;
};

export const FlowParticle = forwardRef<Group, FlowParticleProps>(({ createMaterial }, ref) => (
  <group ref={ref} visible={false}>
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[0.045, 10, 8]} />
      {createMaterial(PALETTE.gooBright, 'goo')}
    </mesh>
  </group>
));

FlowParticle.displayName = 'FlowParticle';
