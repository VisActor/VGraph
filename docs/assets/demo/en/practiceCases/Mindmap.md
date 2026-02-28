---
category: examples
group: practiceCases
title: Mind Map Tree Expand/Collapse
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/dp_mindmap.gif
link: practiceCases/Mindmap
option:
---
# Mind Map Tree Expand/Collapse

Mind map scenario: nodes on the left and right sides show count badges, and clicking expands/collapses the subtree.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { TreeGraph, panZoom, dragCanvas, CountBadgeUtils, colorParser, insertStyles } from '@visactor/vgraph';

var iconfontStyles = "\n@font-face {\n  font-family: 'iconfont';\n  src: url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff2?t=1685600318362') format('woff2'),\n       url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff?t=1685600318362') format('woff');\n}\ncanvas { font-family: 'iconfont' !important; }\n";
var container = document.getElementById(CONTAINER_ID);
insertStyles(iconfontStyles, 'vgraph-demo-iconfont');

var NODE_COLORS = ['#5678D6','#EB8D2F','#59A649','#E0BA2D','#A56AAD','#6DBEC9','#D95145','#A0A0AD','#94674E','#ED848F'];

var graph = new TreeGraph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.3,
  maxRatio: 8,
  animate: true,
  layout: { type: 'mindMap', options: {
    direction: 'LR',
    size: function() { return [container.offsetWidth, container.offsetHeight]; },
    nodeSep: function() { return 40; },
    nodeSize: function() { return [190, 40]; },
    rankSep: function() { return 120; }
  } },
  setDefaultNode: function(nodeData) {
    if (nodeData.id === 'Modeling Methods') {
      return { width: 124, height: 40, fillStyle: '#3073F2', strokeStyle: null, radius: 8,
        label: { x: 0, y: 0, text: nodeData.id, textAlign: 'center', fontSize: 16, fontWeight: 500, fillStyle: '#fff', width: 100, textOverflow: 'ellipsis' },
        anchors: [[0,0.5],[1,0.5]] };
    }
    return { label: nodeData.id, type: 'category', radius: 4, color: NODE_COLORS[Math.round(Math.random()*9)], width: 190, height: 40,
      anchors: [[0,0.5],[1,0.5]],
      icons: nodeData.children ? [{ type: 'category', show: 'hover', position: nodeData.position === 'right' ? [1,0.5] : [0,0.5], offsets: nodeData.position === 'right' ? [20,0] : [-20,0],
        setStyles: function() { return { fillStyle: '#3073F2', icon: (nodeData.position === 'right' ? '&#xe617;' : '&#xe618;'), cursor: 'pointer' }; },
        setBgStyles: function() { return { type: 'circle', size: 14 }; },
        onClick: function(e, nodeData) { showSum(nodeData, e); },
        onMouseEnter: function(e) { var bkg = e.target.children[0]; bkg.set('fillStyle', '#E4EDFE'); graph.draw(); },
        onMouseLeave: function(e) { var bkg = e.target.children[0]; bkg.set('fillStyle', '#FFF'); graph.draw(); }
      }] : undefined };
  },
  setDefaultEdge: function() { return { type: 'hLine', styles: { radius: 8 }, lineWidth: 1, endArrow: true }; }
});

graph.addBehavior(dragCanvas);
graph.addBehavior(panZoom, { sensitivity: 4 });

fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894e075c8a46.json')
  .then(function(response) { return response.json(); })
  .then(function(rawData) { graph.data(rawData); });

function showSum(nodeData, e) {
  var node = graph.getNodeById(nodeData.id);
  node.set('iconLayer', e.target);
  e.target.hide();
  var count = getChildrenCount(nodeData);
  var sumLayer = node.get('sumLayer');
  if (!sumLayer) {
    sumLayer = CountBadgeUtils.init(node, {
      position: node.get('position'), text: String(count), color: node.get('color'),
      onClick: function() { sumLayer.hide(); node.get('iconLayer').hide(); graph.expand(node); },
      onMouseEnter: function() { var rect = sumLayer.children[1]; rect.set('fillStyle', colorParser(rect.get('strokeStyle')).lerp('#ffffff', 0.875).hex()); graph.draw(); },
      onMouseLeave: function() { var rect = sumLayer.children[1]; rect.set('fillStyle', '#FFF'); graph.draw(); }
    });
    node.set('sumLayer', sumLayer);
  }
  sumLayer.show();
  graph.collapse(node);
}

function getChildrenCount(nodeData) {
  var children = nodeData.children; if (!children || children.length === 0) { return 0; }
  var count = children.length; children.forEach(function(child) { count += getChildrenCount(child); });
  return count;
}
```
