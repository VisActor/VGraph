import { NodeData, EdgeData } from "../../typings/data";
import {
  ForceManyBody,
  ForceLink,
  ForceX,
  ForceY,
  ForceCenter,
  ForceCollision,
} from "./";

export function autoForces(
  nodes: NodeData[],
  edges: EdgeData[],
  connection: any,
  options: {
    graphSize: number[];
    nodeSize?: number;
    scaleFactor?: number;
  }
) {
  const nodeSize = options.nodeSize || 15;
  const nodeSizeCoeff = nodeSize < 40 ? nodeSize : 40 + (nodeSize - 40) * 0.5; // 避免 nodeSize 过大形成太大的 distance 导致布局交叉过多。
  // 之前业务没有 nodeSize 这么大的场景，因此预计不会对之前的业务方有影响。
  const width = options.graphSize[0];
  const height = options.graphSize[1];
  const center = {
    x: width / 2,
    y: height / 2,
  };
  const N = nodes.length;
  const E = edges.length;
  const avgDegree = (E / N || 0) > 0.1 ? E / N || 0 : 0.1; // 平均度数
  const multi = connection.isMultiComponents; // 是否有零散的节点
  const leaf = Math.max((2 * connection.numLeaf) / N, 0.1); // 叶子节点的系数, 设定至少为 0.1
  // 有零散的节点时或者平均度数小叶子结点比例小(说明可能有长链)的情况，加大中心吸引力
  let strengthXY =
    multi || 0.01 / avgDegree / leaf > 0.05 ? 0.05 : 0.01 / avgDegree / leaf;
  // 15 * 4 / 3 = 20
  let distance = ((nodeSizeCoeff * 4) / 3) * avgDegree;
  // 叶子节点很多，适当调整 distance 使叶子节点能分散开
  if (leaf >= 1) {
    distance = nodeSizeCoeff * 2 * leaf;
  }
  // 节点很少的时候，适当增大引力和斥力平铺开
  const mean = (width + height) / 2;
  if (N * nodeSizeCoeff < mean) {
    distance = Math.max(distance, mean / Math.max(N / 1.5, 12));
    strengthXY *= 0.2; // 减小中心引力，尽量让节点分散开
  }
  const forces: Map<string, any> = autoConfigForces(
    edges,
    nodeSize,
    distance,
    strengthXY,
    center
  );
  const zoomRatio =
    (Math.sqrt(((width * height) / N / 400) * Math.max(avgDegree, 1)) /
      nodeSize) *
    1.5 *
    (options.scaleFactor || 1);
  return { forces, zoomRatio: Math.max(Math.min(zoomRatio, 2), 0.05) };
}

function autoConfigForces(
  edges: EdgeData[],
  nodeSize: number,
  distance: number,
  strengthXY: number,
  center: { x: number; y: number }
) {
  return new Map<string, any>([
    [
      "link",
      new ForceLink({
        edges,
        options: { distance },
      }),
    ],
    [
      "charge",
      new ForceManyBody({
        options: { strength: -distance },
      }),
    ],
    ["forceX", new ForceX({ options: { strength: strengthXY, x: center.x } })],
    ["forceY", new ForceY({ options: { strength: strengthXY, y: center.y } })],
    [
      "collide",
      new ForceCollision({
        options: {
          radius: (d: { width?: number }) => 0.5 * (d.width || nodeSize) + 2,
        },
      }),
    ],
    ["center", new ForceCenter({ options: { x: center.x, y: center.y } })],
  ]);
}
