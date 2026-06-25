---
category: examples
group: groups
title: Custom Group
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/custom_group.gif
link: group-spec/options
option:
---
# Custom Group
In most business scenarios, group styles and interactions are fairly standard. What often needs customization is the title, so VGraph provides a lightweight way to customize group titles. We also welcome more real-world custom group use cases.
See <a href="/vgraph/guide/group-spec/options#分组标题">Group Title Options</a> for details.
## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, dragCanvas, Layer, Text, Rect } from '@visactor/vgraph';

var data = {
  nodes: [
    {
      id: '1',
      label: 'Data Acquisition',
      x: 300,
      y: 200
    },
    {
      id: '2',
      label: 'Data Cleaning',
      x: 300,
      y: 280
    },
    {
      id: '3',
      label: 'Data Organization',
      x: 300,
      y: 360
    },
    {
      id: '4',
      label: 'Modeling and Analysis',
      x: 450,
      y: 360
    }
  ],
  edges: [
    {
      source: '1',
      target: '2'
    },
    {
      source: '2',
      target: '3'
    },
    {
      source: '3',
      target: '4'
    }
  ],
  groups: [
    {
      name: 'Data Layer',
      children: ['1', '2', '3']
    }
  ]
};

var container = document.getElementById(CONTAINER_ID);
var width = container.offsetWidth;
var height = container.offsetHeight;

var graph = new Graph({
  container: CONTAINER_ID,
  width: width,
  height: height,
  minRatio: 0.2,
  maxRatio: 8,
  setDefaultNode: function(nodeData) {
    return {
      label: {
        text: nodeData.label,
        fillStyle: '#3073F2'
      },
      type: 'rect',
      width: 100,
      height: 40,
      radius: 3,
      strokeStyle: '#1E54C9',
      anchors: [
        [0, 0.5],
        [0.5, 0],
        [0.5, 1],
        [1, 0.5]
      ]
    };
  },
  setDefaultEdge: function() {
    return {
      strokeStyle: '#D1D5DA',
      endArrow: true
    };
  },
  setDefaultGroup: function(groupData) {
    return {
      strokeStyle: '#3073F2',
      radius: 6,
      linkNode: true,
      padding: 20,
      lineWidth: 0.5,
      titleSize: 30,

      renderGroupTitle: function(group, layer, width) {
        var text = new Text({
          text: groupData.name,
          x: width / 2,
          y: 18,
          fontSize: 10,
          textBaseline: 'middle',
          textAlign: 'center',
          fillStyle: '#3073F2'
        });

        var rect = new Rect({
          left: 0,
          top: 0,
          width: width,
          height: 4,
          radius: [6, 6, 0, 0],
          fillStyle: '#3073F2'
        });

        layer.add(rect);
        layer.add(text);
      }
    };
  }
});
graph.data(data);
graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);

graph.on('group:click', function(e) {
  var group = e.target;
  if (group.get('collapsed')) {
    group.expand();
  } else {
    group.collapse();
  }
});
```
