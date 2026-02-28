---
category: examples
group: dag
title: 简易泳道图-水平
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/swim_lane_h.png
link: dag/dataAnalysisH
option:
---
# 简易泳道图-水平

原始 vgraph demo 迁移到 vgraph，保持主要交互与布局行为。

## 关键配置

- `Graph` / `DAGLayout`：保持原始布局与样式配置。
- `setDefaultNode` / `setDefaultEdge`：保留节点与连线外观。
- 交互行为：保留示例中的展开、收起、hover 或点击逻辑。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, DAGLayout, GraphEvent, Node, Edge, Group } from '@visactor/vgraph';

const data = {
  nodes: [
    { id: '2.1.2' },
    { id: '2.2.0' },
    { id: '2.2.1' },
    { id: '2.2.2' },
    { id: '2.3.0' },
    { id: '2.3.1' },
    { id: '2.3.2' },
    { id: '2.4.0' },
    { id: '2.4.1' },
  ],
  edges: [
    { source: '2.1.2', target: '2.2.0' },
    { source: '2.2.0', target: '2.2.1' },
    { source: '2.2.1', target: '2.2.2' },
    { source: '2.2.2', target: '2.3.0' },
    { source: '2.3.0', target: '2.3.1' },
    { source: '2.3.1', target: '2.3.2' },
    { source: '2.3.2', target: '2.4.0' },
    { source: '2.4.0', target: '2.4.1' },
  ],
  groups: [
    { id: '2.1.x', children: ['2.1.2'] },
    { id: '2.2.x', children: ['2.2.0', '2.2.1', '2.2.2'] },
    { id: '2.3.x', children: ['2.3.0', '2.3.1', '2.3.2'] },
    { id: '2.4.x', children: ['2.4.0', '2.4.1'] },
  ],
};

const container = document.getElementById(CONTAINER_ID);

// 初始化 graph 实例
const graph = new Graph({
  container: CONTAINER_ID,
  width: container.scrollWidth,
  height: container.scrollHeight,
  setDefaultNode(nodeData) {
    const index = parseInt(nodeData.id.charAt(2), 10) - 1;
    return {
      label: {
        text: nodeData.id,
        fontSize: 14,
        textBaseline: 'middle',
        textAlign: 'center',
        fillStyle: 'rgba(20, 20, 20, 0.9)',
      },
      type: 'rect',
      width: 140,
      height: 48,
      radius: 3,
      strokeStyle: '#E1E4EB',
      // 自定义节点所在层级，DagLayout 会根据 rank 字段对节点分层
      rank: index,
      anchors: [
        [0, 0.5],
        [0.5, 0],
        [0.5, 1],
        [1, 0.5],
      ],
    };
  },
  setNodeStateStyles(state, nodeData, node) {
    const label = node.getLabel();
    if (state === 'hover') {
      label.set('fillStyle', '#2E62F1');
      return { strokeStyle: '#2E62F1' };
    }
    if (state === 'active') {
      label.set('fillStyle', '#fff');
      return {
        fillStyle: '#2E62F1',
        strokeStyle: '#2E62F1',
      };
    }
    if (state === 'default') {
      label.set('fillStyle', 'rgba(20, 20, 20, 0.9)');
      return {
        strokeStyle: '#E1E4EB',
        fillStyle: '#fff',
      };
    }
  },
  setDefaultEdge(edgeData) {
    const sourceId = graph.getNodeById(edgeData.source).get('groupId');
    const targetId = graph.getNodeById(edgeData.target).get('groupId');
    // 同层级节点间用直线
    let type = 'line';
    let sourceAnchor = undefined;
    let targetAnchor = undefined;
    if (sourceId !== targetId) {
      // 不同层级节点之间用水平折线，并指定连线连接点
      type = 'vLine';
      sourceAnchor = 2;
      targetAnchor = 1;
    }
    return {
      type: type,
      lineWidth: 1,
      hitWidth: 6,
      strokeStyle: '#D1D5DA',
      endArrow: true,
      sourceAnchor,
      targetAnchor,
    };
  },
  setEdgeStateStyles(state, edgeData, edge) {
    if (state === 'hover') {
      // 避免连线重合时出现显示错误
      edge.toFront();
      return {
        strokeStyle: '#2E62F1',
      };
    }
    if (state === 'active') {
      edge.toFront();
      return {
        lineWidth: 2,
        strokeStyle: '#2E62F1',
      };
    }
  },
  setDefaultGroup(groupData) {
    return {
      strokeStyle: '#D9D9D9',
      fillStyle: '#FAFBFC',
      radius: 12,
      linkNode: true,
      padding: 20,
      // 指定分组标题栏在整个分组的左侧
      titlePosition: 'left',
      title: {
        text: { text: groupData.id, fillStyle: '#626978', y: 45 },
        background: {
          fillStyle: '#F0F3F6',
        },
      },
    };
  },
});
// 写入数据
graph.data(data);
new DAGLayout({
  graph,
  rankDir: 'TB',
  nodeSep: 24,
  rankSep: 64,
  ranker: 'custom',
  ignoreGroup: true,
});
let minX = Infinity;
let maxX = -Infinity;
graph.getNodes().forEach((node: Node) => {
  const x = node.get('x');
  minX = Math.min(x, minX);
  maxX = Math.max(x, maxX);
});

graph.getGroups().forEach((group: Group) => {
  group.updateData({
    // minX 是最左侧节点的中心坐标，减去宽度的一半
    fixLeft: minX - 70,
    // maxX - minX 相对于整行的长度相差一个节点的宽度
    fixWidth: maxX - minX + 140,
  });
});
graph.refresh();
// 适应视图大小
graph.fitView();
// 添加交互
// hover node
graph.on('node:mouseenter', (e: GraphEvent) => {
  e.target.setState('active');
});

graph.on('node:mouseleave', (e: GraphEvent) => {
  e.target.setState('default', true);
});

//hover edge
graph.on('edge:mouseenter', (e: GraphEvent) => {
  const edge = e.target;
  edge.setState('active');
  edge.source.setState('hover');
  edge.target.setState('hover');
});

graph.on('edge:mouseleave', (e: GraphEvent) => {
  const edge = e.target;
  edge.removeState('active');
  edge.source.setState('default', true);
  edge.target.setState('default', true);
});

// 点击分组收起/展开
graph.on('group:click', (e) => {
  const group = e.target;
  if (group.get('collapsed')) {
    group.expand();
  } else {
    group.collapse();
  }
});
```
