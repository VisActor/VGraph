import { isMathEqual, normalizeVector } from '../../utils/math';
import { Point } from '../../typings/renderer';

export function getDimAt(t: number, a: number, b: number) {
  return (b - a) * t + a;
}

export function getProjectionDist(target: Point, x1: number, y1: number, x2: number, y2: number): number {
  const d = [x2 - x1, y2 - y1];
  if (isMathEqual(d[0], 0) && isMathEqual(d[1], 0)) {
    return NaN;
  }
  let u = [-d[1], d[0]];
  u = normalizeVector(u);
  const a = [target.x - x1, target.y - y1];
  return Math.abs(a[0] * u[0] + a[1] * u[1]);
}

export function drawArc(ctx: CanvasRenderingContext2D, pathSegment: any) {
  const [, cx, cy, rx, ry, theta, dTheta, psi, fs] = pathSegment.configs.params;
  const r = (rx > ry) ? rx : ry;
  const scaleX = (rx > ry) ? 1 : rx / ry;
  const scaleY = (rx > ry) ? ry / rx : 1;

  ctx.translate(cx, cy);
  ctx.rotate(psi);
  ctx.scale(scaleX, scaleY);
  ctx.arc(0, 0, r, theta, theta + dTheta, !!(1 - fs));
  ctx.scale(1 / scaleX, 1 / scaleY);
  ctx.rotate(-psi);
  ctx.translate(-cx, -cy);
}

export function getArcProjectionDist(target: Point, cx: number, cy: number, r: number, startAngle: number, endAngle: number, clockwise: number, out: number[] = []) {
  const v = [target.x, target.y];
  const v0 = [cx, cy];
  const v1 = [1, 0];
  const subv = [v[0] - v0[0], v[1] - v0[1],];
  const theta = (v1[0] * subv[0] + v1[1] * subv[1])
    / (Math.hypot(v1[0], v1[1]) * Math.hypot(subv[0], subv[1]));
  let angle = Math.acos(Math.min(1, Math.max(-1, theta)));
  if (v1[0] * subv[1] - subv[0] * v1[1] < 0) {
    angle = Math.PI * 2 - angle;
  }
  angle = nearAngle(angle, startAngle, endAngle, clockwise);
  const vpoint = [r * Math.cos(angle) + cx, r * Math.sin(angle) + cy];
  out[0] = vpoint[0];
  out[1] = vpoint[1];
  const d = Math.sqrt((target.x - vpoint[0]) * (target.x - vpoint[0]) + (target.y - vpoint[1]) * (target.y - vpoint[1]));
  return d;
}

function angleNearTo(angle: number, min: number, max: number, out = false) {
  let v1 = min;
  let v2 = max;
  if (out) {
    if (angle < min) {
      v1 = min - angle;
      v2 = Math.PI * 2 - max + angle;
    } else if (angle > max) {
      v1 = Math.PI * 2 - angle + min;
      v2 = angle - max;
    }
  } else {
    v1 = angle - min;
    v2 = max - angle;
  }

  return v1 > v2 ? max : min;
}

function nearAngle(angle: number, startAngle: number, endAngle: number, clockwise: number): number {
  let plus = 0;
  const PI2 = Math.PI * 2;
  if (endAngle - startAngle >= PI2) {
    plus = PI2;
  }
  startAngle = startAngle % PI2;
  endAngle = endAngle % PI2 + plus;
  angle = angle % PI2;
  if (clockwise) {
    if (startAngle >= endAngle) {
      if (angle > endAngle && angle < startAngle) {
        return angle;
      }
      return angleNearTo(angle, endAngle, startAngle, true);
    }
    if (angle < startAngle || angle > endAngle) {
      return angle;
    }
    return angleNearTo(angle, startAngle, endAngle);
  }
  if (startAngle <= endAngle) {
    if (startAngle < angle && angle < endAngle) {
      return angle;
    }
    return angleNearTo(angle, startAngle, endAngle, true);
  }
  if (angle > startAngle || angle < endAngle) {
    return angle;
  }
  return angleNearTo(angle, endAngle, startAngle);
}

function getArcLength(params: any): number {
  const [, , , rx, ry, , dTheta] = params;
  const radDiff = Math.abs(dTheta);
  // 大多数情况下是圆，先判断圆
  if (rx === ry) {
    return radDiff * rx;
  }
  const lambda = Math.pow(Math.abs(rx - ry) / (rx + ry), 2);
  const r = Math.PI * (rx + ry) * ((3 * lambda) / (10 + Math.sqrt(4 - 3 * lambda) + 1));
  return r * (radDiff / 2 * Math.PI);
}

export default {
  getDimAt,
  getProjectionDist,
  drawArc,
  getArcProjectionDist,
  getArcLength,
}
