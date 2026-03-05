---
category: examples
group: reactNodes
title: React 展开树图节点
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/react_treegraph.gif
link: reactNodes/reactTreeGraph
option:
---
# React 展开树图节点
VGraph 为满足<b>重节点展示</b>的图场景提供了 React 节点组件，让用户使用 react 轻松定制节点。<br/> 使用前请详细阅读<a href="/vgraph/guide/react-node-spec/react-viewer" target="_blank">使用文档</a>。
## 关键配置

- `TreeGraph`：layout 为 compactBox，setDefaultNode 配置宽高与 expanded。
- `Viewer`：setNode 返回带 Tabs 与展开/收起图标的 React 组件；hideDetails。
- `graph.toggleCollapse(node, true)`：切换节点折叠状态。

## 代码演示

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
  id: '总经理',
  children: [
    {
      id: '人事部',
      children: [
        { id: '招聘' },
        { id: '薪酬' },
        { id: '培训' },
        { id: '绩效' },
        { id: '劳资' }
      ]
    },
    {
      id: '生产部',
      children: [
        { id: '生产' },
        { id: '采购' },
        { id: '仓储' },
        { id: '品管' },
        { id: '物流' }
      ]
    },
    {
      id: '营销部',
      children: [{ id: '营销' }, { id: '策划' }, { id: '大客户' }]
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

  if (!graph) return <div>加载中...</div>;

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
