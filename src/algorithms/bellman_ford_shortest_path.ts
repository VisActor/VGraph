import { Graph, TreeGraph, GraphStructure } from '../';

// Bellman Ford 单源最短路径算法，能处理负权边
// 时间复杂度 O(EV); 空间复杂度 O(V)
export function bellmanFordSP(
  graph: Graph | TreeGraph | GraphStructure,
  startId: string,
  endId: string,
  getEdgeWeight?: (edge: any) => number
) {
  const distance: { [k: string]: number } = {};
  const paths: { [k: string]: string } = {};
  const nodes = graph.getNodes();
  const edges = graph.getEdges();
  const N = nodes.length;

  distance[startId] = 0;

  function getWeight(edge: any) {
    return getEdgeWeight ? getEdgeWeight(edge) : 1;
  }

  for (let i = 0; i < N - 1; i++) {
    edges.forEach((edge: any) => {
      const source = edge.get('source');
      const target = edge.get('target');
      const dist = distance[source] + getWeight(edge);
      if (distance[target] === undefined || dist < distance[target]) {
        distance[target] = dist;
        paths[target] = source;
      }
    });
  }

  if (distance[endId] === undefined) {
    return null;
  }
  let id = endId;
  const result = [id];
  while (1) {
    id = paths[id];
    if (id === undefined) {
      return null;
    }
    result.unshift(id);
    if (id === startId) {
      break;
    }
  }
  return { cost: distance[endId], path: result };
}
