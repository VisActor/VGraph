import { useState, useEffect } from "react";
import {
  Graph,
  TreeGraph,
  GRAPH_EVENTS,
  Node,
  Edge,
  Group,
} from "@visactor/vgraph";

export function useEdges(graph: Graph | TreeGraph) {
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (!graph) {
      return;
    }
    setEdges(graph.getEdges());
    // reset data
    graph.on(GRAPH_EVENTS.DATA_END, () => {
      setEdges(graph.getEdges());
    });

    // add edge
    graph.on(GRAPH_EVENTS.ADD_END, (e: { target: Node | Edge | Group }) => {
      if (e.target.type === "edge") {
        setEdges(graph.getEdges());
      }
    });

    // remove edge
    graph.on(GRAPH_EVENTS.REMOVE_END, (e: { target: Node | Edge | Group }) => {
      if (e.target.type === "edge") {
        setEdges(graph.getEdges());
      }
    });

    // update edge
    graph.on(GRAPH_EVENTS.UPDATE_END, (e: { target: Node | Edge | Group }) => {
      if (e.target.type === "edge") {
        setEdges(graph.getEdges());
      }
    });

    // move edge
    graph.on(GRAPH_EVENTS.MOVE_END, () => {
      setEdges(graph.getEdges());
    });

    // clear
    graph.on(GRAPH_EVENTS.CLEAR_END, () => {
      setEdges([]);
    });

    // layout edge
    graph.on(GRAPH_EVENTS.LAYOUT_END, () => {
      setEdges(graph.getEdges());
    });
  }, [graph]);

  return edges;
}
