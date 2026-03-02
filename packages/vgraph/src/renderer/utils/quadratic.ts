import { isMathEqual, getPointDist } from "../../utils/math";

export function getDimAt(
  t: number,
  p0: number,
  p1: number,
  p2: number
): number {
  const nt = 1 - t;
  return p0 * nt * nt + p1 * 2 * t * nt + p2 * t * t;
}

export function getExtrema(p0: number, p1: number, p2: number): number {
  const divider = p0 + p2 - 2 * p1;
  if (isMathEqual(divider, 0)) {
    return 0.5;
  }
  return Math.min(Math.max((p0 - p1) / divider, 0), 1);
}

export function getLength(
  p0: number[],
  p1: number[],
  p2: number[],
  iteration: number
): number {
  let px = p0[0];
  let py = p0[1];

  let d = 0;
  const step = 1 / iteration;

  for (let i = 1; i <= iteration; i++) {
    const t = i * step;
    const x = getDimAt(t, p0[0], p1[0], p2[0]);
    const y = getDimAt(t, p0[1], p1[1], p2[1]);

    const dx = x - px;
    const dy = y - py;
    d += Math.sqrt(dx * dx + dy * dy);

    px = x;
    py = y;
  }
  return d;
}

export function getProjectionDist(
  target: number[],
  p0: number[],
  p1: number[],
  p2: number[],
  out: number[] = []
): number {
  let t = 0;
  let interval = 0.005;
  let d = Infinity;
  const _v0 = [target[0], target[1]];
  const _v1 = [];
  const _v2 = [];
  const EPSILON = 0.0001;

  for (let _t = 0; _t < 1; _t += 0.05) {
    _v1[0] = getDimAt(_t, p0[0], p1[0], p2[0]);
    _v1[1] = getDimAt(_t, p0[1], p1[1], p2[1]);
    const d1 = getPointDist(_v0, _v1);
    if (d1 < d) {
      t = _t;
      d = d1;
    }
  }
  d = Infinity;

  // 二分查找投影点，迭代 32 次或精度达到停止
  for (let i = 0; i < 32; i++) {
    if (interval < EPSILON) {
      break;
    }
    const prev = t - interval;
    const next = t + interval;

    _v1[0] = getDimAt(prev, p0[0], p1[0], p2[0]);
    _v1[1] = getDimAt(prev, p0[1], p1[1], p2[1]);

    const d1 = getPointDist(_v1, _v0);

    if (prev >= 0 && d1 < d) {
      t = prev;
      d = d1;
    } else {
      _v2[0] = getDimAt(next, p0[0], p1[0], p2[0]);
      _v2[1] = getDimAt(next, p0[1], p1[1], p2[1]);
      const d2 = getPointDist(_v2, _v0);
      if (next <= 1 && d2 < d) {
        t = next;
        d = d2;
      } else {
        interval *= 0.5;
      }
    }
  }
  if (out) {
    out[0] = getDimAt(t, p0[0], p1[0], p2[0]);
    out[1] = getDimAt(t, p0[1], p1[1], p2[1]);
  }
  return Math.sqrt(d);
}

export function drawPath(
  ctx: CanvasRenderingContext2D,
  p0: number[],
  p1: number[],
  p2: number[]
) {
  ctx.beginPath();
  ctx.moveTo(p0[0], p0[1]);
  ctx.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]);
}

export function getQuadraticBBox(p0: number[], p1: number[], p2: number[]) {
  const xExtrema = getExtrema(p0[0], p1[0], p2[0]);
  const yExtrema = getExtrema(p0[1], p1[1], p2[1]);
  const x = getDimAt(xExtrema, p0[0], p1[0], p2[0]);
  const y = getDimAt(yExtrema, p0[1], p1[1], p2[1]);
  const minX = Math.min(p0[0], p2[0], x);
  const maxX = Math.max(p0[0], p2[0], x);
  const minY = Math.min(p0[1], p2[1], y);
  const maxY = Math.max(p0[1], p2[1], y);
  return {
    minX,
    minY,
    maxX,
    maxY,
  };
}

export default {
  getQuadraticBBox,
  getDimAt,
  getExtrema,
  getLength,
  getProjectionDist,
  drawPath,
};
