/** Más alto = menos alejamiento permitido (zoom ortográfico mínimo). */
export const CAMERA_MIN_ZOOM = 26;
export const CAMERA_DEFAULT_ZOOM = 26;
export const CAMERA_MAX_ZOOM = 120;
/** Solo el tramo más alejado (0–1) aplica niebla/bloom fuerte. */
export const CAMERA_FOG_ZOOM_RANGE = 0.18;
/** Densidad base de FogExp2 (sin alejar). */
export const CAMERA_FOG_DENSITY_BASE = 0.0007;
/** Extra de niebla solo con zoom al mínimo (alejado al máximo). */
export const CAMERA_FOG_DENSITY_MAX_ADD = 0.0014;
export const CAMERA_CELEBRATION_ZOOM = 72;
export const CAMERA_MIN_POLAR_ANGLE = Math.PI / 6;
export const CAMERA_MAX_POLAR_ANGLE = Math.PI / 2.2;
export const CAMERA_DAMPING_FACTOR = 0.08;
export const CAMERA_PAN_SPEED = 1.15;
export const CAMERA_VERTICAL_DRAG_SENSITIVITY = 0.0045;
export const CAMERA_HORIZONTAL_DRAG_SENSITIVITY = 0.006;
export const CAMERA_COLLISION_MARGIN = 1.5;
export const CAMERA_CELEBRATION_ORBIT_RADIANS = Math.PI * 2;
export const CAMERA_CELEBRATION_PAN_ZOOM_MS = 1400;
export const CAMERA_CELEBRATION_ORBIT_MS = 10000;
export const CAMERA_DEFAULT_COLLIDER_HEIGHT = 5;
