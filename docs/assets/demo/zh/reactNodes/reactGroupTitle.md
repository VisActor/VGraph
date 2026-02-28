---
category: examples
group: reactNodes
title: React 分组标题
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/react_group_title.gif
link: reactNodes/reactGroupTitle
option:
---
# React 分组标题
vGraph 为满足重节点展示的图场景提供了 React 节点组件，并在新版本支持了分组标题渲染。 使用前请详细阅读使用文档。
## 关键配置

- `Graph`：layout 为 nestedDag，setDefaultGroup 配置分组样式，data 含 groups。
- `Viewer`：setNode、setGroupTitle；setGroupTitle 返回可双击编辑的 React 组件。

## 代码演示

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Graph, panZoom } from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';
import { Input } from '@arco-design/web-react';

const container = document.getElementById(CONTAINER_ID);
const width = container ? container.offsetWidth : 800;
const height = container ? container.offsetHeight : 600;

function App() {
  const [graph, setGraph] = useState(null);

  useEffect(function() {
    const g = new Graph({
      container: CONTAINER_ID,
      width: width,
      height: height,
      minRatio: 0.3,
      maxRatio: 8,
      renderMode: 'dom',
      layout: {
        type: 'nestedDag',
        options: {
          dagOptions: {
            rankDir: 'TB',
            nodeSep: 50,
            rankSep: 150
          }
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
        return { type: 'line', endArrow: true };
      },
      setDefaultGroup: function() {
        return {
          linkNode: true,
          padding: [16, 12, 16, 12],
          opacity: 1,
          fillStyle: '#F6F7F9',
          strokeStyle: '#E3E5EB',
          lineWidth: 1,
          titleSize: 40,
          radius: 4
        };
      }
    });
    g.addBehavior(panZoom);
    g.data({
      nodes: [
        { id: '1', name: '数据整理' },
        { id: '2', name: '建模分析' },
        { id: '3', name: '描述分析' }
      ],
      edges: [
        { source: '1', target: '2' },
        { source: '1', target: '3' }
      ],
      groups: [
        { id: '12', name: '子流程1', children: ['1', '2', '3'] }
      ]
    });
    g.fitView();
    setGraph(g);
    return function() { g.destroy(); };
  }, []);

  function setNode(node) {
    return (
      <div
        style={{
          width: 140,
          borderRadius: 4,
          padding: '0 12px',
          border: '1px solid #ccc',
          lineHeight: '40px',
          textAlign: 'center',
          backgroundColor: '#fff'
        }}
      >
        {node.get('name')}
      </div>
    );
  }

  function setGroupTitle(group) {
    return <TitleEditor group={group} />;
  }

  if (!graph) return <div>加载中...</div>;

  return (
    <div>
      <Viewer graph={graph} setNode={setNode} setGroupTitle={setGroupTitle} />
    </div>
  );
}

const TitleEditor = React.memo(function TitleEditor(props) {
  const group = props.group;
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState(group.get('name') || group.get('id'));

  return (
    <div
      style={{
        lineHeight: '40px',
        height: '100%',
        border: '1px solid #E3E5EB',
        borderRadius: '4px 4px 0 0',
        background: '#fff'
      }}
      onDoubleClick={function() { setVisible(true); }}
    >
      {visible ? (
        <Input
          autoFocus
          value={name}
          style={{ height: 40, borderRadius: '4px 4px 0 0' }}
          onChange={function(v) { setName(v); }}
          onBlur={function() {
            group.set('name', name);
            setVisible(false);
          }}
          onPressEnter={function() {
            group.set('name', name);
            setVisible(false);
          }}
        />
      ) : (
        <span style={{ paddingLeft: 12 }}>{name}</span>
      )}
    </div>
  );
});

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
