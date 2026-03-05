---
category: examples
group: force
title: 限制节点在视觉窗口内
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/graphs_force_keptBbox.png
 link: force-spec/keptBbox
option:
---
# 限制节点在视觉窗口内

数据描述: VIS合作者网络 <br>交互操作: 拖拽节点可以观察力导向布局的变化。 <br> 限制节点在视觉窗口内。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  dragNode,
  ForceDirectedLayout,
  ForceCollision,
  ForceLink,
  ForceManyBody,
  ForceCenter,
  ForceX,
  ForceY,
  Rect,
  Node,
} from '@visactor/vgraph';

const color = [
  '#4c72b0',
  '#dd8452',
  '#25a868',
  '#c44e52',
  '#8172b3',
  '#937860',
  '#da8bc3',
  '#8c8c8c',
  '#ccb974',
  '#64b5cd',
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

    const nodes = graph.getNodes();
    const collisionForce = new ForceCollision({
      options: {
        width: nodes.map((node) => {
          return node.layer.getBBoxForHit().width + 3;
        }),
        height: nodes.map((node) => {
          return node.layer.getBBoxForHit().height;
        }),
      },
    });

    const borderDist = 100;
    const consForceX = new ForceX({
      options: {
        strength: 1.0,
        minX: nodes.map((d) => {
          return borderDist + d.layer.getBBoxForHit().width / 2;
        }),
        maxX: nodes.map((d) => {
          return width - borderDist - d.layer.getBBoxForHit().width / 2;
        }),
        withAlpha: false,
      },
    });
    const consForceY = new ForceY({
      options: {
        strength: 1.0,
        minY: nodes.map((d) => {
          return borderDist + d.configs.height / 2;
        }),
        maxY: nodes.map((d) => {
          return height - borderDist - d.layer.getBBoxForHit().height / 2;
        }),
        withAlpha: false,
      },
    });
    const forces = {
      link: new ForceLink({ edges: data.edges, options: { distance: 30 } }),
      charge: new ForceManyBody({ options: { strength: -60 } }),
      collide: collisionForce,
      center: new ForceCenter({ options: { x: width / 2, y: height / 2 } }),
      consX: consForceX,
      consY: consForceY,
    };

    const fdp = new ForceDirectedLayout({
      graph,
      forces,
      maxIteration: 300,
      tickIterations: 10,
      onTick: () => {
        graph.refresh();
      },
    });
    graph.set('layout', fdp);
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
    const addShape = () => {
      const shape = new Rect({
        left: borderDist,
        top: borderDist,
        width: width - 2 * borderDist,
        height: height - 2 * borderDist,
        opacity: 0.2,
        strokeStyle: '#c44e52',
      });
      shape.capture = false;
      graph.getContainer().add(shape);
    };
    addShape();
  });
```
