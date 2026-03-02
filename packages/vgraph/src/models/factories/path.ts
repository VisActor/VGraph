import { getDimAt } from "../../renderer/utils/cubic";
import { Grid } from "../../components/grid";
import { adjustControlPoints } from "./edge";
import { NodeConfigs } from "../../typings/model";

const LOOP_TAN = Math.tan(Math.PI / 8);
const LOOP_SIN = Math.sin(Math.PI / 8);
const LOOP_COS = Math.cos(Math.PI / 8);
const MIN_LOOP_DIST = 12;

export function getCurveLoopAnchors(node: any, configs: any) {
  const { loop = {} } = configs;
  const { position, clockwise = true } = loop;
  const bbox = node.getBBox();
  let r = bbox.height / 2;
  if (position === "left" || position === "right") {
    r = bbox.width / 2;
  }
  const center = [node.get("x"), node.get("y")];
  let offset = r * LOOP_TAN;
  let bboxOffset = 0;
  if (configs.type === "circle") {
    offset = r * LOOP_SIN;
    bboxOffset = r * (1 - LOOP_COS);
  }
  let startPoint;
  let endPoint;
  switch (position) {
    case "left":
      startPoint = [bbox.left - bboxOffset, center[1] + offset];
      endPoint = [bbox.left - bboxOffset, center[1] - offset];
      break;
    case "right":
      startPoint = [bbox.left + bbox.width - bboxOffset, center[1] - offset];
      endPoint = [bbox.left + bbox.width - bboxOffset, center[1] + offset];
      break;
    case "bottom":
      startPoint = [center[0] + offset, bbox.top + bbox.height - bboxOffset];
      endPoint = [center[0] - offset, bbox.top + bbox.height - bboxOffset];
      break;
    default:
      startPoint = [center[0] - offset, bbox.top - bboxOffset];
      endPoint = [center[0] + offset, bbox.top - bboxOffset];
      break;
  }
  if (!clockwise) {
    const swap = [startPoint[0], startPoint[1]];
    startPoint = [endPoint[0], endPoint[1]];
    endPoint = [swap[0], swap[1]];
  }
  return { startPoint, endPoint };
}

export function getDefaultLoopAnchors(node: any, edgeConfigs: NodeConfigs) {
  const { loop = {} } = edgeConfigs;
  const { position = "top" } = loop;
  const { left, top, width, height } = node.getBBox();
  const x = left + width / 2;
  const y = top + height / 2;
  // 自环所在边 1/4 和 3/4 处
  switch (position) {
    case "top":
      return {
        startPoint: [x - width / 4, y - height / 2],
        endPoint: [x + width / 4, y - height / 2],
      };
    case "bottom":
      return {
        startPoint: [x - width / 4, y + height / 2],
        endPoint: [x + width / 4, y + height / 2],
      };
    case "left":
      return {
        startPoint: [x - width / 2, y - height / 4],
        endPoint: [x - width / 2, y + height / 4],
      };
    case "right":
      return {
        startPoint: [x + width / 2, y - height / 4],
        endPoint: [x + width / 2, y + height / 4],
      };
    default:
      return {
        startPoint: [x - width / 4, y - height / 2],
        endPoint: [x + width / 4, y - height / 2],
      };
  }
}

export function getLoopDist(dist: number, node: any, edgeConfigs: any) {
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(dist)) {
    return dist;
  }
  const { loop = {} } = edgeConfigs;
  const position = loop.position;
  const { width, height } = node.getBBox();
  // 若自环所在边是长边，取 1/4, 短边默认取 1/2
  if (position === "left" || position === "right") {
    return Math.max(MIN_LOOP_DIST, width / (width > height ? 4 : 2));
  }
  return Math.max(MIN_LOOP_DIST, height / (height > width ? 4 : 2));
}

export function getDefaultLoopPath(dist: number, edgeConfigs: any) {
  const { loop = {}, startPoint, endPoint } = edgeConfigs;
  const { position, radius = 2 } = loop;
  const [startX, startY] = startPoint;
  const [endX, endY] = endPoint;
  if (radius === 0) {
    const path = [["M", startPoint[0], startPoint[1]]];
    switch (position) {
      case "left":
        path.push(["L", startX - dist, startY]);
        path.push(["L", endX - dist, endY]);
        break;
      case "right":
        path.push(["L", startX + dist, startY]);
        path.push(["L", endX + dist, endY]);
        break;
      case "bottom":
        path.push(["L", startX, startY + dist]);
        path.push(["L", endX, endY + dist]);
        break;
      default:
        path.push(["L", startX, startY - dist]);
        path.push(["L", endX, endY - dist]);
    }
    path.push(["L", endPoint[0], endPoint[1]]);
    return path;
  }
  const qPathLength = 0.5 * Math.PI * radius;
  switch (position) {
    case "left":
      return [
        ["M", startX, startY],
        ["L", startX - dist + radius, startY],
        // [ 'A', radius, radius, 0, 0, 0, startX - dist, startY + radius ],
        [
          "Q",
          startX - dist,
          startY,
          startX - dist,
          startY + radius,
          qPathLength,
        ],
        ["L", startX - dist, endY - radius],
        // [ 'A', radius, radius, 0, 0, 0, endX - dist + radius, endY ],
        ["Q", startX - dist, endY, endX - dist + radius, endY, qPathLength],
        ["L", endX, endY],
      ];
    case "right":
      return [
        ["M", startX, startY],
        ["L", startX + dist - radius, startY],
        // [ 'A', radius, radius, 0, 0, 1, startX + dist, startY + radius ],
        [
          "Q",
          startX + dist,
          startY,
          startX + dist,
          startY + radius,
          qPathLength,
        ],
        ["L", startX + dist, endY - radius],
        // [ 'A', radius, radius, 0, 0, 1, endX + dist - radius, endY ],
        ["Q", startX + dist, endY, endX + dist - radius, endY, qPathLength],
        ["L", endX, endY],
      ];
    case "bottom":
      return [
        ["M", startX, startY],
        ["L", startX, startY + dist - radius],
        // [ 'A', radius, radius, 0, 0, 0, startX + radius, startY + dist ],
        [
          "Q",
          startX,
          startY + dist,
          startX + radius,
          startY + dist,
          qPathLength,
        ],
        ["L", endX - radius, endY + dist],
        // [ 'A', radius, radius, 0, 0, 0, endX, endY + dist - radius ],
        ["Q", endX, endY + dist, endX, endY + dist - radius, qPathLength],
        ["L", endX, endY],
      ];
    default:
      return [
        ["M", startX, startY],
        ["L", startX, startY - dist + radius],
        // [ 'A', radius, radius, 0, 0, 1, startX + radius, startY - dist ],
        [
          "Q",
          startX,
          startY - dist,
          startX + radius,
          startY - dist,
          qPathLength,
        ],
        ["L", endX - radius, endY - dist],
        // [ 'A', radius, radius, 0, 0, 1, endX, endY - dist + radius ],
        ["Q", endX, endY - dist, endX, endY - dist + radius, qPathLength],
        ["L", endX, endY],
      ];
  }
}

export function getRoundLoopPath(dist: number, edgeConfigs: any) {
  const { loop = {}, startPoint, endPoint } = edgeConfigs;
  const { position } = loop;
  const path = [["M", startPoint[0], startPoint[1]]];
  let r;
  switch (position) {
    case "left":
      r = (endPoint[1] - startPoint[1]) / 2;
      if (r > dist) {
        dist = r;
      }
      path.push(["L", startPoint[0] - dist + r, startPoint[1]]);
      path.push(["A", r, r, 0, 0, 0, startPoint[0] - dist + r, endPoint[1]]);
      // path.push([ 'Q', startPoint[0] - dist, startPoint[1], startPoint[0] - dist, startPoint[1] + r, 0.5 * Math.PI * r]);
      // path.push([ 'Q', startPoint[0] - dist, endPoint[1],  startPoint[0] - dist + r, endPoint[1], 0.5 * Math.PI * r]);
      break;
    case "right":
      r = (endPoint[1] - startPoint[1]) / 2;
      if (r > dist) {
        dist = r;
      }
      path.push(["L", startPoint[0] + dist - r, startPoint[1]]);
      path.push(["A", r, r, 0, 0, 1, startPoint[0] + dist - r, endPoint[1]]);
      // path.push([ 'Q', startPoint[0] + dist, startPoint[1], startPoint[0] + dist, startPoint[1] + r, 0.5 * Math.PI * r]);
      // path.push([ 'Q', startPoint[0] + dist, endPoint[1],  startPoint[0] + dist - r, endPoint[1], 0.5 * Math.PI * r]);
      break;
    case "bottom":
      r = (endPoint[0] - startPoint[0]) / 2;
      if (r > dist) {
        dist = r;
      }
      path.push(["L", startPoint[0], startPoint[1] + dist - r]);
      path.push(["A", r, r, 0, 0, 0, endPoint[0], endPoint[1] + dist - r]);
      // path.push([ 'Q', startPoint[0], startPoint[1] + dist, startPoint[0]  + r, startPoint[1] + dist, 0.5 * Math.PI * r]);
      // path.push([ 'Q', endPoint[0], endPoint[1] + dist,  endPoint[0], endPoint[1] + dist - r, 0.5 * Math.PI * r]);
      break;
    default:
      r = (endPoint[0] - startPoint[0]) / 2;
      if (r > dist) {
        dist = r;
      }
      path.push(["L", startPoint[0], startPoint[1] - dist + r]);
      path.push(["A", r, r, 0, 0, 1, endPoint[0], endPoint[1] - dist + r]);
      // path.push([ 'Q', startPoint[0], startPoint[1] - dist, startPoint[0]  + r, startPoint[1] - dist, 0.5 * Math.PI * r]);
      // path.push([ 'Q', endPoint[0], endPoint[1] - dist,  endPoint[0], endPoint[1] - dist + r, 0.5 * Math.PI * r]);
      break;
  }
  if (r < dist) {
    path.push(["L", endPoint[0], endPoint[1]]);
  }
  return path;
}

export function getArcLoopPath(dist: number, edgeConfigs: any) {
  const { loop = {}, startPoint, endPoint } = edgeConfigs;
  const { position } = loop;
  const quadraticPoints = [startPoint];
  switch (position) {
    case "left":
      quadraticPoints.push([
        startPoint[0] - dist,
        (startPoint[1] + endPoint[1]) / 2,
      ]);
      break;
    case "right":
      quadraticPoints.push([
        startPoint[0] + dist,
        (startPoint[1] + endPoint[1]) / 2,
      ]);
      break;
    case "bottom":
      quadraticPoints.push([
        (startPoint[0] + endPoint[0]) / 2,
        endPoint[1] + dist,
      ]);
      break;
    default:
      quadraticPoints.push([
        (startPoint[0] + endPoint[0]) / 2,
        endPoint[1] - dist,
      ]);
  }
  quadraticPoints.push(endPoint);
  return quadraticPoints;
}

export function getDefaultLoopControlPoints(node: any, edgeConfigs: any) {
  const { startPoint, endPoint, loop = {} } = edgeConfigs;
  const { position } = loop;
  let dist = loop.dist;
  const { width, height } = node.getBBox();
  let ratio;
  switch (position) {
    case "left":
      if (!dist) {
        ratio = width > height ? 4 : 2;
        dist = Math.max(MIN_LOOP_DIST, width / ratio);
      }
      return [
        [startPoint[0] - dist, startPoint[1]],
        [startPoint[0] - dist, endPoint[1]],
      ];
    case "right":
      if (!dist) {
        ratio = width > height ? 4 : 2;
        dist = Math.max(MIN_LOOP_DIST, width / ratio);
      }
      return [
        [startPoint[0] + dist, startPoint[1]],
        [startPoint[0] + dist, endPoint[1]],
      ];
    case "bottom":
      if (!dist) {
        ratio = height > width ? 4 : 2;
        dist = Math.max(MIN_LOOP_DIST, height / ratio);
      }
      return [
        [startPoint[0], startPoint[1] + dist],
        [endPoint[0], startPoint[1] + dist],
      ];
    default:
      if (!dist) {
        ratio = height > width ? 4 : 2;
        dist = Math.max(MIN_LOOP_DIST, height / ratio);
      }
      return [
        [startPoint[0], startPoint[1] - dist],
        [endPoint[0], startPoint[1] - dist],
      ];
  }
}

export function getLoopControlPoints(node: any, configs: any) {
  const { startPoint, endPoint, loop = {} } = configs;
  const { left, top, width, height } = node.getBBox();
  const center = [left + width / 2, top + height / 2];
  let r = height / 2;
  let defaultDist = height;
  if (loop.position === "left" || loop.position === "right") {
    r = width / 2;
    defaultDist = width;
  }
  const dist = loop.dist || defaultDist;
  const scaleRate = (r + dist) / r;
  const startVec = [startPoint[0] - center[0], startPoint[1] - center[1]];
  const startExtendVec = [startVec[0] * scaleRate, startVec[1] * scaleRate];
  const cp1 = [center[0] + startExtendVec[0], center[1] + startExtendVec[1]];
  const endVec = [endPoint[0] - center[0], endPoint[1] - center[1]];
  const endExtendVec = [endVec[0] * scaleRate, endVec[1] * scaleRate];
  const cp2 = [center[0] + endExtendVec[0], center[1] + endExtendVec[1]];
  return [cp1, cp2];
}

export function getArcControlPoints(
  point1: number[],
  vertex: number[],
  point2: number[],
  length: number,
  isRadius = true
) {
  const [v1x, v1y] = [point1[0] - vertex[0], point1[1] - vertex[1]];
  const [v2x, v2y] = [point2[0] - vertex[0], point2[1] - vertex[1]];
  const dist1 = Math.sqrt(v1x ** 2 + v1y ** 2);
  const dist2 = Math.sqrt(v2x ** 2 + v2y ** 2);
  const [norm1x, norm1y] = [v1x / dist1, v1y / dist1];
  const [norm2x, norm2y] = [v2x / dist2, v2y / dist2];
  const cross = norm1x * norm2y - norm1y * norm2x;
  if (cross === 0) {
    // 共线
    return [vertex, vertex, 0];
  }
  const fs = cross > 0 ? 0 : 1; // 按照顺时针或逆时针方向
  const angle = Math.acos(norm1x * norm2x + norm1y * norm2y);
  let radius = isRadius ? length : length / (Math.PI - angle);
  const halfAngle = angle / 2;
  const maxL = Math.min(dist1, dist2) / 2;
  let L = radius / Math.tan(halfAngle);
  // 处理边长小于半径的情况
  if (maxL < L) {
    L = maxL;
    radius = L * Math.tan(halfAngle);
  }
  const cp1 = [vertex[0] + norm1x * L, vertex[1] + norm1y * L];
  const cp2 = [vertex[0] + norm2x * L, vertex[1] + norm2y * L];
  return [cp1, cp2, fs, radius, Math.PI - angle];
}

export function getRouterCubicPath(
  configs: any,
  direction: "v" | "h",
  grid: Grid
) {
  const { startPoint, endPoint } = configs;
  const allPoints = [
    startPoint,
    ...(configs.controlPoints?.concat?.() ?? []),
    endPoint,
  ];
  const path: (string | number)[][] = [["M", startPoint[0], startPoint[1]]];
  const cubicPath = getCubicPath(configs, direction);
  if (
    isCubicWalkable(
      [
        // cubic 可达，采用 cubic
        [cubicPath[0][1], cubicPath[0][2]],
        [cubicPath[1][1], cubicPath[1][2]],
        [cubicPath[1][3], cubicPath[1][4]],
        [cubicPath[1][5], cubicPath[1][6]],
      ] as number[][],
      grid
    )
  ) {
    return cubicPath;
  }
  // 否则采用 动态 radius Turning line
  for (let i = 1; i < allPoints.length - 1; i++) {
    const point1 = allPoints[i - 1];
    const vertex = allPoints[i];
    const point2 = allPoints[i + 1];
    const length = Math.min(
      Math.sqrt(
        Math.pow(point2[0] - vertex[0], 2) + Math.pow(point2[1] - vertex[1], 2)
      ),
      Math.sqrt(
        Math.pow(point1[0] - vertex[0], 2) + Math.pow(point1[1] - vertex[1], 2)
      )
    );
    if (length <= 0) {
      path.push(["L", vertex[0], vertex[1]]);
      continue;
    }
    const [cp1, cp2, , r, angle] = getArcControlPoints(
      point1,
      vertex,
      point2,
      length,
      false
    );
    if (!r) {
      path.push(["L", cp2[0], cp2[1]]);
    } else {
      path.push(["L", cp1[0], cp1[1]]);
      path.push([
        "Q",
        vertex[0],
        vertex[1],
        cp2[0],
        cp2[1],
        (r as number) * (angle as number),
      ]);
    }
  }
  path.push(["L", endPoint[0], endPoint[1]]);
  return path;
}

const stops = [
  0.125, 0.16666666666666666, 0.20833333333333331, 0.25, 0.29166666666666663,
  0.3333333333333333, 0.375, 0.41666666666666663, 0.4583333333333333, 0.5,
  0.5416666666666666, 0.5833333333333333, 0.625, 0.6666666666666666,
  0.7083333333333333, 0.75, 0.7916666666666666, 0.8333333333333333, 0.875,
];

function isCubicWalkable(path: number[][], grid: Grid) {
  const gap = 2 * grid.getStep() + grid.options?.extraWidth || 0;
  for (const stop of stops) {
    const x = getDimAt(stop, path[0][0], path[1][0], path[2][0], path[3][0]);
    const y = getDimAt(stop, path[0][1], path[1][1], path[2][1], path[3][1]);
    if (
      (Math.abs(x - path[0][0]) < gap && Math.abs(y - path[0][1]) < gap) ||
      (Math.abs(x - path[3][0]) < gap && Math.abs(y - path[3][1]) < gap)
    ) {
      // 距离起始点和终点较近的采样点忽略。
      continue;
    }
    const point = [x, y];
    const [col, row] = grid.getIndexByCoord(point[0], point[1]);
    const isWalkable = grid.isWalkable(col, row);
    if (!isWalkable) {
      return false;
    }
  }
  return true;
}
function getCubicPath(configs: any, direction: "v" | "h") {
  const { startPoint, endPoint, styles = {} } = configs;
  const { curvePosition = [0.5, 0.5] } = styles;
  const cp1 =
    direction === "h"
      ? [
          (endPoint[0] - startPoint[0]) * curvePosition[0] + startPoint[0],
          startPoint[1],
        ]
      : [
          startPoint[0],
          (endPoint[1] - startPoint[1]) * curvePosition[0] + startPoint[1],
        ];
  const cp2 =
    direction === "h"
      ? [
          (endPoint[0] - startPoint[0]) * curvePosition[1] + startPoint[0],
          endPoint[1],
        ]
      : [
          endPoint[0],
          (endPoint[1] - startPoint[1]) * curvePosition[1] + startPoint[1],
        ];
  const controlPoints = adjustControlPoints(configs, [cp1, cp2], direction);
  const path: (string | number)[][] = [
    ["M", startPoint[0], startPoint[1]],
    [
      "C",
      controlPoints[0][0],
      controlPoints[0][1],
      controlPoints[1][0],
      controlPoints[1][1],
      endPoint[0],
      endPoint[1],
    ],
  ];
  return path;
}
