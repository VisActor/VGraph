---
category: examples
group: tree
title: 思维导图
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/cap.gif
 link: demo-spec/cap
option:
---
# 思维导图

数据描述：六顶思考帽与产品规划的关系。<br>交互操作：<code>hover 节点</code>: 高亮起止路径；<code>click icon</code>: 伸缩/展开树结构。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { TreeGraph, panZoom, dragCanvas, Node, Edge } from '@visactor/vgraph';

const nodeColors = [
  '#707792',
  '#A1A7B5',
  '#03A86D',
  '#F2AF02',
  '#475466',
  '#F54E59',
  '#2E62F1',
];

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;

const expandIcon = '&#xe613;';
const collapseIcon = '&#xe611;';

const graph = new TreeGraph({
  container: CONTAINER_ID,
  width,
  height,
  minRatio: 0.3,
  maxRatio: 8,
  animate: true,
  layout: {
    type: 'mindMap',
    options: {
      direction: 'LR',
      nodeSize() {
        return [138, 40];
      },
      nodeSep() {
        return 20;
      },
      rankSep() {
        return 40;
      },
    },
  },
  setDefaultNode(node) {
    const depth = node.id.split('-');
    const nodeConfigs = {
      radius: 5,
      width: 138,
      height: 40,
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
      label: {
        text: node.name,
        fillStyle: depth.length <= 2 ? '#fff' : 'rgba(20, 20, 20, 0.9)',
        fontSize: 12,
        textAlign: depth.length === 1 ? 'center' : 'left',
        textBaseline: 'middle',
      },
    };

    let icon = null;

    if (depth.length > 1) {
      nodeConfigs.color = nodeColors[depth[1]];
    }

    if (depth.length === 1) {
      nodeConfigs.fillStyle = 'l(180) 0:#8490AE 1:#8792B8';
      nodeConfigs.strokeStyle = null;
    } else if (depth.length === 2) {
      icon = '&#xe62a;';
      nodeConfigs.type = 'tag';
      nodeConfigs.theme = 'filled';
    } else if (depth.length === 3) {
      nodeConfigs.type = 'tag';
      if (depth[2] === '1') {
        icon = '&#xe640;';
      } else if (depth[2] === '2') {
        icon = '&#xe632;';
      } else {
        icon = '&#xe61c;';
      }
    }

    if (node.children) {
      nodeConfigs.icons = [
        {
          setStyles(data) {
            const styles = {
              fillStyle: nodeConfigs.color || '#707792',
              size: 12,
              cursor: 'pointer',
            };
            if (data.collapsed) {
              styles.icon = expandIcon;
            } else {
              styles.icon = collapseIcon;
            }
            return styles;
          },
          setBgStyles() {
            return {
              type: 'circle',
              size: 14,
            };
          },
          show: 'hover',
          position: node.position === 'left' ? [0, 0.5] : [1, 0.5],
          size: 16,
          onClick(e, data) {
            const n = graph.getNodeById(data.id);
            const collapsed = n.get('collapsed');
            const label = n.getLabel();
            label.set(
              'text',
              collapsed
                ? n.get('name')
                : n.get('name') + '(' + n.get('children').length + ')'
            );
            const iconShape = e.target;
            iconShape.set('icon', collapsed ? collapseIcon : expandIcon);
            graph.toggleCollapse(n);
          },
        },
      ];
    }
    if (icon) {
      nodeConfigs.icon = {
        icon: icon,
        size: 24,
        background: {
          width: 32,
        },
      };
    }
    return nodeConfigs;
  },
  setNodeStateStyles(state) {
    if (state === 'active') {
      return {
        shadowColor: 'rgba(27, 31, 35, 0.12)',
        shadowBlur: 10,
        shadowOffsetY: 4,
      };
    }
  },
  setDefaultEdge() {
    return {
      type: 'hLine',
      strokeStyle: '#D1D5DA',
    };
  },
  setEdgeStateStyles(state, edgeConfigs, edge) {
    edge.toFront();
    const node = edge.target;
    if (state === 'active') {
      return {
        lineWidth: 2,
        strokeStyle: node.get('color'),
      };
    }
  },
});

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_186bfc55a2354.json'
)
  .then((response) => response.json())
  .then((data) => {
    graph.data(data);
  });

graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);
```
