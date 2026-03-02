export function degToRadian(deg: number): number {
  return (deg / 180) * Math.PI;
}

export function changedMatrix(m: number[]): boolean {
  return (
    m[0] !== 1 ||
    m[1] !== 0 ||
    m[2] !== 0 ||
    m[3] !== 1 ||
    m[4] !== 0 ||
    m[5] !== 0
  );
}

export function translate(matrix: number[], x: number, y: number): number[] {
  matrix[4] += x;
  matrix[5] += y;
  return matrix;
}

export function rotate(matrix: number[], deg: number, isRadian = false) {
  let rad = deg;
  if (!isRadian) {
    rad = degToRadian(deg);
  }
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const a00 = matrix[0];
  const a10 = matrix[1];
  const a01 = matrix[2];
  const a11 = matrix[3];
  const a02 = matrix[4];
  const a12 = matrix[5];

  matrix[0] = a00 * cos + a10 * sin;
  matrix[1] = -a00 * sin + a10 * cos;
  matrix[2] = a01 * cos + a11 * sin;
  matrix[3] = -a01 * sin + cos * a11;
  matrix[4] = cos * a02 + sin * a12;
  matrix[5] = cos * a12 - sin * a02;

  return matrix;
}

export function scale(matrix: number[], sx: number, sy: number) {
  matrix[0] *= sx;
  matrix[1] *= sy;
  matrix[2] *= sx;
  matrix[3] *= sy;
  matrix[4] *= sx;
  matrix[5] *= sy;

  return matrix;
}

export function invert(matrix: number[]): number[] | null {
  const a00 = matrix[0];
  const a10 = matrix[1];
  const a01 = matrix[2];
  const a11 = matrix[3];
  const a02 = matrix[4];
  const a12 = matrix[5];

  let det = a00 * a11 - a10 * a01;
  if (!det) {
    return null;
  }
  det = 1.0 / det;

  matrix[0] = a11 * det;
  matrix[1] = -a10 * det;
  matrix[2] = -a01 * det;
  matrix[3] = a00 * det;
  matrix[4] = (a01 * a12 - a11 * a02) * det;
  matrix[5] = (a10 * a02 - a00 * a12) * det;
  return matrix;
}

export function multiply(m1: number[], m2: number[], out: number[]): number[] {
  const out0 = m1[0] * m2[0] + m1[2] * m2[1];
  const out1 = m1[1] * m2[0] + m1[3] * m2[1];
  const out2 = m1[0] * m2[2] + m1[2] * m2[3];
  const out3 = m1[1] * m2[2] + m1[3] * m2[3];
  const out4 = m1[0] * m2[4] + m1[2] * m2[5] + m1[4];
  const out5 = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];
  out[0] = out0;
  out[1] = out1;
  out[2] = out2;
  out[3] = out3;
  out[4] = out4;
  out[5] = out5;
  return out;
}

export function pointMultiply(
  point: { x: number; y: number },
  matrix: number[]
): { x: number; y: number } {
  const { x, y } = point;
  return {
    x: matrix[0] * x + matrix[2] * y + matrix[4],
    y: matrix[1] * x + matrix[3] * y + matrix[5],
  };
}

export const MatrixUtils = {
  changedMatrix,
  rotate,
  translate,
  scale,
  invert,
  multiply,
  pointMultiply,
};
