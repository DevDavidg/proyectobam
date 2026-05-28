import { BoxGeometry, CircleGeometry, ConeGeometry, CylinderGeometry, SphereGeometry, TorusGeometry } from 'three';

const BOX_GEOMETRY_CACHE = new Map<string, BoxGeometry>();
const CYLINDER_GEOMETRY_CACHE = new Map<string, CylinderGeometry>();
const CONE_GEOMETRY_CACHE = new Map<string, ConeGeometry>();
const SPHERE_GEOMETRY_CACHE = new Map<string, SphereGeometry>();
const TORUS_GEOMETRY_CACHE = new Map<string, TorusGeometry>();
const CIRCLE_GEOMETRY_CACHE = new Map<string, CircleGeometry>();

const getGeometryKey = (args: number[]): string => args.join('|');

export const getBoxGeometry = (width: number, height: number, depth: number) => {
  const key = getGeometryKey([width, height, depth]);
  const cached = BOX_GEOMETRY_CACHE.get(key);
  if (cached) {
    return cached;
  }
  const geometry = new BoxGeometry(width, height, depth);
  BOX_GEOMETRY_CACHE.set(key, geometry);
  return geometry;
};

export const getCylinderGeometry = (radiusTop: number, radiusBottom: number, height: number, radialSegments: number) => {
  const key = getGeometryKey([radiusTop, radiusBottom, height, radialSegments]);
  const cached = CYLINDER_GEOMETRY_CACHE.get(key);
  if (cached) {
    return cached;
  }
  const geometry = new CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
  CYLINDER_GEOMETRY_CACHE.set(key, geometry);
  return geometry;
};

export const getConeGeometry = (radius: number, height: number, radialSegments: number) => {
  const key = getGeometryKey([radius, height, radialSegments]);
  const cached = CONE_GEOMETRY_CACHE.get(key);
  if (cached) {
    return cached;
  }
  const geometry = new ConeGeometry(radius, height, radialSegments);
  CONE_GEOMETRY_CACHE.set(key, geometry);
  return geometry;
};

export const getSphereGeometry = (
  radius: number,
  widthSegments: number,
  heightSegments: number,
  phiStart = 0,
  phiLength = Math.PI * 2,
  thetaStart = 0,
  thetaLength = Math.PI
) => {
  const key = getGeometryKey([radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength]);
  const cached = SPHERE_GEOMETRY_CACHE.get(key);
  if (cached) {
    return cached;
  }
  const geometry = new SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength);
  SPHERE_GEOMETRY_CACHE.set(key, geometry);
  return geometry;
};

export const getTorusGeometry = (radius: number, tube: number, radialSegments: number, tubularSegments: number, arc = Math.PI * 2) => {
  const key = getGeometryKey([radius, tube, radialSegments, tubularSegments, arc]);
  const cached = TORUS_GEOMETRY_CACHE.get(key);
  if (cached) {
    return cached;
  }
  const geometry = new TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);
  TORUS_GEOMETRY_CACHE.set(key, geometry);
  return geometry;
};

export const getCircleGeometry = (radius: number, segments: number) => {
  const key = getGeometryKey([radius, segments]);
  const cached = CIRCLE_GEOMETRY_CACHE.get(key);
  if (cached) {
    return cached;
  }
  const geometry = new CircleGeometry(radius, segments);
  CIRCLE_GEOMETRY_CACHE.set(key, geometry);
  return geometry;
};
