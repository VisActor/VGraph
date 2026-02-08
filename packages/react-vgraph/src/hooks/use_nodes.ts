import { useState, useEffect } from "react";
import {
  Graph,
  TreeGraph,
  GRAPH_EVENTS,
  Node,
  Edge,
  Group,
} from "@visactor/vgraph";

export function useNodes(graph: Graph | TreeGraph) {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    if (!graph) {
      return;
    }
    setNodes(graph.getNodes());
    // reset data
    graph.on(GRAPH_EVENTS.DATA_END, () => {
      setNodes(graph.getNodes());
    });

    // add node
    graph.on(GRAPH_EVENTS.ADD_END, (e: { target: Node | Edge | Group }) => {
      if (e.target.type === "node") {
        setNodes(graph.getNodes());
      }
    });

    // remove node
    graph.on(GRAPH_EVENTS.REMOVE_END, (e: { target: Node | Edge | Group }) => {
      if (e.target.type === "node") {
        setNodes(graph.getNodes());
      }
    });

    // update node
    graph.on(GRAPH_EVENTS.UPDATE_END, (e: { target: Node | Edge | Group }) => {
      if (e.target.type === "node") {
        setNodes(graph.getNodes());
      }
    });

    // move node
    graph.on(GRAPH_EVENTS.MOVE_END, () => {
      setNodes(graph.getNodes());
    });

    // clear
    graph.on(GRAPH_EVENTS.CLEAR_END, () => {
      setNodes([]);
    });

    // layout node
    graph.on(GRAPH_EVENTS.LAYOUT_END, () => {
      setNodes(graph.getNodes());
    });
  }, [graph]);

  return nodes;
}
