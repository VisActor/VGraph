import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { Graph, DAGLayout } from "@visactor/vgraph";
import { Viewer } from "../../src";

const App = () => {
  const [graph, setGraph] = useState<Graph | null>(null);

  useEffect(() => {
    const g = new Graph({
      container: "viewerExample",
      width: 800,
      height: 500,
      renderMode: "dom",
      setDefaultNode() {
        return {
          type: "rect",
          width: 120,
          height: 50,
        };
      },
      setDefaultEdge() {
        return {
          type: "line",
          strokeStyle: "#bbb",
        };
      },
    });
    g.data({
      nodes: [{ id: "A" }, { id: "B" }, { id: "C" }],
      edges: [
        { source: "A", target: "B" },
        { source: "B", target: "C" },
      ],
    });
    g.set(
      "layout",
      new DAGLayout({ graph: g, rankDir: "LR", nodeSep: 40, rankSep: 80 })
    );
    g.refresh();
    g.fitView();
    setGraph(g);
    return () => {
      g.destroy();
    };
  }, []);

  return (
    <div style={{ width: 800, height: 500 }} id="viewerExample">
      {graph && (
        <Viewer
          graph={graph}
          setNode={(node) => <div style={{ padding: 8 }}>{node.get("id")}</div>}
        />
      )}
    </div>
  );
};

const rootElement = document.getElementById("root");
render(<App />, rootElement);
