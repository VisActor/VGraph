---
category: examples
group: plugins
title: 文字气泡
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/raw_tooltip.gif
link: plugins/rawtooltip
option:
---
# 文字气泡

此组件是原生 js 组件，推荐给非 react 框架应用使用。<br> 交互操作：<code>hover node</code>展示节点的 tooltip。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, dragCanvas, highlightRelations, dragNode, RawTooltip } from '@visactor/vgraph';

var color = ['#5678D6','#EB8D2F','#59A649','#E0BA2D','#A56AAD','#6DBEC9','#D95145','#A0A0AD','#94674E','#ED848F'];
var container = document.getElementById(CONTAINER_ID);
var width = container.offsetWidth;
var height = container.offsetHeight;

var colorMap = {}; var index = 0;
var graph = new Graph({
  container: CONTAINER_ID,
  width: width,
  height: height,
  minRatio: 0.2,
  maxRatio: 8,
  linkCenter: true,
  layout: { type: 'force', options: {
    maxIteration: 300,
    tickIterations: 10,
    clearOnEndOnFirstCall: true,
    onTick: function() { graph.refresh(); },
    onEnd: function() { graph.fitView(); }
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

    new RawTooltip(graph, {
      styles: { border: '1px solid #ccc', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#fff' },
      content: function(entity) { return entity.get('name') + ': ' + entity.get('group'); },
      target: 'node'
    });
  });

function dealData(data) {
  var nodes = data.nodes;
  nodes.forEach(function(node) { node.id = node.name; });
  data.links.forEach(function(edge) { edge.source = nodes[edge.source].id; edge.target = nodes[edge.target].id; });
  data.edges = data.links; return data;
}
```

