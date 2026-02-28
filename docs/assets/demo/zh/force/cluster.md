---
category: examples
group: force
title: 聚簇图布局
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/force_cluster.png
 link: force-spec/cluster
option:
---
# 聚簇图布局

数据描述: VIS合作者网络，通过类间排斥力和类内吸引力达到聚簇效果。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  dragNode,
  ForceLink,
  ForceManyBody,
  IntraClusterForce,
  InterClusterForce,
  ForceX,
  ForceY,
  ForceCollision,
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
const x = width / 2;
const y = height / 2;
const forces = {
  link: new ForceLink({ options: { distance: 0 } }),
  manybody: new ForceManyBody({ options: { strength: -100 } }),
  attrCluster: new IntraClusterForce({ options: { strength: 0.2 } }),
  repulCluster: new InterClusterForce({ options: { strength: -10 } }),
  x: new ForceX({ options: { x, strength: 0.2 } }),
  y: new ForceY({ options: { y, strength: 0.2 } }),
  collision: new ForceCollision({
    options: { radius: (d) => d.width * 0.5 + 2 || 5 },
  }),
  center: new ForceCenter({ options: { x, y } }),
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
      forces,
      tickIterations: 10,
      maxIteration: 300,
      clearOnEndOnFirstCall: true,
      onTick: () => {
        graph.refresh();
      },
      onEnd: () => {
        graph.fitView();
      },
    },
  },
  setDefaultNode(nodeData) {
    return {
      type: 'circle',
      width: nodeData.r * 2 || 10,
      height: nodeData.r * 2 || 10,
      strokeStyle: null,
      fillStyle: color[nodeData.group % 13],
    };
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
