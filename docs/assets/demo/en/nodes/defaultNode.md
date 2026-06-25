---
category: examples
group: nodes
title: Built-in Nodes
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/inset_nodes.png
link: node-spec/prebuilt
option:
---
# Built-in Nodes
VGraph provides mature built-in nodes and rich events. With configurations such as icons and anchors, you can build a wide range of business node styles.
<br>
See <a href="/vgraph/guide/node-spec/options">Node Options</a>. For the event list, see <a href="/guide/events#graph-事件">Events</a>.
## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, insertStyles } from '@visactor/vgraph';

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

var IMG_URL =
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_184761c054531.svg';

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
graph.addBehavior(panZoom);

graph.add('node', {
  x: 100,
  y: 100,
  width: 140,
  height: 40,
  type: 'rect',
  label: 'Default rectangle node style',
  radius: 4,
});

graph.add('node', {
  type: 'rect',
  x: 260,
  y: 100,
  width: 140,
  height: 40,
  color: '#4170F2',
  radius: 4,
  label: {
    text: 'Rectangle style with color config',
    fillStyle: '#4170F2',
    textOverflow: 'ellipsis',
  },
});

graph.add('node', {
  type: 'rect',
  x: 420,
  y: 100,
  width: 140,
  height: 40,
  strokeStyle: '#4170F2',
  fillStyle: '#F2F6FF',
  radius: 4,
  label: {
    text: 'Rectangle style with background color',
    fillStyle: '#4170F2',
  },
});

graph.add('node', {
  type: 'rect',
  x: 580,
  y: 100,
  width: 140,
  height: 40,
  strokeStyle: null,
  fillStyle: '#4170F2',
  radius: 4,
  label: {
    text: 'Filled style rectangle',
    fillStyle: '#fff',
    textOverflow: 'ellipsis',
  },
});

graph.add('node', {
  type: 'rect',
  x: 100,
  y: 152,
  width: 140,
  height: 40,
  label: 'Default rounded rectangle style',
  radius: 20,
});

graph.add('node', {
  type: 'rect',
  x: 260,
  y: 152,
  width: 140,
  height: 40,
  color: '#4170F2',
  radius: 20,
  label: {
    text: 'Rounded rectangle style with color config',
    fillStyle: '#4170F2',
    textOverflow: 'ellipsis',
  },
});

graph.add('node', {
  type: 'rect',
  x: 420,
  y: 152,
  width: 140,
  height: 40,
  strokeStyle: '#4170F2',
  fillStyle: '#F2F6FF',
  radius: 20,
  label: {
    text: 'Rounded rectangle with background color',
    fillStyle: '#4170F2',
  },
});

graph.add('node', {
  type: 'rect',
  x: 580,
  y: 152,
  width: 140,
  height: 40,
  strokeStyle: null,
  fillStyle: '#4170F2',
  radius: 20,
  label: {
    text: 'Filled style rounded rectangle',
    fillStyle: '#fff',
    textOverflow: 'ellipsis',
  },
});

graph.add('node', {
  type: 'tag',
  color: '#4170F2',
  width: 140,
  height: 40,
  x: 100,
  y: 232,
  label: 'Default style tag',
  icon: '&#xe60a;',
  theme: 'lighted',
  radius: 4,
});

graph.add('node', {
  type: 'tag',
  width: 140,
  height: 40,
  x: 260,
  y: 232,
  color: '#4170F2',
  label: 'Outlined style tag',
  icon: '&#xe60a;',
  theme: 'outlined',
  radius: 4,
});

graph.add('node', {
  type: 'tag',
  color: '#4170F2',
  width: 140,
  height: 40,
  x: 420,
  y: 232,
  label: 'Filled dark inverted tag',
  icon: '&#xe60a;',
  theme: 'filled',
  radius: 4,
});

graph.add('node', {
  type: 'tag',
  color: '#5AC8FA',
  width: 140,
  height: 40,
  x: 580,
  y: 232,
  label: {
    text: 'Filled light default tag',
  },
  icon: '&#xe60a;',
  theme: 'filled',
  radius: 4,
});

graph.add('node', {
  type: 'capsule',
  color: '#4170F2',
  width: 140,
  height: 40,
  x: 100,
  y: 284,
  label: 'Default style capsule',
  icon: '&#xe60a;',
  theme: 'lighted',
});

graph.add('node', {
  type: 'capsule',
  color: '#4170F2',
  width: 140,
  height: 40,
  x: 260,
  y: 284,
  label: 'Outlined style capsule',
  icon: '&#xe60a;',
  theme: 'outlined',
});

graph.add('node', {
  type: 'capsule',
  color: '#4170F2',
  width: 140,
  height: 40,
  x: 420,
  y: 284,
  label: 'Filled style inverted capsule node',
  icon: '&#xe60a;',
  theme: 'filled',
});

graph.add('node', {
  type: 'capsule',
  color: '#5AC8FA',
  width: 140,
  height: 40,
  x: 580,
  y: 284,
  label: 'Filled light node',
  icon: '&#xe60a;',
  theme: 'filled',
});

graph.add('node', {
  x: 50,
  y: 364,
  width: 48,
  height: 48,
  type: 'icon',
  color: '#4170F2',
  theme: 'lighted',
  icon: '&#xe60a;',
  label: 'Default icon node',
  radius: 4,
});

graph.add('node', {
  x: 140,
  y: 364,
  width: 48,
  height: 48,
  type: 'icon',
  color: '#2E62F1',
  theme: 'outlined',
  icon: '&#xe60a;',
  label: 'Outlined icon node',
  radius: 4,
});

graph.add('node', {
  x: 230,
  y: 364,
  width: 48,
  height: 48,
  type: 'icon',
  color: '#2E62F1',
  theme: 'filled',
  icon: '&#xe60a;',
  label: 'Filled icon node',
  radius: 4,
});

graph.add('node', {
  x: 50,
  y: 436,
  width: 48,
  height: 48,
  type: 'icon',
  color: '#4170F2',
  theme: 'lighted',
  icon: '&#xe60a;',
  label: 'Default icon node',
  radius: 24,
});

graph.add('node', {
  x: 140,
  y: 436,
  width: 48,
  height: 48,
  type: 'icon',
  color: '#2E62F1',
  theme: 'outlined',
  icon: '&#xe60a;',
  label: 'Outlined icon node',
  radius: 24,
});

graph.add('node', {
  x: 230,
  y: 436,
  width: 48,
  height: 48,
  type: 'icon',
  color: '#2E62F1',
  theme: 'filled',
  icon: '&#xe60a;',
  label: 'Filled icon node',
  radius: 24,
});

graph.add('node', {
  x: 360,
  y: 364,
  width: 48,
  height: 48,
  type: 'image',
  strokeStyle: '#E1E4EB',
  fillStyle: '#fff',
  image: {
    width: 24,
    height: 24,
    url: IMG_URL,
  },
  label: 'Image node',
  theme: 'lighted',
  radius: 4,
});

graph.add('node', {
  x: 440,
  y: 364,
  width: 48,
  height: 48,
  type: 'image',
  color: '#2E62F1',
  theme: 'outlined',
  image: {
    width: 24,
    height: 24,
    url: IMG_URL,
  },
  label: 'Outlined image node',
  radius: 4,
});

graph.add('node', {
  x: 530,
  y: 364,
  width: 24,
  height: 24,
  type: 'image',
  image: {
    url: IMG_URL,
  },
  label: 'Normal image node',
  radius: 4,
});

graph.add('node', {
  x: 360,
  y: 436,
  width: 48,
  height: 48,
  type: 'image',
  strokeStyle: '#E1E4EB',
  fillStyle: '#fff',
  image: {
    width: 24,
    height: 24,
    url: IMG_URL,
  },
  label: 'Image node',
  radius: 24,
});

graph.add('node', {
  x: 440,
  y: 436,
  width: 48,
  height: 48,
  type: 'image',
  color: '#2E62F1',
  theme: 'outlined',
  image: {
    width: 24,
    height: 24,
    url: IMG_URL,
  },
  label: 'Outlined image node',
  radius: 24,
});

graph.add('node', {
  x: 100,
  y: 526,
  width: 140,
  height: 40,
  type: 'category',
  color: '#4170F2',
  label: 'Light category node',
  radius: 4,
});

graph.add('node', {
  x: 250,
  y: 526,
  width: 140,
  height: 40,
  type: 'category',
  color: '#4170F2',
  label: 'Light category node',
  position: 'top',
  radius: 4,
});

graph.add('node', {
  x: 360,
  y: 526,
  width: 48,
  height: 48,
  type: 'circle',
  strokeStyle: '#4170F2',
  label: 'Circle node',
});

graph.add('node', {
  x: 440,
  y: 526,
  width: 48,
  height: 48,
  type: 'circle',
  fillStyle: '#4170F2',
  strokeStyle: null,
  label: {
    text: 'Circle node',
    fillStyle: '#fff',
    textAlign: 'center',
  },
});

graph.add('node', {
  x: 130,
  y: 624,
  width: 200,
  height: 90,
  type: 'title',
  title: {
    text: 'title',
    fontWeight: 500,
    height: 30,
    backgroundColor: '#F6F8FA',
    borderColor: '#E1E4EB',
  },
  label:
    '中文中文中文中文中文中文中文中文中文ontentcontentcontentcontentcontentcontentcontentcontentcontent',
  radius: 4,
});

graph.add('node', {
  x: 356,
  y: 624,
  width: 200,
  height: 90,
  type: 'title',
  title: {
    text: 'title',
    fontWeight: 500,
    fillStyle: '#fff',
    height: 30,
    backgroundColor: '#2E62F1',
  },
  label:
    '123123123123123123123contentcontentcontentcontentcontentcontentcontent',
  radius: 4,
});

graph.add('node', {
  x: 586,
  y: 436,
  width: 140,
  height: 60,
  type: 'rhombus',
  label: 'Rhombus node',
});

graph.add('node', {
  x: 586,
  y: 524,
  width: 140,
  height: 40,
  radius: 4,
  type: 'imageTag',
  label: 'Tag node with image',
  image: IMG_URL,
});

graph.add('node', {
  x: 586,
  y: 624,
  width: 200,
  height: 70,
  radius: 4,
  type: 'imageTag',
  label:
    'Multi-line tag node with imageMulti-line tag node with imageMulti-line tag node with imageMulti-line tag node with image',
  image: IMG_URL,
});

graph.fitView();
```
