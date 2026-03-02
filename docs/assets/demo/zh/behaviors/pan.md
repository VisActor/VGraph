---
category: examples
group: behaviors
title: 限制移动范围
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/yonly.gif
link: behaviors/pan
option:
---
# 限制移动范围

限制平移操作在图形区域内，结合缩小时隐藏细节以提升流畅度。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { TreeGraph, dragCanvas, panZoom, hideDetails } from '@visactor/vgraph';

function buildTree(depth) {
  var id = depth + '-' + Math.random();
  var data = { id: id, children: [] };
  if (depth >= 5) { return data; }
  for (var i = 0; i < Math.round(Math.random() * 4) + 1; i++) { data.children.push(buildTree(depth + 1)); }
  return data;
}
var data = buildTree(0);
var NODE_COLORS = ['#5678D6','#EB8D2F','#59A649','#E0BA2D','#A56AAD','#6DBEC9','#D95145','#A0A0AD','#94674E','#ED848F'];

var container = document.getElementById(CONTAINER_ID);
var graph = new TreeGraph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.01,
  maxRatio: 8,
  animate: false,
  layout: { type: 'compactBox', options: {
    direction: 'LR',
    size: function() { return [800, 600]; },
    nodeSep: function() { return 20; },
    nodeSize: function() { return [100, 40]; },
    rankSep: function() { return 80; }
  } },
  setDefaultNode: function(nodeData) {
    return {
      width: 100,
      height: 40,
      type: 'category',
      color: nodeData.id === data.id ? NODE_COLORS[0] : NODE_COLORS[Math.round(Math.random() * 9)],
      label: { text: nodeData.id, textAlign: 'left' },
      anchors: [[0, 0.5],[1, 0.5]],
      radius: 4
    };
  },
  setDefaultEdge: function() { return { type: 'hCubic' }; },
  setNodeStateStyles: function(state, nodeData) {
    if (state === 'hide') { return { fillStyle: nodeData.color }; }
    if (state === 'clicked') { return { strokeStyle: nodeData.color }; }
  }
});

graph.data(data);
graph.addBehavior(dragCanvas, { limit: true });
graph.addBehavior(panZoom, { sensitivity: 4, limit: true });
graph.addBehavior(hideDetails, { hideRatio: 0.4, hideState: 'hide' });
```

