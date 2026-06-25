---
category: examples
group: behaviors
title: Details First, Then Overview
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/hide_details.gif
link: behaviors/hideDetails
option:
---
# Details First, Then Overview

When the default view focuses on local details (for example, the initial state focuses on the root node, or the most recent unfinished workflow), VGraph provides the <a href="/vgraph/guide/behaviors#hideDetails-隐藏细节">hide details when zoomed out</a> interaction. It helps you focus on the most important information in an overview state, and combined with click-to-focus it makes it easy to zoom out for overview and then focus back on an individual.

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
graph.addBehavior(dragCanvas);
graph.addBehavior(panZoom, { sensitivity: 4 });
graph.addBehavior(hideDetails, { hideRatio: 0.4, hideState: 'hide' });

var root = graph.getNodeById(data.id);
graph.focusPoint(root.get('x') + 300, root.get('y'));

var activeNode = null;
graph.on('node:click', function(e) {
  graph.set('autoDraw', false);
  if (activeNode) { activeNode.removeState('clicked'); }
  activeNode = e.target;
  graph.setZoomRatio(1);
  activeNode.setState('clicked');
  graph.set('autoDraw', true);
  graph.focus(activeNode, true);
});
```
