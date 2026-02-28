---
category: examples
group: dag
title: 嵌套布局-多层嵌套-默认收起
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/multinested_dag.png
link: dag/multiNestedCollapse
option:
---
# 嵌套布局-多层嵌套-默认收起

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
      dagOptions: {
        rankDir: 'LR',
        nodeSep: 30,
        edgeSep: 10,
        rankSep: 50,
        ranker: 'networkSimplex',
        cache: true,
      },
    }
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
      padding: 20,
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
graph.on('edge:click', (e) => {
  e.target.updatePosition();
  e.target.hide();
  graph.refresh();
});

const collapseGroupWidth = 250;

fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18bd7f6e22364.json')
  .then((response) => response.json())
  .then((data) => {
    graph.addBehavior(panZoom, { sensitivity: 5 });
    graph.addBehavior(dragCanvas, {
      canvasOnly: false,
    });
    graph.addBehavior(highlightRelations);
    graph.data(data);

    const groups = graph.getGroups();
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      if (!group.belong) {
        collapseGroup(group);
      }
    }
    graph.layout();
    graph.alignView('cc');
  });

const collapseGroup = (group) => {
  const children = group.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type === 'group') {
        collapseGroup(child);
      }
    }
  }
  group.collapse();
  group.set('fixWidth', collapseGroupWidth);
  group.updateGroup();
};

function toggleGroup(group) {
  if (group.get('collapsed')) {
    group.set('fixWidth', undefined);
    // 节点状态为收起，故而展开节点
    group.expand();
    // 在大多数场景中一般仅需minCross一次即可，所以vgraph会在每次执行完预排序后将minCross置为false
    // 但在本场景中，由于是默认收起，所以每次都会有”没见过“的节点，所以需要重新将minCross设置为true
    graph.get('layout').options.minCross = true; 
  } else {
    group.set('fixWidth', collapseGroupWidth); // 注释可以保持之前的宽度
    // 节点状态为展开，故而收起节点
    group.collapse();
    group.refreshBox();
  }
  graph.layout(group.get('id'));
}
```
