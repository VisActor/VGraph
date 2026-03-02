---
category: examples
group: dag
title: 嵌套布局-多层嵌套
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/multinested_dag.png
link: dag/multiNested
option:
---
# 嵌套布局-多层嵌套

原始 vgraph demo 迁移到 vgraph，保持主要交互与布局行为。

## 关键配置

- `Graph` / `DAGLayout`：保持原始布局与样式配置。
- `setDefaultNode` / `setDefaultEdge`：保留节点与连线外观。
- 交互行为：保留示例中的展开、收起、hover 或点击逻辑。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  dragCanvas,
  Graph,
  panZoom,
  insertStyles,
  Text,
  highlightRelations,
  Icon,
} from '@visactor/vgraph';

const expandIcon = '&#xe610;';
const collapseIcon = '&#xe60f;'; // 用于收起展开节点

const changeTypeColor = {
  other: null,
  '#c44e52': '#c44e52',
  '#25a868': '#25a868',
  '#dd8452': '#dd8452',
};
const changeTypeIcon = {
  '#c44e52': '&#xe605;',
  '#25a868': '&#xe606;',
  '#dd8452': '&#xe601;',
};
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

const container = document.getElementById(CONTAINER_ID);
insertStyles(iconfontStyles, 'vgraph-demo-iconfont');
// 初始化 graph 实例
const graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.01,
  maxRatio: 8,
  layout: {
    type: 'nestedDag',
    options: {
      // customLayout: customLayout,
      // 可以尝试取消注释使用自定义布局。
      dagOptions: {
        rankDir: 'LR',
        nodeSep: 30,
        edgeSep: 10,
        rankSep: 50,
        ranker: 'networkSimplex',
        cache: true,
      },
    },
  },
  setDefaultNode(nodeData) {
    let icons = null;
    // 设置icon随changeType变化
    if ((nodeData && nodeData.changeType)) {
      const icon = changeTypeIcon[nodeData.changeType];
      icons = [
        {
          setStyles: () => {
            return {
              icon,
              size: 15,
              fillStyle: changeTypeColor[(nodeData && nodeData.changeType) || 'other'],
            };
          },
          position: [0.9, 0.5],
        },
      ];
    }

    // nodeData.width = nodeData.width || 100;
    // nodeData.height = nodeData.height || 20;

    return {
      type: 'Rect',
      radius: 10,
      width: nodeData.width || 100,
      height: nodeData.height || 20,
      strokeStyle: '#4170F2',
      fillStyle: changeTypeColor[(nodeData && nodeData.changeType) || 'other'],
      label: {
        offsetX: (nodeData && nodeData.changeType) ? -6 : 0,
        width: (nodeData.width || 100) - 30,
        text: (nodeData && nodeData.text) || nodeData.id,
        fillStyle: '111',
        textOverflow: 'ellipsis',
        opacity: 1.0,
      },
      icons,
      anchors: [
        [0.0, 0.5],
        [1.0, 0.5],
        //   [0.5, 0.0],
        //   [0.5, 1.0],
      ],
      opacity: 0.3,
    };
  },
  setNodeStateStyles(state, data) {
    if (state === 'hide') {
      return { fillStyle: data.color };
    }
  },
  setDefaultEdge(edge) {
    return {
      id: edge.source + '-' + edge.target,
      // type: 'quadratic',
      // type: "line",
      type: 'hCubic',
      endArrow: {
        width: 9,
        height: 12,
      },
      strokeStyle: '#64b5cd',
      appendSize: 2,
      lineWidth: 2,
      opacity: 0.3,
    };
  },
  setEdgeStateStyles(state) {
    if (state === 'active') {
      return {
        opacity: 1.0,
        strokeStyle: '#64b5cd',
      };
    }
    return { opacity: 0.1 };
  },
  setDefaultGroup(groupData) {
    return {
      linkNode: true,
      fillStyle: '#fff',
      strokeStyle: '#DDE2E9',
      linkGroupOnCollapse: true,
      paddin: 20,
      radius: 4,
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
      capture: false,
      titleSize: 32,
      renderGroupTitle(group, layer, width) {
        const icon = new Icon({
          x: 28,
          y: 16,
          fillStyle: '#595959',
          icon: group.get('collapsed') ? expandIcon : collapseIcon,
          cursor: 'pointer',
        });
        layer.add(icon);

        icon.on('click', () => {
          toggleGroup(group);
        });

        const text = new Text({
          x: 40,
          y: 16,
          text: group.get('text'),
          width: width - 40 - 16,
          textOverflow: 'ellipsis',
        });
        layer.add(text);
      },
    };
  },
});
fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18d636c6c543.json'
)
  .then((response) => response.json())
  .then((data) => {
    // 嵌套分组数据，示例：
    // data = { nodes: [{ id: '1' }], edges: [], groups: [{ id: 'group1', children: ['1'] }, { 'id': 'group2', children: ['group1'] }] }
    // 上面这个数据展示了一个最小嵌套分组示例，即 group1 包含了节点 1，group2 包含了 group1，即 [group2 [group1 [1]]] 的嵌套分组
    console.time();
    graph.addBehavior(panZoom, { sensitivity: 5 });
    graph.addBehavior(dragCanvas, {
      canvasOnly: false,
    });
    graph.addBehavior(highlightRelations);
    graph.data(data);
    graph.refresh();
    graph.draw();
    graph.fitView();
    console.timeEnd();
  });

function toggleGroup(group) {
  if (group.get('collapsed')) {
    // 节点状态为收起，故而展开节点
    group.expand();
  } else {
    // 节点状态为展开，故而收起节点
    group.collapse();
  }
  graph.layout(group.get('id'));
}

```
