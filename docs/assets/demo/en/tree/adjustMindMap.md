---
category: examples
group: tree
title: Node Adaptive Mind Map
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/adjust_mind_map.png
link: demo-spec/treeBasic
option:
---
# Node Adaptive Mind Map

A basic feature of classic mind maps is to fix the maximum width/height of nodes and then adapt to text length. In VGraph, node width and height are required. This demo provides a practical implementation approach.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { TreeGraph, panZoom, dragCanvas, Text } from '@visactor/vgraph';

const expandIcon = '&#xe613;';
const collapseIcon = '&#xe611;';

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;

const MAX_NODE_WIDTH = 300;
const MAX_NODE_HEIGHT = 100;

const text = new Text({
  x: 0,
  y: 0,
  text: '',
  width: MAX_NODE_WIDTH - 24,
  height: MAX_NODE_HEIGHT - 24,
});

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
      nodeSep() {
        return 20;
      },
      rankSep() {
        return 80;
      },
    },
  },
  setDefaultNode(node) {
    let icons;
    if (node.children) {
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
    const label =
      node.id === 'Modeling Methods' || node.id === 'Multiple linear regression'
        ? node.id.repeat(10)
        : node.id;
    text.set('text', label);
    const bbox = text.getBBox();
    return {
      width: Math.min(bbox.width + 24, 300),
      height: Math.max(40, bbox.height + 24),
      radius: 4,
      strokeStyle: '#3073F2',
      label: {
        text: label,
        width: bbox.width,
        height: bbox.height,
        textOverflow: 'ellipsis',
      },
      icons: icons,
      anchors: [[0, 0.5], [1, 0.5]],
    };
  },
  setDefaultEdge() {
    return {
      type: 'hLine',
    };
  },
});

graph.addBehavior(dragCanvas);
graph.addBehavior(panZoom, { sensitivity: 4 });

fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894e075c8a46.json')
  .then((response) => response.json())
  .then((data) => {
    graph.data(data);
  });
```
