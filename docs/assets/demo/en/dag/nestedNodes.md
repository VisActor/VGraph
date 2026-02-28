---
category: examples
group: dag
title: Nested Layout - Connecting Nodes
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/nested_nodes.png
link: dag/nestedNodes
option:
---
# Nested Layout - Connecting Nodes

Migrating the original vgraph demo to vgraph, maintaining the main interaction and layout behavior.

## Key Configurations

- `Graph` / `DAGLayout`: Maintain the original layout and style configuration.
- `setDefaultNode` / `setDefaultEdge`: Preserve the appearance of nodes and lines.
- Interactive behaviors: Retain the expand, collapse, hover, or click logic from the example.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { DAGLayout, Graph, panZoom } from '@visactor/vgraph';

const container = document.getElementById(CONTAINER_ID);

const graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.1,
  setDefaultNode(nodeData: any) {
    return {
      type: 'rect',
      width: 120,
      height: 40,
      radius: 4,
      fillStyle: '#fff',
      label: nodeData.id,
      anchors: [
        [0.5, 0],
        [0.5, 1],
      ],
    };
  },
  setDefaultEdge() {
    return {
      type: 'line',
      endArrow: true,
    };
  },
  setDefaultGroup(group: any) {
    return {
      linkNode: true,
      fillStyle: '#F3F9FF',
      strokeStyle: '#3073F2',
      radius: 4,
      padding: 10,
      anchors: [
        [0.5, 0],
        [0.5, 1],
      ],
      title: {
        text: { text: group.id, fillStyle: '#fff' },
        background: {
          fillStyle: '#3073F2',
        },
      },
    };
  },
});
graph.addBehavior(panZoom);

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894df5c3f850.json'
)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    // Write data
    graph.data(data);
    // Apply layout
    new DAGLayout({
      graph,
      options: {
        rankDir: 'TB',
        nodeSep: 80,
        edgeSep: 20,
        rankSep: 100,
        // Enable special optimization for directly connected nodes. You can comment this out to compare the effect.
        linkNode: true,
      },
    });
    // Refresh node positions based on the layout result
    graph.refresh();
    // Fit to view size
    graph.fitView();
  });
```
