---
category: examples
group: nodes
title: 支持彩色图标
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/color_icons.png
 link: node-spec/prebuilt
option:
---
# 支持彩色图标
VGraph 支持绘制彩色的 iconfont 图标，引用方式与普通 iconfont 相同。
<br>
详细文档可见<a href="/vgraph/guide/node-spec/options">节点文档</a>。事件列表请见<a href="/guide/events#graph-事件">事件</a>。
## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, insertStyles } from '@visactor/vgraph';

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

var container = document.getElementById(CONTAINER_ID);
var width = container.offsetWidth;
var height = container.offsetHeight;

var graph = new Graph({
  container: CONTAINER_ID,
  width: width,
  height: height,
  minRatio: 0.2,
  maxRatio: 8,
  setDefaultNode: function() {
    return {
      width: 140,
      height: 40,
      type: 'tag',
      radius: 4,
      label: 'example',
      theme: 'lighted',
    };
  },
});

graph.add('node', {
  x: 240,
  y: 200,
  icon: {
    icon: '&#xe613;',
    background: {
      fillStyle: '#EBF1FF',
    },
    fontFamily: 'iconfont',
  },
});

graph.add('node', {
  x: 410,
  y: 200,
  icon: {
    icon: '&#xe610;',
    background: {
      fillStyle: '#EBEDFF',
    },
    fontFamily: 'iconfont',
  },
});

graph.add('node', {
  x: 580,
  y: 200,
  icon: {
    icon: '&#xe61b;',
    background: {
      fillStyle: '#FFFAEB',
    },
    fontFamily: 'iconfont',
  },
});

graph.add('node', {
  x: 240,
  y: 270,
  icon: {
    icon: '&#xe60f;',
    background: {
      fillStyle: '#E1F3FF',
    },
    fontFamily: 'iconfont',
  },
});

graph.add('node', {
  x: 410,
  y: 270,
  icon: {
    icon: '&#xe61a;',
    background: {
      fillStyle: '#FFE8E7',
    },
    fontFamily: 'iconfont',
  },
});

document.fonts.ready.then(function() {
  graph.draw();
});
```
