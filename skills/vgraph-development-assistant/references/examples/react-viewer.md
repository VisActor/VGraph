# React Viewer Example

Use this pattern when the user asks for React-rendered nodes.

```tsx
import React, { useEffect, useRef, useState } from "react";
import { Graph, panZoom, dragCanvas } from "@visactor/vgraph";
import { Viewer } from "@visactor/react-vgraph";

export function VGraphPanel() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [graph, setGraph] = useState<Graph | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const g = new Graph({
      container: containerRef.current,
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
    };
  }, []);

  return (
    <div>
      <div ref={containerRef} style={{ width: 900, height: 560 }} />
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

Use a DOM ref instead of a hard-coded container id in reusable React components;
hard-coded ids collide when the component is mounted more than once or in
strict-mode development workflows.

Avoid React Viewer for very large graphs unless the user explicitly needs DOM nodes.
