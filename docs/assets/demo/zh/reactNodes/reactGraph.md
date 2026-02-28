---
category: examples
group: reactNodes
title: React 展开节点
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/react_graph.gif
link: reactNodes/reactGraph
option:
---
# React 展开节点
vGraph 为满足重节点展示的图场景提供了 React 节点组件，让用户使用 react 轻松定制节点。 使用前请详细阅读使用文档。
## 关键配置

- `Graph`：`dag` 布局（`rankDir: TB`），默认节点宽 `280`、高 `80`，可展开至 `150`。
- `Viewer`：在 `setNode` 中通过 `Tabs + Tag + Icon` 组合实现节点内容和交互。
- `hideDetails`：缩小时简化展示，保证大图浏览性能与可读性。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Graph, panZoom } from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';
import { Tabs, Tag } from '@arco-design/web-react';
import { IconShrink, IconExpand, IconPlusCircle, IconMinusCircle } from '@arco-design/web-react/icon';

const TabPane = Tabs.TabPane;
const container = document.getElementById(CONTAINER_ID);
const width = container ? container.offsetWidth : 800;
const height = container ? container.offsetHeight : 600;

function buildTargets(data) {
  var targetsMap = {};
  var nodes = data.nodes || [];
  var edges = data.edges || [];
  nodes.forEach(function(n) { targetsMap[n.id] = []; });
  edges.forEach(function(e) {
    var src = e.source;
    if (!targetsMap[src]) targetsMap[src] = [];
    targetsMap[src].push(e.target);
  });
  return targetsMap;
}

function getSubtreeIds(nodeId, targetsMap) {
  var ids = [nodeId];
  var children = targetsMap[nodeId];
  if (children) {
    children.forEach(function(id) {
      ids = ids.concat(getSubtreeIds(id, targetsMap));
    });
  }
  return ids;
}

function applyCollapses(data, collapsedState) {
  if (!data || !data.nodes) return data;
  var targetsMap = buildTargets(data);
  var hideIds = {};
  Object.keys(collapsedState || {}).forEach(function(nodeId) {
    getSubtreeIds(nodeId, targetsMap).forEach(function(id) {
      if (id !== nodeId) hideIds[id] = true;
    });
  });
  var nodes = data.nodes.filter(function(n) { return !hideIds[n.id]; });
  var hideSet = hideIds;
  var edges = (data.edges || []).filter(function(e) {
    return !hideSet[e.source] && !hideSet[e.target];
  });
  return { nodes: nodes, edges: edges };
}

function App() {
  const [fullData, setFullData] = useState(null);
  const [collapsedState, setCollapsedState] = useState({});
  const [graph, setGraph] = useState(null);
  const graphRef = useRef(null);
  const fitViewDone = useRef(false);

  var visibleData = useMemo(function() {
    return applyCollapses(fullData, collapsedState);
  }, [fullData, collapsedState]);

  useEffect(function() {
    var url = 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/job.json';
    fetch(url).then(function(res) { return res.json(); }).then(function(d) { setFullData(d); });
  }, []);

  useEffect(function() {
    if (!fullData || !container) return;
    var layoutOptions = { rankDir: 'TB', nodeSep: 50, rankSep: 150 };
    var layoutConfig = { type: 'dag', options: layoutOptions };
    var defaultNodeConfig = { width: 280, height: 80, anchors: [[0.5, 0], [0.5, 1]] };
    var endArrow = { width: 3, height: 5 };
    var defaultEdgeConfig = { type: 'vLine', endArrow: endArrow, strokeStyle: '#ddd', appendSize: 2 };
    var g = new Graph({
      container: CONTAINER_ID,
      width: width,
      height: height,
      minRatio: 0.3,
      maxRatio: 8,
      renderMode: 'dom',
      layout: layoutConfig,
      setDefaultNode: function() { return defaultNodeConfig; },
      setDefaultEdge: function() { return defaultEdgeConfig; }
    });
    var panZoomOpt = { sensitivity: 5 };
    g.addBehavior(panZoom, panZoomOpt);
    graphRef.current = g;
    setGraph(g);
    return function() { g.destroy(); graphRef.current = null; };
  }, [fullData]);

  useEffect(function() {
    var g = graphRef.current;
    if (!g || !visibleData || !visibleData.nodes.length) return;
    g.data(visibleData);
    g.refresh();
    g.layout();
    if (!fitViewDone.current) {
      g.fitView();
      fitViewDone.current = true;
    }
  }, [visibleData, graph]);

  function resizeNode(node) {
    var g = graphRef.current;
    if (!g) return;
    g.disableAutoDraw();
    var height150 = { height: 150 };
    var height80 = { height: 80 };
    if (node.get('height') === 80) {
      node.set('expanded', true);
      node.updateData(height150);
    } else {
      node.set('expanded', false);
      node.updateData(height80);
    }
    g.enableAutoDraw(true);
    g.layout(node.get('id'));
  }

  function toggleData(node) {
    var id = node.get('id');
    setCollapsedState(function(prev) {
      var next = Object.assign({}, prev);
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }

  function setNode(node) {
    var activeTab = node.get('activeTab') || '1';
    var expand = node.get('expanded');
    var targetsMap = {};
    if (fullData) {
      targetsMap = buildTargets(fullData);
    }
    var hasChildren = (targetsMap[node.get('id')] || []).length > 0;
    var collapsed = collapsedState[node.get('id')];
    var paddingStyle = { padding: 12 };
    var tab1 = React.createElement('div', { style: paddingStyle }, 'Content of Tab Panel 1');
    var tab2 = React.createElement('div', { style: paddingStyle }, 'Content of Tab Panel 2');
    var tab3 = React.createElement('div', { style: paddingStyle }, 'Content of Tab Panel 3');
    var tabs = React.createElement(
      Tabs,
      { defaultActiveTab: activeTab, onChange: function(tab) { node.set('activeTab', tab); } },
      React.createElement(TabPane, { key: '1', title: 'Tab 1' }, tab1),
      React.createElement(TabPane, { key: '2', title: 'Tab 2', disabled: true }, tab2),
      React.createElement(TabPane, { key: '3', title: 'Tab 3' }, tab3)
    );
    var descDiv = React.createElement('div', { style: paddingStyle }, 'some description');
    var content = expand ? React.createElement('div', null, tabs) : descDiv;
    var iconStyles = { color: '#3073FF', position: 'absolute', left: 132, top: expand ? 142 : 72, fontSize: 16 };
    var nodeW = node.get('width');
    var nodeH = node.get('height');
    var boxStyle = { padding: 6, border: '1px solid #E1E4EB', borderRadius: 4, width: nodeW, height: nodeH };
    var floatRight = { float: 'right' };
    var tagStyle = { marginRight: 8 };
    var resizeIcon = React.createElement(IconExpand, { style: floatRight, onClick: function() { resizeNode(node); } });
    if (expand) {
      resizeIcon = React.createElement(IconShrink, { style: floatRight, onClick: function() { resizeNode(node); } });
    }
    var collapseIcon = null;
    if (hasChildren) {
      collapseIcon = React.createElement(IconMinusCircle, { style: iconStyles, onClick: function() { toggleData(node); }, className: 'icon' });
      if (collapsed) {
        collapseIcon = React.createElement(IconPlusCircle, { style: iconStyles, onClick: function() { toggleData(node); }, className: 'icon' });
      }
    }
    return React.createElement(
      'div',
      { style: boxStyle },
      resizeIcon,
      React.createElement(Tag, { checkable: true, color: 'arcoblue', defaultChecked: true, style: tagStyle }, '正常'),
      node.get('name'),
      content,
      collapseIcon
    );
  }

  function getNodeStyles() { return { backgroundColor: '#3073FF' }; }
  var hideDetailsOpt = { ratio: 0.4, getNodeStyles: getNodeStyles };

  if (!graph) return React.createElement('div', null, '加载中...');

  return React.createElement(Viewer, { graph: graph, setNode: setNode, hideDetails: hideDetailsOpt });
}

ReactDOM.render(React.createElement(App, null), document.getElementById(CONTAINER_ID));
```
