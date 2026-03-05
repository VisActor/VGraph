---
category: examples
group: nodes
title: 可删除标签的节点
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/del_tag.gif
 link: node-addon-spec/tag
option:
---
# 可删除标签的节点
推荐基于内置节点进行继承，这样可以最大程度保留配置项功能和外观。VGraph 封装了标签的定义工具，直接引用即可。
<br>
详细文档可见<a href="/vgraph/guide/node-addon-spec/tag">标签工具</a>。
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

var CLOSE_ICON = '&#xe61a;';

var data = {
  nodes: [
    {
      id: 'node1',
      type: 'multiTagDelete',
      x: 400,
      y: 300,
      width: 240,
      height: 56,
      close: true,
      label: '可删除的多个标签排列',
      tags: ['标签 1', '标签2', '标签3', '标签4', '标签5'],
    },
  ],
  edges: [],
};

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

registerNode('multiTagDelete', {
  type: 'multiTagDelete',
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
    TagUtils.initTags(layer, {
      left: -configs.width / 2 + 12,
      top: -configs.height / 2 + 8,
      id: 'tag',
      maxWidth: configs.width - 24,
      tags: configs.tags.map(function(text) {
        return {
          text: text,
          close: configs.close
            ? {
                icon: CLOSE_ICON,
                onClose: function(e, layer) {
                  TagUtils.removeTag(layer);
                  graph.draw();
                },
              }
            : undefined,
        };
      }),
    });
    var tagLayer = TagUtils.initTag(layer, { left: 0, top: 0, text: '' });
    layer.set('tagLayer', tagLayer);
  },
  updateShape: function(layer) {
    var tag = layer.get('tagLayer');
    TagUtils.removeTag(tag);
    var tagLayer = TagUtils.initTag(layer, { left: 0, top: 0, text: '' });
    layer.set('tagLayer', tagLayer);
  },
});

graph.data(data);
graph.addBehavior(panZoom);

document.fonts.ready.then(function() {
  graph.draw();
});
```
