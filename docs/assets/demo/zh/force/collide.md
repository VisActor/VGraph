---
category: examples
group: force
title: 基础的圆形无重叠
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/collide.png
 link: force-spec/collide
option:
---
# 基础的圆形无重叠

数据描述：随机生成的圆形 bubble 数据。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  panZoom,
  dragCanvas,
  dragNode,
  ForceCollision,
  ForceManyBody,
  ForceX,
  ForceY,
  Node,
} from '@visactor/vgraph';

function bubbleData() {
  const k = 4;
  const nClusters = 10;
  const r = () => Math.random() * 3 * k + k;
  const nodes = Array.from({ length: 200 }, (_, i) => ({
    r: r(),
    group: i && i % nClusters,
  }));
  return { nodes, edges: [] };
}
const data = bubbleData();

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

const nonCollisionForce = {
  x: new ForceX({ options: { x: width / 2, strength: 0.1 } }),
  y: new ForceY({ options: { y: height / 2, strength: 0.1 } }),
  repul: new ForceManyBody({ options: { strength: -10 } }),
  collision: new ForceCollision({
    options: { radius: data.nodes.map((d) => d.r) },
  }),
};

const graph = new Graph({
  container: CONTAINER_ID,
  width,
  height,
  minRatio: 0.2,
  maxRatio: 8,
  linkCenter: true,
  layout: {
    type: 'force',
    options: {
      forces: nonCollisionForce,
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
      width: nodeData.r * 2,
      height: nodeData.r * 2,
      strokeStyle: '#fff',
      fillStyle: color[nodeData.group % 12],
    };
  },
});

graph.data(data);

graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);
graph.addBehavior(dragNode, {
  onDrag: (node, x, y) => {
    node.configs.fx = node.configs.x;
    node.configs.fy = node.configs.y;
    graph.layout();
  },
  onDrop: (node) => {
    node.configs.fx = undefined;
    node.configs.fy = undefined;
    graph.layout();
  },
  delegate: false,
});
```
