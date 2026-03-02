---
category: examples
group: force
title: Force Layout with Non-Overlapping Labels
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/labelCollide.png
link: force-spec/labelCollide
option:
---
# Force Layout with Non-Overlapping Labels

Data Description: miserables data.<br>
By setting the collision width and height to the actual rendered width and height of the node and text label, a non-overlapping effect is achieved in scenes where nodes have text labels.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  dragNode,
  ForceCollision,
  ForceLink,
  ForceManyBody,
  ForceCenter,
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

let graph;

const collisionForce = new ForceCollision({
  options: {
    width: (nodeData) => {
      const nodeInst = graph.getNodeById(nodeData.id);
      return nodeInst && nodeInst.layer ? nodeInst.layer.getBBoxForHit().width + 3 : 20;
    },
    height: (nodeData) => {
      const nodeInst = graph.getNodeById(nodeData.id);
      return nodeInst && nodeInst.layer ? nodeInst.layer.getBBoxForHit().height : 20;
    },
  },
});

const forces = {
  link: new ForceLink({ options: { distance: 30 } }),
  charge: new ForceManyBody({ options: { strength: -60 } }),
  collide: collisionForce,
  center: new ForceCenter({ options: { x: width / 2, y: height / 2 } }),
};

graph = new Graph({
  container: CONTAINER_ID,
  width,
  height,
  layout: {
    type: 'force',
    options: {
      forces,
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
  setDefaultNode(nodeData) {
    return {
      type: 'circle',
      width: 20,
      height: 20,
      strokeStyle: '#fff',
      fillStyle: color[nodeData.group % 12],
      label: {
        text: nodeData.id,
        fontSize: 8,
        textBaseline: 'middle',
        textAlign: 'center',
        offsetX: 0,
        offsetY: 12,
        fillStyle: '#333',
        opacity: 1,
      },
    };
  },
  setDefaultEdge() {
    return {
      strokeStyle: '#ddd',
    };
  },
});

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18949c3ac3627.json'
)
  .then((response) => response.json())
  .then((data) => {
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
```
