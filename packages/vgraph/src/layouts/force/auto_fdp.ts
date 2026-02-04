import { Graph } from "../../graph";
import { Node, Edge } from "../../models/entities";
import { EdgeData, NodeData } from "../../typings/data";
import { autoForces } from "./auto_force";
import {
  isMultiComponentsForGraph,
  isMultiComponentsForData,
} from "../utils/connected_components";
import {
  EdgeStructure,
  GraphStructure,
  NodeStructure,
} from "../../graph_structure";

export function autoFDP(
  graph: Graph | GraphStructure | { nodes: NodeData[]; edges: EdgeData[] },
  options: {
    graphSize: number[];
    nodeSize?: number;
    scaleFactor?: number;
  }
) {
  if (!graph) {
    throw new Error(
      "graph is required, you can pass either a Graph instance or a GraphStructure instance"
    );
  }
  let nodes: NodeData[];
  let edges: EdgeData[];
  let connected;
  if (graph instanceof Graph || graph instanceof GraphStructure) {
    nodes = graph
      .getNodes()
      .map((node: Node | NodeStructure) => node.configs as NodeData);
    edges = graph
      .getEdges()
      .map((edge: Edge | EdgeStructure) => edge.configs as EdgeData);
    connected = isMultiComponentsForGraph(graph);
  } else {
    nodes = graph.nodes;
    edges = graph.edges;
    connected = isMultiComponentsForData(graph as any);
  }
  return autoForces(nodes, edges, connected, options);
}
