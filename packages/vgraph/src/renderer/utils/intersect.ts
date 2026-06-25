import { Path } from "../shapes/path";
import { Cubic } from "../shapes/cubic";
import { Quadratic } from "../shapes/quadratic";
import { BBox, Point } from "../../typings/renderer";

const stops = [
  0, 0.041666666666666664, 0.08333333333333333, 0.125, 0.16666666666666666,
  0.20833333333333331, 0.25, 0.29166666666666663, 0.3333333333333333, 0.375,
  0.41666666666666663, 0.4583333333333333, 0.5, 0.5416666666666666,
  0.5833333333333333, 0.625, 0.6666666666666666, 0.7083333333333333, 0.75,
  0.7916666666666666, 0.8333333333333333, 0.875, 0.9166666666666666,
  0.9583333333333333, 1,
];
const hypot = Math.hypot;

export function isPointIntersect(point: Point, bbox: BBox) {
  return (
    bbox.left <= point.x &&
    point.x <= bbox.left + bbox.width &&
    bbox.top <= point.y &&
    point.y <= bbox.top + bbox.height
  );
}

export function isRectIntersect(bbox1: BBox, bbox2: BBox) {
  if (bbox1.left > bbox2.left + bbox2.width) {
    return false;
  }
  if (bbox1.left + bbox1.width < bbox2.left) {
    return false;
  }
  if (bbox1.top > bbox2.top + bbox2.height) {
    return false;
  }
  if (bbox1.top + bbox1.height < bbox2.top) {
    return false;
  }
  return true;
}

export function isPathIntersect(path: Path | Cubic | Quadratic, bbox: BBox) {
  const edgeBox = path.getBBox();
  const hitWidth = path.getHitWidth();
  const halfWidth = hitWidth / 2;
  if (!isRectIntersect(bbox, edgeBox)) {
    return false;
  }
  for (const stop of stops) {
    const point = path.getPointAt(stop);
    if (
      isRectIntersect(
        {
          left: point.x - halfWidth,
          top: point.y - halfWidth,
          width: hitWidth,
          height: hitWidth,
        },
        bbox
      )
    ) {
      return true;
    }
  }
  return false;
}

export function getNearestPoint(anchors: number[][], point: number[]) {
  let result = 0;
  let min = Infinity;
  const [x, y] = point;
  for (let i = 0; i < anchors.length; i++) {
    const anchor = anchors[i];
    const dist = hypot(anchor[0] - x, anchor[1] - y);
    if (dist < min) {
      min = dist;
      result = i;
    }
  }
  return result;
}

export function getCircleIntersect(
  bbox: BBox,
  point: number[]
): [number, number] | null {
  const [x, y] = point;
  const cx = bbox.left + bbox.width / 2;
  const cy = bbox.top + bbox.height / 2;
  const r = bbox.width / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = hypot(dx, dy);
  if (dist < r) {
    return null;
  }
  const radian = Math.atan(dy / dx);
  return [
    cx + Math.abs(r * Math.cos(radian)) * Math.sign(dx),
    cy + Math.abs(r * Math.sin(radian)) * Math.sign(dy),
  ];
}

// 忽略半径的阈值，若圆角半径小于该值则忽略圆角接触点的计算
const RADIUS_IGNORE_THRESHOLD = 4;

export function getRectIntersect(
  bbox: BBox,
  point: number[],
  radius?: number | number[]
) {
  const { left, top, width, height } = bbox;
  const [x, y] = point;
  const minX = left;
  const maxX = left + width;
  const minY = top;
  const maxY = top + height;
  let points: any = null;
  let minDist = Infinity;
  if (x > minX && x < maxX && y > minY && y < maxY) {
    return null;
  }

  // 与边界重叠的情况下直接返回，避免精度损失。
  if (x === minX && y > minY && y < maxY) {
    return [minX, y];
  }
  if (x === maxX && y > minY && y < maxY) {
    return [maxX, y];
  }
  if (y === minY && x > minX && x < maxX) {
    return [x, minY];
  }
  if (y === maxY && x > minX && x < maxX) {
    return [x, maxY];
  }

  const diffX = left + width / 2 - x;
  const diffY = top + height / 2 - y;
  if (diffX === 0) {
    if (Math.abs(y - minY) > Math.abs(y - maxY)) {
      return [x, maxY];
    } else {
      return [x, minY];
    }
  }
  const a = diffY / diffX;
  const b = y - a * x;

  function getMinDist(x0: number, y0: number) {
    const pointDist = hypot(x0 - x, y0 - y);
    if (!points) {
      points = [x0, y0];
      minDist = pointDist;
    } else if (minDist > pointDist) {
      points = [x0, y0];
    }
  }

  // left
  let y1 = a * minX + b;
  if (y1 >= minY && y1 <= maxY) {
    getMinDist(minX, y1);
  }
  // right
  y1 = a * maxX + b;
  if (y1 >= minY && y1 <= maxY) {
    getMinDist(maxX, y1);
  }
  // top
  let x1 = (minY - b) / a;
  if (x1 >= minX && x1 <= maxX) {
    getMinDist(x1, minY);
  }
  // bottom
  x1 = (maxY - b) / a;
  if (x1 >= minX && x1 <= maxX) {
    getMinDist(x1, maxY);
  }

  if (radius) {
    if (typeof radius === "number") {
      if (radius <= RADIUS_IGNORE_THRESHOLD) {
        return points;
      }
      radius = [radius, radius, radius, radius];
    }
    let center: number[] = [];
    let rad = null;
    if (
      radius[0] > RADIUS_IGNORE_THRESHOLD &&
      points[0] < minX + radius[0] &&
      points[1] < minY + radius[0]
    ) {
      // 左上
      center = [minX + radius[0], minY + radius[0]];
      rad = radius[0];
    } else if (
      radius[1] > RADIUS_IGNORE_THRESHOLD &&
      points[0] > maxX - radius[1] &&
      points[1] < minY + radius[1]
    ) {
      // 右上
      center = [maxX - radius[1], minY + radius[1]];
      rad = radius[1];
    } else if (
      radius[2] > RADIUS_IGNORE_THRESHOLD &&
      points[0] > maxX - radius[2] &&
      points[1] > maxY - radius[2]
    ) {
      // 右下
      center = [maxX - radius[2], maxY - radius[2]];
      rad = radius[2];
    } else if (
      radius[3] > RADIUS_IGNORE_THRESHOLD &&
      points[0] < minX + radius[3] &&
      points[1] > maxY - radius[3]
    ) {
      // 左下
      center = [minX + radius[3], maxY - radius[3]];
      rad = radius[3];
    }
    if (rad) {
      const dx = points[0] - center[0];
      const dy = points[1] - center[1];
      const dist = hypot(dx, dy);
      points = [center[0] + (dx * rad) / dist, center[1] + (dy * rad) / dist];
    }
  }
  return points;
}

function pointDist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

export function pointToRectDist(point: Point, bbox: BBox) {
  const { x, y } = point;
  const { left, top, width, height } = bbox;
  if (y < top) {
    // 左上
    if (x < left) {
      return pointDist(x, y, left, top);
    }
    // 右上
    if (x > left + width) {
      return pointDist(x, y, left + width, top);
    }
    // 中上
    return Math.abs(y - top);
  }
  if (y > top && y < top + height) {
    // 左中
    if (x < left) {
      return Math.abs(x - left);
    }
    // 右中
    if (x > left + width) {
      return Math.abs(x - left - width);
    }
    return 0;
  }
  // 左下
  if (x < left) {
    return pointDist(x, y, left, top + height);
  }
  // 右下
  if (x > left + width) {
    return pointDist(x, y, left + width, top + height);
  }
  // 中下
  return Math.abs(y - top - height);
}
