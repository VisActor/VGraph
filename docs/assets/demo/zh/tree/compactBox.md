---
category: examples
group: tree
title: 基础紧凑树示例
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/compactbox.png
 link: tree-graph-spec/options
option:
---
# 基础紧凑树示例

数据描述：一个简单的分层树结构。<br>交互操作：单击节点下方的 icon 可以对节点进行展开或收缩。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { TreeGraph, panZoom, dragCanvas } from '@visactor/vgraph';

const expandIcon = '&#xe613;';
const collapseIcon = '&#xe611;';

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;

const graph = new TreeGraph({
  container: CONTAINER_ID,
  width,
  height,
  minRatio: 0.3,
  maxRatio: 8,
  animate: true,
  layout: {
    type: 'compactBox',
    options: {
      direction: 'LR',
      nodeSep() {
        return 15;
      },
      nodeSize() {
        return [140, 20];
      },
      rankSep() {
        return 40;
      },
    },
  },
  setDefaultNode(node) {
    let icons;
    let fillColor = '#D9E3F8';
    if (node.children) {
      fillColor = '#F4E0CB';
      icons = [
        {
          setStyles(data) {
            const styles = {
              fillStyle: '#C96600',
              size: 10,
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
            return { type: 'circle' };
          },
          position: [1, 0.5],
          show: 'hover',
          onClick(e, nodeData) {
            const n = graph.getNodeById(nodeData.id);
            const icon = e.target.children[1];
            icon.set('icon', n.get('collapsed') ? collapseIcon : expandIcon);
            e.target.hide();
            graph.toggleCollapse(n);
          },
        },
      ];
    }
    return {
      width: 140,
      height: 40,
      radius: 4,
      strokeStyle: null,
      fillStyle: fillColor,
      label: node.id,
      icons,
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
    };
  },
  setDefaultEdge() {
    return {
      type: 'hLine',
    };
  },
});

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894eaa3dc997.json'
)
  .then((response) => response.json())
  .then((data) => {
    graph.data(data);
    graph.addBehavior(dragCanvas);
    graph.addBehavior(panZoom, { sensitivity: 4 });
  });
```
