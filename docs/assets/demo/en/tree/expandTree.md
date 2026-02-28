---
category: examples
group: tree
title: Expand Tree by Level
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/expand_tree.gif
link: demo-spec/treeBasic
option:
---
# Expand Tree by Level

When dealing with a large amount of data, expanding level by level is a good way to focus information. The nodes of a vgraph tree can be configured with the `collapse` field to control the collapse/expand of the subtree. The following demo provides a better implementation.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { TreeGraph, panZoom, dragCanvas } from '@visactor/vgraph';

const expandIcon = '&#xe613;';
const collapseIcon = '&#xe611;';

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;
const select = document.createElement('select');
container.append(select);
select.innerHTML = '<option>1</option><option>2</option><option>3</option>';

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

select.onchange = (e) => {
  showTreeData(parseInt(e.target.value, 10));
};

let data = {};
function showTreeData(depth) {
  if (depth === undefined) {
    depth = 1;
  }
  data.children.forEach((nodeData) => {
    showData(nodeData, depth, 1);
  });
  graph.data(data);
  graph.fitView();
}

function showData(nodeData, depth, current) {
  if (current < depth) {
    nodeData.collapsed = false;
    if (nodeData.children) {
      nodeData.children.forEach((child) => {
        showData(child, depth, current + 1);
      });
    }
  } else if (current === depth) {
    nodeData.collapsed = true;
  }
}

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894eaa3dc997.json'
)
  .then((response) => response.json())
  .then((treeData) => {
    data = treeData;
    showTreeData(1);
    graph.addBehavior(dragCanvas);
    graph.addBehavior(panZoom, { sensitivity: 4 });
  });
```
