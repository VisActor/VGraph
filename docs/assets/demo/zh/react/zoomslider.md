---
category: examples
group: react
title: 缩放 UI 联动
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/slider.gif
 link: behaviors
option:
---
# 缩放 UI 联动

业务经常会提供使用滑动条来进行视图缩放展示最大最小缩放比，这就需要与内置交互 panZoom 进行联动。<br> 交互操作：在画布上进行平移缩放，或使用上方滑动条。

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
      未就绪: '#7152E8',
      等待执行: '#EE8B24',
      执行中: '#2367EA',
      成功: '#07A35A',
      失败: '#D94147',
      终止: '#5470A5'
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
