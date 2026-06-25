# @visactor/vgraph

VGraph is the graph visualization and analysis engine of [VisActor](https://visactor.io).

## Installation

```bash
npm install @visactor/vgraph
```

## Features

- Canvas-based graph rendering and interaction
- Built-in nodes, edges, groups, and layouts
- Support for custom rendering, behaviors, and graph analysis scenarios
- TypeScript declarations bundled with the package

## Quick Start

```ts
import { Graph } from '@visactor/vgraph';

const graph = new Graph({
  container: 'graph-container',
  width: 800,
  height: 600,
  setDefaultNode(node) {
    return {
      label: node.id,
      width: 120,
      height: 40
    };
  }
});

graph.data({
  nodes: [
    { id: 'Hello', x: 100, y: 100 },
    { id: 'World', x: 320, y: 100 }
  ],
  edges: [{ source: 'Hello', target: 'World' }]
});
```

## Documentation

- Docs: [https://visactor.io/vgraph](https://visactor.io/vgraph)
- Examples: [https://visactor.io/vgraph/example](https://visactor.io/vgraph/example)
- Repository: [https://github.com/VisActor/VGraph](https://github.com/VisActor/VGraph)
