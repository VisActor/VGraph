---
category: examples
group: plugins
title: Custom Legend
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/custom_legend.gif
link: plugins/customLegend
option:
---
# Custom Legend

Show a custom categorical legend, linked with the node states in the graph.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, CategoryLegend, insertStyles } from '@visactor/vgraph';

var iconfontStyles = `
@font-face {
  font-family: 'iconfont';
  src: url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff2?t=1685600318362') format('woff2'),
       url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff?t=1685600318362') format('woff');
}
canvas,
.iconfont {
  font-family: 'iconfont' !important;
}
`;

var data = { nodes: [
  { name: 'JOB1', status: 'Success', id: '1' }, { name: 'JOB2', status: 'Success', id: '2' },
  { name: 'JOB3', status: 'Running', id: '3' }, { name: 'JOB4', status: 'Terminated', id: '4' },
  { name: 'JOB5', status: 'Running', id: '5' }, { name: 'JOB6', status: 'Waiting', id: '6' },
  { name: 'JOB7', status: 'Failed', id: '7' }, { name: 'JOB8', status: 'Waiting', id: '8' },
  { name: 'JOB9', status: 'Not Ready', id: '9' }, { name: 'JOB10', status: 'Failed', id: '10' },
  { name: 'JOB11', status: 'Terminated', id: '11' }, { name: 'JOB12', status: 'Not Ready', id: '12' }
], edges: [
  { source: '1', target: '2' }, { source: '1', target: '3' }, { source: '2', target: '4' }, { source: '2', target: '5' },
  { source: '3', target: '6' }, { source: '4', target: '7' }, { source: '5', target: '7' }, { source: '5', target: '8' },
  { source: '5', target: '9' }, { source: '6', target: '9' }, { source: '7', target: '10' }, { source: '8', target: '10' },
  { source: '9', target: '11' }, { source: '9', target: '12' }
]};
var colors = { 'Not Ready': '#7152E8','Waiting': '#EE8B24','Running': '#2367EA','Success': '#07A35A','Failed': '#D94147','Terminated': '#5470A5' };
var icons = { 'Not Ready': '&#xe603;','Waiting': '&#xe60c;','Running': '&#xe60a;','Success': '&#xe6b9;','Failed': '&#xe60b;','Terminated': '&#xe614;' };

var container = document.getElementById(CONTAINER_ID);
insertStyles(iconfontStyles, 'vgraph-demo-iconfont');
var width = container.offsetWidth; var height = container.offsetHeight;
var graph = new Graph({
  container: CONTAINER_ID, width: width, height: height, minRatio: 0.3, maxRatio: 8,
  layout: { type: 'dag' },
  setDefaultNode: function(nodeData) {
    return {
      type: 'tag', width: 140, height: 40,
      color: colors[nodeData.status], label: nodeData.name,
      anchors: [[0.5, 0.0],[0.5, 1.0]],
      icon: { icon: icons[nodeData.status], size: 25, background: { width: 40 }, triggerId: 'triggerIcon' }
    };
  },
  setDefaultEdge: function() { return { type: 'vLine', endArrow: { width: 3, height: 5 }, strokeStyle: '#D1D5DA', appendSize: 2 }; }
});

graph.addBehavior(panZoom);
graph.data(data);
graph.fitView();
document.fonts && document.fonts.ready.then(function() { graph.draw(); });

var legendData = [];
Object.keys(colors).forEach(function(value) {
  legendData.push({
    marker: { type: 'icon', icon: icons[value], fillStyle: colors[value] },
    label: value, value: value
  });
});

var legendContainer = document.createElement('div');
legendContainer.style.position = 'absolute'; legendContainer.style.left = '0px'; legendContainer.style.bottom = '0px';
legendContainer.style.border = '1px solid #ccc'; legendContainer.style.borderRadius = '4px'; legendContainer.style.backgroundColor = '#fff';
container.append(legendContainer);

new CategoryLegend(graph, {
  legendData: legendData,
  container: legendContainer,
  responsive: true,
  encodeAttr: 'status', target: 'node', width: 85, height: 200,
  hover: { enable: true, legendActiveState: 'hover', graphActiveState: 'hover' },
  click: { enable: true, multiple: true, filter: true, legendActiveState: 'click' },
  setLegendStateStyles: function(state) {
    if (state === 'hover') { return { size: 13, textStyles: { fillStyle: '#1d2129' } }; }
    if (state === 'click') { return { opacity: 0.2, textStyles: { opacity: 0.2 } }; }
  }
});
```
