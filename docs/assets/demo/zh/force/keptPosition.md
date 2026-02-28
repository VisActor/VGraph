---
category: examples
group: force
title: 展开收起保留原有结构
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/keptPosition.gif
 link: force-spec/keptPosition
option:
---
# 展开收起保留原有结构

数据描述: VIS合作者网络。<br>交互操作: 双击节点展开/收起节点。尽可能在展开收起时保持原有结构。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  dragNode,
  uuid,
  ForceX,
  ForceY,
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
  layout: {
    type: 'force',
    options: {
      autoFDP: true,
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
      width: 15,
      height: 15,
      strokeStyle: '#fff',
      fillStyle: color[(nodeData.group % 13) || 0],
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
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18949c3ac3627.json'
)
  .then((response) => response.json())
  .then((data) => {
    graph.data(data);
    graph.addBehavior(highlightRelations);
    graph.addBehavior(panZoom);
    graph.addBehavior(dragCanvas);

    const fdp = graph.get('layout');

    graph.addBehavior(dragNode, {
      onDrag: (node, x, y) => {
        node.set('fx', node.get('x'));
        node.set('fy', node.get('y'));
        fdp.layout();
      },
      onDrop: (node) => {
        node.set('fx', undefined);
        node.set('fy', undefined);
        fdp.layout();
      },
      delegate: false,
    });

    graph.on('node:dblclick', (e) => {
      const target = e.target;
      const x = target.get('x');
      const y = target.get('y');
      if (target.get('children')) {
        collapseNode(target.configs, data);
        const autoLayout = graph.disableAutoLayout();
        graph.updateData(data);
        graph.enableAutoLayout(autoLayout);
        return;
      }
      const id = target.get('id');
      const nodes = [];
      const edges = [];
      for (let i = 0; i < 20; i++) {
        const nid = uuid(8);
        nodes.push({
          id: nid,
          expended: true,
          group: Math.random() > 0.1 ? target.get('group') : Math.round(Math.random() * 10),
        });
        edges.push({ source: id, target: nid });
      }
      edges.push({ source: nodes[0].id, target: nodes[1].id });
      edges.push({ source: nodes[2].id, target: nodes[3].id });
      edges.push({ source: nodes[4].id, target: nodes[5].id });
      edges.push({ source: nodes[5].id, target: nodes[6].id });
      edges.push({ source: nodes[6].id, target: nodes[7].id });

      expandNode(target.configs, { nodes, edges }, data);
      const autoLayout = graph.disableAutoLayout();
      graph.updateData(data);
      assignPosition(target, nodes.map((d) => d.id), graph);

      const originNodes = graph.getNodes().map((d) => d.configs);
      const consForcePosX = new ForceX({
        nodes: originNodes,
        options: {
          strength: originNodes.map((d) => (d.expended || d.id === id ? 0.05 : 0.1)),
          x: originNodes.map((d) => (d.expended ? x : d.x)),
        },
      });
      const consForcePosY = new ForceY({
        nodes: originNodes,
        options: {
          strength: originNodes.map((d) => (d.expended || d.id === id ? 0.05 : 0.1)),
          y: originNodes.map((d) => (d.expended ? y : d.y)),
        },
      });
      originNodes.forEach((d) => {
        d.expended = undefined;
      });
      fdp.removeForce('consForcePosX');
      fdp.addForce('consForcePosX', consForcePosX);
      fdp.removeForce('consForcePosY');
      fdp.addForce('consForcePosY', consForcePosY);
      graph.enableAutoLayout(autoLayout);
    });
  });

function assignPosition(parent, children, graph) {
  const x = parent.x;
  const y = parent.y;
  const nodes = graph.getNodes().map((d) => d.configs);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  nodes.forEach((node) => {
    if (node.x != null) {
      if (node.x < minX) minX = node.x;
      if (node.x > maxX) maxX = node.x;
    }
    if (node.y != null) {
      if (node.y < minY) minY = node.y;
      if (node.y > maxY) maxY = node.y;
    }
  });
  const xRange = maxX - minX;
  const yRange = maxY - minY;
  const initialRadius = Math.max(Math.sqrt((xRange * yRange) / nodes.length) * 0.01, 1);
  const initialAngle = Math.PI * (3 - Math.sqrt(5));
  const nodeIdMap = graph.getNodeMap();
  let count = 0;
  children.forEach((nodeId) => {
    const node = nodeIdMap[nodeId].configs;
    if (isNaN(node.vx)) node.vx = 0;
    if (isNaN(node.vy)) node.vy = 0;
    const radius = initialRadius * Math.sqrt(0.5 + count);
    const angle = count * initialAngle;
    if (node.x == null) {
      count++;
      node.x = node.fx != null ? node.fx : x + radius * Math.cos(angle) * 5;
    }
    if (node.y == null) {
      node.y = node.fy != null ? node.fy : y + radius * Math.sin(angle) * 5;
    }
  });
}

function collapseNode(targetNode, data) {
  collapse(targetNode, data);
  const collapseNodeList = data.nodes.filter((node) => node.collapse);
  const collapseEdgeList = data.edges.filter((edge) => edge.collapse);
  data.nodes = data.nodes.filter((node) => !node.collapse);
  data.edges = data.edges.filter((edge) => !edge.collapse);
  targetNode.children = undefined;
}

function collapse(targetNode, data) {
  if (targetNode.children) {
    targetNode.children.forEach((child) => {
      collapse(child, data);
      child.collapse = true;
    });
    targetNode.children = null;
  }
  if (targetNode.expendEdges) {
    targetNode.expendEdges.forEach((edge) => {
      edge.collapse = true;
    });
  }
}

function expandNode(targetNode, expandData, data) {
  targetNode.children = [];
  targetNode.expendEdges = [];
  expandData.nodes.forEach((node) => {
    targetNode.children.push(node);
    data.nodes.push(node);
  });
  expandData.edges.forEach((edge) => {
    data.edges.push(edge);
    targetNode.expendEdges.push(edge);
  });
}
```
