import { Edge } from "../../models/entities";
import { Graph } from "../../graph";
import { GraphStructure, EdgeStructure } from "../../graph_structure";

const EDGE_TYPES = {
  LINE: "line",
  HLINE: "hLine",
  VLINE: "vLine",
  TURNINGLINE: "turningLine",
  QUADRATIC: "quadratic",
  CUBIC: "cubic",
  LOOP: "loop",
  HCUBIC: "hCubic",
  VCUBIC: "vCubic",
};

export function dealDuplicateEdge(
  graph: Graph | GraphStructure,
  edges: Edge[] | EdgeStructure[],
  needFilter = true,
  scale = 6
) {
  let repeatEdges = [] as any;
  if (needFilter) {
    const edgeArrays = [] as any;
    const edgeMap = {} as any;
    for (const edge of edges) {
      const source = edge.get("source");
      const target = edge.get("target");
      if (
        edgeMap[source + "--and--" + target] ||
        edgeMap[target + "--and--" + source]
      ) {
        const edgeArray =
          edgeMap[source + "--and--" + target] ??
          edgeMap[target + "--and--" + source];
        edgeArray.push(edge);
      } else {
        const edgeArray = [edge];
        edgeArrays.push(edgeArray);
        edgeMap[source + "--and--" + target] = edgeArray;
      }
    }
    repeatEdges = edgeArrays.filter((arr: any) => arr.length > 1);
  } else {
    repeatEdges = edges;
  }

  const nodeMap = graph.getNodeMap();
  for (const edgeArray of repeatEdges) {
    const edge = edgeArray[0];
    const { startPoint, endPoint } = edge.getTerminal
      ? edge.getTerminal()
      : {
          startPoint: [
            nodeMap[edge.get("source")].get("x"),
            nodeMap[edge.get("source")].get("y"),
          ],
          endPoint: [
            nodeMap[edge.get("target")].get("x"),
            nodeMap[edge.get("target")].get("y"),
          ],
        };
    const length = edgeArray.length;
    const type = edge.get("type");
    const controlPoints = edge.get("controlPoints");
    const even = +(length % 2 === 0);
    const edgeSource = edge.get("source");

    // TODO: 控制点不能越过下面的这个矩形范围。
    // const sourceBbox = edge.source.getBBox();
    // const sourcePos = edge.source.configs;
    // const targetBbox = edge.target.getBBox();
    // const targetPos = edge.target.configs;
    // const borders = [
    //   getBorderPoints(sourceBbox, sourcePos, startPoint),
    //   getBorderPoints(targetBbox, targetPos, endPoint),
    // ];
    // const minX = Math.min(borders[0][0], borders[0][2], borders[1][0], borders[1][2]);
    // const minY = Math.min(borders[0][1], borders[0][3], borders[1][1], borders[1][3]);
    // const maxX = Math.max(borders[0][0], borders[0][2], borders[1][0], borders[1][2]);
    // const maxY = Math.max(borders[0][1], borders[0][3], borders[1][1], borders[1][3]);
    // borderLimit(minX, minY, maxX, maxY);

    // 矩形范围限制较为复杂，先不考虑矩形范围限制。
    if (
      ((type === EDGE_TYPES.HLINE && startPoint[1] !== endPoint[1]) ||
        (type === EDGE_TYPES.VLINE && startPoint[0] !== endPoint[0])) &&
      !controlPoints
    ) {
      let direction = 1;
      const dx = endPoint[0] - startPoint[0];
      const dy = endPoint[1] - startPoint[1];
      let { curvePosition = 0.5, curveOffset = 0 } = edge.get("styles")
        ? edge.get("styles")
        : {};
      let lineX = startPoint[0] + dx * curvePosition + curveOffset;
      let lineY = startPoint[1] + dy * curvePosition + curveOffset;
      if (type === EDGE_TYPES.VLINE) {
        lineY = startPoint[1] + dy * curvePosition + curveOffset;
        if (
          (lineY < startPoint[1] && lineY < endPoint[1]) ||
          (lineY > startPoint[1] && lineY > endPoint[1])
        ) {
          lineY = startPoint[1] + dy * 0.5;
          curvePosition = 0.5;
          curveOffset = 0;
        }
      } else if (type === EDGE_TYPES.HLINE) {
        lineX = startPoint[0] + dx * curvePosition + curveOffset;
        if (
          (lineX < startPoint[0] && lineX < endPoint[0]) ||
          (lineX > startPoint[0] && lineX > endPoint[0])
        ) {
          lineX = startPoint[0] + dx * 0.5;
          curvePosition = 0.5;
          curveOffset = 0;
        }
      }
      for (let i = 0; i < length; i++) {
        // hLine 和 vLine 平移控制点
        const e = edgeArray[i];
        const eSource = e.get("source");

        e.set("controlPoints", undefined);
        // 增加控制点。
        const movement =
          (Math.floor((i + 1 + even) / 2) - 0.5 * even) *
          direction *
          (e.get("lineWidth") * scale || scale);
        let tempControlPoints = [] as any;
        if (type === EDGE_TYPES.VLINE) {
          if (Math.abs(dy) > 0) {
            tempControlPoints = [
              [startPoint[0], lineY + movement],
              [endPoint[0], lineY + movement],
            ];
          } else {
            tempControlPoints = [
              [(startPoint[0] + endPoint[0]) * 0.5, lineY + movement],
            ];
          }
        } else if (type === EDGE_TYPES.HLINE) {
          if (Math.abs(dx) > 0) {
            tempControlPoints = [
              [lineX + movement, startPoint[1]],
              [lineX + movement, endPoint[1]],
            ];
          } else {
            tempControlPoints = [
              [lineX + movement, (startPoint[1] + endPoint[1]) * 0.5],
            ];
          }
        }
        if (eSource !== edgeSource) {
          tempControlPoints.reverse();
        }
        e.set("controlPoints", tempControlPoints);
        direction *= -1;
      }
    } else {
      if (!controlPoints) {
        // 无控制点垂直平分线上添加控制点
        const x = startPoint[0] - endPoint[0];
        const y = startPoint[1] - endPoint[1];
        const len = Math.sqrt(x * x + y * y);
        const cos = x / len;
        const sin = y / len;
        const midX = (startPoint[0] + endPoint[0]) * 0.5;
        const midY = (startPoint[1] + endPoint[1]) * 0.5;
        let direction = 1;
        for (let i = 0; i < length; i++) {
          const e = edgeArray[i];
          const eSource = e.get("source");
          const movement =
            (Math.floor((i + 1 + even) / 2) - 0.5 * even) *
            direction *
            (e.get("lineWidth") * scale || scale);
          e.controlPoints = [[midX + movement * sin, midY + movement * -cos]];
          if (eSource !== edgeSource) {
            e.controlPoints.reverse();
          }
          e.set("controlPoints", e.controlPoints);
          direction *= -1;
        }
      } else {
        const firstPoint = controlPoints[0];
        const lastPoint = controlPoints[controlPoints.length - 1];
        // 带控制点, 要么控制点左右移，要么控制点上下移。
        const dx = Math.abs(firstPoint[0] - startPoint[0]);
        const dy = Math.abs(lastPoint[1] - startPoint[1]);
        let moveX = dx >= dy;
        if (type === EDGE_TYPES.HLINE || type === EDGE_TYPES.HCUBIC) {
          moveX = false;
        } else if (type === EDGE_TYPES.VLINE || type === EDGE_TYPES.VCUBIC) {
          moveX = true;
        }
        if (controlPoints.length > 1) {
          if (firstPoint[0] === lastPoint[0]) {
            moveX = true;
          }
          if (firstPoint[1] === lastPoint[1]) {
            moveX = false;
          }
        }
        let direction = 1;
        for (let i = 0; i < length; i++) {
          const e = edgeArray[i];
          const tempControlPoints = [] as any;
          for (const point of controlPoints) {
            tempControlPoints.push(point.concat());
          }
          const eSource = e.get("source");
          const edgeSource = edge.get("source");
          if (eSource !== edgeSource) {
            tempControlPoints.reverse();
          }
          const movement =
            (Math.floor((i + 1 + even) / 2) - 0.5 * even) *
            direction *
            (e.get("lineWidth") * scale || scale);
          for (const point of tempControlPoints) {
            if (moveX) {
              point[0] += movement;
            } else {
              point[1] += movement;
            }
          }
          e.set("controlPoints", tempControlPoints);
          direction *= -1;
        }
      }
    }
  }
  return repeatEdges;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getBorderPoints(
  bbox: { width: number; height: number },
  pos: { x: number; y: number },
  point: [number, number]
) {
  const { width, height } = bbox;
  const { x, y } = pos;
  const box = [
    x - 0.5 * width,
    x + 0.5 * width,
    y - 0.5 * height,
    y + 0.5 * height,
  ];
  const dist = [
    { id: "left", value: box[0] - point[0] },
    { id: "right", value: box[1] - point[0] },
    { id: "top", value: box[2] - point[1] },
    { id: "bottom", value: box[3] - point[1] },
  ].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
  const borderMap = {
    left: [box[0], box[2], box[0], box[3]],
    right: [box[1], box[2], box[1], box[3]],
    top: [box[2], box[0], box[2], box[1]],
    bottom: [box[3], box[0], box[3], box[1]],
  };
  return borderMap[dist[0].id];
}

// TODO: For EdgeStructure
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getStartEndPoint(
  source: { x: number; y: number; width: number; height: number },
  target: { x: number; y: number; width: number; height: number }
) {
  const startPoint = getNearestPoint(
    [
      [source.x - 0.5 * source.width, source.y],
      [source.x + 0.5 * source.width, source.y],
      [source.x, source.y - 0.5 * source.height],
      [source.x, source.y + 0.5 * source.height],
    ],
    [source.x, source.y]
  );
  const endPoint = getNearestPoint(
    [
      [target.x - 0.5 * target.width, target.y],
      [target.x + 0.5 * target.width, target.y],
      [target.x, target.y - 0.5 * target.height],
      [target.x, target.y + 0.5 * target.height],
    ],
    [target.x, target.y]
  );
  return { startPoint, endPoint };
}

function getNearestPoint(anchors: number[][], point: number[]) {
  let result;
  let min = Infinity;
  const [x, y] = point;
  for (const anchor of anchors) {
    const dist = Math.hypot(anchor[0] - x, anchor[1] - y);
    if (dist < min) {
      min = dist;
      result = anchor;
    }
  }
  return result;
}

/**
 * Stagger the duplicated edge with existing ones, is often used in the editing scenario.
 * 在编辑场景下，将重复的连线与已有连线错开
 * @param {Edge} edge - The configurations to update the group with.
 * @param {any} configs - The configurations of the new edge.
 * @param {number} count - The repetition count.
 * @param {number} scale - Padding to the next edge.
 */
export function getDuplicateEdgeConfigs(
  edge: Edge,
  configs: any,
  count: number,
  scale = 10
) {
  const controlPoints = edge.get("controlPoints");
  const type = edge.get("type");
  const { startPoint, endPoint } = edge.getTerminal();
  const direction = count % 2 === 0 ? -1 : 1;
  const movement =
    Math.floor((count + 1) / 2) *
    direction *
    (edge.get("lineWidth") ?? 1) *
    scale;
  configs.__baseId = edge.get("id");
  configs.__count = count;
  let cps: number[][] = [];
  if (!controlPoints) {
    // 无控制点垂直平分线上添加控制点
    const x = startPoint[0] - endPoint[0];
    const y = startPoint[1] - endPoint[1];
    const len = Math.sqrt(x * x + y * y);
    const cos = x / len;
    const sin = y / len;
    const midX = (startPoint[0] + endPoint[0]) * 0.5;
    const midY = (startPoint[1] + endPoint[1]) * 0.5;
    cps = [[midX + movement * sin, midY + movement * -cos]];
  } else {
    const firstPoint = controlPoints[0];
    const lastPoint = controlPoints[controlPoints.length - 1];
    // 带控制点, 要么控制点左右移，要么控制点上下移。
    const dx = Math.abs(firstPoint[0] - startPoint[0]);
    const dy = Math.abs(lastPoint[1] - startPoint[1]);
    let moveX = dx >= dy;
    if (type === EDGE_TYPES.HLINE || type === EDGE_TYPES.HCUBIC) {
      moveX = false;
    } else if (type === EDGE_TYPES.VLINE || type === EDGE_TYPES.VCUBIC) {
      moveX = true;
    }
    if (controlPoints.length > 1) {
      if (firstPoint[0] === lastPoint[0]) {
        moveX = true;
      }
      if (firstPoint[1] === lastPoint[1]) {
        moveX = false;
      }
    }
    for (const point of controlPoints) {
      cps.push(point.concat());
    }
    for (const point of cps) {
      if (moveX) {
        point[0] += movement;
      } else {
        point[1] += movement;
      }
    }
  }
  configs.controlPoints =
    configs.source === edge.get("source") ? cps : cps.reverse;
  return configs;
}
