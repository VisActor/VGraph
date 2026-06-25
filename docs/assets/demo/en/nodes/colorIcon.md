---
category: examples
group: nodes
title: Support for Color Icons
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/color_icons.png
link: node-spec/prebuilt
option:
---
# Support for Color Icons
VGraph supports rendering colorful iconfont icons, and the import method is the same as standard iconfont usage.
<br>
See <a href="/vgraph/guide/node-spec/options">Node Options</a>. For the event list, see <a href="/guide/events#graph-事件">Events</a>.
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
