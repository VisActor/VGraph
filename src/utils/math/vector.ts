export function normalizeVector(v: number[]): number[] {
  const x = v[0];
  const y = v[1];
  let len = x * x + y * y;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  return [x * len, y * len];
}

export function dotMultiply(vector1: number[], vector2: number[]): number {
  const [u1, u2] = vector1;
  const [v1, v2] = vector2;
  return u1 * v1 + u2 * v2;
}

export function crossMultiply(vector1: number[], vector2: number[]): number {
  const [u1, u2] = vector1;
  const [v1, v2] = vector2;
  return u1 * v2 - u2 * v1;
}

export function changeCoordinateBasis(vector: number[], newBasisX: number[], newBasisY: number[]): number[] {
  // vector = u * x + v * y
  const u = crossMultiply(vector, newBasisY) / crossMultiply(newBasisX, newBasisY);
  const v = crossMultiply(vector, newBasisX) / crossMultiply(newBasisY, newBasisX);
  return [u, v];
}

export const VectorUtils = {
  normalizeVector,
  dotMultiply,
  crossMultiply,
  changeCoordinateBasis
}