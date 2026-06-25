---
category: examples
group: react
title: Zoom UI Linking
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/slider.gif
link: behaviors
option:
---
# Zoom UI Linking

A zoom slider is commonly used in products to control view zoom and show min/max zoom ratios, which requires linking with the built-in panZoom interaction. <br>Interactions: pan/zoom on the canvas, or use the slider above.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Graph, panZoom } from '@visactor/vgraph';
import { Slider } from '@arco-design/web-react';

var container = document.getElementById(CONTAINER_ID);
var width = container ? container.offsetWidth : 800;
var height = container ? container.offsetHeight : 600;

function App() {
  var [data, setData] = useState(null);
  var [graph, setGraph] = useState(null);
  var [ratio, setRatio] = useState(1);

  useEffect(function() {
    var url = 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/job.json';
    fetch(url)
      .then(function(res) { return res.json(); })
      .then(function(d) { setData(d); });
  }, []);

  useEffect(function() {
    if (!data) return;
    var colors = {
      'Not Ready': '#7152E8',
      'Waiting': '#EE8B24',
      'Running': '#2367EA',
      'Success': '#07A35A',
      'Failed': '#D94147',
      'Terminated': '#5470A5'
    };
    var g = new Graph({
      container: CONTAINER_ID,
      width: width,
      height: height,
      minRatio: 0.2,
      maxRatio: 2,
      layout: {
        type: 'dag'
      },
      setDefaultNode: function(node) {
        return {
          type: 'category',
          radius: 4,
          width: 80,
          height: 20,
          color: colors[node.status],
          label: node.name,
          anchors: [
            [0.5, 0.0],
            [0.5, 1.0]
          ]
        };
      },
      setDefaultEdge: function() {
        return {
          type: 'vLine',
          endArrow: {
            width: 3,
            height: 5
          },
          strokeStyle: '#ddd',
          appendSize: 2
        };
      }
    });
    g.addBehavior(panZoom);
    g.data(data);
    g.fitView();
    g.on('transformed', function() {
      setRatio(g.getZoomRatio());
    });
    setGraph(g);
    return function() { g.destroy(); };
  }, [data]);

  function handleChange(val) {
    setRatio(val);
    if (graph) {
      graph.setZoomRatio(val);
    }
  }

  return (
    <div>
      <Slider
        min={0.2}
        max={2}
        value={ratio}
        step={0.1}
        style={{ width: 300, marginBottom: 8 }}
        onChange={handleChange}
      />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
