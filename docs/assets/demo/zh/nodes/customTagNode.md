---
category: examples
group: nodes
title: 带标签的节点
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/tag_node.png
 link: node-addon-spec/tag
option:
---
# 带标签的节点
推荐基于内置节点进行继承，这样可以最大程度保留配置项功能和外观。vGraph 封装了标签的定义工具，直接引用即可。 详细文档可见标签工具。
## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  registerNode,
  Layer,
  panZoom,
  TagUtils,
  GraphEvent,
  insertStyles,
} from '@visactor/vgraph';

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

var STATE_ICON = '&#xe672;';
var CLOSE_ICON = '&#xe61a;';

var data = {
  nodes: [
    {
      id: 'node1',
      type: 'tagRect',
      x: 100,
      y: 100,
      width: 140,
      height: 56,
      theme: 'rect',
      label: '默认的标签样式',
    },
    {
      id: 'node2',
      type: 'closableTagRect',
      x: 300,
      y: 100,
      width: 140,
      height: 56,
      theme: 'rect',
      label: '可关闭的自定义样式标签',
    },
    {
      id: 'node3',
      type: 'iconTagRect',
      x: 500,
      y: 100,
      width: 140,
      height: 56,
      theme: 'rect',
      label: '带图标的标签',
      icon: STATE_ICON,
    },
    {
      id: 'node4',
      type: 'tagRect',
      x: 100,
      y: 200,
      width: 140,
      height: 56,
      theme: 'capsule',
      label: '默认样式的胶囊标签',
    },
    {
      id: 'node5',
      type: 'closableTagRect',
      x: 300,
      y: 200,
      width: 140,
      height: 56,
      theme: 'capsule',
      label: '可关闭的胶囊标签',
    },
    {
      id: 'node6',
      type: 'iconTagRect',
      x: 500,
      y: 200,
      width: 140,
      height: 56,
      theme: 'capsule',
      label: '带图标的胶囊标签',
      icon: STATE_ICON,
    },
  ],
  edges: [],
};

function registerTagNodes(graph) {
  registerNode('tagRect', {
    type: 'tagRect',
    extends: 'rect',
    drawCurrentLabel: false,
    getConfigsForShape: function(nodeData) {
      var configs = Object.assign({}, nodeData);
      configs.radius = 4;
      configs.label = {
        text: nodeData.label,
        textAlign: 'left',
        textBaseline: 'middle',
        textOverflow: 'ellipsis',
        width: nodeData.width - 12,
        fillStyle: '#21252C',
        offsetY: 11,
      };
      return configs;
    },
    shape: function(layer, configs) {
      TagUtils.initTag(layer, {
        text: '标签文本',
        left: -configs.width / 2 + 12,
        top: -configs.height / 2 + 8,
        id: 'tag',
        theme: configs.theme,
      });
    },
  });

  registerNode('closableTagRect', {
    type: 'closableTagRect',
    extends: 'rect',
    drawCurrentLabel: false,
    getConfigsForShape: function(nodeData) {
      var configs = Object.assign({}, nodeData);
      configs.radius = 4;
      configs.label = {
        text: nodeData.label,
        textAlign: 'left',
        textBaseline: 'middle',
        textOverflow: 'ellipsis',
        offsetY: 11,
      };
      return configs;
    },
    shape: function(layer, configs) {
      TagUtils.initTag(layer, {
        text: '标签文本',
        left: -configs.width / 2 + 12,
        top: -configs.height / 2 + 8,
        id: 'tag',
        theme: configs.theme,
        label: {
          fillStyle: '#2E62F1',
        },
        background: {
          fillStyle: '#E9EEFE',
          strokeStyle: '#E1E4E8',
        },
        close: {
          icon: CLOSE_ICON,
          fillStyle: '#2E62F1',
          onClose: function(e, layer) {
            layer.getParent().remove(layer);
            graph.draw();
          },
        },
      });
    },
  });

  registerNode('iconTagRect', {
    type: 'iconTagRect',
    extends: 'rect',
    drawCurrentLabel: false,
    getConfigsForShape: function(nodeData) {
      var configs = Object.assign({}, nodeData);
      configs.radius = 4;
      configs.label = {
        text: nodeData.label,
        textAlign: 'left',
        textBaseline: 'middle',
        textOverflow: 'ellipsis',
        offsetY: 11,
      };
      return configs;
    },
    shape: function(layer, configs) {
      TagUtils.initTag(layer, {
        text: '标签文本',
        left: -configs.width / 2 + 12,
        top: -configs.height / 2 + 8,
        id: 'tag',
        theme: configs.theme,
        label: {
          fillStyle: '#2E62F1',
        },
        background: {
          fillStyle: '#E9EEFE',
          strokeStyle: '#E1E4E8',
        },
        icon: {
          icon: configs.icon,
          fillStyle: '#2E62F1',
        },
      });
    },
  });
}

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
});
registerTagNodes(graph);
graph.data(data);

graph.addBehavior(panZoom);

document.fonts.ready.then(function() {
  graph.draw();
});
```
