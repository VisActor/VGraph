---
category: examples
group: animate
title: Line Trail
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/trail.gif
link: animate/trail
option:
---
# Line Trail

The line trail animation is suitable for showing the trend of data relationships. It can be a single animation or an infinite animation, and can be used for things like pipeline run displays.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, dragCanvas, Edge } from '@visactor/vgraph';
import React from 'react';
import ReactDOM from 'react-dom';

function initGraph() {
  const container = document.getElementById(CONTAINER_ID);
  const darkContainer = document.createElement('div');
  container.appendChild(darkContainer);
  darkContainer.style.width = '100%';
  darkContainer.style.height = '100%';
  darkContainer.style.background = 'rgb(18,18,11)';
  const graph = new Graph({
    container: darkContainer,
    width: container.offsetWidth,
    height: container.offsetHeight,
    minRatio: 0.3,
    maxRatio: 8,
    setDefaultNode: function(nodeData) {
      return {
        type: 'circle',
        width: 50,
        height: 50,
        fillStyle: 'rgb(18, 19, 20)',
        strokeStyle: '#666',
        label: {
          text: nodeData.id,
          fillStyle: '#fff',
          textAlign: 'center',
          textBaseline: 'middle'
        },
        anchors: [
          [0, 0.5],
          [1, 0.5]
        ]
      };
    },
    setDefaultEdge: function() {
      return {
        strokeStyle: 'rgb(46,47,40)'
      };
    }
  });

  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  graph.data({
    nodes: [
      {
        id: 'node1',
        x: 100,
        y: 100
      },
      {
        id: 'node2',
        x: 300,
        y: 200
      },
      {
        id: 'node3',
        x: 100,
        y: 300
      }
    ],
    edges: [
      {
        source: 'node1',
        target: 'node2',
        type: 'hLine'
      },
      {
        source: 'node3',
        target: 'node2',
        type: 'hCubic'
      }
    ]
  });

  graph.getEdges().forEach(function(edge) {
    graph.animate({
      target: edge,
      type: 'trail',
      common: {
        duration: 2000
      }
    });
  });

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
