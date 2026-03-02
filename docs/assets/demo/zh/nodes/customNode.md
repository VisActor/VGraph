---
category: examples
group: nodes
title: 自定义节点
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/custom_node1.png
 link: node-spec/customization
option:
---
# 自定义节点
推荐基于内置节点进行继承，这样可以最大程度保留配置项功能和外观。vGraph 支持继承内置节点，可仅实现需要自定义的部分。 详细文档可见自定义节点。
## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, registerNode, Layer, Icon, panZoom, insertStyles } from '@visactor/vgraph';

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
    {
      id: 'node1',
      x: 100,
      y: 100,
      label: 'node1',
      icon: '&#xe612;',
    },
    {
      id: 'node2',
      x: 300,
      y: 100,
      label: 'node2222222222',
      icon: '&#xe601;',
    },
  ],
  edges: [
    {
      source: 'node1',
      target: 'node2',
    },
  ],
};

registerNode('iconRect', {
  type: 'iconRect',
  extends: 'rect',
  drawCurrentLabel: false,
  getConfigsForShape: function(nodeData) {
    return Object.assign({}, nodeData, {
      radius: 4,
      label: {
        text: nodeData.label,
        textAlign: 'left',
        textBaseline: 'middle',
        textOverflow: 'ellipsis',
        offsetX: 18,
      },
    });
  },
  shape: function(layer, configs) {
    var icon = new Icon({
      x: -configs.width / 2 + 19,
      y: 0,
      size: 14,
      icon: configs.icon,
      fillStyle: configs.strokeStyle || '#545454',
    });
    layer.add(icon);
  },
});

var container = document.getElementById(CONTAINER_ID);
var width = container.offsetWidth;
var height = container.offsetHeight;

var graph = new Graph({
  container: CONTAINER_ID,
  width: width,
  height: height,
  minRatio: 0.2,
  maxRatio: 8,
  linkCenter: false,
  setDefaultNode: function(node) {
    return {
      type: 'iconRect',
      width: 140,
      height: 40,
      fillStyle: '#E4EDFE',
      strokeStyle: '#3073F2',
    };
  },
});

graph.data(data);
graph.addBehavior(panZoom);

document.fonts.ready.then(function() {
  graph.draw();
});
```
