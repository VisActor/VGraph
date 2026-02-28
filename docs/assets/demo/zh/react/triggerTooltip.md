---
category: examples
group: react
title: 工具提示
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/tooltip.gif
 link: node-addon-spec/trigger
option:
---
# 工具提示

vgraph-react 中的 Tooltip 依赖 Arco Design。如果你的项目并未使用此 ui 库，vgraph 提供 Trigger 工具帮助你轻松封装任意 UI 组件库的 Tooltip。当 tooltip 的热区需要响应事件时，可以通过 graph.handleEvent 处理。详细请见UI 触发器

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Graph, panZoom } from '@visactor/vgraph';
import { Tooltip } from '@visactor/react-vgraph-ui';

var container = document.getElementById(CONTAINER_ID);
var width = container ? container.offsetWidth : 800;
var height = container ? container.offsetHeight : 600;

function App() {
  var [data, setData] = useState(null);
  var [graph, setGraph] = useState(null);

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
      minRatio: 0.3,
      maxRatio: 8,
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
    setGraph(g);
    return function() { g.destroy(); };
  }, [data]);

  function getNodeContent(entity) {
    return entity.get('name') + ': ' + entity.get('status');
  }

  function getEdgeContent(entity) {
    return 'From ' + entity.getSource().get('name') + ' to ' + entity.getTarget().get('name');
  }

  return (
    <div>
      <Tooltip graph={graph} getContent={getNodeContent} target="node" />
      <Tooltip graph={graph} getContent={getEdgeContent} target="edge" />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
