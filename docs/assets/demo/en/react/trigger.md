---
category: examples
group: react
title: Trigger
cover:
link: demo-spec/reactTrigger
option:
---
# Trigger

Data description: Workflow data with task completion status. <br>Interaction: <code>click icon</code> to show the node trigger.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Graph, panZoom } from '@visactor/vgraph';
import { Trigger } from '@visactor/react-vgraph-ui';
import { insertStyles } from '@visactor/vgraph';

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
var css = '.trigger-menu-item { padding: 8px; color: #4e5969; background-color: #fff; cursor: pointer; } .trigger-menu-item:hover { background-color: #f2f3f5; }';

var style = document.createElement('style');
style.appendChild(document.createTextNode(css));
document.getElementsByTagName('head')[0].appendChild(style);

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
    var g = new Graph({container: CONTAINER_ID, width: width, height: height, minRatio: 0.3, maxRatio: 8, layout: {type: 'dag'}, setDefaultNode: function(node) {return {type: 'tag', width: 120, height: 40, color: colors[node.status], icon: {icon: icons[node.status], size: 25, background: {width: 40}, triggerId: 'triggerIcon'}, label: node.name, anchors: [[0.5, 0.0], [0.5, 1.0]]};}, setDefaultEdge: function() {return {type: 'vLine', endArrow: {width: 3, height: 5}, strokeStyle: '#D1D5DA', appendSize: 2};}});
    g.addBehavior(panZoom);
    g.data(data);
    g.fitView();
    document.fonts.ready.then(function() { g.draw(); });
    setGraph(g);
    return function() { g.destroy(); };
  }, [data]);

  function getNodeContent(entity, type) {
    return (
      <div style={{border: '1px solid #ccc', borderRadius: 4, backgroundColor: '#fff'}}>
        {['Menu1', 'Menu2', 'Menu3'].map(function(item) {
          return (
            <div
              onClick={function(e) { console.log(item, e); }}
              key={item}
              className="trigger-menu-item"
            >
              {item}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <Trigger
        graph={graph}
        trigger="click"
        target="node"
        triggerId="triggerIcon"
        position="rt"
        popupAlign={{right: 4}}
        popup={getNodeContent}
      />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
