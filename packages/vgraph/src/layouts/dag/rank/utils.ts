import { Graph } from "../../../graph";
import { Node, Edge } from "../../../models/entities";
import {
  NodeStructure,
  EdgeStructure,
  GraphStructure,
} from "../../../graph_structure";

export function normalizeRanks(graph: GraphStructure | Graph): void {
  const ranks = graph
    .getNodes()
    .map((node: Node | NodeStructure) => node.get("rank"));
  const minRanks = Math.min(...ranks);
  graph
    .getNodes()
    .forEach((node: Node | NodeStructure) =>
      node.set("rank", node.get("rank") - minRanks)
    );
}

export function getNodeEdges(graph: Graph | GraphStructure) {
  const nodeEdges: Record<string, (Edge | EdgeStructure)[]> = {};
  graph.getNodes().forEach((node: Node | NodeStructure) => {
    nodeEdges[node.get("id")] = [];
  });
  // 注意重复边
  const visitedEdge = {};
  graph.getEdges().forEach((edge: Edge | EdgeStructure) => {
    const source = edge.get("source");
    const target = edge.get("target");

    if (nodeEdges[source] === undefined) {
      throw new Error(source + "source not found");
    }
    if (nodeEdges[target] === undefined) {
      throw new Error(target + "target not found");
    }

    const e = source + "-and-" + target;
    if (visitedEdge[e]) {
      return;
    }
    visitedEdge[e] = true;
    nodeEdges[source].push(edge);
    nodeEdges[target].push(edge);
  });
  return nodeEdges;
}
