import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import { EntityType } from '../../ecs/components/components';
import type { RenderEntitySnapshot } from '../../ecs/systems/sync-grid-system';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';
import { HealthBar } from './health-bar';

type EnemyMeshProps = {
  entity: RenderEntitySnapshot;
};

const getPhaseFromId = (id: number) => (id % 11) * 0.37;

export const EnemyMesh = ({ entity }: EnemyMeshProps) => {
  const groupRef = useRef<Group | null>(null);
  const coreRef = useRef<Group | null>(null);
  const damageTimestamps = useGameStore((state) => state.damageTimestamps);
  const isEnemy = entity.kind === EntityType.ENEMY;
  const phase = useMemo(() => getPhaseFromId(entity.id), [entity.id]);
  const position = useMemo(
    () => gridToWorldCenter(entity.x, entity.y, entity.sizeX, entity.sizeY, GRID_SIZE, CELL_SIZE),
    [entity.x, entity.y, entity.sizeX, entity.sizeY]
  );
  const hpRatio = Math.max(0, Math.min(1, (entity.hp ?? 0) / Math.max(1, entity.maxHp ?? 1)));
  const wasDamagedRecently = entity.sourceId ? Date.now() - (damageTimestamps[entity.sourceId] ?? 0) < 1200 : false;

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }
    const t = state.clock.getElapsedTime() + phase;
    const locomotion = Math.sin(t * 8.6);
    const breathing = Math.sin(t * 2.2);
    const damagePulse = wasDamagedRecently ? Math.sin(t * 24) * 0.08 : 0;
    const lowHpTension = 1 + (1 - hpRatio) * 0.08;
    groupRef.current.position.y = Math.abs(locomotion) * 0.15 + Math.max(0, breathing) * 0.05;
    groupRef.current.rotation.z = locomotion * 0.05;
    groupRef.current.scale.y = (1 + locomotion * 0.08 + damagePulse) * lowHpTension;
    groupRef.current.scale.x = 1 - locomotion * 0.04 - damagePulse * 0.45;
    groupRef.current.scale.z = 1 - locomotion * 0.04 - damagePulse * 0.45;
    if (coreRef.current) {
      coreRef.current.rotation.y = Math.sin(t * 1.5) * 0.18;
    }
  });

  if (!isEnemy) {
    return null;
  }

  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.44, 20]} />
        <meshBasicMaterial color="#020617" transparent={true} opacity={0.34} depthWrite={false} />
      </mesh>
      <group ref={groupRef}>
        <group ref={coreRef}>
          <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
            <sphereGeometry args={[0.5, 20, 20]} />
            <meshStandardMaterial
              color={wasDamagedRecently ? '#fb7185' : '#ef4444'}
              roughness={0.58}
              metalness={0.08}
              emissive={wasDamagedRecently ? '#7f1d1d' : '#3f0a0a'}
              emissiveIntensity={wasDamagedRecently ? 0.35 : 0.15}
            />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.95, 0]}>
            <coneGeometry args={[0.35, 0.45, 10]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.5} metalness={0.12} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.16, 0.58, 0.4]}>
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.4} />
          </mesh>
          <mesh castShadow receiveShadow position={[-0.16, 0.58, 0.4]}>
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.4} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.17, 0.58, 0.46]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh castShadow receiveShadow position={[-0.17, 0.58, 0.46]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.3, 0.45]}>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.7} />
          </mesh>
        </group>
      </group>
      <group position={[0, 1.45, 0]}>
        <HealthBar hp={entity.hp ?? 0} maxHp={entity.maxHp ?? 1} visible={wasDamagedRecently} />
      </group>
    </group>
  );
};
