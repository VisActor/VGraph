---
category: examples
group: dag
title: Nested Layout
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/nested.png
link: dag/nested
option:
---
# Nested Layout

Data description: Grouped data can easily cause group overlap and poor readability if you do not relayout each group. VGraph supports nested layouts to achieve better layout results.

## Key Configurations

- `Graph` / `DAGLayout`: Maintain the original layout and style configuration.
- `setDefaultNode` / `setDefaultEdge`: Preserve the appearance of nodes and lines.
- Interactive behaviors: Retain the expand, collapse, hover, or click logic from the example.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom } from '@visactor/vgraph';

// Initialize the graph instance
const container = document.getElementById(CONTAINER_ID);
const graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.1,
  layout: {
    type: 'nestedDag',
    options: {
      dagOptions: {
        rankDir: 'LR',
        nodeSep: 80,
        edgeSep: 20,
        rankSep: 100,
      }
    }
  },
  setDefaultNode(nodeData: any) {
    return {
      type: 'rect',
      width: 120,
      height: 40,
      radius: 4,
      fillStyle: '#fff',
      text: nodeData.name != null ? nodeData.name : (nodeData.id != null ? nodeData.id : 'null'),
      label: {
        width: 80,
        text: nodeData.name != null ? nodeData.name : (nodeData.id != null ? nodeData.id : 'null'),
        textOverflow: 'ellipsis',
      },
      rectWidth: 20,
      anchors: [
        [0, 0.5],
        [1, 0.5],
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
      linkNode: false,
      fillStyle: '#F3F9FF',
      strokeStyle: '#3073F2',
      radius: 4,
      padding: 10,
      anchors: [
        [0, 0.5],
        [1, 0.5],
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
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_186c5d878fe34.json'
)
  .then((response) => response.json())
  .then((data) => {
    // Write data
    graph.data(data);
    // Fit to view size
    graph.fitView();
  });
```
