---
category: examples
group: dag
title: 嵌套布局-异步展开收起
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/nested_async_expand.gif
link: dag/nestedAsyncExpand
option:
---
# 嵌套布局-异步展开收起

数据描述：带分组的数据如果不对每个分组重新布局容易产生分组覆盖看不清等问题。VGraph 支持嵌套布局以达到更好的布局效果。数据量极大时可以选择在用户展开节点时再请求内部结构展开。<br>交互操作：<code>click 节点图标</code>:展开分组节点查看内部结构；<code>click 分组图标</code>: 收起分组内部结构。

## 关键配置

- `Graph` / `DAGLayout`：保持原始布局与样式配置。
- `setDefaultNode` / `setDefaultEdge`：保留节点与连线外观。
- 交互行为：保留示例中的展开、收起、hover 或点击逻辑。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  panZoom,
  GroupUtils,
  insertStyles,
  uuid,
} from '@visactor/vgraph';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Spin } from '@arco-design/web-react';

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

function initGraph() {
  insertStyles(iconfontStyles, 'vgraph-demo-iconfont');
  // 初始化 graph 实例
  const container = document.getElementById(CONTAINER_ID);
  const graphContainer = document.getElementById('graphContainer');
  const graph = new Graph({
    container: 'graphContainer',
    width: (graphContainer && graphContainer.offsetWidth) || container.offsetWidth,
    height: (graphContainer && graphContainer.offsetHeight) || container.offsetHeight,
    layout: {
      type: 'nestedDag',
      options: {
        dagOptions: {
          rankDir: 'LR',
          nodeSep: 80,
          edgeSep: 20,
          rankSep: 120,
          adjustControlPoints: true,
        },
      },
    },
    setDefaultNode(nodeData) {
      return {
        type: 'rect',
        width: 120,
        height: 40,
        radius: 4,
        color: nodeData.group ? '#3073F2' : '#E1E4E8',
        label: {
          width: 80,
          text: nodeData.class || nodeData.id,
          textOverflow: 'ellipsis',
        },
        rectWidth: 20,
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],

        icons: nodeData.group
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
    setDefaultGroup(group) {
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
          text: { text: group.class, fillStyle: '#fff' },
          background: {
            fillStyle: '#3073F2',
          },
          icon: {
            icon: collapseIcon,
            fillStyle: '#fff',
            cursor: 'pointer',
            onClick: (e, group) => {
              collapseGroup(group);
            },
          },
        },
      };
    },
  });
  // 写入数据
  graph.data({
    nodes: [
      { label: 'TOP', class: 'type-TOP', id: '0', group: true },
      { label: 'S', class: 'type-S', id: '1' },
      { label: 'NP', class: 'type-NP', id: '2' },
      { label: 'DT', class: 'type-DT', id: '3' },
      { label: 'This', class: 'type-TK', id: '4' },
      { label: 'VP', class: 'type-VP', id: '5', group: true },
      { label: 'VBZ', class: 'type-VBZ', id: '6' },
      { label: 'is', class: 'type-TK', id: '7' },
      { label: 'NP', class: 'type-NP', id: '8' },
      { label: 'DT', class: 'type-DT', id: '9' },
      { label: 'NN', class: 'type-NN', id: '11' },
      { label: 'type.', class: 'type-.', id: '13' },
      { label: 'sentence', class: 'type-TK', id: '14' },
    ],
    edges: [
      { source: '3', target: '4' },
      { source: '2', target: '3' },
      { source: '1', target: '2' },
      { source: '6', target: '7' },
      { source: '5', target: '6' },
      { source: '8', target: '9' },
      { source: '8', target: '11' },
      { source: '5', target: '8' },
      { source: '1', target: '5' },
      { source: '13', target: '14' },
      { source: '1', target: '13' },
      { source: '0', target: '1' },
    ],
  });

  // 适应视图大小
  graph.fitView();
  graph.addBehavior(panZoom);

  function collapseGroup(group) {
    // 收起分组为节点
    const groupNode = GroupUtils.collapseGroup(graph, group);
    // 重布局
    graph.layout();
    // 聚焦节点，以防用户焦点丢失
    graph.focus(groupNode);
    return groupNode;
  }

  return { graph };
}

function mockData() {
  const nodes = [];
  const edges = [];
  const count = Math.random() * 5 + 1;
  for (let i = 0; i < count; i++) {
    const id = uuid(8);
    nodes.push({ id });

    if (i > 0) {
      edges.push({
        source: nodes[0].id,
        target: id,
      });
    }
  }
  return { nodes, edges };
}

function App() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { graph } = initGraph();
    graph.on('node:click', (e) => {
      const node = e.target;
      // 点击的是节点上的 icon
      if ((e.relatedTarget && e.relatedTarget.type) === 'icon') {
        expandNode(node);
        return;
      }
      // 如果有点击节点的其他交互在这里实现
    });

    function expandNode(node) {
      if (!node.get('childNodes')) {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          // 异步请求数据展开
          expandGroupNode(node, mockData());
        }, 1000);
      } else {
        // 如果展开过有数据，直接展开
        expandGroupNode(node);
      }
    }

    function expandGroupNode(node, data) {
      const group = GroupUtils.expandGroupNode(graph, node, data);
      graph.layout();
      // 聚焦分组，以防用户焦点丢失
      graph.focus(group);
    }
  }, []);

  return (
    <Spin loading={loading} style={{ width: '100%', height: '100%' }}>
      <div id="graphContainer" style={{ width: '100%', height: '100%', position: 'relative' }} />
    </Spin>
  );
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
