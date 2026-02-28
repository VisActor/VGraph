---
category: examples
group: nodes
title: Node with Addable Tags
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/add_tag.gif
link: node-addon-spec/tag
option:
---
# Node with Addable Tags
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

var data = {
  nodes: [
    {
      id: 'node1',
      type: 'multiTagAdd',
      x: 400,
      y: 100,
      width: 240,
      height: 56,
      label: 'Multiple addable tags arrangement',
      close: false,
      tags: [{ text: 'Text Tag 1' }],
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
registerNode('multiTagAdd', {
  type: 'multiTagAdd',
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
    var addTag = TagUtils.initTag(layer, {
      left: 0,
      top: -configs.height / 2 + 8,
      text: 'Add',
      icon: {
        icon: '&#xe61b;',
      },
    });
    addTag.children[1].set('cursor', 'pointer');
    var bbox = addTag.getBBox();
    addTag.translate(configs.width / 2 - 12 - bbox.width, 0);

    var options = {
      left: -configs.width / 2 + 12,
      top: -configs.height / 2 + 8,
      id: 'tag',
      maxWidth: configs.width - 28 - bbox.width,
      tags: configs.tags,
    };

    var tagsLayer = TagUtils.initTags(layer, options);

    addTag.on('click', function() {
      tagsLayer = TagUtils.addTag(tagsLayer, {
        text: 'Tag ' + (configs.tags.length + 1),
      });
      graph.draw();
    });
  },
});

graph.data(data);
graph.addBehavior(panZoom);

document.fonts.ready.then(function() {
  graph.draw();
});
```
