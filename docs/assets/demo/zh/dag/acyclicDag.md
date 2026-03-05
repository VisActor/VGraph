---
category: examples
group: dag
title: 有向无环图收起展开
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/acyclic_dag.gif
link: dag/acyclicDag
option:
---
# 有向无环图收起展开

收起展开可以帮助用户梳理整个图的结构，突出重点，是较为常用的交互。数据无环的收起/展开实现更容易一些。 <br>交互操作：<code>click 节点</code>: 收起/展开节点。

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
      edgeSep: 50,
      rankSep: 60,
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
fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_186c5d1eac181.json'
)
  .then((response) => response.json())
  .then((data) => {
    graph.data(data);
    graph.fitView();
  });

graph.addBehavior(panZoom);

graph.on('node:click', (e: GraphEvent) => {
  const node = e.target;

  graph.disableAutoDraw();
  // 关闭自动布局，在批量新增/删除节点时提升性能
  graph.set('autoLayout', false);
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
  // 获取 id 为 key,  Node 为 value 的节点 map
  const nodeMap = graph.getNodeMap();
  let nodes: any = [];
  let edges: any = [];
  const targets = node.targets;
  for (let i = targets.length - 1; i >= 0; i--) {
    const id = targets[i];
    const hideData = getNodeData(nodeMap[id]);
    nodes = nodes.concat(hideData.nodes);
    edges = edges.concat(hideData.edges);
  }
  return { nodes, edges };
}

function getNodeData(node: Node) {
  const nodeMap = graph.getNodeMap();
  let nodes = [node.configs];
  const nodeId = node.get('id');
  let edges: any = [];
  node.edges.forEach((edge: any) => {
    if (edge.get('target') === nodeId) {
      edges.push(edge.configs);
    }
  });
  const targets = node.targets;
  for (let i = targets.length - 1; i >= 0; i--) {
    const id = targets[i];
    // 递归移除下游节点的下游
    const hideData = getNodeData(nodeMap[id]);
    nodes = nodes.concat(hideData.nodes);
    edges = edges.concat(hideData.edges);
  }
  // 移除所有下游节点
  graph.remove(node);
  // 将移除节点和连线的数据记录下来，用于恢复
  return { nodes, edges };
}

function expand(node: Node) {
  node.set('collapsed', false);
  // 将删除的节点和连线恢复
  const { nodes, edges } = node.get('hideData');
  nodes.forEach((nodeData: any) => {
    graph.add('node', nodeData);
  });

  edges.forEach((edgeData: any) => {
    graph.add('edge', edgeData);
  });
}
```
