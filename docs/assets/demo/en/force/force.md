---
category: examples
group: force
title: Basic Force-Directed Graph
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/force_basic.png
link: force-spec/force
option:
---
# Basic Force-Directed Graph

Data description: VIS collaborators network. <br>Interaction: dragging nodes lets you observe changes in the force layout.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  dragNode,
  Node,
} from '@visactor/vgraph';

const color = [
  '#5678D6',
  '#EB8D2F',
  '#59A649',
  '#E0BA2D',
  '#A56AAD',
  '#6DBEC9',
  '#D95145',
  '#A0A0AD',
  '#94674E',
  '#ED848F',
  '#a305e5',
  '#000000',
  '#d0ff8f',
];

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;

const graph = new Graph({
  container: CONTAINER_ID,
  width,
  height,
  minRatio: 0.2,
  maxRatio: 8,
  linkCenter: true,
  setDefaultNode(nodeData) {
    return {
      type: 'circle',
      width: 15,
      height: 15,
      strokeStyle: '#fff',
      fillStyle: color[nodeData.group % 13],
    };
  },
  layout: {
    type: 'force',
    options: {
      maxIteration: 300,
      tickIterations: 10,
      onTick: () => {
        graph.refresh();
      },
      onEnd: () => {
        graph.fitView();
      },
      clearOnEndOnFirstCall: true,
    },
  },
  setNodeStateStyles(state) {
    if (state === 'active') {
      return {
        opacity: 1.0,
      };
    }
    return { opacity: 0.2 };
  },
  setDefaultEdge() {
    return {
      strokeStyle: '#ccc',
    };
  },
  setEdgeStateStyles(state) {
    if (state === 'active') {
      return {
        strokeStyle: '#A7A7A7',
      };
    }
    return { opacity: 0.2 };
  },
});

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18949c3ac5677.json'
)
  .then((response) => response.json())
  .then((data) => {
    if (data.links) {
      dealData(data);
    }
    graph.data(data);
    graph.addBehavior(highlightRelations);
    graph.addBehavior(panZoom);
    graph.addBehavior(dragCanvas);
    graph.addBehavior(dragNode, {
      onDrag: (node, x, y) => {
        node.set('fx', node.get('x'));
        node.set('fy', node.get('y'));
        graph.layout();
      },
      onDrop: (node) => {
        node.set('fx', undefined);
        node.set('fy', undefined);
        graph.layout();
      },
      delegate: false,
    });
  });

function dealData(data) {
  const nodes = data.nodes;
  nodes.forEach((node) => {
    node.id = node.name;
  });
  data.links.forEach((edge) => {
    edge.source = nodes[edge.source].id;
    edge.target = nodes[edge.target].id;
  });
  data.edges = data.links;
  return data;
}
```
