---
category: examples
group: behaviors
title: 先看整体再看细节
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/show_details.gif
link: behaviors/showDetails
option:
---
# 先看整体再看细节

平移缩放时仅保留主要图形以保障性能，必要时显示细节并支持关系高亮。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, dragCanvas, highlightRelations, showDetails } from '@visactor/vgraph';

var container = document.getElementById(CONTAINER_ID);
var graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.01,
  maxRatio: 8,
  linkCenter: true,
  layout: { type: 'force', options: {
    autoFDP: true,
    maxIteration: 100,
    tickIterations: 10,
    clearOnEndOnFirstCall: true,
    onTick: function() { graph.refresh(); },
    onEnd: function() { graph.getEdges().forEach(function(edge) { edge.show(); }); graph.fitView(); }
  } },
  setDefaultNode: function(nodeData) {
    return {
      type: 'circle', width: 15, height: 15, fillStyle: '#5678D6', strokeStyle: null,
      label: { text: String(nodeData.id), fillStyle: '#21252C', strokeStyle: '#fff', fontSize: 10, lineWidth: 1, textAlign: 'center', textBaseline: 'middle', opacity: 0 }
    };
  },
  setNodeStateStyles: function(state, nodeData, node) {
    var label = node.getLabel();
    if (state === 'click') { label.set('opacity', 1); return { fillStyle: '#EB8D2F', opacity: 1 }; }
    if (state === 'active') { label.set({ fillStyle: '#21252C', strokeStyle: '#fff', opacity: 1 }); return { opacity: 1 }; }
    if (state === 'blur') { label.set('opacity', 0.2); return { opacity: 0.2 }; }
  },
  setDefaultEdge: function() { return { strokeStyle: '#C9CDD4' }; },
  setEdgeStateStyles: function(state) { if (state === 'active') { return { strokeStyle: '#1E54C9' }; } return { opacity: 0.2 }; }
});

fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894e5184cc79.json')
  .then(function(response) { return response.json(); })
  .then(function(data) {
    graph.disableAutoLayout();
    graph.data({
      nodes: data.nodes.map(function(node) { return { id: String(node.id) }; }),
      edges: data.links.map(function(edge) { return { source: String(edge.source), target: String(edge.target), type: Math.round(Math.random() * 5) }; })
    });
    graph.getEdges().forEach(function(edge) { edge.hide(); });
    graph.setZoomRatio(0.15);
    graph.enableAutoLayout();
  });

graph.addBehavior(panZoom, { keyShapeOnly: true, shouldHideEdge: function(edge) { return !edge.hasState('active'); } });
graph.addBehavior(dragCanvas, { keyShapeOnly: true });
graph.addBehavior(showDetails, { showRatio: 0.6 });
graph.addBehavior(highlightRelations, { trigger: 'click' });

var clickedNode = null;
graph.on('node:click', function(e) {
  if (clickedNode) { clickedNode.removeState('click'); }
  e.target.setState('click');
  clickedNode = e.target;
});
```

