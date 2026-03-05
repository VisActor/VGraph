---
category: examples
group: tree
title: Basic Dendrogram Example
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/dendriogram.png
link: tree-graph-spec/options
option:
---
# Basic Dendrogram Example

Data description: A simple hierarchical tree structure. <br>Interaction: click the icon on the right of a node to expand/collapse.

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
  animate: true,
  maxRatio: 8,
  layout: {
    type: 'dendrogram',
    options: {
      direction: 'LR',
      nodeSep() {
        return 20;
      },
      nodeSize() {
        return [140, 40];
      },
      rankSep() {
        return 80;
      },
    },
  },
  setDefaultNode(node) {
    let icons;
    const leafColor = '#D9E3F8';
    const nodeColor = '#F4E0CB';
    let color = leafColor;
    const label = node.id;
    if (node.children) {
      color = nodeColor;
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
            const icon = e.target;
            icon.set('icon', n.get('collapsed') ? collapseIcon : expandIcon);
            graph.toggleCollapse(n);
          },
        },
      ];
    }
    return {
      width: 140,
      height: 40,
      radius: 6,
      strokeStyle: undefined,
      fillStyle: color,
      label: label,
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
      icons: icons,
    };
  },
  setDefaultEdge() {
    return {
      type: 'hCubic',
      strokeStyle: '#C9CDD4',
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
