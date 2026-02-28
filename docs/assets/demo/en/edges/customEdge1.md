---
category: examples
group: edges
title: Custom Edge
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/custom_edge1.gif
link: edge-spec/customization
option:
---
# Custom Edge
vGraph provides a rich variety of built-in connections, and in most cases, there is no need to customize the path. It is recommended to inherit from the built-in connections and customize the parts other than the connection itself. This demo shows how to customize an icon to appear and interact in the middle of the connection when the mouse hovers over it. You can comment out the code in the connection time to have the icon appear at the mouse position to improve the experience. For detailed documentation, please refer to Custom Edge.
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
