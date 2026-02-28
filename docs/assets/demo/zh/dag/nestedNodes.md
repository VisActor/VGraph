---
category: examples
group: dag
title: 嵌套布局-连接节点
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/nested_nodes.png
link: dag/nestedNodes
option:
---
# 嵌套布局-连接节点

原始 vgraph demo 迁移到 vgraph，保持主要交互与布局行为。

## 关键配置

- `Graph` / `DAGLayout`：保持原始布局与样式配置。
- `setDefaultNode` / `setDefaultEdge`：保留节点与连线外观。
- 交互行为：保留示例中的展开、收起、hover 或点击逻辑。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { DAGLayout, Graph, panZoom } from '@visactor/vgraph';

const container = document.getElementById(CONTAINER_ID);

const graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.1,
  setDefaultNode(nodeData: any) {
    return {
      type: 'rect',
      width: 120,
      height: 40,
      radius: 4,
      fillStyle: '#fff',
      label: nodeData.id,
      anchors: [
        [0.5, 0],
        [0.5, 1],
      ],
    };
  },
  setDefaultEdge() {
    return {
      type: 'line',
      endArrow: true,
    };
  },
  setDefaultGroup(group: any) {
    return {
      linkNode: true,
      fillStyle: '#F3F9FF',
      strokeStyle: '#3073F2',
      radius: 4,
      padding: 10,
      anchors: [
        [0.5, 0],
        [0.5, 1],
      ],
      title: {
        text: { text: group.id, fillStyle: '#fff' },
        background: {
          fillStyle: '#3073F2',
        },
      },
    };
  },
});
graph.addBehavior(panZoom);

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894df5c3f850.json'
)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    // 写入数据
    graph.data(data);
    // 应用布局
    new DAGLayout({
      graph,
      options: {
        rankDir: 'TB',
        nodeSep: 80,
        edgeSep: 20,
        rankSep: 100,
        // 对直接连接节点的情况开启特殊优化，可以注释掉对比效果
        linkNode: true,
      },
    });
    // 根据布局结果刷新节点位置
    graph.refresh();
    // 适应视图大小
    graph.fitView();
  });
```
