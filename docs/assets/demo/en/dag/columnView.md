---
category: examples
group: dag
title: Table Field Relationships
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/column_view.png
link: dag/columnView
option:
---
# Table Field Relationships

Migrating the original vgraph demo to vgraph, maintaining the main interaction and layout behavior.

## Key Configurations

- `Graph` / `DAGLayout`: Maintain the original layout and style configuration.
- `setDefaultNode` / `setDefaultEdge`: Preserve the appearance of nodes and lines.
- Interactive behaviors: Retain the expand, collapse, hover, or click logic from the example.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  panZoom,
  dragCanvas,
  DAGLayout,
  Text,
  Icon,
  highlightRelations,
} from '@visactor/vgraph';

var container = document.getElementById(CONTAINER_ID);

// Layer spacing
var rankSep = 100;
// Vertical spacing between tables in each layer
var tableSep = 50;
// Field width
var nodeWidth = 180;
// Field height
var nodeHeight = 20;
// Table name height
var groupHeight = 20;

var expandIcon = '&#xe610;';
var collapseIcon = '&#xe60f;'; // Used to collapse/expand nodes

var graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.1,
  layout: {
    type: 'nestedDag',
    options: {
      customLayout,
    },
  },
  setDefaultNode(nodeData) {
    // Style for fields in the table
    return {
      width: nodeWidth,
      height: nodeHeight,
      strokeStyle: '#80A3FF',
      label: nodeData.id,
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
    };
  },
  setNodeStateStyles(state, nodeData) {
    var node = graph.getNodeById(nodeData.id);
    var label = node.getLabel();
    if (state === 'blur') {
      label.set('opacity', 0.1);
      return {};
    } else {
      label.set('opacity', 1.0);
      return {};
    }
  },
  setDefaultEdge() {
    return {
      type: 'hCubic',
      endArrow: true,
    };
  },
  setEdgeStateStyles(state, edgeData) {
    if (state === 'blur') {
      return { opacity: 0.1 };
    }
    return { opacity: 1.0 };
  },
  setDefaultGroup(group) {
    return {
      linkNode: true,
      linkGroupOnCollapse: true,
      fillStyle: '#3073FF',
      strokeStyle: '#3073FF',
      radius: [4, 4, 0, 0],
      padding: 1,
      anchors: [
        { position: [0, 0], offsets: [0, 0.5 * groupHeight] },
        { position: [1, 0], offsets: [0, 0.5 * groupHeight] },
      ],
      titleSize: groupHeight,
      renderGroupTitle(group, layer, width) {
        var icon = new Icon({
          x: 12,
          y: 0.5 * groupHeight,
          fillStyle: '#FFF',
          icon: group.get('collapsed') ? expandIcon : collapseIcon,
          cursor: 'pointer',
        });
        layer.add(icon);

        icon.on('click', function() {
          toggleGroup(group, graph);
        });

        var text = new Text({
          x: 20,
          y: 0.5 * groupHeight,
          fillStyle: '#FFF',
          text: group.get('id'),
          width: width - 30 - 16,
          textOverflow: 'ellipsis',
        });
        layer.add(text);
      },
    };
  },
});

// Add interactions
graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);
graph.addBehavior(highlightRelations);
graph.on('node:mouseleave', function() {
  clearState(graph);
});

function toggleGroup(group, graph) {
  if (group.get('collapsed')) {
    // Node is collapsed, so expand it
    group.updateData({ radius: [4, 4, 0, 0] });
    group.expand();
  } else {
    // Node is expanded, so collapse it
    group.updateData({ radius: [4, 4, 4, 4] });
    group.collapse();
  }
  graph.layout(group.get('id'));
}

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894e0249b625.json'
)
  .then(function(response) { return response.json(); })
  .then(function(data) {
    graph.data(data);
    // Fit to view size
    graph.fitView();
  });

function customLayout(subGraph, reuse, rankOnly) {
  var nodeSep =
    subGraph.getNodes()[0].get('parent').id === '_nested_dag_mock_root'
      ? tableSep
      : 0;
  new DAGLayout({
    graph: subGraph,
    rankDir: 'LR',
    nodeSep: nodeSep,
    edgeSep: 10,
    rankSep: rankSep,
    ranker: (reuse && reuse.rank) ? 'custom' : 'networkSimplex',
    order: (reuse && reuse.order) ? 'custom' : 'minCross',
    rankOnly: rankOnly,
    cache: true,
  });
}

function clearState(graph) {
  var autoDraw = graph.disableAutoDraw();
  graph.getNodes().forEach(function(n) {
    n.setState('default', true);
  });
  graph.getEdges().forEach(function(e) {
    e.setState('default', true);
  });
  graph.enableAutoDraw(autoDraw);
}
```
