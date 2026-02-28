---
category: examples
group: solutions
title: 数据表血缘-列视图
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/column-lineage.gif
 link: demo-spec/columnLineage
option:
---
# 数据表血缘-列视图

演示基于 vgraph 与 DataLineageGraph 的数据表血缘列视图，展示表中字段级依赖。数据来源为远程 JSON，使用 `@visactor/vgraph` 与 `@visactor/react-vgraph`。

## 关键配置

- `GraphStructure`：有向图结构，nodes/edges/groups。
- `DataLineageGraph`：列视图模式（mode: 'column'），支持 getGroupTitle、getGroupContent、getTableContent、getTaskTooltipContent、getGroupWidth 等配置。

## 代码演示

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Popover, Tooltip } from '@arco-design/web-react';
import { GraphStructure } from '@visactor/vgraph';
import { DataLineageGraph } from '@visactor/react-vgraph';
import { insertStyles } from '@visactor/vgraph';

insertStyles(
  `.relation-table-container {
    display: flex;
    align-items: center;
    height: 28px;
    cursor: pointer;
    margin-left: -10px;
  }
  .relation-table-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }`,
  'vgraph-demo-columnLineage'
);

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;

function App() {
  const [data, setData] = useState(null);
  const [baseTableId, setBaseTableId] = useState('');

  useEffect(function() {
    const url = 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/DataLineageColumn.json';
    fetch(url)
      .then(function(res) { return res.json(); })
      .then(function(raw) {
        setBaseTableId(raw.baseTableId);
        const graphData = new GraphStructure({
          nodes: raw.nodes,
          edges: raw.edges,
          groups: raw.groups
        });
        setData(graphData);
      });
  }, []);

  if (!data) return <div>加载中...</div>;

  const options = {
    baseTableId: baseTableId,
    mode: 'column',
    tableHeight: 32,
    getGroupTitle(groupData) {
      if (groupData.depth === 0) return '主节点';
      const countStr = '总计';
      const count = groupData.subGroups.length;
      return (
        <div>
          <span>{Math.abs(groupData.depth)}层{groupData.depth > 0 ? '下游' : '上游'}</span>
          <span style={{ float: 'right', color: 'rgba(20, 20, 20, 0.65)', fontWeight: 'normal' }}>
            {countStr} <b style={{ color: 'rgba(20, 20, 20, 0.9)' }}>{count}</b> 个
          </span>
        </div>
      );
    },
    onClickTable(node) {
      console.log(node);
    },
    getTaskTooltipContent(data) {
      return (
        <div>
          <div style={{ color: 'rgba(20, 20, 20, 0.65)', fontSize: 12 }}>加工任务名称</div>
          {data.edges.map(function(task) {
            return <div key={task.id}>{task.name}</div>;
          })}
        </div>
      );
    },
    getGroupWidth: function() { return 240; },
    getGroupContent(groupData) {
      const name = groupData.name;
      return (
        <Popover content={name} key={name}>
          <div className="relation-table-container">
            <div className="relation-table-name">{name}</div>
          </div>
        </Popover>
      );
    },
    getTableContent(data, options, group, i) {
      return (
        <Tooltip content={data.name} key={data.id}>
          <div className="relation-table-name" style={{ paddingLeft: 12 }}>
            {data.name}
          </div>
        </Tooltip>
      );
    }
  };

  return (
    <div style={{ width: width, height: height }}>
      <DataLineageGraph
        data={data}
        options={options}
        size={[width, height]}
        minDepth={-2}
        maxDepth={2}
      />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
