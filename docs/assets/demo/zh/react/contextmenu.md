---
category: examples
group: react
title: 右键菜单
cover:
 link: demo-spec/reactContextmenu
option:
---
# 右键菜单

数据描述：带有任务完成状态的流程数据。 交互操作：右键点击节点展示节点的 contextmenu。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Graph, panZoom } from '@visactor/vgraph';
import { Contextmenu } from '@visactor/react-vgraph-ui';

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
      未就绪: '#7152E8',
      等待执行: '#EE8B24',
      执行中: '#2367EA',
      成功: '#07A35A',
      失败: '#D94147',
      终止: '#5470A5'
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
          hitWidth: 4
        };
      }
    });
    g.addBehavior(panZoom);
    g.data(data);
    g.fitView();
    setGraph(g);
    return function() { g.destroy(); };
  }, [data]);

  var style = {width: 100, padding: 8, 'text-align': 'center'};

  function getContent(entity, type) {
    if (type === 'edge') {
      return (
        <div style={style}>
          {'From ' + entity.getSource().get('name') + ' to ' + entity.getTarget().get('name')}
        </div>
      );
    }
    return (
      <div style={style}>
        {entity.get('name') + ': ' + entity.get('status')}
      </div>
    );
  }

  return (
    <div>
      <Contextmenu
        graph={graph}
        getContent={getContent}
        targets={['node', 'edge']}
      />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
