---
category: examples
group: animate
title: Line Extension
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/grow.gif
link: animate/grow
option:
---
# Line Extension

The edge grow animation is suitable for showing a node's direct relationships. It can run once or loop. In this demo, when you hover a node, it uses the state mechanism to play a one-time animation on all edges that start from this node.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, dragCanvas, ForceDirectedLayout, defaultForces, ForceLink, Node, Edge } from '@visactor/vgraph';
import React from 'react';
import ReactDOM from 'react-dom';

function initGraph() {
  const container = document.getElementById(CONTAINER_ID);
  const graph = new Graph({
    container: CONTAINER_ID,
    width: container.offsetWidth,
    height: container.offsetHeight,
    minRatio: 0.3,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode: function() {
      return {
        type: 'circle',
        width: 15,
        height: 15,
        strokeStyle: null,
        fillStyle: '#5678D6'
      };
    },
    setEdgeStateStyles: function() {
      return {
        strokeStyle: '#FF8406'
      };
    }
  });

  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);

  fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18949c3ac3627.json')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      graph.data(data);
      var forces = defaultForces(data.edges, 400, 300);
      var forceLink = new ForceLink({
        edges: data.edges,
        options: { distance: 100 }
      });
      forces.set('link', forceLink);
      var fdp = new ForceDirectedLayout({
        graph: graph,
        forces: forces,
        maxIteration: 200,
        clearOnEndOnFirstCall: true,
        onTick: function() {
          graph.refresh();
        },
        onEnd: function() {
          graph.fitView();
        }
      });
      graph.set('layout', fdp);
    });

  graph.on('node:mouseenter', function(e) {
    var node = e.target;
    var id = node.get('id');
    node.edges.forEach(function(edge) {
      if (edge.get('source') !== id) {
        return;
      }
      edge.setState('active');
      graph.animate({
        target: edge,
        type: 'grow'
      });
    });
  });

  graph.on('node:mouseleave', function(e) {
    graph.stopAnimate();
    var node = e.target;
    var id = node.get('id');
    node.edges.forEach(function(edge) {
      if (edge.get('source') !== id) {
        return;
      }
      edge.removeState('active');
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
