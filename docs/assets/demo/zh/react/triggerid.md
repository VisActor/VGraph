---
category: examples
group: react
title: 触发 ID
cover:
 link: demo-spec/reactTooltip
option:
---
# 触发 ID

在鼠标 hover 到指定图形上出 Tooltip 是一个常见的业务需求，vGraph 支持通过简单配置实现此交互。 交互操作：hover icon展示节点的 tooltip。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Graph, panZoom } from '@visactor/vgraph';
import { Tooltip } from '@visactor/react-vgraph-ui';
import '@arco-design/web-react/dist/css/arco.css';

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
    var colors = {未就绪: '#7152E8', 等待执行: '#EE8B24', 执行中: '#2367EA', 成功: '#07A35A', 失败: '#D94147', 终止: '#5470A5'};
    var icons = {未就绪: '&#xe603;', 等待执行: '&#xe60c;', 执行中: '&#xe60a;', 成功: '&#xe6b9;', 失败: '&#xe60b;', 终止: '&#xe614;'};
    var g = new Graph({container: CONTAINER_ID, width: width, height: height, minRatio: 0.3, maxRatio: 8, layout: {type: 'dag'}, setDefaultNode: function(node) {return {type: 'tag', width: 120, height: 40, color: colors[node.status], label: node.name, anchors: [[0.5, 0.0], [0.5, 1.0]], icon: {icon: icons[node.status], size: 25, background: {width: 40}, triggerId: 'triggerIcon'}};}, setDefaultEdge: function() {return {type: 'vLine', endArrow: {width: 3, height: 5}, strokeStyle: '#D1D5DA', appendSize: 2};}});
    g.addBehavior(panZoom);
    g.data(data);
    g.fitView();
    document.fonts.ready.then(function() { g.draw(); });
    setGraph(g);
    return function() { g.destroy(); };
  }, [data]);

  function getNodeContent(entity) {
    return entity.get('name') + ': ' + entity.get('status');
  }

  return (
    <div>
      <Tooltip graph={graph} getContent={getNodeContent} target="node" triggerId="triggerIcon" mouseEnterDelay={300} />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
