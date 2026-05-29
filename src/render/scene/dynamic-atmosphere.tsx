import { useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import { Color } from 'three';
import { getDayNightCycleState } from '../../core/constants/day-night-cycle';
import {
  CAMERA_FOG_DENSITY_BASE,
  CAMERA_FOG_DENSITY_MAX_ADD,
  CAMERA_FOG_ZOOM_RANGE,
  CAMERA_MAX_ZOOM,
  CAMERA_MIN_ZOOM,
} from '../camera/camera-config';

export type AtmosphereStrength = {
  zoomedOutFactor: number;
  fogFactor: number;
  bloomIntensity: number;
  bloomThreshold: number;
  bloomSmoothing: number;
  fogDensity: number;
  daylight: number;
  nightFactor: number;
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

/** Niebla/bloom solo en el último tramo de alejamiento; a mitad de zoom casi cero. */
const computeFogFactor = (zoom: number): number => {
  const zoomSpan = CAMERA_MAX_ZOOM - CAMERA_MIN_ZOOM;
  const fogSpan = zoomSpan * CAMERA_FOG_ZOOM_RANGE;
  if (fogSpan <= 0) {
    return 0;
  }
  const linear = clamp01(1 - (zoom - CAMERA_MIN_ZOOM) / fogSpan);
  return linear * linear * linear * linear;
};

const computeBloomFactor = (zoom: number): number => {
  const zoomSpan = CAMERA_MAX_ZOOM - CAMERA_MIN_ZOOM;
  const bloomSpan = zoomSpan * 0.4;
  if (bloomSpan <= 0) {
    return 0;
  }
  const linear = clamp01(1 - (zoom - CAMERA_MIN_ZOOM) / bloomSpan);
  return linear * linear;
};

export const computeAtmosphereStrength = (
  zoom: number,
  nightFactor = 0,
): AtmosphereStrength => {
  const fogFactor = computeFogFactor(zoom);
  const bloomFactor = computeBloomFactor(zoom);
  const zoomedOutFactor = Math.max(fogFactor, bloomFactor);
  const nightBoost = clamp01(nightFactor);

  return {
    zoomedOutFactor,
    fogFactor,
    bloomIntensity: 0.03 + bloomFactor * 0.68 + nightBoost * 0.24,
    bloomThreshold: 0.95 - bloomFactor * 0.36 - nightBoost * 0.16,
    bloomSmoothing: 0.07 + bloomFactor * 0.2 + nightBoost * 0.06,
    fogDensity:
      CAMERA_FOG_DENSITY_BASE +
      fogFactor * CAMERA_FOG_DENSITY_MAX_ADD +
      nightBoost * 0.0015,
    daylight: 1 - nightBoost,
    nightFactor: nightBoost,
  };
};

export const DynamicAtmosphere = () => {
  const daySkyColor = useMemo(() => new Color('#86c43e'), []);
  const nightSkyColor = useMemo(() => new Color('#0b1730'), []);
  const mixedSkyColor = useMemo(() => new Color(), []);
  const { scene } = useThree();

  useFrame(({ clock }) => {
    const cycle = getDayNightCycleState(clock.getElapsedTime());
    // Keep day/night sky transitions but disable scene fog completely.
    scene.fog = null;
    mixedSkyColor.lerpColors(daySkyColor, nightSkyColor, cycle.nightFactor);
    scene.background = mixedSkyColor;
  });

  return null;
};
