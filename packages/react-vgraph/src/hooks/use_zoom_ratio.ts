import { useState, useEffect } from "react";
import { Graph, TreeGraph, GRAPH_EVENTS } from "@visactor/vgraph";

export function useZoomRatio(
  graph: Graph | TreeGraph
): [number, (ratio: number) => void] {
  const [ratio, setZoomRatio] = useState(1);

  useEffect(() => {
    if (!graph) {
      return;
    }
    setZoomRatio(graph.getZoomRatio());
    graph.on(
      GRAPH_EVENTS.TRANSFORMED,
      ({ type }: { type: "scale" | "translate" | "matrix" }) => {
        if (type !== "translate") {
          const r = graph.getZoomRatio();
          setZoomRatio(r);
        }
      }
    );
  }, [graph]);

  const handleChange = (ratio: number) => {
    graph.setZoomRatio(ratio);
  };
  return [ratio, handleChange] as [number, (ratio: number) => void];
}
