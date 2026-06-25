---
category: examples
group: practiceCases
title: 添加树节点
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/dp_add_node.gif
link: practiceCases/AddNode
option:
---
# 添加树节点

点击节点上的加号图标在紧凑树中添加子节点；自动判断是否需要移动视图保证新增节点可见。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { TreeGraph, panZoom, dragCanvas, CompactBox, insertStyles } from '@visactor/vgraph';

var iconfontStyles = "\n@font-face {\n  font-family: 'iconfont';\n  src: url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff2?t=1685600318362') format('woff2'),\n       url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff?t=1685600318362') format('woff');\n}\ncanvas { font-family: 'iconfont' !important; }\n";
var expandIcon = '&#xe613;';
var PADDING_RIGHT = 20; var PADDING_BOTTOM = 20;

var container = document.getElementById(CONTAINER_ID);
insertStyles(iconfontStyles, 'vgraph-demo-iconfont');

var layout = new CompactBox({ direction: 'LR', size: function(){ return [800,600]; }, nodeSep: function(){ return 15; }, nodeSize: function(){ return [140,20]; }, rankSep: function(){ return 40; } });

var graph = new TreeGraph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.3,
  maxRatio: 2,
  layout: layout,
  fitViewAfterLayout: false,
  animate: { duration: 300 },
  setDefaultNode: function(nodeData) {
    return { width: 140, height: 40, radius: 4, id: nodeData.id, label: nodeData.id, color: '#5678D6', anchors: [[0,0.5],[1,0.5]],
      icons: [{ setStyles: function(){ return { fillStyle: '#5678D6', icon: expandIcon }; }, position: [1,0.5], show: 'hover', offsets: [8,0], onClick: function(e){ e.stopPropagation(); addNode(nodeData); } }] };
  },
  setNodeStateStyles: function(){ return { strokeStyle: '#f50' }; },
  setDefaultEdge: function(){ return { type: 'hLine' }; }
});

graph.addBehavior(dragCanvas);
graph.addBehavior(panZoom);

graph.data({ id: 'root' });
graph.focus(graph.getNodeById('root'));

function addNode(nodeData) {
  var parent = graph.getNodeById(nodeData.id);
  graph.disableAutoLayout();
  var node = graph.addChild({ id: nodeData.id + '-' + (nodeData.children ? nodeData.children.length : 0) }, parent);
  if (!node) { return; }
  graph.refreshLayout(); graph.set('autoLayout', true);
  var ratio = graph.getZoomRatio(); var offsetX = 0; var offsetY = 0;
  var point = graph.canvasToViewport(node.get('x') + node.get('width')/2, node.get('y') + node.get('height')/2);
  if (point.x > graph.get('width') - PADDING_RIGHT) { offsetX = (parent.get('x') - node.get('x')) * ratio; }
  if (point.y > graph.get('height') - PADDING_BOTTOM) { offsetY = -node.get('height') * ratio; }
  if (offsetX || offsetY) {
    parent.layer.get('__icons').forEach(function(icon){ icon.hide(); });
    if (offsetX) { node.layer.get('__icons').forEach(function(icon){ icon.show(); }); }
    var lastRatioX = 0; var lastRatioY = 0;
    graph.animate({ target: node, common: { duration: 300, repeat: false, onFrame: function(r){ graph.translate(offsetX*r - lastRatioX, offsetY*r - lastRatioY); lastRatioX = offsetX*r; lastRatioY = offsetY*r; } } });
  }
}
```

