---
category: examples
group: practiceCases
title: Reorganize Tree Nodes
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/dp_move_node.gif
link: practiceCases/MoveNode
option:
---
# Reorganize Tree Nodes

Reorganize the node order in a compact tree through attachable drag and drop, with support for temporary edge preview and placement position calculation.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { TreeGraph, panZoom, dragCanvas, attachableDragNode } from '@visactor/vgraph';

var container = document.getElementById(CONTAINER_ID);

var graph = new TreeGraph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.3,
  maxRatio: 2,
  layout: { type: 'compactBox', options: {
    direction: 'LR', size: function(){ return [800, 600]; }, nodeSep: function(){ return 15; }, nodeSize: function(){ return [140, 20]; }, rankSep: function(){ return 50; }
  } },
  setDefaultNode: function(nodeData) { return { width: 140, height: 40, radius: 4, label: nodeData.id, color: '#5678D6', anchors: [[0,0.5],[1,0.5]] }; },
  setDefaultEdge: function() { return { type: 'hLine' }; }
});

graph.addBehavior(dragCanvas);
graph.addBehavior(panZoom);
graph.addBehavior(attachableDragNode, {
  delegate: false,
  tempEdgeStyles: { strokeStyle: '#2367EA' },
  shouldTrigger: function(ev) { if (ev.target === graph.root) { return false; } return true; },
  onDragStart: function(node) {
    graph.setChildrenVisibility(node, false);
    graph.disableAutoLayout();
    graph.removeChild(node, node.get('parent'), false);
    graph.set('autoLayout', true);
    graph.draw();
  },
  findClosestNode: function(node) {
    var x = node.configs.x; var y = node.configs.y; var id = node.configs.id;
    var min = Infinity; var closest = null;
    graph.getNodes().forEach(function(n){ var nodeX = n.get('x'); var nodeY = n.get('y'); if (nodeX > x || n.get('id') === id || !n.isVisible()) { return; } var dist = (x-nodeX)*(x-nodeX) + (y-nodeY)*(y-nodeY); if (dist < min) { min = dist; closest = n; } });
    return closest;
  },
  onDrop: function(node, parent) {
    var y = node.get('y'); var index = -1; var childData = parent.get('children') || [];
    for (var i = 0; i < childData.length - 1; i++) {
      var n = graph.getNodeById(childData[i].id);
      if (i === 0 && y < n.get('y')) { index = 0; break; }
      if (n.get('y') <= y && graph.getNodeById(childData[i + 1].id).get('y') > y) { index = i + 1; break; }
    }
    if (!node.get('collapsed')) { graph.setChildrenVisibility(node, true); }
    graph.moveNode(node, parent, index);
  }
});

fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894e075c8a46.json')
  .then(function(response) { return response.json(); })
  .then(function(data) { graph.data(data); });
```
