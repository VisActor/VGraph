---
category: examples
group: nodes
title: 带角标的节点
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/marker_node.gif
 link: node-addon-spec/note
option:
---
# 带角标的节点
角标多用于展示数据异常或者需要关注的补充信息。vGraph 封装了角标的定义工具，直接引用即可。 详细文档可见角标工具。
## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  registerNode,
  Layer,
  panZoom,
  NoteMarkerUtils,
  RawTooltip,
} from '@visactor/vgraph';

function registerMarkerNodes() {
  registerNode('markerNode', {
    type: 'markerNode',
    extends: 'rect',
    drawCurrentLabel: false,
    getConfigsForShape: function(nodeData) {
      return nodeData;
    },
    shape: function(layer, configs) {
      if (!configs.error) {
        return;
      }
      NoteMarkerUtils.init(layer, {
        width: 14,
        height: 16,
        radius: 4,
        position: configs.position,
        fillStyle: '#E33232',
        strokeStyle: '#E33232',
        triggerId: 'errorMarker',
      });
    },
  });
}

var data = {
  nodes: [
    { id: 'node1', x: 400, y: 100 },
    { id: 'node2', error: '运行失败', position: 'right', x: 250, y: 200 },
    { id: 'node3', error: '脚本有误', position: 'left', x: 550, y: 200 },
  ],
  edges: [
    { source: 'node1', target: 'node2' },
    { source: 'node1', target: 'node3' },
  ],
};
registerMarkerNodes();
var container = document.getElementById(CONTAINER_ID);
var width = container.offsetWidth;
var height = container.offsetHeight;

var graph = new Graph({
  container: CONTAINER_ID,
  width: width,
  height: height,
  minRatio: 0.3,
  maxRatio: 8,
  setDefaultNode: function(node) {
    return {
      type: 'markerNode',
      label: node.id,
      width: 140,
      height: 40,
      radius: 4,
      strokeStyle: '#E1E4E8',
      anchors: [
        [0.5, 0],
        [0.5, 1],
      ],
    };
  },
  setDefaultEdge: function(edgeData) {
    return {
      type: 'vLine',
    };
  },
});
graph.addBehavior(panZoom);
graph.data(data);

new RawTooltip(graph, {
  styles: {
    border: '1px solid #ccc',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: '#fff',
  },
  content: function(entity) {
    return entity.get('id') + ' ' + entity.get('error');
  },
  triggerId: 'errorMarker',
  target: 'node',
});
```
