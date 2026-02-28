---
category: examples
group: dag
title: Nested Layout - Multi-level Nesting - Default Collapse
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/multinested_dag.png
link: dag/multiNestedCollapse
option:
---
# Nested Layout - Multi-level Nesting - Default Collapse

Migrating the original vgraph demo to vgraph, maintaining the main interaction and layout behavior.

## Key Configurations

- `Graph` / `DAGLayout`: Maintain the original layout and style configuration.
- `setDefaultNode` / `setDefaultEdge`: Preserve the appearance of nodes and lines.
- Interactive behaviors: Retain the expand, collapse, hover, or click logic from the example.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  dragCanvas,
  Graph,
  panZoom,
  insertStyles,
  Text,
  highlightRelations,
  Icon,
} from '@visactor/vgraph';

const expandIcon = '&#xe610;';
const collapseIcon = '&#xe60f;'; // Used to collapse/expand nodes

const changeTypeColor = {
  other: null,
  '#c44e52': '#c44e52',
  '#25a868': '#25a868',
  '#dd8452': '#dd8452',
};
const changeTypeIcon = {
  '#c44e52': '&#xe605;',
  '#25a868': '&#xe606;',
  '#dd8452': '&#xe601;',
};
const iconfontStyles = `
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

const container = document.getElementById(CONTAINER_ID);
insertStyles(iconfontStyles, 'vgraph-demo-iconfont');
// Initialize the graph instance
const graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.01,
  maxRatio: 8,
  layout: {
    type: 'nestedDag',
    options: {
      dagOptions: {
        rankDir: 'LR',
        nodeSep: 30,
        edgeSep: 10,
        rankSep: 50,
        ranker: 'networkSimplex',
        cache: true,
      },
    }
  },
  setDefaultNode(nodeData) {
    let icons = null;
    // Set the icon to change with changeType
    if ((nodeData && nodeData.changeType)) {
      const icon = changeTypeIcon[nodeData.changeType];
      icons = [
        {
          setStyles: () => {
            return {
              icon,
              size: 15,
              fillStyle: changeTypeColor[(nodeData && nodeData.changeType) || 'other'],
            };
          },
          position: [0.9, 0.5],
        },
      ];
    }
    return {
      type: 'Rect',
      radius: 10,
      width: nodeData.width || 100,
      height: nodeData.height || 20,
      strokeStyle: '#4170F2',
      fillStyle: changeTypeColor[(nodeData && nodeData.changeType) || 'other'],
      label: {
        offsetX: (nodeData && nodeData.changeType) ? -6 : 0,
        width: (nodeData.width || 100) - 30,
        text: (nodeData && nodeData.text) || nodeData.id,
        fillStyle: '111',
        textOverflow: 'ellipsis',
        opacity: 1.0,
      },
      icons,
      anchors: [
        [0.0, 0.5],
        [1.0, 0.5],
        //   [0.5, 0.0],
        //   [0.5, 1.0],
      ],
      opacity: 0.3,
    };
  },
  setNodeStateStyles(state, data) {
    if (state === 'hide') {
      return { fillStyle: data.color };
    }
  },
  setDefaultEdge(edge) {
    return {
      id: edge.source + '-' + edge.target,
      // type: 'quadratic',
      // type: "line",
      type: 'hCubic',
      endArrow: {
        width: 9,
        height: 12,
      },
      strokeStyle: '#64b5cd',
      appendSize: 2,
      lineWidth: 2,
      opacity: 0.3,
    };
  },
  setEdgeStateStyles(state) {
    if (state === 'active') {
      return {
        opacity: 1.0,
        strokeStyle: '#64b5cd',
      };
    }
    return { opacity: 0.1 };
  },
  setDefaultGroup(groupData) {
    return {
      linkNode: true,
      fillStyle: '#fff',
      strokeStyle: '#DDE2E9',
      linkGroupOnCollapse: true,
      padding: 20,
      radius: 4,
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
      capture: false,
      titleSize: 32,
      renderGroupTitle(group, layer, width) {
        const icon = new Icon({
          x: 28,
          y: 16,
          fillStyle: '#595959',
          icon: group.get('collapsed') ? expandIcon : collapseIcon,
          cursor: 'pointer',
        });
        layer.add(icon);

        icon.on('click', () => {
          toggleGroup(group);
        });

        const text = new Text({
          x: 40,
          y: 16,
          text: group.get('text'),
          width: width - 40 - 16,
          textOverflow: 'ellipsis',
        });
        layer.add(text);
      },
    };
  },
});
graph.on('edge:click', (e) => {
  e.target.updatePosition();
  e.target.hide();
  graph.refresh();
});

const collapseGroupWidth = 250;

fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18bd7f6e22364.json')
  .then((response) => response.json())
  .then((data) => {
    graph.addBehavior(panZoom, { sensitivity: 5 });
    graph.addBehavior(dragCanvas, {
      canvasOnly: false,
    });
    graph.addBehavior(highlightRelations);
    graph.data(data);

    const groups = graph.getGroups();
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      if (!group.belong) {
        collapseGroup(group);
      }
    }
    graph.layout();
    graph.alignView('cc');
  });

const collapseGroup = (group) => {
  const children = group.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type === 'group') {
        collapseGroup(child);
      }
    }
  }
  group.collapse();
  group.set('fixWidth', collapseGroupWidth);
  group.updateGroup();
};

function toggleGroup(group) {
  if (group.get('collapsed')) {
    group.set('fixWidth', undefined);
    // Node is collapsed, so expand it
    group.expand();
    // In most scenarios, minCross is only needed once, so vgraph will set minCross to false after each pre-sorting.
    // But in this scenario, since it is collapsed by default, there will always be "unseen" nodes,
    // so you need to set minCross to true again.
    graph.get('layout').options.minCross = true; 
  } else {
    group.set('fixWidth', collapseGroupWidth); // Comment out to keep the previous width
    // Node is expanded, so collapse it
    group.collapse();
    group.refreshBox();
  }
  graph.layout(group.get('id'));
}
```
