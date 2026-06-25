# TreeGraph Example

Use `TreeGraph` for nested data.

```ts
import { TreeGraph, panZoom, dragCanvas } from "@visactor/vgraph";

const graph = new TreeGraph({
  container: "container",
  width: 800,
  height: 520,
  layout: {
    type: "compactBox",
    options: {
      direction: "LR"
    }
  },
  setDefaultNode: node => ({
    id: node.id,
    label: node.name ?? node.id,
    width: 132,
    height: 40,
    style: {
      fill: "#fff",
      stroke: "#2f80ed"
    }
  })
});

graph.data({
  id: "root",
  name: "Root",
  children: [
    {
      id: "frontend",
      name: "Frontend",
      children: [{ id: "vgraph", name: "VGraph" }]
    },
    {
      id: "backend",
      name: "Backend"
    }
  ]
});

graph.addBehavior(panZoom, { sensitivity: 4 });
graph.addBehavior(dragCanvas);
```

Do not add explicit edges for parent-child links unless the user is intentionally mixing custom relation edges outside the tree model.
