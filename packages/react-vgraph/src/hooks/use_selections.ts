import { useState, useEffect } from "react";
import {
  Graph,
  TreeGraph,
  GRAPH_EVENTS,
  Node,
  Edge,
  Group,
} from "@visactor/vgraph";

export function useSelections(graph: Graph | TreeGraph) {
  const [selections, setSelections] = useState<(Node | Edge | Group)[]>([]);

  useEffect(() => {
    if (!graph) {
      return;
    }
    graph.on(GRAPH_EVENTS.BATCH_STATE_END, (e: any) => {
      if (e?.state !== "select") {
        return;
      }
      // 仅处理 stack、编辑器等直接 emit 的批量事件。
      setSelections(e.targets);
    });

    graph.on(GRAPH_EVENTS.STATE_END, (e: any) => {
      if (e?.state !== "select") {
        return;
      }
      const target = e.target;
      if (target?.hasState("select")) {
        setSelections([target]);
      } else {
        setSelections([]);
      }
    });
    // clear
    graph.on(GRAPH_EVENTS.CLEAR_END, () => {
      setSelections([]);
    });
  }, [graph]);

  return selections;
}
