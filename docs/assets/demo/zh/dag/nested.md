---
category: examples
group: dag
title: 嵌套布局
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/nested.png
link: dag/nested
option:
---
# 嵌套布局

数据描述：带分组的数据如果不对每个分组重新布局容易产生分组覆盖看不清等问题。VGraph 支持嵌套布局以达到更好的布局效果。

## 关键配置

- `Graph` / `DAGLayout`：保持原始布局与样式配置。
- `setDefaultNode` / `setDefaultEdge`：保留节点与连线外观。
- 交互行为：保留示例中的展开、收起、hover 或点击逻辑。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom } from '@visactor/vgraph';

// 初始化 graph 实例
const container = document.getElementById(CONTAINER_ID);
const graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.1,
  layout: {
    type: 'nestedDag',
    options: {
      dagOptions: {
        rankDir: 'LR',
        nodeSep: 80,
        edgeSep: 20,
        rankSep: 100,
      }
    }
  },
  setDefaultNode(nodeData: any) {
    return {
      type: 'rect',
      width: 120,
      height: 40,
      radius: 4,
      fillStyle: '#fff',
      text: nodeData.name != null ? nodeData.name : (nodeData.id != null ? nodeData.id : 'null'),
      label: {
        width: 80,
        text: nodeData.name != null ? nodeData.name : (nodeData.id != null ? nodeData.id : 'null'),
        textOverflow: 'ellipsis',
      },
      rectWidth: 20,
      anchors: [
        [0, 0.5],
        [1, 0.5],
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
      linkNode: false,
      fillStyle: '#F3F9FF',
      strokeStyle: '#3073F2',
      radius: 4,
      padding: 10,
      anchors: [
        [0, 0.5],
        [1, 0.5],
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
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_186c5d878fe34.json'
)
  .then((response) => response.json())
  .then((data) => {
    // 写入数据
    graph.data(data);
    // 适应视图大小
    graph.fitView();
  });
```
