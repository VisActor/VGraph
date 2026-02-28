---
category: examples
group: wasm
title: WASM Directed Graph Layout
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/wasmlayout.jpeg
link: wasm/daglayout
option:
---
# WASM Directed Graph Layout

Data description: Grouped directed graph.

Get higher quality layout effects through Wasm directed graph layout.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Tag } from '@arco-design/web-react';
import { dragCanvas, Graph, highlightRelations, Layer, panZoom, Rect, Text } from '@visactor/vgraph';
import { WasmDAGLayout, loadWasm } from '@visactor/vgraph-wasm';
import { Viewer } from '@visactor/react-vgraph';

const tagColors = {
  tag0: '#5678D6',
  tag1: '#EB8D2F',
  tag2: '#59A649',
  tag3: '#A0A0AD',
  tag4: '#D95145',
  tag5: '#B4B2FF',
};

function App(props) {
  const { data } = props;
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    loadWasm('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/dotlayout.wasm').then(function() {
      setLoading(false);
    });
  }, []);

  useEffect(function() {
    if (loading) {
      return;
    }
    const container = document.getElementById(CONTAINER_ID);
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const g = new Graph({
      container: container,
      width: width,
      height: height,
      minRatio: 0.001,
      maxRatio: 8,
      animate: false,
      renderMode: 'dom',
      setDefaultNode: function(nodeData) {
        return {
          width: 100,
          height: 32,
          anchors: [
            [0.5, 0],
            [0.5, 1],
          ],
        };
      },
      setDefaultEdge: function(edge) {
        return {
          type: 'turningLine',
          useSplineTerminal: true,
          endArrow: {
            width: 5,
            height: 7
          },
          startArrow: false,
          radius: 10,
          strokeStyle: '#ccc',
          appendSize: 2,
          lineWidth: 2,
        };
      },
      setEdgeStateStyles: function(state) {
        if (state === 'active') {
          return {
            opacity: 1.0,
            strokeStyle: '#ccc',
          };
        }
        return { opacity: 0.01 };
      },
      setDefaultGroup: function(groupData) {
        return {
          linkNode: true,
          fillStyle: 'rgba(200,244,255,0.15)',
          strokeStyle: '#DDE2E9',
          linkGroupOnCollapse: true,
          padding: [10, 10, 10, 10],
          radius: 4,
          anchors: [
            [0, 0.5],
            [1, 0.5],
            [0.5, 0],
            [0.5, 1],
          ],
          capture: false,
          titleSize: 32,
          renderGroupTitle: function(group, layer, width) {
            const text = new Text({
              text: groupData.id,
              x: width / 2,
              width: width - 5,
              textOverflow: 'ellipsis',
              y: 12,
              fontSize: 15,
              textBaseline: 'middle',
              textAlign: 'center',
              fillStyle: '#3073F2'
            });

            const rect = new Rect({
              left: 0,
              top: 0,
              width: width,
              height: 30,
              fillStyle: '#3073F2',
              opacity: 0.2
            });

            layer.add(rect);
            layer.add(text);
            return 30;
          },
        };
      },
    });

    g.addBehavior(dragCanvas, { canvasOnly: false });
    g.addBehavior(panZoom);
    g.addBehavior(highlightRelations);
    g.on('node:click', function(e) { console.log(e.target) });
    g.on('edge:click', function(e) { console.log(e.target) });
    g.on('group:click', function(e) { console.log(e.target) });
    g.addBehavior(panZoom);
    g.data(data);

    const dot = new WasmDAGLayout({
      graph: g,
      rankDir: 'TB',
      lineType: 'polyline',
      rankSep: 120,
      nodeSep: 100,
    });
    g.set('layout', dot);

    g.refresh();
    g.fitView();
    setGraph(g);
  }, [loading]);

  function setNode(node) {
    if (node.get('tag') === undefined) {
      node.set('tag', 'tag' + Math.floor(Math.random() * 6));
    }
    const status = node.get('tag');

    return React.createElement('div', { style: { width: node.get('width'), height: node.get('height'), border: '1px solid ' + tagColors[status], borderRadius: 4, padding: '4px 5px' } },
      React.createElement(Tag, { size: 'small', color: tagColors[status] }, status),
      React.createElement('span', { style: { marginLeft: 2, color: tagColors[status] } }, node.get('id'))
    );
  }

  return React.createElement('div', null,
    graph && React.createElement(Viewer, {
      graph: graph,
      setNode: setNode
    })
  );
}

fetch(
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/7121eh7phohmnuvog/nesteddag.json'
)
  .then(function(response) { return response.json(); })
  .then(function(data) {
    ReactDOM.render(React.createElement(App, { data: data }), document.getElementById(CONTAINER_ID));
  });
```
