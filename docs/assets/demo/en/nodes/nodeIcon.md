---
category: examples
group: nodes
title: Node Icons
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/node_icons.gif
link: node-spec/prebuilt
option:
---
# Node Icons
VGraph supports adding iconfont icons onto nodes via configuration. Below are several configuration examples.
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
});
graph.add('node', {
  x: 300,
  y: 200,
  width: 140,
  height: 40,
  type: 'category',
  color: '#4170F2',
  strokeStyle: '#E1E4E8',
  radius: 4,
  label: 'Category Node',
  icons: [
    {
      show: 'hover',
      position: [1, 0.5],
      setStyles: function() {
        return {
          size: 14,
          cursor: 'pointer',
          fillStyle: '#4170F2',
          icon: '&#xe613;',
        };
      },
      setBgStyles: function() {
        return {
          type: 'circle',
          size: 18,
        };
      },
    },
  ],
});

graph.add('node', {
  type: 'title',
  x: 500,
  y: 200,
  width: 176,
  height: 82,
  strokeStyle: '#E1E4E8',
  radius: 4,
  title: {
    text: 'Task name',
    fillStyle: 'rgba(20, 20, 20, 0.9)',
    height: 28,
    backgroundColor: '#E0E9FF',
  },
  label: {
    text: 'Start time: 2020-10-10 00:00:00\\nEnd time: 2020-10-10 12:00:00',
    color: 'rgba(20, 20, 20, 0.45)',
    fontSize: 10,
  },
  icons: [
    {
      show: 'always',
      position: [1, 0],
      offsets: [-12, 14],
      setStyles: function() {
        return {
          fillStyle: '#2E62F1',
          icon: '&#xe8b8;',
          cursor: 'pointer',
          triggerId: 'triggerLabel',
        };
      },
    },
  ],
});

setTimeout(function() {
  graph.draw();
}, 10);

document.fonts.ready.then(function() {
  graph.draw();
});
```
