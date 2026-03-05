---
category: examples
group: reactNodes
title: React 节点
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/react_node.gif
 link: react-node-spec/react-viewer
option:
---
# React 节点
VGraph 为满足<b>重节点展示</b>的图场景提供了 React 节点组件，让用户使用 react 轻松定制节点。<br/> 使用前请详细阅读<a href="/vgraph/guide/react-node-spec/react-viewer" target="_blank">使用文档</a>。
## 关键配置

- `Graph`：图实例，layout 为 dag，setDefaultNode 配置宽高与锚点。
- `Viewer`：setNode 返回 React 组件；hideDetails 在缩放较小时简化节点展示。

## 代码演示

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Graph, panZoom } from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';
import { Tag } from '@arco-design/web-react';

const container = document.getElementById(CONTAINER_ID);
const width = container ? container.offsetWidth : 800;
const height = container ? container.offsetHeight : 600;

const statusMap = {
  成功: '#5678D6',
  等待执行: '#EB8D2F',
  执行中: '#59A649',
  终止: '#A0A0AD',
  失败: '#D95145',
  未就绪: '#B4B2FF'
};

const TagNode = React.memo(function TagNode(props) {
  const node = props.node;
  const status = node.get('status');
  return (
    <div style={{ width: node.get('width'), height: node.get('height'), border: '1px solid #ccc', borderRadius: 4, padding: '8px 10px' }}>
      <Tag color={statusMap[status]}>{status}</Tag>
      <span style={{ marginLeft: 4 }}>{node.get('name')}</span>
    </div>
  );
});

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
      maxRatio: 8,
      renderMode: 'dom',
      layout: {
        type: 'dag',
        options: {
          rankDir: 'TB',
          nodeSep: 50,
          rankSep: 150
        }
      },
      setDefaultNode: function() {
        return {
          width: 140,
          height: 40,
          anchors: [[0.5, 0], [0.5, 1]]
        };
      },
      setDefaultEdge: function() {
        return {
          type: 'vLine',
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
    return <TagNode node={node} />;
  }

  function getNodeStyles(node) {
    return { backgroundColor: statusMap[node.get('status')] };
  }

  if (!graph) return <div>加载中...</div>;

  return (
    <div>
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
