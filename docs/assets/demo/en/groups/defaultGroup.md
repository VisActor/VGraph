---
category: examples
group: groups
title: Built-in Group
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/inset_groups.png
link: group-spec/options
option:
---
# Built-in Group
vGraph supports custom configuration of group titles and has built-in collapse/expand functionality. This demo shows the full configuration of the default group title and the expand/collapse interaction. For detailed documentation, please see the group documentation. For a list of events, please see events.
## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, dragCanvas, insertStyles } from '@visactor/vgraph';

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

var expandIcon = '&#xeb15;';
var collapseIcon = '&#xeb14;';

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
  groups: [{ name: 'Data Layer', children: ['1', '2', '3'] }]
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
  linkCenter: true,
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
      radius: 4,
      linkNode: true,
      padding: 20,
      lineWidth: 0.5,
      titleSize: 30,
      title: {
        text: { text: groupData.name, fontSize: 14, fillStyle: '#3073F2' },
        background: {
          height: 28,
          fillStyle: '#E4EDFE'
        },
        icon: {
          icon: collapseIcon,
          fillStyle: '#3073F2',
          cursor: 'pointer',
          onClick: function(e, group) {
            if (group.get('collapsed')) {
              e.target.set('icon', collapseIcon);
              group.expand();
            } else {
              e.target.set('icon', expandIcon);
              group.collapse();
            }
          }
        }
      }
    };
  }
});
graph.data(data);

document.fonts.ready.then(function() {
  graph.draw();
});
graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);
```
