---
category: examples
group: reactNodes
title: React Node with Internal Scrolling
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/react_scroll.gif
link: react-node-spec/react-viewer
option:
---
# React Node with Internal Scrolling

vGraph provides React node components to satisfy complex node display scenarios in graphs, allowing users to easily customize nodes using React. This example provides a solution where internal node scrolling does not conflict with view scrolling.

## Key Configurations

- `Graph`: Single node, with `setDefaultNode` configuring width, height, and anchors.
- `Viewer`: `setNode` returns a div with `overflow: auto` and a `className` of `scroll-container`.
- `panZoom`: In `options.shouldTrigger`, if the target is `scroll-container`, return `false`.

## Code Demo

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
        The scrolling inside the node does not conflict with the panning and zooming of the entire view. The scrolling inside the node does not conflict with the panning and zooming of the entire view. The scrolling inside the node does not conflict with the panning and zooming of the entire view.
      </div>
    );
  }

  if (!graph) return <div>Loading...</div>;

  return (
    <div>
      <Viewer graph={graph} setNode={setNode} ref={viewerRef} />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
