---
category: examples
group: custom
title: 网状布局
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/grid.jpeg
 link: force-spec/concentricCircles
option:
---
# 网状布局

数据描述: 单链关系数据常用的布局方式，此实例实现了一种限制单行节点个数的方式，并且能在增删改图中数据时自动刷新布局。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  dragNode,
  Layer,
  LayoutBase,
  registerEdge,
} from '@visactor/vgraph';

var container = document.getElementById(CONTAINER_ID);
var width = container.offsetWidth;
var height = container.offsetHeight;

registerEdge('stepLine', {
  extends: 'turningLine',
  drawCurrentLabel: false,
  getConfigsForShape: function(configs) {
    var startPoint = configs.startPoint;
    var endPoint = configs.endPoint;
    var source = configs.source;
    var target = configs.target;
    var controlPoints = [];
    if (startPoint[0] > endPoint[0]) {
      startPoint[0] = source.get('x') + source.get('width') / 2;
      endPoint[0] = target.get('x') - target.get('width') / 2;
      controlPoints = [
        [startPoint[0] + 20, startPoint[1]],
        [startPoint[0] + 20, startPoint[1] + source.get('height') / 2 + 20],
        [endPoint[0] - 20, startPoint[1] + source.get('height') / 2 + 20],
        [endPoint[0] - 20, endPoint[1]]
      ];
    }
    configs.controlPoints = controlPoints;
    return configs;
  },
  shape: function() {},
  afterUpdatePath: function() {}
});

class GridLayout extends LayoutBase {
  constructor(configs) {
    super(configs);
    this.graph = configs.graph;
    this.circleLayer = null;
    this.options = {
      nodeSep: 60,
      rankSep: 40,
      lineCapacity: 4,
    };
  }

  layout() {
    var length = 0;
    var row = 0;
    var count = 0;
    var nodeSep = this.options.nodeSep;
    var rankSep = this.options.rankSep;
    var lineCapacity = this.options.lineCapacity;
    var node = this.graph.getNodes().find(function(node) { return node.sources.length === 0; });
    while (node) {
      node.set('x', length);
      node.set('y', row);
      count += 1;
      if (count === lineCapacity + 1) {
        row += node.get('height') + rankSep;
        length = 0;
        count = 0;
        continue;
      } else {
        length += (node.get('width') + nodeSep);
      } 
      node = node.targets.length > 0 ? this.graph.getNodeById(node.targets[0]) : undefined;
    }
  }
}

var graph = new Graph({
  container: CONTAINER_ID,
  width: width,
  height: height,
  minRatio: 0.2,
  maxRatio: 8,
  linkCenter: true,
  autoLayout: true,
  setDefaultNode: function(nodeData) {
    return {
      width: 140,
      height: 40,
      label: nodeData.id,
      fillStyle: '#F3F9FF',
    };
  },
  setDefaultEdge: function(edgeData) {
    return {
      endArrow: true,
      type: 'stepLine'
    }
  }
});
graph.addBehavior(highlightRelations);
graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);
graph.addBehavior(dragNode);

var layout = new GridLayout({ graph: graph });
graph.set('layout', layout);

var nodes = [];
var edges = [];
for (var i = 0; i < 100; i++) {
  nodes.push({ id: i.toString() });
  if (i !== 0) {
    edges.push({
      source: (i - 1).toString(),
      target: i.toString()
    });
  }
}
graph.data({ nodes: nodes, edges: edges });
graph.alignView('lt');
```
