---
category: examples
group: dag
title: Basic Directed Graph
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/fundflow.png
link: dag/fundFlow
option:
---
# Basic Directed Graph

Data description: Company fund flow data. <br>Interactions: <code>hover node</code>: show start/end paths. This demo also shows how to allow dragging only on the x axis.

## Key Configurations

- `Graph` / `DAGLayout`: Maintain the original layout and style configuration.
- `setDefaultNode` / `setDefaultEdge`: Preserve the appearance of nodes and lines.
- Interactive behaviors: Retain the expand, collapse, hover, or click logic from the example.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  GraphEvent,
  Edge,
  Node,
  dragCanvas,
} from '@visactor/vgraph';

const data = {
  nodes: [
    { name: 'Initial Capital', id: '1' },
    { name: 'Equity and Debt', id: '2' },
    { name: 'Product Development', id: '3' },
    { name: 'Fixed Assets', id: '4' },
    { name: 'Salaries and Expenses', id: '5' },
    { name: 'Product Promotion', id: '6' },
    { name: 'Product Sales', id: '7' },
    { name: 'Company Revenue', id: '8' },
    { name: 'Taxation', id: '9' },
    { name: 'Dividend Distribution', id: '10' },
    { name: 'Company Operations', id: '11' },
  ],
  edges: [
    { source: '1', target: '2' },
    { source: '1', target: '3' },
    { source: '1', target: '4' },
    { source: '1', target: '5' },
    { source: '2', target: '8' },
    { source: '3', target: '6' },
    { source: '6', target: '7' },
    { source: '7', target: '8' },
    { source: '8', target: '9' },
    { source: '8', target: '10' },
    { source: '8', target: '11' },
  ],
};

const container = document.getElementById(CONTAINER_ID);

// Initialize the graph instance
const graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  layout: {
    type: 'dag',
    options: {
      rankDir: 'LR',
      nodeSep: 50,
      edgeSep: 20,
      rankSep: 60,
    },
  },
  setDefaultNode(nodeData) {
    return {
      label: {
        width: 80,
        text: nodeData.name,
        fontSize: 16,
        textBaseline: 'middle',
        textAlign: 'center',
      },
      type: 'rect',
      width: 100,
      height: 30,
      radius: 5,
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
    };
  },
  setDefaultEdge() {
    return {
      type: 'line',
      lineWidth: 2,
      endArrow: true,
    };
  },
  setEdgeStateStyles(state: string) {
    if (state === 'blur') {
      return {
        opacity: 0.3,
      };
    }
  },
});
// Write data
graph.data(data);
// Add mouse drag canvas interaction
graph.addBehavior(dragCanvas, { xOnly: true });
graph.refresh();
// Fit to view size
graph.fitView();

graph.on('node:mouseenter', (e: GraphEvent) => {
  const node = e.target;
  const nodeId = node.get('id');
  const autoDraw = graph.disableAutoDraw();
  graph.getNodes().forEach((n) => {
    if (n !== node) {
      n.setOpacity(0.2);
    }
  });
  graph.getEdges().forEach((edge: Edge) => {
    if (edge.get('source') !== nodeId && edge.get('target') !== nodeId) {
      edge.setState('blur');
    }
  });
  // Highlight all paths of the node on mouse hover
  const visited = {};
  const dfs = (id: string, direction: 'sources' | 'targets') => {
    const n = graph.getNodeById(id);
    n.setOpacity(1.0);
    n.edges.forEach((edge: Edge) => {
      if ((direction === 'sources' ? edge.target : edge.source) === n) {
        edge.removeState('blur');
      }
    });
    n[direction].forEach((id: string) => {
      if (visited[id] !== true) {
        visited[id] = true;
        dfs(id, direction);
      }
    });
  };
  dfs(nodeId, 'sources');
  dfs(nodeId, 'targets');
  graph.enableAutoDraw(autoDraw);
});

graph.on('node:mouseleave', (e: GraphEvent) => {
  graph.getNodes().forEach((node) => {
    node.setOpacity(1);
  });
  graph.getEdges().forEach((edge: Edge) => {
    edge.clearStates();
  });
});
```
