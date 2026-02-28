---
category: examples
group: edges
title: Edge-based Node Location
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/custom_edge3.gif
link: edge-spec/customization
option:
---
# Edge-based Node Location
vGraph provides a rich variety of built-in connections, and in most cases, you don't need to customize the path. It is recommended to inherit from the built-in connections and customize the parts other than the connection itself. This demo shows how to add two icons at the end of the built-in connection to locate the node at the other end. This can effectively improve user reading efficiency when the graph range exceeds one screen. For detailed documentation, please refer to Custom Edge.
## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, registerEdge, Layer, Path, Icon, GroupUtils, panZoom, unRegisterEdge, insertStyles } from '@visactor/vgraph';

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

var expandIcon = '&#xe610;';
var collapseIcon = '&#xe60f;';

unRegisterEdge('lineCurve');
registerEdge('iconEdge', {
  extends: 'line',
  getConfigsForShape: function(edgeData) {
    return edgeData;
  },
  shape: function(layer) {
    var path = layer.find(function(shape) {
      return shape.get('_keyShape');
    });
    var p = path.getPointAt(0.1);
    var startIcon = new Icon({
      x: p.x,
      y: p.y,
      icon: '&#xe620;',
      type: 'target',
      fillStyle: '#3073F2',
      cursor: 'pointer'
    });

    var q = path.getPointAt(0.9);
    var endIcon = new Icon({
      x: q.x,
      y: q.y,
      icon: '&#xe61f;',
      type: 'source',
      fillStyle: '#3073F2',
      cursor: 'pointer'
    });
    startIcon.hide();
    endIcon.hide();
    layer.add(startIcon);
    layer.add(endIcon);
    layer.set('icons', [startIcon, endIcon]);
  },
  afterUpdatePath: function(layer, configs) {
    var path = layer.find(function(shape) {
      return shape.get('_keyShape');
    });
    var icons = layer.get('icons');
    icons[0].set(path.getPointAt(0.1));
    icons[1].set(path.getPointAt(0.9));
  }
});

var container = document.getElementById(CONTAINER_ID);
var graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.1,
  layout: {
    type: 'dag',
    options: {
      rankDir: 'LR',
      nodeSep: 80,
      edgeSep: 20,
      rankSep: 100,
      ranker: 'feasibleTree'
    }
  },
  setDefaultNode: function(nodeData) {
    return {
      type: 'rect',
      width: 120,
      height: 40,
      radius: 4,
      fillStyle: '#fff',
      text: nodeData.name || nodeData.id,
      label: {
        width: 80,
        text: nodeData.name || nodeData.id,
        textOverflow: 'ellipsis'
      },
      rectWidth: 20,
      anchors: [
        [0, 0.5],
        [1, 0.5]
      ],
      icons: nodeData.childNodes
        ? [
            {
              show: 'always',
              position: [1, 0.5],
              offsets: [-16, 0],
              setStyles: function() {
                return {
                  fillStyle: '#666',
                  icon: expandIcon,
                  cursor: 'pointer'
                };
              }
            }
          ]
        : undefined
    };
  },
  setDefaultEdge: function() {
    return {
      type: 'iconEdge',
      endArrow: true
    };
  },
  setDefaultGroup: function(group) {
    return {
      linkNode: false,
      fillStyle: '#F3F9FF',
      strokeStyle: '#3073F2',
      padding: 10,
      radius: 4,
      anchors: [
        [0, 0.5],
        [1, 0.5]
      ],
      title: {
        text: { text: group.id, fillStyle: '#fff' },
        background: {
          fillStyle: '#3073F2'
        },
        icon: {
          icon: collapseIcon,
          fillStyle: '#fff',
          cursor: 'pointer',
          onClick: function(e, group) {
            collapseGroup(group);
          }
        }
      }
    };
  }
});
graph.addBehavior(panZoom);

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_186c5d878fe34.json'
)
  .then(function(response) {
    return response.json();
  })
  .then(function(rawData) {
    var data = GroupUtils.getCollapsableData(rawData);
    graph.data(data);
    graph.refresh();
    graph.fitView();
  });

graph.on('node:click', function(e) {
  var node = e.target;
  if (node.get('childNodes') && e.relatedTarget && e.relatedTarget.type === 'icon') {
    expandNode(node);
    return;
  }
});

graph.on('edge:mouseenter', function(e) {
  var edge = e.target;
  var icons = edge.layer.get('icons');
  icons[0].show();
  icons[1].show();
  graph.draw();
});

graph.on('edge:mouseleave', function(e) {
  var edge = e.target;
  var icons = edge.layer.get('icons');
  icons[0].hide();
  icons[1].hide();
  graph.draw();
});

graph.on('edge:click', function(e) {
  var shape = e.relatedTarget;
  var type = shape.get('type');
  if (shape.type !== 'icon' || !type) {
    return;
  }
  var node = e.target[type];
  graph.focus(node);
  graph.animate({
    target: node,
    type: 'flash',
    custom: {
      strokeStyle: '#3073FF'
    }
  });
});

function expandNode(node) {
  var autoLayout = graph.disableAutoLayout();
  var group = GroupUtils.expandGroupNode(graph, node);
  graph.enableAutoLayout(autoLayout);
  graph.refresh();
  graph.focus(group);
}

function collapseGroup(group) {
  var autoLayout = graph.disableAutoLayout();
  var groupNode = GroupUtils.collapseGroup(graph, group);
  graph.enableAutoLayout(autoLayout);
  graph.refresh();
  graph.focus(groupNode);
  return groupNode;
}
```
