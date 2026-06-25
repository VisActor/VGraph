---
category: examples
group: practiceCases
title: Super Long Edge Text Label
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/dp_edge_label.png
link: practiceCases/EdgeLabel
option:
---
# Super Long Edge Text Label

Display a super long text label on a directed graph edge, with support for ellipsis and position adjustment.

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
      label: { text: 'Super long text label super long text label super long text label super long text label super long text label', position: 1, width: 110, offsetY: -10, textOverflow: 'ellipsis', textAlign: 'end' } };
  }
});

graph.addBehavior(panZoom);

fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_186c5d1eac181.json')
  .then(function(response) { return response.json(); })
  .then(function(data) { graph.data(data); graph.fitView(); });
```
