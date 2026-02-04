
/* eslint-disable no-case-declarations */
import { degToRadian } from '../../utils/math';
import { BBox, Point } from '../../typings/renderer';
import lineUtil from './line';
import * as cubicUtil from './cubic';
import quadratic from './quadratic';

export type Segment = {
  // 在图场景下，线条更多的是直线，或圆角直线，很少有贝塞尔曲线和其他的组合。
  // 所以先对 path 进行简化，支持 M, L, H, V, A, Z。有场景再补上 C,S,Q,T
  type: 'line' | 'arc' | 'cubic' | 'quadratic';
  length: number;
  configs: any;
}

function toAbsolute(x: number, y: number, prePoint: Point) {
  if (!prePoint) {
    return { x, y };
  }
  return {
    x: prePoint.x + x,
    y: prePoint.y + y,
  }
}

export function pathToSegments(paths: any, startArrow: boolean, endArrow: boolean) {
  let lastPoint: Point = { x: 0, y: 0 };
  let startPoint: any = {};
  let nextMove = false;
  let point;
  let len = 0;
  let currentLength = 0;
  const segments: Segment[] = [];
  for (const path of paths) {
    // 相对 or 绝对坐标
    const relative = /[a-z]/.test(path[0]);
    switch (path[0]) {
      case 'M':
      case 'm':
        lastPoint = relative ? toAbsolute(path[1], path[2], lastPoint) : {
          x: path[1],
          y: path[2],
        }
        // 更新新的起点
        startPoint = Object.assign({}, lastPoint);
        nextMove = true;
        break;
      case 'L':
      case 'l':
        point = relative ? toAbsolute(path[1], path[2], lastPoint) : {
          x: path[1],
          y: path[2],
        };
        currentLength = Math.hypot(lastPoint.x - point.x, lastPoint.y - point.y);
        segments.push({
          length: currentLength,
          type: 'line',
          configs: {
            points: [lastPoint, point],
            move: nextMove,
          },
        });
        nextMove = false;
        lastPoint = point;
        break;
      case 'H':
      case 'h':
        point = relative ? toAbsolute(path[1], 0, lastPoint) : {
          x: path[1],
          y: lastPoint.y,
        };
        currentLength = Math.abs(point.x - lastPoint.x);
        segments.push({
          type: 'line',
          length: currentLength,
          configs: {
            points: [lastPoint, point],
            move: nextMove,
          }
        });
        nextMove = false;
        lastPoint = point;
        break;
      case 'V':
      case 'v':
        point = relative ? toAbsolute(0, path[1], lastPoint) : {
          x: lastPoint.x,
          y: path[1],
        };
        currentLength = Math.abs(point.y - lastPoint.y);
        segments.push({
          type: 'line',
          length: currentLength,
          configs: {
            points: [lastPoint, point],
            move: nextMove,
          }
        });
        nextMove = false;
        lastPoint = point;
        break;
      case 'A':
      case 'a':
        const rx = path[1];
        const ry = path[2];
        const psi = path[3];
        const fa = path[4];
        const fs = path[5];
        point = relative ? toAbsolute(path[6], path[7], lastPoint) : {
          x: path[6],
          y: path[7]
        };
        const params = getArcParams(lastPoint, point, fa, fs, rx, ry, psi);
        currentLength = lineUtil.getArcLength(params);
        segments.push({
          type: 'arc',
          length: currentLength,
          configs: {
            move: nextMove,
            points: [lastPoint, point],
            params,
            psi,
          },
        });
        lastPoint = point;
        nextMove = false;
        break;
      case 'C':
      case 'c':
        const p1 = Object.assign({}, lastPoint);
        const p2 = relative ? toAbsolute(path[1], path[2], lastPoint) : { x: path[1], y: path[2] };
        const p3 = relative ? toAbsolute(path[3], path[4], lastPoint) : { x: path[3], y: path[4] };
        const p4 = relative ? toAbsolute(path[5], path[6], lastPoint) : { x: path[5], y: path[6] };
        currentLength = cubicUtil.getLength([p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y], [p4.x, p4.y], 24);
        segments.push({
          type: 'cubic',
          length: currentLength,
          configs: {
            move: nextMove,
            points: [p1, p2, p3, p4],
          }
        });
        nextMove = false;
        lastPoint = p4;
        break;
      case 'Q':
      case 'q':
        const qp1 = Object.assign({}, lastPoint);
        const qp2 = relative ? toAbsolute(path[1], path[2], lastPoint) : { x: path[1], y: path[2] };
        const qp3 = relative ? toAbsolute(path[3], path[4], lastPoint) : { x: path[3], y: path[4] };
        if (path[5] !== undefined) {
          currentLength = path[5];
          // 内置连线所使用的 Q 均为圆弧线的一部分，可以精确计算弧长并传入此处
        } else {
          currentLength = quadratic.getLength([qp1.x, qp1.y], [qp2.x, qp2.y], [qp3.x, qp3.y], 24);
        }
        segments.push({
          type: 'quadratic',
          length: currentLength,
          configs: {
            move: nextMove,
            points: [qp1, qp2, qp3],
          }
        });
        nextMove = false;
        lastPoint = qp3;
        break;
      case 'Z':
      case 'z':
        currentLength = Math.hypot(lastPoint.x - startPoint.x, lastPoint.y - startPoint.y);
        segments.push({
          type: 'line',
          length: currentLength,
          configs: {
            points: [lastPoint, startPoint],
            move: nextMove,
          }
        });
        lastPoint = { x: 0, y: 0 };
        startPoint = { x: 0, y: 0 };
        break;
      default:
        break;
    }
    len += currentLength;
  }
  return { segments, length: len };
}

function vectorDist(v: number[]) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

function vectorRatio(u: number[], v: number[]) {
  return (u[0] * v[0] + u[1] * v[1]) / (vectorDist(u) * vectorDist(v));
}

function vectorAngle(u: number[], v: number[]) {
  return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vectorRatio(u, v));
}

// https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
function getArcParams(point1: Point, point2: Point, fa: number, fs: number, rx: number, ry: number, psiDeg: number) {
  const rad = degToRadian(psiDeg);
  const psi = rad % (Math.PI * 2);
  const x1 = point1.x;
  const y1 = point1.y;
  const x2 = point2.x;
  const y2 = point2.y;
  const xp = Math.cos(psi) * (x1 - x2) / 2.0 + Math.sin(psi) * (y1 - y2) / 2.0;
  const yp = -1 * Math.sin(psi) * (x1 - x2) / 2.0 + Math.cos(psi) * (y1 - y2) / 2.0;
  const lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);

  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }

  let f = Math.sqrt((((rx * rx) * (ry * ry))
    - ((rx * rx) * (yp * yp)) - ((ry * ry) * (xp * xp)))
    / ((rx * rx) * (yp * yp) + (ry * ry) * (xp * xp)));
  if (fa === fs) {
    f *= -1;
  }
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(f)) {
    f = 0;
  }

  const cxp = f * rx * yp / ry;
  const cyp = f * -ry * xp / rx;
  const cx = (x1 + x2) / 2.0 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
  const cy = (y1 + y2) / 2.0 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;
  const theta = vectorAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
  const u = [(xp - cxp) / rx, (yp - cyp) / ry];
  const v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
  let dTheta = vectorAngle(u, v);

  if (vectorRatio(u, v) <= -1) {
    dTheta = Math.PI;
  }
  if (vectorRatio(u, v) >= 1) {
    dTheta = 0;
  }
  if (fs === 0 && dTheta > 0) {
    dTheta = dTheta - 2 * Math.PI;
  }
  if (fs === 1 && dTheta < 0) {
    dTheta = dTheta + 2 * Math.PI;
  }
  return [point1, cx, cy, rx, ry, theta, dTheta, psi, fs];
}

export function getSegmentsBBox(segments: Segment[]): BBox {
  let bbox: any = {};
  let currentBBox: any = {};
  for (const segment of segments) {
    const configs = segment.configs;
    if (segment.type === 'line') {
      const [p1, p2] = configs.points;
      currentBBox = {
        minX: Math.min(p1.x, p2.x),
        minY: Math.min(p1.y, p2.y),
        maxX: Math.max(p1.x, p2.x),
        maxY: Math.max(p1.y, p2.y),
      }
    } else if (segment.type === 'arc') {
      const [, cx, cy, rx, ry, theta, dTheta, psi, fs] = configs.params;
      const start = theta;
      const end = theta + dTheta;

      const xDim = ellipseUtil.xExtrema(psi, rx, ry);
      let minX = Infinity;
      let maxX = -Infinity;
      const xs = [start, end];
      for (let i = -Math.PI * 2; i <= Math.PI * 2; i += Math.PI) {
        const xAngle = xDim + i;
        if (fs === 1) {
          if (start < xAngle && xAngle < end) {
            xs.push(xAngle);
          }
        } else {
          if (end < xAngle && xAngle < start) {
            xs.push(xAngle);
          }
        }
      }

      for (let i = 0, l = xs.length; i < l; i++) {
        const x = ellipseUtil.xAt(psi, rx, ry, cx, xs[i]);
        if (x < minX) {
          minX = x;
        }
        if (x > maxX) {
          maxX = x;
        }
      }

      const yDim = ellipseUtil.yExtrema(psi, rx, ry);
      let minY = Infinity;
      let maxY = -Infinity;
      const ys = [start, end];
      for (let i = -Math.PI * 2; i <= Math.PI * 2; i += Math.PI) {
        const yAngle = yDim + i;
        if (fs === 1) {
          if (start < yAngle && yAngle < end) {
            ys.push(yAngle);
          }
        } else {
          if (end < yAngle && yAngle < start) {
            ys.push(yAngle);
          }
        }
      }

      for (let i = 0, l = ys.length; i < l; i++) {
        const y = ellipseUtil.yAt(psi, rx, ry, cy, ys[i]);
        if (y < minY) {
          minY = y;
        }
        if (y > maxY) {
          maxY = y;
        }
      }
      currentBBox = {
        minX,
        maxX,
        minY,
        maxY,
      };
    } else if (segment.type === 'cubic') {
      const [p0, p1, p2, p3] = segment.configs.points;
      currentBBox = cubicUtil.getCubicBox([p0.x, p0.y], [p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y]);
    }
    else if (segment.type === 'quadratic') {
      const [p0, p1, p2] = segment.configs.points;
      currentBBox = quadratic.getQuadraticBBox([p0.x, p0.y], [p1.x, p1.y], [p2.x, p2.y]);
    }

    if (bbox.minX === undefined) {
      bbox = currentBBox;
    } else {
      bbox = {
        minX: Math.min(currentBBox.minX, bbox.minX),
        minY: Math.min(currentBBox.minY, bbox.minY),
        maxX: Math.max(currentBBox.maxX, bbox.maxX),
        maxY: Math.max(currentBBox.maxY, bbox.maxY),
      }
    }
  }
  return {
    left: bbox.minX,
    top: bbox.minY,
    width: bbox.maxX - bbox.minX,
    height: bbox.maxY - bbox.minY
  }
}

export const ellipseUtil = {
  xAt(psi: number, rx: number, ry: number, cx: number, t: number) {
    return rx * Math.cos(psi) * Math.cos(t) - ry * Math.sin(psi) * Math.sin(t) + cx;
  },
  yAt(psi: number, rx: number, ry: number, cy: number, t: number) {
    return rx * Math.sin(psi) * Math.cos(t) + ry * Math.cos(psi) * Math.sin(t) + cy;
  },
  xExtrema(psi: number, rx: number, ry: number) {
    return Math.atan((-ry / rx) * Math.tan(psi));
  },
  yExtrema(psi: number, rx: number, ry: number) {
    return Math.atan((ry / (rx * Math.tan(psi))));
  },
};
