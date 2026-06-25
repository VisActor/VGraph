# @visactor/react-vgraph

React bindings and helper components for [VGraph](https://visactor.io/vgraph).

## Installation

```bash
npm install @visactor/vgraph @visactor/react-vgraph react react-dom
```

If your application uses TypeScript, install React type packages in the app as usual:

```bash
npm install -D @types/react @types/react-dom
```

## Peer Dependencies

- `@visactor/vgraph`
- `react`
- `react-dom`

## Exports

- `Viewer`: Render React nodes and group titles on top of an existing VGraph instance
- `DataLineageGraph`: Ready-to-use data lineage graph component
- `useNodes`, `useEdges`, `useZoomRatio`, `useSelections`: React hooks for VGraph state access

## Quick Start

```tsx
import React from "react";
import { Graph } from "@visactor/vgraph";
import { Viewer } from "@visactor/react-vgraph";

const graph = new Graph({
  container: "container",
  width: 800,
  height: 600,
});

graph.data({
  nodes: [{ id: "node-1", x: 100, y: 100 }],
  edges: [],
});

export function App() {
  return <Viewer graph={graph} setNode={(node) => <div>{node.id}</div>} />;
}
```

## Documentation

- Docs: [https://visactor.io/vgraph](https://visactor.io/vgraph)
- Examples: [https://visactor.io/vgraph/example](https://visactor.io/vgraph/example)
