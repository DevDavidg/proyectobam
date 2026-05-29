import {
  CAMERA_CELEBRATION_ORBIT_MS,
  CAMERA_CELEBRATION_ORBIT_RADIANS,
  CAMERA_CELEBRATION_PAN_ZOOM_MS,
  CAMERA_CELEBRATION_ZOOM,
  CAMERA_MAX_ZOOM,
  CAMERA_MIN_ZOOM,
} from './camera-config';

export type CameraCelebrationPhase = 'pan_zoom' | 'orbit' | 'done';

export type CameraCelebrationState = {
  startedAt: number;
  startTargetX: number;
  startTargetY: number;
  startTargetZ: number;
  endTargetX: number;
  endTargetY: number;
  endTargetZ: number;
  startZoom: number;
  endZoom: number;
  startAzimuth: number;
  buildingId: string;
  phase: CameraCelebrationPhase;
  phaseStartedAt: number;
};

export const easeInOutCubic = (value: number): number => {
  if (value < 0.5) {
    return 4 * value * value * value;
  }
  return 1 - Math.pow(-2 * value + 2, 3) / 2;
};

export const clampZoom = (zoom: number): number => Math.max(CAMERA_MIN_ZOOM, Math.min(CAMERA_MAX_ZOOM, zoom));

export const createCelebrationState = (params: {
  now: number;
  startTarget: [number, number, number];
  endTarget: [number, number, number];
  startZoom: number;
  startAzimuth: number;
  buildingId: string;
}): CameraCelebrationState => ({
  startedAt: params.now,
  startTargetX: params.startTarget[0],
  startTargetY: params.startTarget[1],
  startTargetZ: params.startTarget[2],
  endTargetX: params.endTarget[0],
  endTargetY: params.endTarget[1],
  endTargetZ: params.endTarget[2],
  startZoom: params.startZoom,
  endZoom: clampZoom(CAMERA_CELEBRATION_ZOOM),
  startAzimuth: params.startAzimuth,
  buildingId: params.buildingId,
  phase: 'pan_zoom',
  phaseStartedAt: params.now,
});

export type CelebrationFrame = {
  target: [number, number, number];
  zoom: number;
  azimuth: number;
  phase: CameraCelebrationPhase;
  done: boolean;
};

export const sampleCelebrationFrame = (state: CameraCelebrationState, now: number): CelebrationFrame => {
  if (state.phase === 'pan_zoom') {
    const elapsed = now - state.phaseStartedAt;
    const progress = Math.min(1, elapsed / CAMERA_CELEBRATION_PAN_ZOOM_MS);
    const eased = easeInOutCubic(progress);
    const target: [number, number, number] = [
      state.startTargetX + (state.endTargetX - state.startTargetX) * eased,
      state.startTargetY + (state.endTargetY - state.startTargetY) * eased,
      state.startTargetZ + (state.endTargetZ - state.startTargetZ) * eased,
    ];
    const zoom = state.startZoom + (state.endZoom - state.startZoom) * eased;

    if (progress >= 1) {
      return {
        target,
        zoom,
        azimuth: state.startAzimuth,
        phase: 'orbit',
        done: false,
      };
    }

    return {
      target,
      zoom,
      azimuth: state.startAzimuth,
      phase: 'pan_zoom',
      done: false,
    };
  }

  const orbitElapsed = now - (state.phase === 'orbit' ? state.phaseStartedAt : state.startedAt + CAMERA_CELEBRATION_PAN_ZOOM_MS);
  const orbitProgress = Math.min(1, orbitElapsed / CAMERA_CELEBRATION_ORBIT_MS);
  const orbitEased = easeInOutCubic(orbitProgress);
  const azimuth = state.startAzimuth + CAMERA_CELEBRATION_ORBIT_RADIANS * orbitEased;

  if (orbitProgress >= 1) {
    return {
      target: [state.endTargetX, state.endTargetY, state.endTargetZ],
      zoom: state.endZoom,
      azimuth,
      phase: 'done',
      done: true,
    };
  }

  return {
    target: [state.endTargetX, state.endTargetY, state.endTargetZ],
    zoom: state.endZoom,
    azimuth,
    phase: 'orbit',
    done: false,
  };
};
