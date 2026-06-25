import { Graph, TreeGraph, GraphStructure } from "../";

export function topologicalSort(graph: Graph | GraphStructure | TreeGraph) {
  const order: any = [];
  const nodeSources = {};
  const headers: any = [];
  const nodes = graph.getNodes();
  const nodeMap = graph.getNodeMap();
  nodes.forEach((node: any) => {
    const id = node.get("id");
    const length = node.sources.length;
    nodeSources[id] = length;
    if (length === 0) {
      headers.push(id);
    }
  });

  if (headers.length === 0) {
    return null;
  }

  while (headers.length) {
    const nodeId = headers.shift();
    const node = nodeMap[nodeId];
    order.push(node);
    node.targets.forEach((id: string) => {
      nodeSources[id]--;
      if (nodeSources[id] === 0) {
        headers.push(id);
      }
    });
  }
  const hasCircle = Object.values(nodeSources).find((v: any) => v !== 0);
  if (hasCircle) {
    return null;
  }
  return order;
}
