---
category: examples
group: behaviors
title: Brush Select
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/brush_select.gif
link: behaviors/brushSelect
option:
---
# Brush Select

The built-in brushSelect interaction in VGraph lets users select graph elements in batches, including nodes, edges, and groups.<br>
See <a href="/vgraph/guide/behaviors">Interactions</a> for details.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { TreeGraph, panZoom, brushSelect } from '@visactor/vgraph';

var container = document.getElementById(CONTAINER_ID);

var graph = new TreeGraph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  layout: { type: 'compactBox', options: {
    direction: 'LR',
    size: function() { return [800, 600]; },
    nodeSep: function() { return 15; },
    nodeSize: function() { return [140, 20]; },
    rankSep: function() { return 50; }
  } },
  setDefaultNode: function(nodeData) {
    return {
      width: 140,
      height: 40,
      radius: 4,
      label: { text: nodeData.id },
      color: '#5678D6',
      anchors: [[0, 0.5],[1, 0.5]]
    };
  },
  setNodeStateStyles: function() { return { lineWidth: 3 }; },
  setDefaultEdge: function() { return { type: 'hLine' }; }
});

graph.addBehavior(panZoom);

var selectedNodes = [];
graph.addBehavior(brushSelect, {
  targets: ['node'],
  onSelect: function(node) { node.setState('select'); return true; },
  onDeselect: function(node) { node.removeState('select'); },
  onChange: function(nodes) { selectedNodes = nodes; }
});

graph.on('canvas:click', function() {
  selectedNodes.forEach(function(node) { node.removeState('select'); });
  selectedNodes = [];
});

fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894e075c8a46.json')
  .then(function(response) { return response.json(); })
  .then(function(data) { graph.data(data); });
```
