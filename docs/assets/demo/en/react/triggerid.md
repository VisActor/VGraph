---
category: examples
group: react
title: Trigger ID
cover:
link: demo-spec/reactTooltip
option:
---
# Trigger ID

Showing a tooltip when hovering a specific shape is a common requirement. VGraph supports this interaction through simple configuration. <br>Interaction: <code>hover icon</code> to show the node tooltip.

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
    var colors = {'Not Ready': '#7152E8', 'Waiting': '#EE8B24', 'Running': '#2367EA', 'Success': '#07A35A', 'Failed': '#D94147', 'Terminated': '#5470A5'};
    var icons = {'Not Ready': '&#xe603;', 'Waiting': '&#xe60c;', 'Running': '&#xe60a;', 'Success': '&#xe6b9;', 'Failed': '&#xe60b;', 'Terminated': '&#xe614;'};
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
