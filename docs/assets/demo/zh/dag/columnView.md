---
category: examples
group: dag
title: 表字段关系
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/column_view.png
link: dag/columnView
option:
---
# 表字段关系

原始 vgraph demo 迁移到 vgraph，保持主要交互与布局行为。

## 关键配置

- `Graph` / `DAGLayout`：保持原始布局与样式配置。
- `setDefaultNode` / `setDefaultEdge`：保留节点与连线外观。
- 交互行为：保留示例中的展开、收起、hover 或点击逻辑。

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

// 层间距
var rankSep = 100;
// 每层中表的上下间距
var tableSep = 50;
// 字段宽度
var nodeWidth = 180;
// 字段高度
var nodeHeight = 20;
// 表名高度
var groupHeight = 20;

var expandIcon = '&#xe610;';
var collapseIcon = '&#xe60f;'; // 用于收起展开节点

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
    // 表中字段样式
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

// 添加交互
graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);
graph.addBehavior(highlightRelations);
graph.on('node:mouseleave', function() {
  clearState(graph);
});

function toggleGroup(group, graph) {
  if (group.get('collapsed')) {
    // 节点状态为收起，故而展开节点
    group.updateData({ radius: [4, 4, 0, 0] });
    group.expand();
  } else {
    // 节点状态为展开，故而收起节点
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
    // 适应视图大小
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
