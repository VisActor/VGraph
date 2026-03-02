import { Graph } from "../../../graph";
import { Node } from "../../../models/entities";
import { GraphStructure, NodeStructure } from "../../../graph_structure";
// 前置条件：
// - Graph is a DAG.
export function bfsRank(
  graph: Graph | GraphStructure,
  startNode?: Node | NodeStructure
) {
  const nodes = graph.getNodes() as any;
  if (startNode === undefined) {
    startNode = nodes.find((node: Node | NodeStructure) => {
      return node.get("root");
    })![0]; // 默认从nest Graph的根节点开始(如果有)
    if (startNode === undefined) {
      startNode = nodes[0];
    } // 如果还是没有，则取第一个节点
  }
  const sourceNode = startNode as Node | NodeStructure; // For tslint
  sourceNode.set("rank", 0);
  const setRankUp = (
    node: Node | NodeStructure,
    parent: Node | NodeStructure
  ) => {
    if (parent) {
      node.set("rank", parent.get("rank") - 1);
    }
  };
  const setRankDown = (
    node: Node | NodeStructure,
    parent: Node | NodeStructure
  ) => {
    if (parent) {
      node.set("rank", parent.get("rank") + 1);
    }
  };
  bfs(graph, sourceNode, setRankUp, "up");
  bfs(graph, sourceNode, setRankDown, "down");
}
function bfs(
  graph: Graph | GraphStructure,
  startnode: Node | NodeStructure,
  callback: (node: Node | NodeStructure, parent: Node | NodeStructure) => void,
  directed: "up" | "down" = "down" // -1: 反向，1: 正向
) {
  const queue = [];
  queue.push(startnode);
  const visited = {};
  visited[startnode.get("id")] = true;
  const nodeMap = graph.getNodeMap();
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (directed === "down") {
      node.targets.forEach((vid: string) => {
        const nextNode = nodeMap[vid];
        if (!visited[vid]) {
          visited[vid] = true;
          queue.push(nextNode);
          callback(nextNode, node);
        }
      });
    }
    if (directed === "up") {
      node.sources.forEach((vid: string) => {
        const nextNode = nodeMap[vid];
        if (!visited[vid]) {
          visited[vid] = true;
          queue.push(nextNode);
          callback(nextNode, node);
        }
      });
    }
  }
}
