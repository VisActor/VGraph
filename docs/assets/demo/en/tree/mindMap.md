---
category: examples
group: tree
title: Basic Mind Map Example
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/graphs_tree_mindMap.png
link: demo-spec/treeBasic
option:
---
# Basic Mind Map Example

Data description: A mind map of the principles and practices of data mining.

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
    type: 'mindMap',
    options: {
      direction: 'LR',
      nodeSep() {
        return 20;
      },
      nodeSize() {
        return [100, 20];
      },
      rankSep() {
        return 80;
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
      label: node.name,
      icons: icons,
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
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894ec05cdb49.json'
)
  .then((response) => response.json())
  .then((data) => {
    graph.data(data);
    graph.addBehavior(dragCanvas);
    graph.addBehavior(panZoom, { sensitivity: 4 });
  });
```
