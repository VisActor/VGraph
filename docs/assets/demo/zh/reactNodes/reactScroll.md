---
category: examples
group: reactNodes
title: React 节点内滚动
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/react_scroll.gif
 link: react-node-spec/react-viewer
option:
---
# React 节点内滚动
vGraph 为满足重节点展示的图场景提供了 React 节点组件，让用户使用 react 轻松定制节点。示例提供了一种节点内滚动和视图滚动不冲突的一种实现方案。
## 关键配置

- `Graph`：单节点，setDefaultNode 配置宽高与锚点。
- `Viewer`：setNode 返回带 overflow:auto 的 div，className 为 scroll-container。
- `panZoom`：options.shouldTrigger 中若 target 为 scroll-container 则 return false。

## 代码演示

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Graph, panZoom } from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';

const container = document.getElementById(CONTAINER_ID);
const width = container ? container.offsetWidth : 800;
const height = container ? container.offsetHeight : 600;

function App() {
  const [graph, setGraph] = useState(null);
  const viewerRef = useRef();

  useEffect(function() {
    const g = new Graph({
      container: CONTAINER_ID,
      width: width,
      height: height,
      minRatio: 0.3,
      maxRatio: 8,
      renderMode: 'dom',
      setDefaultNode: function() {
        return {
          width: 120,
          height: 120,
          anchors: [[0.5, 0], [0.5, 1]]
        };
      }
    });
    g.addBehavior(panZoom, {
      sensitivity: 5,
      autoPreventDefault: false,
      shouldTrigger: function(e) {
        if (e.target && e.target.classList && e.target.classList.contains('scroll-container')) {
          return false;
        }
        e.preventDefault();
        return true;
      }
    });
    const node = g.add('node', {});
    g.focus(node);
    setGraph(g);
    return function() { g.destroy(); };
  }, []);

  function setNode(node) {
    return (
      <div
        className="scroll-container"
        style={{ width: node.get('width'), height: node.get('height'), overflow: 'auto', border: '1px solid #ccc', borderRadius: 4, padding: 12 }}
      >
        节点内部的滚动与整个视图的平移缩放不冲突。节点内部的滚动与整个视图的平移缩放不冲突。节点内部的滚动与整个视图的平移缩放不冲突。
      </div>
    );
  }

  if (!graph) return <div>加载中...</div>;

  return (
    <div>
      <Viewer graph={graph} setNode={setNode} ref={viewerRef} />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
