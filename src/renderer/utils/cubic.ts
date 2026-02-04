import { isMathEqual, getPointDist } from '../../utils/math';

export function getDimAt(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const nt = 1 - t;
  return p0 * Math.pow(nt, 3)
    + p1 * 3 * t * nt * nt
    + p2 * 3 * t * t * nt
    + p3 * Math.pow(t, 3);
}

export function getExtrema(p0: number, p1: number, p2: number, p3: number): number[] {
  const b = 6 * p2 - 12 * p1 + 6 * p0;
  const a = 9 * p1 + 3 * p3 - 3 * p0 - 9 * p2;
  const c = 3 * p1 - 3 * p0;
  const extrema = [];

  if (isMathEqual(a, 0)) {
    if (!isMathEqual(b, 0)) {
      const t1 = -c / b;
      if (t1 >= 0 && t1 <= 1) {
        extrema.push(t1);
      }
    }
  }
  else {
    const disc = b * b - 4 * a * c;
    if (isMathEqual(disc, 0)) {
      extrema[0] = -b / (2 * a);
    }
    else if (disc > 0) {
      const discSqrt = Math.sqrt(disc);
      const t1 = (-b + discSqrt) / (2 * a);
      const t2 = (-b - discSqrt) / (2 * a);
      if (t1 >= 0 && t1 <= 1) {
        extrema.push(t1);
      }
      if (t2 >= 0 && t2 <= 1) {
        extrema.push(t2);
      }
    }
  }
  return extrema;
}

export function getCubicBox(p0: number[], p1: number[], p2: number[], p3: number[]) {
  const xExtremas = getExtrema(p0[0], p1[0], p2[0], p3[0]);
  const yExtremas = getExtrema(p0[1], p1[1], p2[1], p3[1]);
  const xPoints = [p0[0], p3[0]];
  const yPoints = [p0[1], p3[1]];

  for (const xExtrema of xExtremas) {
    xPoints.push(getDimAt(xExtrema, p0[0], p1[0], p2[0], p3[0]));
  }

  for (const yExtrema of yExtremas) {
    yPoints.push(getDimAt(yExtrema, p0[1], p1[1], p2[1], p3[1]));
  }

  // eslint-disable-next-line prefer-spread
  const minX = Math.min.apply(Math, xPoints);
  // eslint-disable-next-line prefer-spread
  const maxX = Math.max.apply(Math, xPoints);
  // eslint-disable-next-line prefer-spread
  const minY = Math.min.apply(Math, yPoints);
  // eslint-disable-next-line prefer-spread
  const maxY = Math.max.apply(Math, yPoints);

  return { minX, minY, maxX, maxY };
}

export function cubicDerivativeAt(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const nt = 1 - t;
  return 3 * (
    ((p1 - p0) * nt + 2 * (p2 - p1) * t) * nt
    + (p3 - p2) * t * t);
}

export function getLength(p0: number[], p1: number[], p2: number[], p3: number[], iteration: number): number {
  let px = p0[0];
  let py = p0[1];

  let d = 0;
  const step = 1 / iteration;

  for (let i = 1; i <= iteration; i++) {
    const t = i * step;
    const x = getDimAt(t, p0[0], p1[0], p2[0], p3[0]);
    const y = getDimAt(t, p0[1], p1[1], p2[1], p3[1]);

    const dx = x - px;
    const dy = y - py;
    d += Math.sqrt(dx * dx + dy * dy);

    px = x;
    py = y;
  }
  return d;
}

export function getProjectionDist(target: number[], p0: number[], p1: number[], p2: number[], p3: number[], out: number[] = []): number {
  let t = 0;
  let interval = 0.005;
  let d = Infinity;
  let prev;
  let next;
  let d1;
  let d2;
  const _v0 = [target[0], target[1]];
  const _v1 = [];
  const _v2 = [];

  for (let _t = 0; _t < 1; _t += 0.05) {
    _v1[0] = getDimAt(_t, p0[0], p1[0], p2[0], p3[0]);
    _v1[1] = getDimAt(_t, p0[1], p1[1], p2[1], p3[1]);

    d1 = getPointDist(_v0, _v1);
    if (d1 < d) {
      t = _t;
      d = d1;
    }
  }
  d = Infinity;

  for (let i = 0; i < 32; i++) {
    if (interval < 0.0001) {
      break;
    }
    prev = t - interval;
    next = t + interval;

    _v1[0] = getDimAt(prev, p0[0], p1[0], p2[0], p3[0]);
    _v1[1] = getDimAt(prev, p0[1], p1[1], p2[1], p3[1]);

    d1 = getPointDist(_v1, _v0);

    if (prev >= 0 && d1 < d) {
      t = prev;
      d = d1;
    }
    else {
      _v2[0] = getDimAt(next, p0[0], p1[0], p2[0], p3[0]);
      _v2[1] = getDimAt(next, p0[1], p1[1], p2[1], p3[1]);
      d2 = getPointDist(_v2, _v0);

      if (next <= 1 && d2 < d) {
        t = next;
        d = d2;
      }
      else {
        interval *= 0.5;
      }
    }
  }
  if (out) {
    out[0] = getDimAt(t, p0[0], p1[0], p2[0], p3[0]);
    out[1] = getDimAt(t, p0[1], p1[1], p2[1], p3[1]);
  }
  return Math.sqrt(d);
}

export function drawPath(ctx: CanvasRenderingContext2D, p0: number[], p1: number[], p2: number[], p3: number[]) {
  ctx.beginPath();
  ctx.moveTo(p0[0], p0[1]);
  ctx.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
}

export default {
  getDimAt,
  getExtrema,
  getLength,
  getProjectionDist,
  drawPath,
}
