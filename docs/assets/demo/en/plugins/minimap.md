---
category: examples
group: plugins
title: Minimap
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/minimap.gif
link: plugins/minimap
option:
---
# Minimap

The minimap helps users see the overall data distribution while analyzing a local area, quickly move the viewport, and relocate the view by clicking the minimap when the main view is lost.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, dragCanvas, highlightRelations, dragNode, Minimap } from '@visactor/vgraph';

var color = ['#5678D6','#EB8D2F','#59A649','#E0BA2D','#A56AAD','#6DBEC9','#D95145','#A0A0AD','#94674E','#ED848F'];
var container = document.getElementById(CONTAINER_ID);
var width = container.offsetWidth; var height = container.offsetHeight;
var colorMap = {}; var index = 0;

var graph = new Graph({
  container: CONTAINER_ID,
  width: width,
  height: height,
  minRatio: 0.2,
  maxRatio: 8,
  linkCenter: true,
  layout: { type: 'force', options: {
    maxIteration: 300, tickIterations: 10, clearOnEndOnFirstCall: true,
    onTick: function() { graph.refresh(); }, onEnd: function() { graph.fitView(); }
  } },
  setDefaultNode: function(node) {
    var fillStyle = color[0];
    if (node.group !== undefined) {
      if (colorMap[node.group]) { fillStyle = colorMap[node.group]; }
      else { fillStyle = color[index % 10]; index += 1; colorMap[node.group] = fillStyle; }
    }
    return { type: 'circle', width: 15, height: 15, strokeStyle: null, fillStyle: fillStyle };
  },
  setNodeStateStyles: function(state) { if (state === 'active') { return { opacity: 1.0 }; } return { opacity: 0.2 }; },
  setDefaultEdge: function() { return { strokeStyle: '#ccc' }; },
  setEdgeStateStyles: function(state) { if (state === 'active') { return { strokeStyle: '#A7A7A7' }; } return { opacity: 0.2 }; }
});

fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18949c3ac5677.json')
  .then(function(response) { return response.json(); })
  .then(function(data) {
    if (data.links) { dealData(data); }
    graph.data(data);
    graph.addBehavior(highlightRelations);
    graph.addBehavior(panZoom);
    graph.addBehavior(dragCanvas);
    graph.addBehavior(dragNode, {
      onDrag: function(node) { node.set('fx', node.get('x')); node.set('fy', node.get('y')); graph.layout(); },
      onDrop: function(node) { node.set('fx', undefined); node.set('fy', undefined); graph.layout(); },
      delegate: false
    });

    var minimapDiv = document.createElement('div');
    minimapDiv.style.position = 'absolute'; minimapDiv.style.left = '0px'; minimapDiv.style.top = '0px';
    minimapDiv.style.backgroundColor = '#fff'; minimapDiv.style.border = '1px solid #ccc';
    container.append(minimapDiv);
    new Minimap(graph, {
      container: minimapDiv, width: 200, height: 150, type: 'delegate',
      getNodeStyles: function(node) { return { fillStyle: node.get('fillStyle'), r: 10 }; }
    });
  });

function dealData(data) {
  var nodes = data.nodes; nodes.forEach(function(node) { node.id = node.name; });
  data.links.forEach(function(edge) { edge.source = nodes[edge.source].id; edge.target = nodes[edge.target].id; });
  data.edges = data.links; return data;
}
```
