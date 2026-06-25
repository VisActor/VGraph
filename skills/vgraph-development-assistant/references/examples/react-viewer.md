# React Viewer Example

Use this pattern when the user asks for React-rendered nodes.

```tsx
import React, { useEffect, useState } from "react";
import { Graph, panZoom, dragCanvas } from "@visactor/vgraph";
import { Viewer } from "@visactor/react-vgraph";

export function VGraphPanel() {
  const [graph, setGraph] = useState<Graph | null>(null);

  useEffect(() => {
    const g = new Graph({
      container: "vgraph-canvas",
      width: 900,
      height: 560,
      renderMode: "dom",
      layout: { type: "dag" },
      setDefaultNode: node => ({
        id: node.id,
        width: 180,
        height: 64
      })
    });

    g.data({
      nodes: [
        { id: "a", name: "Source" },
        { id: "b", name: "Target" }
      ],
      edges: [{ source: "a", target: "b" }]
    });

    g.addBehavior(panZoom);
    g.addBehavior(dragCanvas);
    setGraph(g);

    return () => {
      g.destroy();
      setGraph(null);
    };
  }, []);

  return (
    <div>
      <div id="vgraph-canvas" style={{ width: 900, height: 560 }} />
      {graph && (
        <Viewer
          graph={graph}
          setNode={node => (
            <div className="node-card">
              {node.get("label") ?? node.get("id")}
            </div>
          )}
        />
      )}
    </div>
  );
}
```

Avoid React Viewer for very large graphs unless the user explicitly needs DOM nodes.
