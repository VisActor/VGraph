---
category: examples
group: tree
title: 行政区划
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/area.gif
 link: demo-spec/area
option:
---
# 行政区划

数据描述：紧凑树布局示例，支持节点收起/展开与子树着色。交互：点击节点切换子树，鼠标悬停高亮关联链路。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { TreeGraph, panZoom, dragCanvas, Node, Edge } from '@visactor/vgraph';

var colors = [
  { bkg: '#F9DABA', text: '#EE8B24' },
  { bkg: '#B9EBD2', text: '#07A35A' },
  { bkg: '#DCE2EE', text: '#5470A5' },
  { bkg: '#CFD2FF', text: '#7152E8' },
  { bkg: '#FEC7C9', text: '#D94147' },
];

var container = document.getElementById(CONTAINER_ID);
var width = container.offsetWidth;
var height = container.offsetHeight;

var graph = new TreeGraph({
  container: CONTAINER_ID,
  width: width,
  height: height,
  minRatio: 0.3,
  maxRatio: 8,
  animate: true,
  layout: {
    type: 'compactBox',
    options: {
      direction: 'LR',
      nodeSep: function() { return 10; },
      nodeSize: function() { return [110, 20]; },
      rankSep: function() { return 150; }
    }
  },
  setDefaultNode: function(node) {
    var text;
    if (node.children) {
      text = node.name + ' (' + node.children.length + ')';
    } else {
      text = node.name;
    }
    return {
      id: node.code,
      type: 'rect',
      width: 110,
      height: 20,
      fillStyle: node.styles ? node.styles.bkg : '#fff',
      strokeStyle: node.styles ? node.styles.text : '#545454',
      collapsed: node.collapsed === undefined ? (node.code === '0' ? false : true) : node.collapsed,
      anchors: [ [0, 0.5], [1, 0.5] ],
      label: {
        text: text,
        width: 100,
        fillStyle: node.styles ? node.styles.text : '#545454',
        textAlign: 'center',
        textBaseline: 'middle',
        fontSize: 10,
      },
    };
  },
  setNodeStateStyles: function(state, data, node) {
    var label = node.getLabel();
    if (state === 'active') {
      label.set('fillStyle', '#2367EA');
      return { fillStyle: '#C6D8FF', strokeStyle: '#2367EA' };
    } else {
      label.set('fillStyle', data.styles ? data.styles.text : '#545454');
      return;
    }
  },
  setDefaultEdge: function() { return { type: 'hLine' }; },
  setEdgeStateStyles: function(state) { if (state === 'active') { return { strokeStyle: '#2367EA', lineWidth: 2 }; } }
});

fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_186c5bbcde862.json')
  .then(function(response) { return response.json(); })
  .then(function(data) { graph.data(data); graph.refreshLayout(); });

graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);

var colorIndex = 0;
graph.on('node:click', function(e) {
  graph.set('autoDraw', false);
  var node = e.target;
  if (!node.get('children')) { graph.set('autoDraw', true); return; }
  clearStates();
  if (node.get('level') === 1) {
    if (node.get('styles')) {
      node.updateData({ styles: null });
      node.getEdges().forEach(function(edge) {
        if (edge.get('target') === node.get('id')) { edge.getKeyShape().set('strokeStyle', '#545454'); }
      });
    } else {
      var styles = colors[colorIndex % 5];
      colorIndex += 1;
      setSubTreeStyles(e.target, styles);
    }
  }
  graph.toggleCollapse(e.target);
  graph.set('autoDraw', true);
  graph.draw();
});

function setSubTreeStyles(node, styles) {
  var nodeId = node.get('id');
  var children = node.get('children');
  node.updateData({ styles: styles });
  node.getEdges().forEach(function(edge) { if (edge.get('target') === nodeId) { edge.getKeyShape().set('strokeStyle', styles.text); } });
  if (children) { children.forEach(function(childData) { setSubTreeStyles(graph.getNodeById(childData.id), styles); }); }
}

function clearStates() {
  graph.getNodes().forEach(function(n) { n.removeState('active'); n.setState('default'); });
  graph.getEdges().forEach(function(edge) { edge.removeState('active'); });
}

graph.on('node:mouseenter', function(e) {
  var node = e.target;
  if (node.get('code') !== '0') {
    node.setState('active');
    node.edges.forEach(function(edge) { edge.toFront(); edge.setState('active'); });
    var source = node.sources.concat();
    var target = node.targets.concat();
    while (source.length) {
      var s = graph.getNodeById(source.shift());
      s.setState('active');
      source = source.concat(s.sources);
      s.edges.forEach(function(edge) { if (edge.target === s) { edge.toFront(); edge.setState('active'); } });
    }
    while (target.length) {
      var t = graph.getNodeById(target.shift());
      t.setState('active');
      target = target.concat(t.targets);
      t.edges.forEach(function(edge) { if (edge.source === t) { edge.toFront(); edge.setState('active'); } });
    }
  }
});

graph.on('node:mouseleave', function() { clearStates(); });
```
