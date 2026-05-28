import type { ThreeEvent } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { memo, useMemo, useRef } from 'react';
import { Object3D, Quaternion, Vector3, type Group } from 'three';
import { EntityType } from '../../ecs/components/components';
import type { RenderEntitySnapshot } from '../../ecs/systems/sync-grid-system';
import { useGameStore } from '../../state/game-store';
import { CELL_SIZE, GRID_SIZE, gridToWorldCenter } from '../../utils/coordinates';
import { ConstructionOverlay } from './construction-overlay';
import { BuildingContactShadow } from './building-contact-shadow';
import { BuildingDirtDecal } from './building-dirt-decal';
import { CannonTowerVisual } from './cannon-tower-visual';
import { LaserTowerVisual } from './laser-tower-visual';
import { SniperTowerVisual } from './sniper-tower-visual';
import { useSpawnScale } from './use-spawn-scale';

type TurretMeshProps = {
  entity: RenderEntitySnapshot;
};

const TurretMeshImpl = ({ entity }: TurretMeshProps) => {
  const turretHeadRef = useRef<Group | null>(null);
  const groupRef = useSpawnScale(entity.sourceId);
  const dummyRef = useRef<Object3D>(new Object3D());
  const targetQuaternionRef = useRef<Quaternion>(new Quaternion());
  const targetVectorRef = useRef<Vector3>(new Vector3());
  const turretWorldPosRef = useRef<Vector3>(new Vector3());
  const openBuildingContextMenu = useGameStore((state) => state.openBuildingContextMenu);
  const setHoveredBuildingId = useGameStore((state) => state.setHoveredBuildingId);
  const isTurret = entity.kind === EntityType.TURRET || entity.kind === EntityType.MORTAR;
  const position = useMemo(
    () => gridToWorldCenter(entity.x, entity.y, entity.sizeX, entity.sizeY, GRID_SIZE, CELL_SIZE),
    [entity.x, entity.y, entity.sizeX, entity.sizeY]
  );
  const isMortar = entity.kind === EntityType.MORTAR;
  const isLaserTower = entity.sourceType === 'DEFENSE_LASER_TOWER';
  const hasTargetRef = useRef(false);

  useFrame((_, delta) => {
    if (!turretHeadRef.current) {
      return;
    }

    const enemies = useGameStore.getState().enemies;
    const turretRange = entity.range ?? (isMortar ? 12 : 5.3);
    const turretGridX = entity.x + entity.sizeX / 2;
    const turretGridY = entity.y + entity.sizeY / 2;
    let nearestEnemy: typeof enemies[number] | undefined;
    let nearestDistance = turretRange;
    for (const enemy of enemies) {
      const dist = Math.hypot(enemy.x - turretGridX, enemy.y - turretGridY);
      if (dist <= nearestDistance) {
        nearestDistance = dist;
        nearestEnemy = enemy;
      }
    }
    const targetEnemy = nearestEnemy;

    if (!targetEnemy) {
      hasTargetRef.current = false;
      return;
    }
    hasTargetRef.current = true;

    const [targetWorldX, , targetWorldZ] = gridToWorldCenter(targetEnemy.x, targetEnemy.y, 1, 1, GRID_SIZE, CELL_SIZE);
    targetVectorRef.current.set(targetWorldX, turretHeadRef.current.position.y, targetWorldZ);
    dummyRef.current.position.copy(turretHeadRef.current.getWorldPosition(turretWorldPosRef.current));
    dummyRef.current.lookAt(targetVectorRef.current);
    targetQuaternionRef.current.copy(dummyRef.current.quaternion);
    turretHeadRef.current.quaternion.slerp(targetQuaternionRef.current, delta * 5);
  });

  if (!isTurret) {
    return null;
  }

  const handleContextMenu = (event: ThreeEvent<MouseEvent>): void => {
    event.stopPropagation();
    event.nativeEvent.preventDefault();
    if (!entity.sourceId) {
      return;
    }
    openBuildingContextMenu(entity.sourceId, {
      x: event.nativeEvent.clientX,
      y: event.nativeEvent.clientY,
    });
  };

  const handlePointerOver = (): void => {
    if (!entity.sourceId) {
      return;
    }
    setHoveredBuildingId(entity.sourceId);
  };

  const handlePointerOut = (): void => {
    setHoveredBuildingId(null);
  };

  return (
    <group
      ref={groupRef}
      position={[position[0], 0, position[2]]}
      onContextMenu={handleContextMenu}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <BuildingDirtDecal sizeX={entity.sizeX} sizeY={entity.sizeY} status={entity.status} intensity={0.95} />
      <group ref={turretHeadRef} position={[0, 0, 0]}>
        {isMortar ? (
          <CannonTowerVisual level={entity.level} isActive={hasTargetRef.current} hp={entity.hp} maxHp={entity.maxHp} />
        ) : isLaserTower ? (
          <LaserTowerVisual level={entity.level} isActive={hasTargetRef.current} hp={entity.hp} maxHp={entity.maxHp} />
        ) : (
          <SniperTowerVisual level={entity.level} isActive={hasTargetRef.current} hp={entity.hp} maxHp={entity.maxHp} />
        )}
      </group>
      {entity.status === 'UNDER_CONSTRUCTION' || entity.status === 'PENDING' ? (
        <ConstructionOverlay sizeX={entity.sizeX * CELL_SIZE} sizeY={entity.sizeY * CELL_SIZE} progress={entity.constructionProgress ?? 0} />
      ) : null}
      <BuildingContactShadow sizeX={entity.sizeX} sizeY={entity.sizeY} status={entity.status} />
    </group>
  );
};

const areTurretEntityPropsEqual = (prev: TurretMeshProps, next: TurretMeshProps): boolean => {
  const prevEntity = prev.entity;
  const nextEntity = next.entity;
  return (
    prevEntity.id === nextEntity.id &&
    prevEntity.x === nextEntity.x &&
    prevEntity.y === nextEntity.y &&
    prevEntity.sizeX === nextEntity.sizeX &&
    prevEntity.sizeY === nextEntity.sizeY &&
    prevEntity.kind === nextEntity.kind &&
    prevEntity.status === nextEntity.status &&
    prevEntity.level === nextEntity.level &&
    prevEntity.hp === nextEntity.hp &&
    prevEntity.maxHp === nextEntity.maxHp &&
    prevEntity.range === nextEntity.range &&
    prevEntity.constructionProgress === nextEntity.constructionProgress &&
    prevEntity.sourceId === nextEntity.sourceId &&
    prevEntity.sourceType === nextEntity.sourceType
  );
};

export const TurretMesh = memo(TurretMeshImpl, areTurretEntityPropsEqual);
