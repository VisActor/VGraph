---
category: examples
group: reactNodes
title: React Expand Tree Graph Node
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/react_treegraph.gif
link: reactNodes/reactTreeGraph
option:
---
# React Expand Tree Graph Node

To support graph scenarios with <b>heavy node rendering</b>, VGraph provides React node components so you can customize nodes easily with React. <br/>Please read <a href="/vgraph/guide/react-node-spec/react-viewer" target="_blank">the documentation</a> before use.

## Key Configurations

- `TreeGraph`: layout is compactBox, setDefaultNode configures width, height, and expanded.
- `Viewer`: setNode returns a React component with Tabs and expand/collapse icons; hideDetails.
- `graph.toggleCollapse(node, true)`: toggles the collapsed state of the node.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { TreeGraph, dragCanvas, panZoom } from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';
import { Tabs } from '@arco-design/web-react';
import { IconPlusCircle, IconMinusCircle } from '@arco-design/web-react/icon';

const TabPane = Tabs.TabPane;
const treeData = {
  id: 'General Manager',
  children: [
    {
      id: 'Human Resources',
      children: [
        { id: 'Recruitment' },
        { id: 'Compensation' },
        { id: 'Training' },
        { id: 'Performance' },
        { id: 'Labor Relations' }
      ]
    },
    {
      id: 'Production Department',
      children: [
        { id: 'Production' },
        { id: 'Purchasing' },
        { id: 'Warehousing' },
        { id: 'Quality Control' },
        { id: 'Logistics' }
      ]
    },
    {
      id: 'Marketing Department',
      children: [{ id: 'Marketing' }, { id: 'Planning' }, { id: 'Key Accounts' }]
    }
  ]
};

const container = document.getElementById(CONTAINER_ID);
const width = container ? container.offsetWidth : 800;
const height = container ? container.offsetHeight : 600;

function App() {
  const [graph, setGraph] = useState(null);
  const graphRef = useRef(null);

  useEffect(function() {
    const g = new TreeGraph({
      container: CONTAINER_ID,
      width: width,
      height: height,
      minRatio: 0.01,
      maxRatio: 8,
      renderMode: 'dom',
      layout: {
        type: 'compactBox',
        options: {
          direction: 'TB',
          alignTop: true,
          size: function() { return [width, height]; },
          nodeSep: function() { return 15; },
          nodeSize: function() { return [280, 150]; },
          rankSep: function() { return 50; }
        }
      },
      animate: true,
      setDefaultNode: function() {
        return {
          width: 280,
          expanded: true,
          height: 150,
          anchors: [[0.5, 0], [0.5, 1]]
        };
      },
      setDefaultEdge: function() {
        return {
          type: 'line',
          strokeStyle: '#ddd',
          appendSize: 2
        };
      }
    });
    g.addBehavior(panZoom);
    g.addBehavior(dragCanvas);
    g.data(treeData);
    graphRef.current = g;
    setGraph(g);
    return function() { g.destroy(); };
  }, []);

  function toggleNode(node) {
    var g = graphRef.current;
    if (g) g.toggleCollapse(node, true);
  }

  function setNode(node) {
    var activeTab = node.get('activeTab') || '1';
    var iconStyles = { color: '#3073FF', position: 'absolute', left: 132, top: 142, fontSize: 16 };
    var icon = null;
    if (node.get('children')) {
      icon = node.get('collapsed') ? (
        <IconPlusCircle
          style={iconStyles}
          onClick={function() { toggleNode(node); }}
          className="icon"
        />
      ) : (
        <IconMinusCircle
          style={iconStyles}
          onClick={function() { toggleNode(node); }}
          className="icon"
        />
      );
    }

    return (
      <div
        style={{
          border: '1px solid #E1E4EB',
          borderRadius: 4,
          width: node.get('width'),
          height: node.get('height')
        }}
      >
        <div style={{ marginTop: 8, textAlign: 'center', fontWeight: 500 }}>{node.get('id')}</div>
        <Tabs
          defaultActiveTab={activeTab}
          onChange={function(tab) { node.set('activeTab', tab); }}
        >
          <TabPane key="1" title="O1">
            <div style={{ paddingLeft: 12 }}>KR1: some content</div>
            <div style={{ paddingLeft: 12 }}>KR2: some content</div>
          </TabPane>
          <TabPane key="2" title="O2">
            <div style={{ paddingLeft: 12 }}>KR1: some content</div>
          </TabPane>
          <TabPane key="3" title="O3">
            <div style={{ paddingLeft: 12 }}>KR1: some content</div>
          </TabPane>
        </Tabs>
        {icon}
      </div>
    );
  }

  function getNodeStyles(node) {
    return { backgroundColor: '#3073FF' };
  }

  if (!graph) return <div>Loading...</div>;

  return (
    <div>
      <Viewer
        graph={graph}
        setNode={setNode}
        hideDetails={{ ratio: 0.1, getNodeStyles: getNodeStyles }}
      />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
