---
category: examples
group: practiceCases
title: 超长连线文本标签
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/dp_edge_label.png
link: practiceCases/EdgeLabel
option:
---
# 超长连线文本标签

在有向图连线上展示超长文本标签，支持省略与位置调整。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom } from '@visactor/vgraph';

var container = document.getElementById(CONTAINER_ID);

var NODE_COLORS = ['#5678D6','#EB8D2F','#59A649','#E0BA2D','#A56AAD','#6DBEC9','#D95145','#A0A0AD','#94674E','#ED848F'];

var graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  layout: { type: 'dag', options: { rankDir: 'LR', nodeSep: 50, edgeSep: 50, rankSep: 120 } },
  setDefaultNode: function() {
    return { type: 'category', radius: 4, color: NODE_COLORS[Math.round(Math.random()*9)], width: 100, height: 30, anchors: [[0,0.5],[1,0.5]] };
  },
  setDefaultEdge: function() {
    return { type: 'hLine', lineWidth: 1, endArrow: true, styles: { curvePosition: 0.1 },
      label: { text: '超长文本标签超长文本标签超长文本标签超长文本标签超长文本标签', position: 1, width: 110, offsetY: -10, textOverflow: 'ellipsis', textAlign: 'end' } };
  }
});

graph.addBehavior(panZoom);

fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_186c5d1eac181.json')
  .then(function(response) { return response.json(); })
  .then(function(data) { graph.data(data); graph.fitView(); });
```

