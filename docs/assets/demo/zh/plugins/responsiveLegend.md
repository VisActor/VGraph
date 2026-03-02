---
category: examples
group: plugins
title: 响应式图例
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/responsive_legend.gif
link: plugins/responsiveLegend
option:
---
# 响应式图例

展示响应式分类图例，支持 hover/click 联动与筛选。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, dragCanvas, CategoryLegend } from '@visactor/vgraph';

var nodes = []; var edges = [];
for (var i = 0; i < 20; i++) { nodes.push({ id: i + '' }); }
for (var j = 1; j < 20; j++) { edges.push({ source: '0', target: j + '' }); }
var data = { nodes: nodes, edges: edges };
var color = ['#5678D6','#EB8D2F','#59A649','#E0BA2D','#A56AAD','#6DBEC9','#D95145','#A0A0AD','#94674E','#ED848F'];

var container = document.getElementById(CONTAINER_ID);
var width = container.offsetWidth; var height = container.offsetHeight;

var graph = new Graph({
  container: CONTAINER_ID, width: width, height: height,
  minRatio: 0.2, maxRatio: 8, linkCenter: true,
  layout: { type: 'force', options: {
    maxIteration: 300, tickIterations: 10, clearOnEndOnFirstCall: true, autoFDP: true,
    onTick: function() { graph.refresh(); }, onEnd: function() { graph.fitView(); }
  } },
  setDefaultNode: function(node) { return { type: 'circle', width: 15, height: 15, strokeStyle: null, fillStyle: node.group ? color[node.group % 10] : color[0] }; },
  setNodeStateStyles: function(state) { if (state === 'active') { return { opacity: 1.0 }; } return { opacity: 0.2 }; },
  setDefaultEdge: function() { return { strokeStyle: '#ccc' }; },
  setEdgeStateStyles: function(state) { if (state === 'active') { return { strokeStyle: '#A7A7A7' }; } return { opacity: 0.2 }; }
});

var visData = { nodes: [], edges: [] }; var miserablesData = { nodes: [], edges: [] };
fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18949c3ac3627.json')
  .then(function(response) { return response.json(); })
  .then(function(data1) {
    fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18949c3ac5677.json')
      .then(function(response) { return response.json(); })
      .then(function(data2) {
        miserablesData = data1; visData = dealData(data2);
        graph.data(data);
        graph.addBehavior(panZoom); graph.addBehavior(dragCanvas);

        var legendContainer = document.createElement('div');
        legendContainer.style.position = 'absolute'; legendContainer.style.left = '0px'; legendContainer.style.bottom = '0px';
        legendContainer.style.border = '1px solid #ccc'; legendContainer.style.borderRadius = '4px';
        container.append(legendContainer);
        new CategoryLegend(graph, {
          container: legendContainer, encodeAttr: 'group', target: 'node', responsive: true,
          encodeStyles: function(nodeData) {
            return { marker: { type: 'circle', fillStyle: nodeData.fillStyle }, label: { text: 'group' + (nodeData.group ? nodeData.group : 0), fillStyle: '#1d2129' } };
          },
          width: 100, height: 250,
          hover: { enable: true, graphActiveState: 'active', graphBlurState: 'blur' },
          click: { enable: true, multiple: true, filter: true },
          setLegendStateStyles: function(state, markerData) { if (state === 'hover') { return { strokeStyle: markerData.fillStyle, lineWidth: 3, textStyles: { opacity: 0.6 } }; } }
        });
      });
  });

function dealData(data) {
  var nodes = data.nodes; nodes.forEach(function(node) { node.id = node.name; });
  data.links.forEach(function(edge) { edge.source = nodes[edge.source].id; edge.target = nodes[edge.target].id; });
  data.edges = data.links; return data;
}
```

