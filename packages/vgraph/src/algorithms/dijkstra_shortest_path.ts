import { Graph, Node, GraphStructure, NodeStructure } from "../";

// classic Dijkstra 单源最短路径算法。时间复杂度O(V^2); 空间复杂度O(E + N)
export function dijkstraSP(
  graph: GraphStructure | Graph,
  startNodeId: string,
  endNodeId: string,
  getEdgeWeight?: (edge: any) => number
): { path: string[]; cost: number } {
  // 未找到起止节点
  if (!graph.getNodeById(startNodeId) || !graph.getNodeById(endNodeId)) {
    return {
      path: [],
      cost: Infinity,
    };
  }
  if (startNodeId === endNodeId) {
    return {
      path: [startNodeId],
      cost: 0,
    };
  }
  // 记录起始节点到其他全部节点到距离
  const dist: { [key: string]: number } = {};
  // 记录添加路径的父节点
  const parent: { [key: string]: any } = {};
  // 记录已经访问的节点
  const visited: { [key: string]: boolean } = {};
  // 获取图节点
  const nodes = graph.getNodes();
  // 初始化 所有节点距离无限大并且未访问
  nodes.forEach((node: Node | NodeStructure) => {
    const id = node.get("id");
    dist[id] = Infinity;
    visited[id] = false;
    parent[id] = null;
  });

  function getWeight(edge: any) {
    return getEdgeWeight ? getEdgeWeight(edge) : 1;
  }

  // 设置起始节点距离0 父节点null
  dist[startNodeId] = 0;
  parent[startNodeId] = null;
  // 依次找出最短路径
  for (let i = 0; i < nodes.length - 1; i++) {
    // 从尚未处理的顶点中选出距离最近的顶点
    const uid = minDistance(dist, visited);
    visited[uid] = true;
    // 找到结束节点 直接退出
    if (uid === endNodeId) {
      break;
    }
    const curNode = graph.getNodeById(uid);
    // 距离最近的节点相连的节点
    curNode.edges.forEach((edge: any) => {
      if (edge.get("source") !== uid) {
        return;
      }
      const vid = edge.get("target");
      const weight = getWeight(edge);
      if (
        !visited[vid] &&
        dist[uid] !== Infinity &&
        dist[uid] + weight < dist[vid]
      ) {
        dist[vid] = dist[uid] + weight;
        parent[vid] = uid;
      }
    });
  }
  let curParent = parent[endNodeId];
  const path: string[] = [endNodeId];
  while (curParent) {
    path.unshift(curParent);
    curParent = parent[curParent];
  }
  if (path.length === 1) {
    return {
      path: [],
      cost: Infinity,
    };
  }
  return {
    path,
    cost: dist[endNodeId],
  };
}

const minDistance = (
  dist: { [key: string]: number },
  visited: { [key: string]: boolean }
) => {
  let min = Infinity;
  let minId = "";
  Object.keys(dist).forEach((id: string) => {
    if (visited[id] === false && dist[id] <= min) {
      min = dist[id];
      minId = id;
    }
  });
  return minId;
};
