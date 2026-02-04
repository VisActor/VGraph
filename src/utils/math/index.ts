const EPSILON = 1e-8;
const PI = Math.PI;

export function isMathEqual(x: number, y: number) {
  return Math.abs(x - y) < EPSILON;
}

export function getNormalizedRad(rad: number) {
  let reverse = false;
  if (rad < 0) {
    rad += PI * 2;
  }
  rad = rad % (PI * 2);
  if (rad > 1 / 2 * PI && rad < 3 / 2 * PI) {
    reverse = true;
    rad -= PI;
  }
  return { rad, reverse };
}

export function getPointDist(v1: number[], v2: number[]): number {
  return (v1[0] - v2[0]) * (v1[0] - v2[0])
    + (v1[1] - v2[1]) * (v1[1] - v2[1]);
}

export {
  degToRadian, changedMatrix, translate, rotate, scale, invert,
  multiply, pointMultiply, MatrixUtils
} from './matrix';

export {
  normalizeVector, dotMultiply,
  crossMultiply, changeCoordinateBasis, VectorUtils
} from './vector';