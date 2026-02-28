---
category: examples
group: nodes
title: Node with Deletable Tags
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/del_tag.gif
link: node-addon-spec/tag
option:
---
# Node with Deletable Tags
It is recommended to inherit from built-in nodes to retain configuration functions and appearance as much as possible. vGraph encapsulates tag definition tools that can be directly referenced. For detailed documentation, please see the tag tools documentation.
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
      label: 'Arrangement of multiple deletable tags',
      tags: ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4', 'Tag 5'],
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
