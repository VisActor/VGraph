---
category: examples
group: dag
title: 基础有向图
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/fundflow.png
link: dag/fundFlow
option:
---
# 基础有向图

数据描述：公司资金流转数据。 <br>交互操作： <code>hover 节点</code>: 展示起止路径。此外，本例子展示了如何设置仅x方向拖拽。

## 关键配置

- `Graph` / `DAGLayout`：保持原始布局与样式配置。
- `setDefaultNode` / `setDefaultEdge`：保留节点与连线外观。
- 交互行为：保留示例中的展开、收起、hover 或点击逻辑。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  GraphEvent,
  Edge,
  Node,
  dragCanvas,
} from '@visactor/vgraph';

const data = {
  nodes: [
    { name: '原始资金', id: '1' },
    { name: '股权债权', id: '2' },
    { name: '产品开发', id: '3' },
    { name: '固定资产', id: '4' },
    { name: '工资费用', id: '5' },
    { name: '产品宣传', id: '6' },
    { name: '产品销售', id: '7' },
    { name: '公司营收', id: '8' },
    { name: '税务', id: '9' },
    { name: '股利发放', id: '10' },
    { name: '公司经营', id: '11' },
  ],
  edges: [
    { source: '1', target: '2' },
    { source: '1', target: '3' },
    { source: '1', target: '4' },
    { source: '1', target: '5' },
    { source: '2', target: '8' },
    { source: '3', target: '6' },
    { source: '6', target: '7' },
    { source: '7', target: '8' },
    { source: '8', target: '9' },
    { source: '8', target: '10' },
    { source: '8', target: '11' },
  ],
};

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
    },
  },
  setDefaultNode(nodeData) {
    return {
      label: {
        width: 80,
        text: nodeData.name,
        fontSize: 16,
        textBaseline: 'middle',
        textAlign: 'center',
      },
      type: 'rect',
      width: 100,
      height: 30,
      radius: 5,
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
    };
  },
  setDefaultEdge() {
    return {
      type: 'line',
      lineWidth: 2,
      endArrow: true,
    };
  },
  setEdgeStateStyles(state: string) {
    if (state === 'blur') {
      return {
        opacity: 0.3,
      };
    }
  },
});
// 写入数据
graph.data(data);
// 添加鼠标拖拽画布交互
graph.addBehavior(dragCanvas, { xOnly: true });
graph.refresh();
// 适应视图大小
graph.fitView();

graph.on('node:mouseenter', (e: GraphEvent) => {
  const node = e.target;
  const nodeId = node.get('id');
  const autoDraw = graph.disableAutoDraw();
  graph.getNodes().forEach((n) => {
    if (n !== node) {
      n.setOpacity(0.2);
    }
  });
  graph.getEdges().forEach((edge: Edge) => {
    if (edge.get('source') !== nodeId && edge.get('target') !== nodeId) {
      edge.setState('blur');
    }
  });
  // 高亮鼠标 hover 到节点的全部路径
  const visited = {};
  const dfs = (id: string, direction: 'sources' | 'targets') => {
    const n = graph.getNodeById(id);
    n.setOpacity(1.0);
    n.edges.forEach((edge: Edge) => {
      if ((direction === 'sources' ? edge.target : edge.source) === n) {
        edge.removeState('blur');
      }
    });
    n[direction].forEach((id: string) => {
      if (visited[id] !== true) {
        visited[id] = true;
        dfs(id, direction);
      }
    });
  };
  dfs(nodeId, 'sources');
  dfs(nodeId, 'targets');
  graph.enableAutoDraw(autoDraw);
});

graph.on('node:mouseleave', (e: GraphEvent) => {
  graph.getNodes().forEach((node) => {
    node.setOpacity(1);
  });
  graph.getEdges().forEach((edge: Edge) => {
    edge.clearStates();
  });
});
```
