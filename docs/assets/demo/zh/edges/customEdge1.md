---
category: examples
group: edges
title: 自定义连线
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/custom_edge1.gif
 link: edge-spec/customization
option:
---
# 自定义连线
VGraph 提供种类丰富的内置连线，大多数情况下不需要自定义路径。推荐基于内置连线进行继承，自定义连线以外的部分。此 demo 展示了如何定制在鼠标 hover 到连线时连线中间出现 icon 并进行交互。可以注释连线时间中的代码变为 icon 出现在鼠标处提升体验。
<br>
详细文档可见<a href="/vgraph/guide/edge-spec/customization">自定义连线</a>。
## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, registerEdge, Layer, Icon, dragNode, panZoom, unRegisterEdge, insertStyles } from '@visactor/vgraph';

var iconfontStyles = `
@font-face {
  font-family: 'iconfont';
  src: url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff2?t=1685600318362') format('woff2'),
       url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff?t=1685600318362') format('woff'),
       url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.ttf?t=1685600318362') format('truetype');
}
canvas,
.iconfont {
  font-family: 'iconfont' !important;
}
`;
insertStyles(iconfontStyles, 'vgraph-demo-iconfont');

var data = {
  nodes: [
    {
      id: 'node1',
      x: 100,
      y: 100,
      label: 'node1'
    },
    {
      id: 'node2',
      x: 300,
      y: 100,
      label: 'node2'
    }
  ],
  edges: [
    {
      source: 'node1',
      target: 'node2'
    }
  ]
};

unRegisterEdge('iconEdge');
registerEdge('iconEdge', {
  extends: 'line',
  getConfigsForShape: function(edgeData) {
    return edgeData;
  },
  shape: function(layer, edgeConfigs) {
    var edge = layer.find(function(shape) {
      return shape.get('_keyShape');
    });
    var p = edge.getPointAt(0.5);
    var icon = new Icon({
      x: p.x,
      y: p.y,
      icon: '&#xe613;',
      fillStyle: '#3073F2'
    });
    icon.hide();
    layer.add(icon);
    layer.set('icon', icon);
  },
  afterUpdatePath: function(layer, configs) {
    var edge = layer.find(function(shape) {
      return shape.get('_keyShape');
    });
    var icon = layer.get('icon');
    var p = edge.getPointAt(0.5);
    icon.set(p);
  }
});

var container = document.getElementById(CONTAINER_ID);
var width = container.offsetWidth;
var height = container.offsetHeight;

var graph = new Graph({
  container: CONTAINER_ID,
  width: width,
  height: height,
  minRatio: 0.2,
  maxRatio: 8,
  linkCenter: false,
  setDefaultNode: function(nodeData) {
    return {
      type: 'circle',
      width: 50,
      height: 50,
      fillStyle: '#E4EDFE',
      strokeStyle: '#3073F2',
      label: {
        text: nodeData.label,
        textAlign: 'center',
        textBaseline: 'middle'
      }
    };
  },
  setNodeStateStyles: function(state) {
    if (state === 'active') {
      return {
        opacity: 1.0
      };
    }
    return { opacity: 0.2 };
  },
  setDefaultEdge: function() {
    return {
      type: 'iconEdge',
      hitWidth: 4
    };
  },
  setEdgeStateStyles: function(state) {
    if (state === 'active') {
      return {
        strokeStyle: '#A7A7A7'
      };
    }
    return { opacity: 0.2 };
  }
});
graph.data(data);

graph.addBehavior(dragNode, {
  delegate: false
});
graph.addBehavior(panZoom);

graph.on('edge:mouseenter', function(e) {
  var edge = e.target;
  var icon = edge.layer.get('icon');
  icon.show();
  graph.draw();
});

graph.on('edge:mouseleave', function(e) {
  var edge = e.target;
  var icon = edge.layer.get('icon');
  icon.hide();
  graph.draw();
});
```
