---
category: examples
group: custom
title: 同心圆布局
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/graphs_force_concentricCircles.png
 link: force-spec/concentricCircles
option:
---
# 同心圆布局

数据描述: 去除连接关系并随机取depth的红楼梦关系图谱。 颜色代表节点与中心节点的深度，可以看到该布局能够使得节点在同心圆环上均匀分布。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  dragNode,
  ShapeBase,
  RawTooltip,
  Circle,
  Layer,
  LayoutBase,
  Node,
} from '@visactor/vgraph';

var color = [
  '#5678D6',
  '#EB8D2F',
  '#59A649',
  '#E0BA2D',
  '#A56AAD',
  '#6DBEC9',
  '#D95145',
  '#A0A0AD',
  '#94674E',
  '#ED848F',
  '#a305e5',
  '#000000',
  '#d0ff8f',
];

var container = document.getElementById(CONTAINER_ID);
var width = container.offsetWidth;
var height = container.offsetHeight;

class ConcentricLayout extends LayoutBase {
  constructor(configs) {
    super(configs);
    this.graph = configs.graph;
    this.circleLayer = null;
    this.options = {
      rootId: '',
      limit: 15,
      rankSep: 100,
      minRadius: 200,
      startRad: 0,
    };
    var layer = new Layer({});
    this.graph.getContainer().add(layer);
    layer.toBack();
    this.circleLayer = layer;
    this.setOptions(configs);
  }

  layout() {
    var rootId = this.options.rootId;
    var rankSep = this.options.rankSep;
    var minRadius = this.options.minRadius;
    var startRad = this.options.startRad;
    var graph = this.graph;
    var centerX = graph.get('width') / 2;
    var centerY = graph.get('height') / 2;
    var maxDepth = Math.max.apply(Math, graph.getNodes().map(function(node) { return node.get('depth'); }));
    var root = graph.getNodeById(rootId);
    if (!root) {
      return;
    }
    root.set('x', centerX);
    root.set('y', centerY);
    var countMap = {};
    var depthMap = {};
    graph.getNodes().forEach(function(node) {
      var depth = node.get('depth');
      if (countMap[depth] !== undefined) {
        countMap[depth]++;
        depthMap[depth].push(node);
      } else {
        countMap[depth] = 1;
        depthMap[depth] = [node];
      }
    });

    var radii = [minRadius];
    for (var i = 1; i <= maxDepth; i++) {
      radii.push(minRadius + i * rankSep);
    }
    for (var i = 1; i <= maxDepth; i++) {
      var rad = (2 * Math.PI) / countMap[i];
      depthMap[i].forEach(function(node, index) {
        var nodeRad = index * rad + startRad;
        var x = centerX + radii[i - 1] * Math.cos(nodeRad);
        var y = centerY + radii[i - 1] * Math.sin(nodeRad);
        node.set('x', x);
        node.set('y', y);
      });
    }
    this.updateBackground(centerX, centerY, maxDepth);
  }

  updateBackground(centerX, centerY, maxDepth) {
    var limit = this.options.limit;
    var minRadius = this.options.minRadius;
    var rankSep = this.options.rankSep;
    this.circleLayer.clear();
    var radii = [minRadius];
    for (var i = 1; i <= maxDepth; i++) {
      radii.push(minRadius + i * rankSep);
    }
    if (maxDepth > limit) {
      console.warn('error: depth large than DEPTH_LIMITED.');
    }
    var addShape = function(rc) {
      var shape = new Circle({
        cx: centerX,
        cy: centerY,
        r: rc,
        opacity: 1.0,
        lineWidth: 2,
        strokeStyle: '#ccc',
      });
      shape.capture = false;
      this.circleLayer.add(shape);
    }.bind(this);

    for (var i = 0; i < maxDepth; i++) {
      addShape(radii[i]);
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
  setDefaultNode: function(node) {
    return {
      type: 'circle',
      width: 50 - Math.sqrt(node.depth) * 10,
      height: 50 - Math.sqrt(node.depth) * 10,
      strokeStyle: undefined,
      fillStyle: color[node.depth % 12],
    };
  },
});
graph.addBehavior(highlightRelations);
graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);
graph.addBehavior(dragNode);

var layout = new ConcentricLayout({
  graph: graph,
  rootId: '5',
});
graph.set('layout', layout);

new RawTooltip(graph, {
  styles: {
    border: null,
    backgroundColor: null,
  },
  content: function(entity) {
    return entity.get('name');
  },
  target: 'node',
});
fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1895333a9a771.json'
)
  .then(function(response) { return response.json(); })
  .then(function(data) {
    data.edges = [];
    data.nodes.forEach(function(node) {
      node.depth = node.id === 5 ? 0 : Math.ceil(Math.random() * 8);
    });
    graph.data(data);
    graph.fitView();
  });
```
