---
category: examples
group: react
title: Tooltip
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/tooltip.gif
link: node-addon-spec/trigger
option:
---
# Tooltip

The Tooltip in vgraph-react depends on Arco Design. If your project does not use this UI library, vgraph provides a Trigger tool to help you easily encapsulate the Tooltip of any UI component library. When the hot area of the tooltip needs to respond to events, it can be handled through `graph.handleEvent`. For details, please see UI Trigger.

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
