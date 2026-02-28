---
category: examples
group: groups
title: Connect When Group is Collapsed
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/link_group_on_collapse.png
link: group-spec/options
option:
---
# Connect When Group is Collapsed
In most business scenarios, the style requirements for groups are not high, and interactions are enumerable. Often, only the title needs to be customized. Therefore, vGraph provides a lightweight method for customizing titles. We also hope to receive more input from businesses on custom grouping scenarios. For detailed documentation, please refer to the group title configuration.
## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, Text, Icon, insertStyles } from '@visactor/vgraph';

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
    { label: 'a', class: 'type-TOP', id: 'a', x: 100, y: 100 },
    { label: 'b', class: 'type-S', id: 'b', x: 200, y: 100 },
    { label: 'c', class: 'type-NP', id: 'c', x: 330, y: 200 },
    { label: 'd', class: 'type-DT', id: 'd', x: 430, y: 300 },
    { label: 'e', class: 'type-TK', id: 'e', x: 430, y: 400 }
  ],
  edges: [
    { source: 'd', target: 'e' },
    { source: 'c', target: 'd' },
    { source: 'b', target: 'a' },
    { source: 'e', target: 'b' },
    { source: 'a', target: 'e' }
  ],
  groups: [
    {
      id: 'group1',
      children: ['d', 'e']
    },
    {
      id: 'group2',
      children: ['group1', 'c']
    },
    {
      id: 'group3',
      children: ['a', 'b']
    }
  ]
};

var container = document.getElementById(CONTAINER_ID);
var width = container.offsetWidth;
var height = container.offsetHeight;
var expandIcon = '&#xe610;';
var collapseIcon = '&#xe60f;';

var graph = new Graph({
  container: CONTAINER_ID,
  width: width,
  height: height,
  minRatio: 0.2,
  maxRatio: 8,
  setDefaultNode: function(nodeData) {
    return {
      label: nodeData.id,
      type: 'rect',
      width: 80,
      height: 30,
      radius: 4,
      anchors: [
        [0, 0.5],
        [0.5, 0],
        [0.5, 1],
        [1, 0.5]
      ]
    };
  },
  setDefaultEdge: function(edge) {
    return {
      type: 'line',
      endArrow: {
        type: 'arrow',
        style: 'triangleSolid',
        size: 10
      }
    };
  },
  setDefaultGroup: function(group) {
    return {
      linkNode: true,
      linkGroupOnCollapse: true,
      fillStyle: '#fff',
      strokeStyle: '#DDE2E9',
      padding: 20,
      radius: 4,
      titleSize: 32,
      anchors: [
        [0, 0.5],
        [1, 0.5]
      ],
      renderGroupTitle: function(group, layer, width) {
        var icon = new Icon({
          x: 28,
          y: 16,
          fillStyle: '#595959',
          icon: group.get('collapsed') ? expandIcon : collapseIcon,
          cursor: 'pointer'
        });
        layer.add(icon);

        icon.on('click', function() {
          toggleGroup(group);
        });

        var text = new Text({
          x: 40,
          y: 16,
          text: group.get('id'),
          width: width - 40 - 16,
          textOverflow: 'ellipsis'
        });
        layer.add(text);
      }
    };
  }
});

graph.data(data);
graph.fitView();

function toggleGroup(group) {
  if (group.get('collapsed')) {
    group.expand();
  } else {
    group.collapse();
  }
  graph.refresh();
}
```
