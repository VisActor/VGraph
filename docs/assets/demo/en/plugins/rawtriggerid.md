---
category: examples
group: plugins
title: Text Tooltip for a Specific Graphic
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/raw_trigger.gif
link: plugins/rawtriggerid
option:
---
# Text Tooltip for a Specific Graphic

A text tooltip precisely bound to an icon within a node via `triggerId`.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, RawTooltip, insertStyles } from '@visactor/vgraph';

var iconfontStyles = `
@font-face {
  font-family: 'iconfont';
  src: url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff2?t=1685600318362') format('woff2'),
       url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff?t=1685600318362') format('woff');
}
@font-face {
  font-family: 'iconfont2';
  src: url('//at.alicdn.com/t/c/font_3765180_akekn48k4es.woff2?t=1705473718196') format('woff2'),
       url('//at.alicdn.com/t/c/font_3765180_akekn48k4es.woff?t=1705473718196') format('woff');
}
canvas,
.iconfont {
  font-family: 'iconfont2','iconfont' !important;
}
`;

var colors = { 'Not Ready': '#7152E8','Waiting': '#EE8B24','Running': '#2367EA','Success': '#07A35A','Failed': '#D94147','Terminated': '#5470A5' };
var icons = { 'Not Ready': '&#xe603;','Waiting': '&#xe60c;','Running': '&#xe60a;','Success': '&#xe6b9;','Failed': '&#xe60b;','Terminated': '&#xe614;' };
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

var container = document.getElementById(CONTAINER_ID);
insertStyles(iconfontStyles, 'vgraph-demo-iconfont');
var graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.3,
  maxRatio: 8,
  layout: { type: 'dag' },
  setDefaultNode: function(node) {
    return {
      type: 'tag', width: 140, height: 40,
      color: colors[node.status], label: node.name,
      anchors: [[0.5, 0.0],[0.5, 1.0]],
      icon: { icon: icons[node.status], size: 25, background: { width: 40 }, triggerId: 'triggerIcon' }
    };
  },
  setDefaultEdge: function() {
    return { type: 'vLine', endArrow: { width: 3, height: 5 }, strokeStyle: '#D1D5DA', appendSize: 2 };
  }
});

graph.addBehavior(panZoom);
graph.data(data);
graph.fitView();
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(function() { graph.draw(); });
} else {
  graph.draw();
}

new RawTooltip(graph, {
  styles: { border: '1px solid #ccc', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#fff' },
  content: function(entity) { return entity.get('name') + ': ' + entity.get('status'); },
  triggerId: 'triggerIcon', target: 'node'
});
```
