---
category: examples
group: tree
title: 缩进森林
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/indent_forest.png
 link: demo-spec/treeBasic
option:
---
# 缩进森林

数据描述：将多棵缩进树横向排列并对齐根节点，连线采用自定义 stepLine。交互：悬停展示节点右下角的展开/收起图标，点击可切换节点。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { TreeGraph, panZoom, dragCanvas, Indented, registerNode, registerEdge, Rect, Layer, unRegisterEdge, LayoutBase } from '@visactor/vgraph';

var expandIcon = '&#xe613';
var collapseIcon = '&#xe611';

class IndentForestLayout extends LayoutBase {
  constructor(options) {
    super(options);
    this.indented = new Indented(options);
    this.options = Object.assign({ indent: 50 }, options);
  }
  layout(data) {
    this.indented.layout(data);
    var subRoots = data.children;
    if (!subRoots || subRoots.length === 0) { return; }
    var nodeSep = this.options.nodeSep;
    var indent = this.options.indent;
    var subIndent = this.options.subIndent;
    var offset = subIndent ? (subIndent - indent) : 0;
    var fixY = subRoots[0].y;
    var maxWidth = getMaxWidth(subRoots[0]);
    if (offset) { subRoots[0].x -= offset; }
    for (var i = 1; i < subRoots.length; i++) {
      var node = subRoots[i];
      var x = node.x; var y = node.y; var width = node.width;
      var offsetX = maxWidth + width / 2 + nodeSep(node) - x + offset;
      var offsetY = fixY - y;
      translateTree(node, offsetX, offsetY, node.collapsed ? (node.x + offsetX) : undefined, node.collapsed ? fixY : undefined);
      if (offset) { node.x -= offset; }
      maxWidth = getMaxWidth(node);
    }
    return data;
  }
}

function getMaxWidth(data) {
  var x = data.x; var width = data.width;
  var maxX = x + width / 2;
  if (data.collapsed) { return maxX; }
  data && data.children && data.children.forEach(function(child) { maxX = Math.max(getMaxWidth(child), maxX); });
  return maxX;
}

function translateTree(node, x, y, parentX, parentY) {
  if (parentX !== undefined) {
    node.x = parentX; node.y = parentY;
    node.children && node.children.forEach(function(child) { translateTree(child, x, y, parentX, parentY); });
  } else {
    node.x += x; node.y += y;
    var fixX = node.collapsed ? node.x : undefined;
    var fixY = node.collapsed ? node.y : undefined;
    node.children && node.children.forEach(function(child) { translateTree(child, x, y, fixX, fixY); });
  }
}

registerNode('underline', {
  extends: 'rect',
  drawCurrentLabel: false,
  getConfigsForShape: function(nodeData) {
    var configs = Object.assign({}, nodeData);
    configs.strokeStyle = null;
    configs.opacity = 0;
    return configs;
  },
  shape: function(layer, nodeData) {
    var width = nodeData.width; var height = nodeData.height; var color = nodeData.color;
    var rect = new Rect({ left: -width / 2, top: height / 2 - 8.5, width: width, height: 1, fillStyle: color });
    layer.add(rect);
  }
});

unRegisterEdge('stepLine');
registerEdge('stepLine', {
  extends: 'turningLine',
  drawCurrentLabel: false,
  getConfigsForShape: function(configs) {
    var startPoint = configs.startPoint; var endPoint = configs.endPoint;
    return Object.assign({}, configs, { controlPoints: [[startPoint[0], endPoint[1]]] });
  },
  shape: function() {},
  afterUpdatePath: function() {}
});

var container = document.getElementById(CONTAINER_ID);
var width = container.offsetWidth;
var height = container.offsetHeight;

var NODE_COLORS = ['#5678D6', '#EB8D2F', '#59A649', '#E0BA2D', '#A56AAD', '#6DBEC9', '#D95145', '#A0A0AD', '#94674E', '#ED848F'];

var layout = new IndentForestLayout({
  direction: 'LR',
  indent: 14,
  subIndent: 60,
  size: function() { return [800, 600]; },
  nodeSep: function() { return 20; },
  nodeSize: function(nodeData) { return [nodeData.width, nodeData.height]; },
  rankSep: function() { return 40; }
});

var graph = new TreeGraph({
  container: CONTAINER_ID,
  width: width,
  height: height,
  minRatio: 0.3,
  maxRatio: 8,
  animate: true,
  layout: layout,
  fitViewAfterLayout: false,
  setDefaultNode: function(node) {
    var icons; var color = node.color || NODE_COLORS[Math.round(Math.random() * 9)];
    if (node.children && node.children.length > 0) {
      icons = [
        {
          setStyles: function(data) {
            var styles = { fillStyle: color, size: 10, cursor: 'pointer' };
            styles.icon = data.collapsed ? expandIcon : collapseIcon; return styles;
          },
          setBgStyles: function() { return { type: 'circle' }; },
          position: [0, 1], offsets: [8, -8], show: 'hover',
          onClick: function(e, nodeData) {
            var n = graph.getNodeById(nodeData.id);
            var icon = e.target.children[1];
            icon.set('icon', n.get('collapsed') ? collapseIcon : expandIcon);
            e.target.hide(); graph.toggleCollapse(n);
          }
        }
      ];
    }
    if (node.depth === 1) {
      return {
        type: 'rect', width: 100, height: 36, fillStyle: '#E3E5EB', radius: 8,
        icons: undefined, color: undefined,
        label: { text: node.nodeLabel, textAlign: 'center', fontSize: 14, fontWeight: 500, fillStyle: '#1B1F23', width: 76, textOverflow: 'ellipsis' },
        anchors: [ [0.5, 1] ]
      };
    }
    return {
      type: 'underline',
      label: { text: node.nodeLabel, fontSize: 10, fontWeight: 500, fillStyle: '#1B1F23', width: 76, textOverflow: 'ellipsis', offsetY: -6 },
      color: color, width: 100, height: 18, icons: icons,
      anchors: [ { position: [0, 1], offsets: [8, -8] } ]
    };
  },
  setDefaultEdge: function(edgeData) {
    var target = graph.getNodeById(edgeData.target);
    return { strokeStyle: target.get('color'), type: 'stepLine' };
  }
});

graph.addBehavior(dragCanvas);
graph.addBehavior(panZoom, { sensitivity: 4 });

fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18b89f066aa87.json')
  .then(function(response) { return response.json(); })
  .then(function(data) {
    graph.data({ id: 'root', children: data.items });
    var root = graph.getNodeById('root');
    var firstNode = graph.getNodeById(data.items[0].id);
    var pos = firstNode.configs; var x = pos.x; var y = pos.y;
    root.updatePosition(x, y); root.hide(); graph.translate(x + 200, y);
  });
```
