import { Graph, GraphStructure, TreeGraph } from "../";
import { topologicalSort } from "./";

// 对于通用图，如果无负权重的图直接用 dijkstra O(E + NLogN)，有负权则用 Bellman Ford 算法 O(NE)
// 对于「有向无环图」，可以用拓扑排序优化到O(N+E)
export function dagSP(
  graph: Graph | GraphStructure | TreeGraph,
  startId: string,
  endId: string,
  getEdgeWeight?: (edge: any) => number
) {
  const path: any = {};
  const dists = {};
  dists[startId] = 0;
  const order = topologicalSort(graph);
  if (!order) {
    console.warn("Graph has cycle(s), topological sort is impossible");
    return null;
  }

  function getDist(nid: string) {
    return dists[nid] !== undefined ? dists[nid] : Infinity;
  }

  function getWeight(edge: any) {
    return getEdgeWeight ? getEdgeWeight(edge) : 1;
  }

  while (order.length) {
    const node = order.shift();
    const nodeId = node.get("id");
    if (getDist(nodeId) === Infinity) {
      continue;
    }
    if (nodeId === endId) {
      break;
    }
    node.edges.forEach((edge: any) => {
      if (edge.get("source") !== nodeId) {
        return;
      }
      const target = edge.get("target");
      const dist = getDist(nodeId) + getWeight(edge);
      if (getDist(target) > dist) {
        dists[target] = dist;
        path[target] = nodeId;
      }
    });
  }
  if (getDist(endId) === Infinity) {
    return null;
  }
  let id = endId;
  const result = [id];
  while (1) {
    id = path[id];
    if (!id) {
      return null;
    }
    result.unshift(id);
    if (id === startId) {
      break;
    }
  }
  return { path: result, cost: dists[endId] };
}
