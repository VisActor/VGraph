---
category: examples
group: nodes
title: 带链接的节点
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/link_node.gif
 link: node-addon-spec/link
option:
---
# 带链接的节点
推荐基于内置节点进行继承，这样可以最大程度保留配置项功能和外观。vGraph 封装了链接的渲染和交互行为，直接引用即可获得 html 组件的体验。 详细文档可见链接工具。
## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, registerNode, Layer, panZoom, LinkUtils, insertStyles } from '@visactor/vgraph';

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

function registerLinkNodes() {
  registerNode('linkNode', {
    type: 'linkNode',
    extends: 'rect',
    drawCurrentLabel: false,
    getConfigsForShape: function(nodeData) {
      var configs = Object.assign({}, nodeData);
      configs.label = {
        text: nodeData.label,
        textAlign: nodeData.align === 'right' ? 'left' : nodeData.align,
        offsetY: nodeData.align === 'right' ? 0 : -10,
        width: 92,
        textOverflow: 'ellipsis',
      };
      return configs;
    },
    shape: function(layer, configs) {
      var align = configs.align;
      var x = -configs.width / 2 + 12;
      var y = -configs.height / 2 + 42;
      if (align === 'center') {
        x = 0;
      } else if (align === 'right') {
        x = configs.width / 2 - 12;
        y = 0;
      }
      var underline = false;
      if (configs.label.textAlign === 'center') {
        if (configs.icon) {
          underline = {
            strokeStyle: '#3A5FBE',
            lineDash: [2, 2],
          };
        } else {
          underline = true;
        }
      }
      LinkUtils.init(layer, {
        x: x,
        y: y,
        align: configs.align,
        text: configs.link || '查看链接',
        maxWidth: configs.align === 'right' ? 68 : undefined,
        disabled: configs.disabled,
        icon: configs.icon
          ? {
              icon: '&#xe61d;',
            }
          : undefined,
        onClick: function() {
          console.log('You just clicked a link');
        },
        underline: underline,
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
  setDefaultNode: function(node) {
    return {
      type: 'linkNode',
      icon: node.y === 200,
      radius: 4,
    };
  },
});
registerLinkNodes();

graph.add('node', {
  x: 100,
  y: 100,
  width: 140,
  height: 58,
  align: 'left',
  label: '左对齐链接节点',
});

graph.add('node', {
  x: 260,
  y: 100,
  width: 140,
  height: 58,
  align: 'center',
  label: '居中对齐链接节点',
});

graph.add('node', {
  x: 440,
  y: 100,
  width: 180,
  height: 48,
  align: 'right',
  label: '右对齐链接节点',
});

graph.add('node', {
  x: 630,
  y: 100,
  width: 180,
  height: 48,
  align: 'right',
  disabled: true,
  link: '超长链接超长链接',
  label: '禁用长链接节点',
});

graph.add('node', {
  x: 100,
  y: 200,
  width: 140,
  height: 58,
  align: 'left',
  label: '带图标链接节点',
});

graph.add('node', {
  x: 260,
  y: 200,
  width: 140,
  height: 58,
  align: 'center',
  label: '居中对齐图标链接',
});

graph.add('node', {
  x: 440,
  y: 200,
  width: 180,
  height: 48,
  align: 'right',
  label: '右对齐图标链接节点',
});

graph.add('node', {
  x: 630,
  y: 200,
  width: 180,
  height: 48,
  align: 'right',
  disabled: true,
  link: '超长链接超长链接',
  label: '禁用长图标链接',
});

graph.addBehavior(panZoom);

document.fonts.ready.then(function() {
  graph.draw();
});
```
