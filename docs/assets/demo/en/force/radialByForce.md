---
category: examples
group: force
title: Circular Layout
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/graphs_force_radial.png
link: force-spec/radialByForce
option:
---
# Circular Layout

Data Description: The relationship graph of characters in "Dream of the Red Chamber", processed into an ego network with Jia Baoyu as the central node.
Through the circular layout, the relationship between nodes and the central node can be easily discovered. Applying a basic force-directed layout on top of the circular layout makes it easy to observe the relationships between other nodes.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  RawTooltip,
  ForceDirectedLayout,
  ForceLink,
  ForceManyBody,
  ForceRadial,
  Circle,
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

const centerX = width / 2;
const centerY = height / 2;
const depthUpperBound = 8;
const nodeSize = 15;

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
      width: nodeSize,
      height: nodeSize,
      strokeStyle: '#fff',
      fillStyle: color[(nodeData.depth % 12) || 0],
    };
  },
  setNodeStateStyles(state) {
    if (state === 'active') {
      return { opacity: 1.0 };
    }
    return { opacity: 0.2 };
  },
  setDefaultEdge() {
    return { strokeStyle: '#ccc' };
  },
  setEdgeStateStyles(state) {
    if (state === 'active') {
      return { strokeStyle: '#A7A7A7' };
    }
    return { opacity: 0.2 };
  },
});

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894d4365891.json'
)
  .then((response) => response.json())
  .then((data) => {
    graph.data(data);
    graph.addBehavior(highlightRelations);
    graph.addBehavior(panZoom);
    graph.addBehavior(dragCanvas);

    const nodes = graph.getNodes().map((d) => d.configs);
    const centerNodeIdx = nodes.findIndex((d) => d.name === '贾宝玉');

    setBfsDepth(centerNodeIdx, graph);
    graph.updateData(data);
    const depths = nodes.map((d) => d.depth);
    const maxDepth = Math.max.apply(null, depths);
    const depthNum = {};
    depths.forEach((d) => {
      if (!depthNum[d]) {
        depthNum[d] = 1;
      } else {
        depthNum[d]++;
      }
    });
    const maxNum = Math.max.apply(null, Object.keys(depthNum).map((k) => depthNum[k]));

    const gap = (Math.sqrt(maxNum) * nodeSize) / 2;
    const radial = 2 * gap + 4 * nodeSize;

    nodes[centerNodeIdx].fx = centerX;
    nodes[centerNodeIdx].fy = centerY;

    const minRs = nodes.map((d) => d.depth * radial - gap);
    const maxRs = nodes.map((d) => d.depth * radial + gap);

    const forces = {
      link: new ForceLink({
        edges: data.edges,
        options: { distance: 0.2 * radial },
      }),
      manybody: new ForceManyBody({ options: { strength: -1.0 * radial } }),
      radial: new ForceRadial({
        options: {
          minR: minRs,
          maxR: maxRs,
          strength: 0.1,
          withAlpha: false,
          posX: centerX,
          posY: centerY,
        },
      }),
      posX: new ForceX({ options: { x: centerX, strength: 0.01 } }),
      posY: new ForceY({ options: { y: centerY, strength: 0.01 } }),
      collide: new ForceCollision({ options: { radius: nodeSize } }),
      center: new ForceCenter({ options: { x: centerX, y: centerY } }),
    };

    new RawTooltip(graph, {
      styles: { border: null, backgroundColor: null },
      content(entity) {
        return entity.get('name');
      },
      target: 'node',
    });

    addBkgShapes(maxDepth, radial, graph);
    const fdp = new ForceDirectedLayout({
      graph,
      forces,
      maxIteration: 300,
      tickIterations: 10,
      center: { x: centerX, y: centerY },
      onTick: () => graph.refresh(),
      onEnd: () => graph.fitView(),
      clearOnEndOnFirstCall: true,
    });

    graph.set('layout', fdp);
  });

function addBkgShapes(maxDepth, radial, graph) {
  const addShape = (rc) => {
    const shape = new Circle({
      cx: centerX,
      cy: centerY,
      r: rc,
      opacity: 1.0,
      lineWidth: 2,
      strokeStyle: '#ccc',
    });
    shape.capture = false;
    graph.getContainer().add(shape);
  };
  for (let i = 0; i < maxDepth + 1; i++) {
    addShape((radial * (i + i + 1)) / 2);
  }
  graph.fitView();
  graph.refresh();
}

function setBfsDepth(centerNodeIdx, graph) {
  graph.getNodes().forEach((d) => d.set('depth', depthUpperBound));
  graph.getNodes()[centerNodeIdx].set('depth', 0);
  bfs(
    graph,
    graph.getNodes()[centerNodeIdx],
    (node, parent) => {
      if (parent) {
        const nextDepth = parent.get('depth') + 1;
        node.set('depth', nextDepth > depthUpperBound ? depthUpperBound : nextDepth);
      }
    },
    false
  );
}

function bfs(graph, startnode, callback, directed) {
  const queue = [];
  queue.push(startnode);
  const visited = {};
  visited[startnode.get('id')] = true;
  while (queue.length > 0) {
    const node = queue.shift();
    node.targets.forEach((vid) => {
      const nextNode = graph.getNodeMap()[vid];
      if (!visited[vid]) {
        visited[vid] = true;
        queue.push(nextNode);
        callback(nextNode, node);
      }
    });
    if (!directed && node.sources) {
      node.sources.forEach((vid) => {
        const nextNode = graph.getNodeMap()[vid];
        if (!visited[vid]) {
          visited[vid] = true;
          queue.push(nextNode);
          callback(nextNode, node);
        }
      });
    }
  }
}
```
