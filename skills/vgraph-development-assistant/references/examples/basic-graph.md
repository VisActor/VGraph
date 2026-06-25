# Basic Graph Example

Use this as the default plain graph snippet.

```ts
import { Graph, panZoom, dragCanvas, dragNode } from "@visactor/vgraph";

const graph = new Graph({
  container: "container",
  width: 800,
  height: 520,
  layout: {
    type: "dag",
    options: {
      rankDir: "LR"
    }
  },
  setDefaultNode: node => ({
    id: node.id,
    label: node.name,
    width: 140,
    height: 44,
    style: {
      fill: node.status === "running" ? "#e8f7ef" : "#f6f7f9",
      stroke: node.status === "running" ? "#18a058" : "#9aa4b2"
    }
  }),
  setDefaultEdge: edge => ({
    ...edge,
    style: {
      stroke: "#9aa4b2"
    }
  })
});

graph.data({
  nodes: [
    { id: "ingest", name: "Ingest", status: "running" },
    { id: "model", name: "Model", status: "running" },
    { id: "report", name: "Report", status: "idle" }
  ],
  edges: [
    { source: "ingest", target: "model" },
    { source: "model", target: "report" }
  ]
});

graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);
graph.addBehavior(dragNode);

graph.on("node:click", ev => {
  console.log("clicked node", ev.target?.get?.("id"));
});
```

If this is for React, do not use this exact container pattern. Use the React Viewer example instead.
