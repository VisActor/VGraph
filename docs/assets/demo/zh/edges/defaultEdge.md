---
category: examples
group: edges
title: 内置连线 Edge
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/inset_edges.png
 link: edge-spec/prebuilt
option:
---
# 内置连线 Edge
VGraph 提供设计成熟的内置连线和丰富的事件，配合 label 等配置可以展示多种数据关系。
<br>
详细文档可见<a href="/vgraph/guide/edge-spec/options">连线文档</a>。事件列表请见<a href="/guide/events#graph-事件">事件</a>。
## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, insertStyles } from '@visactor/vgraph';

var container = document.getElementById(CONTAINER_ID);
var width = container.offsetWidth;
var height = container.offsetHeight;

var graph = new Graph({
  container: CONTAINER_ID,
  width: width,
  height: height,
  minRatio: 0.3,
  maxRatio: 8,
  setDefaultNode: function(nodeData) {
    if (parseInt(nodeData.id, 10) >= 27) {
      return {
        type: 'rect',
        width: 100,
        height: 40,
        strokeStyle: '#2E62F1',
        label: 'example'
      };
    }
    return {
      type: 'circle',
      width: 16,
      height: 16,
      fillStyle: '#5678D6',
      strokeStyle: null
    };
  }
});
graph.addBehavior(panZoom);

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894f27657a34.json'
)
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    graph.data(data);

    graph.add('edge', {
      source: '1',
      target: '2',
      endArrow: true
    });

    graph.add('edge', {
      source: '3',
      target: '4',
      label: {
        text: 'line',
        fillStyle: '#626B7B',
        offsetY: -9
      },
      endArrow: true,
      controlPoints: [
        [220, 70],
        [300, 70]
      ]
    });

    graph.add('edge', {
      type: 'turningLine',
      source: '5',
      target: '6',
      endArrow: true,
      controlPoints: [
        [390, 70],
        [470, 70]
      ],
      radius: 4
    });

    graph.add('edge', {
      type: 'quadratic',
      source: '7',
      target: '8',
      endArrow: true
    });

    graph.add('edge', {
      source: '9',
      target: '10',
      endArrow: true,
      label: {
        text: 'line',
        strokeStyle: '#fff',
        lineWidth: 2,
        autoRotate: true
      }
    });

    graph.add('edge', {
      source: '11',
      target: '12',
      endArrow: true,
      controlPoints: [
        [290, 200],
        [290, 280]
      ]
    });

    graph.add('edge', {
      type: 'turningLine',
      source: '13',
      target: '14',
      endArrow: true,
      controlPoints: [
        [460, 200],
        [460, 280]
      ],
      label: 'turningLine',
      radius: 4
    });

    graph.add('edge', {
      type: 'quadratic',
      source: '15',
      target: '16',
      endArrow: true
    });

    graph.add('edge', {
      source: '17',
      target: '18',
      endArrow: true,
      label: {
        text: 'label',
        autoRotate: true,
        background: {
          fillStyle: '#fff',
          strokeStyle: '#D1D5DA',
          padding: [2, 4, 2, 4]
        }
      }
    });

    graph.add('edge', {
      type: 'hLine',
      source: '19',
      target: '20',
      endArrow: true,
      label: 'hLine'
    });

    graph.add('edge', {
      type: 'vLine',
      source: '21',
      target: '22',
      label: {
        text: 'vLine',
        offsetY: -9
      },
      endArrow: true
    });

    graph.add('edge', {
      type: 'hCubic',
      source: '23',
      target: '24',
      label: {
        text: 'hCubic',
        strokeStyle: '#fff',
        autoRotate: true
      }
    });

    graph.add('edge', {
      type: 'vCubic',
      source: '25',
      target: '26',
      label: {
        text: 'vCubic',
        background: {
          fillStyle: '#fff'
        },
        capture: false
      }
    });

    graph.add('edge', {
      source: '27',
      type: 'loop',
      loop: {
        dist: 35,
        radius: 8
      }
    });

    graph.add('edge', {
      source: '28',
      type: 'loop',
      label: {
        text: 'loop',
        offsetY: -9
      },
      loop: {
        clockwise: false,
        position: 'bottom'
      }
    });

    graph.add('edge', {
      source: '29',
      target: '29',
      loop: {
        theme: 'round',
        position: 'right'
      },
      label: {
        position: 0,
        text: 'round',
        offsetX: 2,
        offsetY: -9
      }
    });

    graph.add('edge', {
      source: '30',
      target: '30',
      loop: {
        theme: 'arc'
      }
    });

    graph.fitView();
  });
```
