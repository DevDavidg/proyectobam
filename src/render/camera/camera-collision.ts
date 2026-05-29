import { Vector3 } from 'three';
import { CAMERA_COLLISION_MARGIN } from './camera-config';
import { buildBuildingColliders, colliderContainsPoint, type BuildingCollider } from './building-colliders';
import type { Building } from '../../core/types/building';

const pushPointOutOfCollider = (
  point: Vector3,
  collider: BuildingCollider,
  margin: number,
): Vector3 => {
  const closestX = Math.max(collider.minX, Math.min(point.x, collider.maxX));
  const closestY = Math.max(collider.minY, Math.min(point.y, collider.maxY));
  const closestZ = Math.max(collider.minZ, Math.min(point.z, collider.maxZ));

  const deltaX = point.x - closestX;
  const deltaY = point.y - closestY;
  const deltaZ = point.z - closestZ;
  const distance = Math.hypot(deltaX, deltaY, deltaZ);

  if (distance <= 1e-6) {
    const centerX = (collider.minX + collider.maxX) / 2;
    const centerZ = (collider.minZ + collider.maxZ) / 2;
    const awayX = point.x - centerX;
    const awayZ = point.z - centerZ;
    const awayDistance = Math.hypot(awayX, awayZ) || 1;
    return new Vector3(
      point.x + (awayX / awayDistance) * margin,
      Math.max(point.y, collider.maxY + margin),
      point.z + (awayZ / awayDistance) * margin,
    );
  }

  const pushDistance = margin / distance;
  return new Vector3(
    point.x + deltaX * pushDistance,
    point.y + deltaY * pushDistance,
    point.z + deltaZ * pushDistance,
  );
};

export const resolveCameraCollision = (
  cameraPosition: Vector3,
  buildings: Building[],
  excludeBuildingIds: ReadonlySet<string> = new Set(),
): Vector3 => {
  const colliders = buildBuildingColliders(buildings);
  let resolved = cameraPosition.clone();

  for (let pass = 0; pass < 3; pass += 1) {
    let changed = false;

    for (const collider of colliders) {
      if (excludeBuildingIds.has(collider.id)) {
        continue;
      }

      if (!colliderContainsPoint(collider, resolved.x, resolved.y, resolved.z)) {
        continue;
      }

      resolved = pushPointOutOfCollider(resolved, collider, CAMERA_COLLISION_MARGIN);
      changed = true;
    }

    if (!changed) {
      break;
    }
  }

  return resolved;
};
