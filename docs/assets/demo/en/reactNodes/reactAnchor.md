---
category: examples
group: reactNodes
title: React Anchor Node
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/react_anchor.gif
link: reactNodes/reactAnchor
option:
---
# React Anchor Node

vGraph provides React node components to meet the needs of displaying heavy nodes in graph scenarios, allowing users to easily customize nodes using React. Please read the usage documentation carefully before use.

## Key Configurations

- `Graph`: The layout is dag (rankDir TB), setDefaultNode width is 450, height is 360, setDefaultEdge is vLine.
- `Viewer`: setNode returns a large card (TitleCard + two StatusCards), with Statistic and Progress inside StatusCard; hideDetails.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Graph, panZoom } from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';
import { Statistic, Progress } from '@arco-design/web-react';
import { IconCodeSquare } from '@arco-design/web-react/icon';

const container = document.getElementById(CONTAINER_ID);
const width = container ? container.offsetWidth : 800;
const height = container ? container.offsetHeight : 600;

function hexToRgbaValue(color) {
  var str = color.toLowerCase();
  var hex = '0123456789abcdef';
  if (str.length >= 7) {
    return [
      hex.indexOf(str[1]) * 16 + hex.indexOf(str[2]),
      hex.indexOf(str[3]) * 16 + hex.indexOf(str[4]),
      hex.indexOf(str[5]) * 16 + hex.indexOf(str[6]),
      1
    ];
  }
  return [0, 0, 0, 1];
}

function TitleCard() {
  return (
    <div style={{ width: '100%', height: 90, backgroundColor: 'rgba(0.9,0.9,0.9,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <IconCodeSquare style={{ fontSize: 70 }} />
    </div>
  );
}

function StatusCard(props) {
  var percent = props.percent;
  var count = props.count;
  var top = props.top;
  var status = percent > 50 ? 'success' : percent > 20 ? 'normal' : 'error';
  var color = status === 'success' ? '#07A35A' : status === 'normal' ? '#3073E0' : '#E33232';
  var rgba = hexToRgbaValue(color);
  var bg = 'rgba(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ',0.03)';
  return (
    <div style={{ width: '90%', position: 'absolute', height: 100, margin: '0 5%', borderLeft: '10px solid ' + color, borderRadius: 10, top: top, display: 'flex', backgroundColor: bg }}>
      <div style={{ width: '20%', marginTop: 30 }}>
        <Statistic value={count} style={{ marginLeft: '20%' }} />
      </div>
      <div style={{ width: '50%', marginTop: 40 }}>
        <Progress percent={percent} color={color} size="large" style={{ marginBottom: 20 }} />
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [graph, setGraph] = useState(null);

  useEffect(function() {
    var url = 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/job.json';
    fetch(url).then(function(res) { return res.json(); }).then(function(d) { setData(d); });
  }, []);

  useEffect(function() {
    if (!data || !container) return;
    var g = new Graph({
      container: CONTAINER_ID,
      width: width,
      height: height,
      minRatio: 0.1,
      maxRatio: 8,
      renderMode: 'dom',
      layout: { type: 'dag', options: { rankDir: 'TB', nodeSep: 30, rankSep: 120 } },
      setDefaultNode: function() {
        return {
          width: 450,
          height: 360,
          opacity: 0,
          anchors: [[0.5, 0], [0.5, 1]]
        };
      },
      setDefaultEdge: function() {
        return { type: 'vLine', endArrow: { width: 13, height: 15 }, strokeStyle: '#ddd', lineWidth: 3, appendSize: 2 };
      }
    });
    g.addBehavior(panZoom);
    g.data(data);
    g.refresh();
    g.fitView();
    setGraph(g);
    return function() { g.destroy(); };
  }, [data]);

  function setNode(node) {
    if (node.get('percent') === undefined) {
      node.set('count', Math.round(100 + Math.random() * 900));
      node.set('percent', Number((Math.random() * 100).toFixed(2)));
      node.set('count2', Math.round(100 + Math.random() * 900));
      node.set('percent2', Number((Math.random() * 100).toFixed(2)));
    }
    var percent = node.get('percent');
    var count = node.get('count');
    var percent2 = node.get('percent2');
    var count2 = node.get('count2');
    return (
      <div style={{ width: '100%', height: '100%', boxShadow: 'rgba(149,157,165,0.2) 0px 8px 24px', borderRadius: 15, userSelect: 'text', display: 'flex', position: 'relative' }}>
        <TitleCard />
        <StatusCard percent={percent} count={count} top={120} />
        <StatusCard percent={percent2} count={count2} top={240} />
      </div>
    );
  }

  function getNodeStyles(n) { return { backgroundColor: '#3073FF' }; }

  if (!graph) return <div>Loading...</div>;

  return <Viewer graph={graph} setNode={setNode} hideDetails={{ ratio: 0.1, getNodeStyles: getNodeStyles }} />;
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
