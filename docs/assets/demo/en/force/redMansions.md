---
category: examples
group: force
title: Knowledge Graph
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/red.gif
link: demo-spec/redMansions
option:
---
# Knowledge Graph

Data description: A Dream of Red Mansions character knowledge graph. <br>Interactions: <code>panZoom canvas</code>: show node labels; <code>hover node</code>: show adjacent nodes and edge labels; <code>click legend</code>: filter by category.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  showDetails,
  defaultForces,
  ForceX,
  ForceY,
  ForceLink,
  CategoryLegend,
} from '@visactor/vgraph';

const nodeColors = [
  '#5678D6',
  '#EB8D2F',
  '#59A649',
  '#E0BA2D',
  '#A56AAD',
  '#6DBEC9',
  '#D95145',
  '#A0A0AD',
  '#94674E',
  '#ED848F',
  '#666',
];

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;

const forces = defaultForces(undefined, width / 2, height / 2);
const forceX = new ForceX({ options: { x: width / 2, strength: 0.05 } });
const forceY = new ForceY({ options: { y: height / 2, strength: 0.05 } });
const forceLink = new ForceLink({
  options: { distance: 50 },
});
forces.set('posX', forceX);
forces.set('posY', forceY);
forces.set('link', forceLink);

const graph = new Graph({
  container: CONTAINER_ID,
  width,
  height,
  minRatio: 0.3,
  maxRatio: 10,
  layout: {
    type: 'force',
    options: {
      forces,
      maxIteration: 300,
      tickIterations: 10,
      onTick: () => {
        graph.refresh();
      },
      onEnd: () => {
        graph.fitView();
      },
      clearOnEndOnFirstCall: true,
    },
  },
  setDefaultNode(nodeData) {
    return {
      type: 'circle',
      width: 15,
      height: 15,
      fillStyle: nodeColors[nodeData.category],
      strokeStyle: null,
      label: {
        text: nodeData.name,
        textBaseline: 'middle',
        textAlign: 'center',
        fillStyle: '#fff',
        strokeStyle: '#666',
        opacity: 0,
      },
    };
  },
  setNodeStateStyles(state) {
    if (state === 'active') {
      return {
        fillStyle: '#64b5cd',
      };
    }
  },
  setDefaultEdge(edgeData) {
    return {
      type: 'quadratic',
      styles: {
        curveOffset: -8,
        curvePosition: 0.5,
      },
      lineWidth: 1,
      strokeStyle: '#ccc',
      label: {
        text: edgeData.relation,
        position: 0.3,
        textBaseline: 'middle',
        textAlign: 'center',
        fillStyle: '#4c72b0',
        strokeStyle: '#fff',
        opacity: 0,
        autoRotate: true,
      },
    };
  },
  setEdgeStateStyles(state, edgeData, edge) {
    const label = edge.getLabel();
    if (state === 'show') {
      if (!edge.states.includes('active')) {
        label.hide();
      }
      label.set('opacity', 1);
      return {
        endArrow: {
          width: 6 / graph.getZoomRatio(),
          height: 10 / graph.getZoomRatio(),
        },
        lineWidth: (edge.get('lineWidth') * 1.5) / graph.getZoomRatio(),
      };
    }
    if (state === 'active') {
      let endArrow = true;
      if (edge.states.includes('show')) {
        label.show();
        endArrow = {
          width: 6 / graph.getZoomRatio(),
          height: 10 / graph.getZoomRatio(),
        };
      }
      return {
        endArrow: endArrow,
        strokeStyle: '#64b5cd',
      };
    }
  },
});

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1895333a9a771.json'
)
  .then((response) => response.json())
  .then((data) => {
    graph.data(data);
    graph.addBehavior(panZoom);
    graph.addBehavior(dragCanvas);
    graph.addBehavior(highlightRelations);
    graph.addBehavior(showDetails, {
      showEdgeState: 'show',
      targets: ['node', 'edge'],
      updateLabels() {
        const ratio = graph.getZoomRatio();
        graph.getNodes().forEach((node) => {
          const label = node.getLabel();
          if (label) {
            label.set({ fontSize: label.get('originSize') / ratio });
          }
        });
        graph.getEdges().forEach((edge) => {
          const label = edge.getLabel();
          if (label) {
            label.set({
              fontSize: label.get('originSize') / ratio,
            });
          }
          edge.removeState('show');
          edge.setState('show');
        });
        graph.draw();
      },
    });

    const legendDiv = document.createElement('div');
    legendDiv.style.position = 'absolute';
    legendDiv.style.right = '10px';
    legendDiv.style.top = '10px';
    legendDiv.style.border = '1px solid #ccc';
    container.append(legendDiv);
    new CategoryLegend(graph, {
      container: legendDiv,
      encodeAttr: 'mansion',
      target: 'node',
      encodeStyles(nodeData) {
        return {
          marker: {
            type: 'circle',
            fillStyle: nodeData.fillStyle,
          },
        };
      },
      click: {
        enable: true,
      },
      width: 100,
      height: 200,
    });
  });
```
