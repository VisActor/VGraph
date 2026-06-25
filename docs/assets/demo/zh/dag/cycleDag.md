---
category: examples
group: dag
title: 有环有向图收起展开
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/cycle_dag.gif
link: dag/cycleDag
option:
---
# 有环有向图收起展开

收起展开可以帮助用户梳理整个图的结构，突出重点，是较为常用的交互。有环的数据处理要格外谨慎，此数据集中 S, VP, NP 三个节点与对应连线就构成了环，当收起 VP 时一般是指收起 VBZ 和 NP 两个节点。 <br>交互操作：<code>click 节点</code>: 收起/展开节点。

## 关键配置

- `Graph` / `DAGLayout`：保持原始布局与样式配置。
- `setDefaultNode` / `setDefaultEdge`：保留节点与连线外观。
- 交互行为：保留示例中的展开、收起、hover 或点击逻辑。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, Node, panZoom, GraphEvent } from '@visactor/vgraph';

const container = document.getElementById(CONTAINER_ID);
// 初始化 graph 实例
const graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  layout: {
    type: 'dag',
    options: {
      rankDir: 'LR',
      nodeSep: 50,
      edgeSep: 20,
      rankSep: 60,
      cache: true,
    },
  },
  setDefaultNode(nodeData: any) {
    return {
      type: 'rect',
      width: 100,
      height: 30,
      radius: 4,
      // 锚点用于指定允许连线连接的相对位置
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
    };
  },
  setDefaultEdge() {
    return {
      type: 'line',
      lineWidth: 1,
      endArrow: true,
    };
  },
});

graph.data({
  nodes: [
    { label: 'TOP', class: 'type-TOP', id: '0' },
    { label: 'S', class: 'type-S', id: '1', strokeStyle: '#3370FF' },
    { label: 'NP', class: 'type-NP', id: '2' },
    { label: 'DT', class: 'type-DT', id: '3' },
    { label: 'This', class: 'type-TK', id: '4' },
    { label: 'VP', class: 'type-VP', id: '5', strokeStyle: '#3370FF' },
    { label: 'VBZ', class: 'type-VBZ', id: '6' },
    { label: 'NP', class: 'type-NP', id: '8', strokeStyle: '#3370FF' },
    { label: 'type.', class: 'type-.', id: '13' },
    { label: 'sentence', class: 'type-TK', id: '14' },
  ],
  edges: [
    { source: '3', target: '4' },
    { source: '2', target: '3' },
    { source: '1', target: '2' },
    { source: '5', target: '6' },
    { source: '5', target: '8', strokeStyle: '#3370FF' },
    { source: '1', target: '5', strokeStyle: '#3370FF' },
    { source: '13', target: '14' },
    { source: '1', target: '13' },
    { source: '0', target: '1' },
    { source: '8', target: '1', strokeStyle: '#3370FF' },
  ],
});
graph.fitView();

graph.addBehavior(panZoom);
graph.on('node:click', (e: GraphEvent) => {
  const node = e.target;
  // 关闭自动布局，在批量新增/删除节点时提升性能
  graph.set('autoLayout', false);
  graph.disableAutoDraw();
  if (node.get('collapsed')) {
    expand(node);
  } else {
    const data = collapse(node);
    node.set('hideData', data);
  }
  // 批量操作后恢复自动布局
  graph.set('autoLayout', true);
  // 固定被操作节点 node 刷新布局
  graph.layout(node.get('id'));
  graph.enableAutoDraw();
});

function collapse(node: Node) {
  node.set('collapsed', true);

  const nodeRank = node.get('rank');
  let nodes: any = [];
  let edges: any = [];
  const targets = nodeRank > 0 ? node.targets : node.sources;
  for (let i = targets.length - 1; i >= 0; i--) {
    const id = targets[i];
    const hideData = getNodeData(graph.getNodeById(id), nodeRank);
    if (hideData) {
      nodes = nodes.concat(hideData.nodes);
      edges = edges.concat(hideData.edges);
    }
  }
  return { nodes, edges };
}

function getNodeData(node: Node, rank: number) {
  let nodes: any = [];
  const nodeId = node.get('id');
  // DagLayout 会在节点上写入 rank 字段用于表名节点所在层级，根据 rank 单向收起节点避免遇到环死循环
  const nodeRank = node.get('rank');
  if ((rank > 0 && nodeRank < rank) || (rank < 0 && nodeRank > rank)) {
    return;
  }
  let edges: any = [];
  node.edges.forEach((edge: any) => {
    const sourceRank = graph.getNodeById(edge.get('source')).get('rank');
    const targetRank = graph.getNodeById(edge.get('target')).get('rank');
    if (
      (rank > 0 && edge.get('target') === nodeId) ||
      (rank < 0 && edge.get('source') === nodeId) ||
      sourceRank > targetRank
    ) {
      edges.push(edge.configs);
    }
  });
  const targets = nodeRank > 0 ? node.targets : node.sources;
  for (let i = targets.length - 1; i >= 0; i--) {
    const hideData = getNodeData(
      graph.getNodeById(targets[i]),
      node.get('rank')
    );
    if (hideData) {
      nodes = nodes.concat(hideData.nodes);
      edges = edges.concat(hideData.edges);
    }
  }
  nodes.push(node.configs);
  graph.remove(node);
  return { nodes, edges };
}

function expand(node: Node) {
  node.set('collapsed', false);
  const { nodes, edges } = node.get('hideData');
  // 将删除的节点和连线恢复
  nodes.forEach((nodeData: any) => {
    graph.add('node', nodeData);
  });

  edges.forEach((edgeData: any) => {
    graph.add('edge', edgeData);
  });
}
```
