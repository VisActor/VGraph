---
category: examples
group: dag
title: 嵌套布局-全量数据展开收起
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/nested_expand.gif
link: dag/nestedExpand
option:
---
# 嵌套布局-全量数据展开收起

数据描述：带分组的数据如果不对每个分组重新布局容易产生分组覆盖看不清等问题。VGraph 支持嵌套布局以达到更好的布局效果。复杂图中默认将分组收起，让用户定位到感兴趣的部分再展开内部结构可以大幅提高查看效率。<br>交互操作：<code>click 节点图标</code>:展开分组节点查看内部结构；<code>click 分组图标</code>: 收起分组内部结构。

## 关键配置

- `Graph` / `DAGLayout`：保持原始布局与样式配置。
- `setDefaultNode` / `setDefaultEdge`：保留节点与连线外观。
- 交互行为：保留示例中的展开、收起、hover 或点击逻辑。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, Group, GroupUtils, Node, insertStyles } from '@visactor/vgraph';

const expandIcon = '&#xe610;';
const collapseIcon = '&#xe60f;';
const iconfontStyles = `
@font-face {
  font-family: 'iconfont';
  src: url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff2?t=1685600318362') format('woff2'),
       url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff?t=1685600318362') format('woff'),
       url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.ttf?t=1685600318362') format('truetype');
}
canvas,
.iconfont {
  font-family: 'iconfont' !important;
}
`;
insertStyles(iconfontStyles, 'vgraph-demo-iconfont');

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
        adjustControlPoints: true,
      },
    },
  },
  setDefaultNode(nodeData: any) {
    return {
      type: 'rect',
      width: 120,
      height: 40,
      radius: 4,
      fillStyle: '#fff',
      text: nodeData.name ?? nodeData.id ?? 'null',
      label: {
        width: 80,
        text: nodeData.name ?? nodeData.id ?? 'null',
        textOverflow: 'ellipsis',
      },
      rectWidth: 20,
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
      // 收起的数据会有 node.childNodes 参数项。如果原始数据中有此参数需另存一份以防丢失
      icons: nodeData.childNodes
        ? [
          {
            show: 'always',
            position: [1, 0.5],
            offsets: [-16, 0],
            setStyles() {
              return {
                fillStyle: '#666',
                icon: expandIcon,
                cursor: 'pointer',
              };
            },
          },
        ]
        : undefined,
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
      padding: 10,
      radius: 4,
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
      title: {
        text: { text: group.id, fillStyle: '#fff' },
        background: {
          fillStyle: '#3073F2',
        },
        icon: {
          icon: collapseIcon,
          fillStyle: '#fff',
          cursor: 'pointer',
          onClick: (e: any, group: Group) => {
            collapseGroup(group);
          },
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
  .then((rawData) => {
    // 原始数据处理，将分组全部折叠
    const data = GroupUtils.getCollapsableData(rawData);
    // 写入数据
    graph.data(data);
    // 适应视图大小
    graph.fitView();
  });

graph.on('node:click', (e) => {
  const node = e.target;
  // 有收起的节点，并且点击的是节点上的 icon
  if (node.get('childNodes') && (e.relatedTarget && e.relatedTarget.type) === 'icon') {
    expandNode(node);
    return;
  }
  // 如果有点击节点的其他交互在这里实现
});

function expandNode(node: Node) {
  // 展开分组
  const group = GroupUtils.expandGroupNode(graph, node);
  // 重布局
  graph.layout();
  graph.refresh();
  // 聚焦分组，以防用户焦点丢失
  graph.focus(group);
}

function collapseGroup(group: Group) {
  // 收起分组为节点
  const groupNode = GroupUtils.collapseGroup(graph, group);
  // 重布局
  graph.layout();
  graph.refresh();
  // 聚焦节点，以防用户焦点丢失
  graph.focus(groupNode);
  return groupNode;
}
```
