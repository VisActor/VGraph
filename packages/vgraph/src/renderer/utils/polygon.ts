import { crossMultiply } from "../../utils/math";
import { getProjectionDist as getLineDist } from "./line";

export function drawPath(ctx: CanvasRenderingContext2D, points: number[][]) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.closePath();
}

export function calculateRegularNPolygon(
  n: number,
  radius: number
): number[][] {
  const angle = (Math.PI * 2) / n;
  const points = [];
  for (let i = 0; i < n; i++) {
    points.push([radius * Math.sin(angle * i), radius * Math.cos(angle * i)]);
  }
  return points;
}

export function calculateRegularNPolygonByEdgeLength(
  n: number,
  edgeLength: number
): number[][] {
  const angle = Math.PI / n;
  const radius = edgeLength / 2 / Math.sin(angle);
  return calculateRegularNPolygon(n, radius);
}

export function calculateNPointStar(
  n: number,
  outerRadius: number,
  innerRadius?: number
): number[][] {
  const angle = Math.PI / n;
  if (!innerRadius) {
    innerRadius = (outerRadius * Math.cos(2 * angle)) / Math.cos(angle);
  }
  const points = [];
  for (let i = 0; i < n; i++) {
    points.push([
      outerRadius * Math.sin(2 * i * angle),
      -outerRadius * Math.cos(2 * i * angle),
    ]);
    points.push([
      innerRadius * Math.sin((2 * i + 1) * angle),
      -innerRadius * Math.cos((2 * i + 1) * angle),
    ]);
  }
  return points;
}

export function isPointInTriangle(point: number[], triangle: number[][]) {
  const [a, b, c] = triangle;
  // 同向法
  const pa = [a[0] - point[0], a[1] - point[1]];
  const pb = [b[0] - point[0], b[1] - point[1]];
  const pc = [c[0] - point[0], c[1] - point[1]];
  const d1 = crossMultiply(pa, pb);
  const d2 = crossMultiply(pb, pc);
  const d3 = crossMultiply(pc, pa);
  return d1 * d2 >= 0 && d1 * d3 >= 0 && d2 * d3 >= 0;
}

export function isPointInPolygon(point: number[], polygon: number[][]) {
  const n = polygon.length - 1;
  let inPoligon = false;
  // 向右引出射线
  for (let i = 0, j = n; i < n; j = i++) {
    const p1 = polygon[i];
    const p2 = polygon[j];
    if (onSegment(p1, p2, point)) {
      return true;
    } // 点在线段上
    if (onLeft(p1, p2, point)) {
      inPoligon = !inPoligon;
    }
  }
  return inPoligon;
}

export function isPointInPolygonStroke(
  point: number[],
  polygon: number[][],
  lineWidth: number
) {
  const n = polygon.length - 1;
  for (let i = 0, j = n; i < n; j = i++) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[j];
    if (
      getLineDist({ x: point[0], y: point[1] }, x1, y1, x2, y2) <= lineWidth
    ) {
      return true;
    }
  }
}

function onLeft(p1: number[], p2: number[], point: number[]) {
  // 判断point是否在线段p1,p2左侧
  const [x, y] = point;
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const dy1 = y1 - y;
  const dy2 = y2 - y;
  const inverseSlope = (x1 - x2) / (y1 - y2);
  // 判断point在p1,p2的y值域内（忽略相切的点或线段），且point在其向右的射线与线段交点左侧
  return dy1 > 0 !== dy2 > 0 && x - (y - y1) * inverseSlope - x1 < 0;
}

function onSegment(p1: number[], p2: number[], point: number[]) {
  // 判断point是否在线段p1,p2上
  const [x, y] = point;
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const dx1 = x1 - x;
  const dx2 = x2 - x;
  const dy1 = y1 - y;
  const dy2 = y2 - y;
  // 判断点是否在直线p1,p2上，并判断点是否在线段p1,p2的范围内
  return dx1 * dy2 - dx2 * dy1 === 0 && dx1 * dx2 + dy1 * dy2 <= 0;
}

export default {
  drawPath,
  isPointInPolygon,
};
