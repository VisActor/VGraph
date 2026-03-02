---
category: examples
group: reactNodes
title: hooks-useZoomRatio
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/useZoomRatio.gif
link: reactNodes/useZoomRatio
option:
---
# hooks-useZoomRatio
vGraph 为 react 用户的重度使用场景提供了一系列 hooks。useZoomRatio 是视图缩放 hook，用法可参考 ZoomUtils 组件。
## 关键配置

- `Graph`：dag 布局，setDefaultNode 配置锚点。
- `useZoomRatio(graph)`：返回 [ratio, setRatio]，setRatio 用于设置缩放比。
- `Viewer`：setNode、hideDetails。

## 代码演示

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Graph, panZoom } from '@visactor/vgraph';
import { Viewer, useZoomRatio } from '@visactor/react-vgraph';

const container = document.getElementById(CONTAINER_ID);
const width = container ? container.offsetWidth : 800;
const height = container ? container.offsetHeight : 600;

function ZoomUtils(props) {
  const graph = props.graph;
  const [ratio, setRatio] = useZoomRatio(graph);
  const spanStyles = {
    padding: 7,
    border: '1px solid #F0F1F3',
    borderRadius: 4,
    cursor: 'pointer',
    userSelect: 'none'
  };
  return (
    <div style={{ margin: 8 }}>
      <span
        style={spanStyles}
        onClick={function() { setRatio(ratio - 0.1); }}
      >
        -
      </span>
      {Math.round(ratio * 100) + '%'}
      <span
        style={spanStyles}
        onClick={function() { setRatio(ratio + 0.1); }}
      >
        +
      </span>
    </div>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [graph, setGraph] = useState(null);

  useEffect(function() {
    const url = 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/job.json';
    fetch(url)
      .then(function(res) { return res.json(); })
      .then(function(d) { setData(d); });
  }, []);

  useEffect(function() {
    if (!data || !container) return;
    const g = new Graph({
      container: CONTAINER_ID,
      width: width,
      height: height,
      minRatio: 0.3,
      maxRatio: 4,
      renderMode: 'dom',
      layout: {
        type: 'dag',
        options: { rankDir: 'LR', nodeSep: 50, rankSep: 150 }
      },
      setDefaultNode: function() {
        return {
          width: 140,
          height: 40,
          opacity: 0,
          anchors: [[0, 0.5], [1, 0.5]]
        };
      },
      setDefaultEdge: function() {
        return {
          type: 'hLine',
          endArrow: { width: 3, height: 5 },
          strokeStyle: '#ddd',
          appendSize: 2
        };
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
    var border = '1px solid #E1E4EB';
    if (node.hasState('select')) border = '1px solid #3073F2';
    return (
      <div style={{ border: border, width: 140, height: 40, borderRadius: 4 }}>
        {node.get('name')}: {node.get('satus')}
      </div>
    );
  }

  function getNodeStyles(node) {
    return { backgroundColor: '#3073FF' };
  }

  if (!graph) return <div>加载中...</div>;

  return (
    <div>
      <ZoomUtils graph={graph} />
      <Viewer
        graph={graph}
        setNode={setNode}
        hideDetails={{ ratio: 0.4, getNodeStyles: getNodeStyles }}
      />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
