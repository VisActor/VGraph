---
category: examples
group: animate
title: 节点闪烁
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/flash.gif
link: animate/flash
option:
---
# 节点闪烁

节点闪烁动画常用在轻量聚焦单个节点，例如此案例中查找节点功能会将节点移动到视窗中心，并用闪烁动画进行轻量的聚焦。

## 代码演示

```livedemo-files template=vgraph-react
>>> app.tsx
import { TreeGraph, panZoom, dragCanvas, Node } from '@visactor/vgraph';
import React from 'react';
import ReactDOM from 'react-dom';

const expandIcon = '&#xe613;';
const collapseIcon = '&#xe611;';

function initGraph() {
  const container = document.getElementById(CONTAINER_ID);
  let graph = null;
  let select = null;

  graph = new TreeGraph({
    container: CONTAINER_ID,
    width: container.offsetWidth,
    height: container.offsetHeight,
    minRatio: 0.3,
    animate: true,
    maxRatio: 8,
    layout: {
      type: 'dendrogram',
      options: {
        direction: 'LR',
        size: function() {
          return [600, 600];
        },
        nodeSep: function() {
          return 20;
        },
        nodeSize: function() {
          return [140, 40];
        },
        rankSep: function() {
          return 80;
        }
      }
    },
    setDefaultNode: function(nodeData) {
      let icons = undefined;
      if (nodeData.children) {
        icons = [
          {
            setStyles: function(data) {
              var styles = {
                fillStyle: '#3073FF',
                size: 10,
                cursor: 'pointer'
              };
              if (data.collapsed) {
                styles.icon = expandIcon;
              } else {
                styles.icon = collapseIcon;
              }
              return styles;
            },
            setBgStyles: function(data) {
              return {
                type: 'circle'
              };
            },
            position: [1, 0.5],
            offsets: [0, 0],
            show: 'hover',
            onClick: function(e, nodeData) {
              var n = graph.getNodeById(nodeData.id);
              var icon = e.target;
              icon.set('icon', n.get('collapsed') ? collapseIcon : expandIcon);
              graph.toggleCollapse(n);
            }
          }
        ];
      }

      return {
        width: 140,
        height: 40,
        radius: 6,
        label: nodeData.id,
        anchors: [
          [0, 0.5],
          [1, 0.5]
        ],
        icons: icons
      };
    },
    setDefaultEdge: function() {
      return {
        type: 'hCubic',
        strokeStyle: '#C9CDD4'
      };
    }
  });

  graph.addBehavior(dragCanvas);
  graph.addBehavior(panZoom, { sensitivity: 4 });

  fetch(
    'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894e075c8a46.json'
  )
    .then(function(response) {
      return response.json();
    })
    .then(function(rawData) {
      graph.data(rawData);

      var options = '';
      graph.getNodes().forEach(function(node) {
        var id = node.get('id');
        options += '<option value="' + id + '">' + id + '</option>';
      });
      select.innerHTML = options;
    });

  select = document.createElement('select');
  container.appendChild(select);

  select.style.position = 'absolute';
  select.style.left = '0';
  select.style.top = '0';

  select.onchange = function(e) {
    var id = select.value;
    var node = graph.getNodeById(id);
    graph.focus(node);
    graph.animate({
      target: node,
      type: 'flash',
      custom: {
        strokeStyle: '#3073FF'
      }
    });
  };

  return graph;
}

function App() {
  React.useEffect(function() {
    initGraph();
  }, []);
  return null;
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
