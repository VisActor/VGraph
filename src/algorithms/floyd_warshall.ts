import { Graph, TreeGraph, GraphStructure } from '../';

// Floyd-Warshall 最短路径算法。时间复杂度 O(N^3);空间复杂度 O(N^2)
export function floydWarshallSP(graph: GraphStructure | Graph | TreeGraph, getEdgeWeight?: (edge: any) => number) {
  const nodes = graph.getNodes();
  const edges = graph.getEdges();
  const N = nodes.length;
  const distance: number[][] = new Array(N);
  const paths: number[][] = new Array(N);
  const nodeMap = {};
  let curIndex = 0;

  function getWeight(edge: any) {
    return getEdgeWeight ? getEdgeWeight(edge) : 1;
  }

  function getIndex(id: string) {
    if (nodeMap[id] === undefined) {
      nodeMap[id] = curIndex;
      curIndex++;
    }
    return nodeMap[id];
  }

  for (let i = 0; i < N; i++) {
    distance[i] = new Array(N).fill(Infinity);
  }

  edges.forEach((edge: any) => {
    const source = getIndex(edge.get('source'));
    const target = getIndex(edge.get('target'));
    distance[source] = distance[source] || [];
    paths[source] = paths[source] || [];
    const weight = getWeight(edge);
    distance[source][target] = weight;
    if (source !== target) {
      paths[source][target] = source;
    }
  });

  for (let k = 0; k < N; k++) {
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (!distance[i][k] || !distance[k][j]) {
          continue;
        }
        if (distance[i][j] > distance[i][k] + distance[k][j]) {
          distance[i][j] = distance[i][k] + distance[k][j];
          paths[i][j] = paths[k][j];
        }
      }
    }
  }
  return { paths, nodeMap };
}

export function getShortestPathToNode(paths: number[][], nodeMap: { [k: string]: number }, start: string, end: string) {
  const startIndex = nodeMap[start];
  let endIndex = nodeMap[end];
  const nodeIds = Object.keys(nodeMap).sort((a: string, b: string) => nodeMap[a] - nodeMap[b]);
  if (!paths[startIndex] || paths[startIndex][endIndex] === undefined) {
    return null;
  }
  const path = [nodeIds[endIndex]];
  while (1) {
    endIndex = paths[startIndex][endIndex];
    if (endIndex === -1) {
      return null;
    }
    path.unshift(nodeIds[endIndex]);
    if (endIndex === startIndex) {
      break;
    }
  }
  return path;
}
