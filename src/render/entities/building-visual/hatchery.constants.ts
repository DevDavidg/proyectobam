import { Quaternion, Vector3 } from 'three';

export const HATCHERY_LEG_POSITIONS: ReadonlyArray<readonly [number, number, number]> = [[-0.55, 0.14, -0.55], [0.55, 0.14, -0.55], [-0.55, 0.14, 0.55], [0.55, 0.14, 0.55]];
export const HATCHERY_RIVET_POSITIONS: ReadonlyArray<readonly [number, number, number]> = [[0.62, 0.72, 0.58], [0.76, 0.72, 0.34], [0.84, 0.72, 0], [0.76, 0.72, -0.34], [0.62, 0.72, -0.58]];

export const HATCHERY_ROTOR_AXIS = new Vector3(0, 1, 0);
export const HATCHERY_ARM_AXIS = new Vector3(0, 0, 1);
export const HATCHERY_ROTATION_QUATERNION = new Quaternion();
export const HATCHERY_ARM_QUATERNION = new Quaternion();
