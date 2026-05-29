import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Euler,
  Matrix4,
  Quaternion,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type GeometryPart = {
  geometry: BufferGeometry;
  color: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
};

const transformMatrix = new Matrix4();
const positionVec = new Vector3();
const quaternion = new Quaternion();
const scaleVec = new Vector3();
const euler = new Euler();

const prepareGeometryForMerge = (geometry: BufferGeometry): BufferGeometry => {
  if (!geometry.getAttribute('normal')) {
    geometry.computeVertexNormals();
  }

  const positionCount = geometry.getAttribute('position').count;
  if (!geometry.getAttribute('uv')) {
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(positionCount * 2), 2));
  }

  return geometry.index !== null ? geometry.toNonIndexed() : geometry;
};

export const mergeGeometryParts = (parts: GeometryPart[]): BufferGeometry => {
  if (parts.length === 0) {
    return new BufferGeometry();
  }

  const transformed = parts.map((part) => {
    const geometry = part.geometry.clone();
    euler.set(part.rotation?.[0] ?? 0, part.rotation?.[1] ?? 0, part.rotation?.[2] ?? 0);
    quaternion.setFromEuler(euler);
    positionVec.set(part.position?.[0] ?? 0, part.position?.[1] ?? 0, part.position?.[2] ?? 0);
    scaleVec.set(part.scale?.[0] ?? 1, part.scale?.[1] ?? 1, part.scale?.[2] ?? 1);
    transformMatrix.compose(positionVec, quaternion, scaleVec);
    geometry.applyMatrix4(transformMatrix);

    const vertexColor = new Color(part.color);
    const positionCount = geometry.attributes.position.count;
    const colors = new Float32Array(positionCount * 3);
    for (let index = 0; index < positionCount; index += 1) {
      colors[index * 3] = vertexColor.r;
      colors[index * 3 + 1] = vertexColor.g;
      colors[index * 3 + 2] = vertexColor.b;
    }
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    return prepareGeometryForMerge(geometry);
  });

  const merged = mergeGeometries(transformed);
  if (!merged) {
    throw new Error('Failed to merge obstacle geometry parts');
  }
  merged.computeVertexNormals();
  return merged;
};
