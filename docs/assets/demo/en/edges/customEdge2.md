---
category: examples
group: edges
title: Custom Edge
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/custom_edge2.gif
link: edge-spec/customization
option:
---
# Custom Edge
VGraph provides a rich set of built-in edges, and in most cases you do not need to customize the path. It is recommended to extend a built-in edge and only customize what you need. This demo shows how to render two text labels, and how to calculate the label angle by calling methods from the inherited built-in edge.
<br>
See <a href="/vgraph/guide/edge-spec/customization">Custom Edges</a> for details.
## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, registerEdge, Layer, Text, dragNode, panZoom, unRegisterEdge } from '@visactor/vgraph';

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
      target: 'node2',
      label: ['hello', 'world']
    }
  ]
};

unRegisterEdge('multipleLabelsEdge');
registerEdge('multipleLabelsEdge', {
  extends: 'line',
  drawCurrentLabel: false,
  getConfigsForShape: function(edgeData) {
    return Object.assign({}, edgeData, {
      label: {
        text: edgeData.label[0],
        position: 0,
        offsetX: 10,
        autoRotate: true,
        textBaseline: 'bottom'
      },
      otherLabel: {
        position: 1,
        offsetX: -10,
        autoRotate: true,
        text: edgeData.label[1],
        textBaseline: 'bottom'
      }
    });
  },
  shape: function(layer, edgeConfigs) {
    var path = layer.find(function(shape) {
      return shape.get('_keyShape');
    });
    var otherLabel = edgeConfigs.otherLabel;
    var labelConfigs = this.getCustomLabelConfigs(path, {
      label: otherLabel
    });
    var label = new Text(labelConfigs);
    label.set('_rightLabel', true);
    layer.add(label);
    this.rotateLabel(label);
  },
  rotateLabel: function(label) {
    var rotate = label.get('rotate');
    var x = label.get('x');
    var y = label.get('y');
    label.setMatrix([1, 0, 0, 1, 0, 0]);
    if (rotate) {
      label.translate(-x, -y);
      label.rawRotate(rotate, true);
      label.translate(x, y);
    }
  },
  afterUpdatePath: function(layer, configs) {
    var path = layer.find(function(shape) {
      return shape.get('_keyShape');
    });
    var label = layer.find(function(shape) {
      return shape.get('_rightLabel');
    });
    if (label) {
      var labelConfigs = this.getCustomLabelConfigs(path, {
        label: configs.otherLabel
      });
      label.set(labelConfigs);
      this.rotateLabel(label);
    }
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
      type: 'multipleLabelsEdge',
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
```
