---
category: examples
group: solutions
title: Data Table Lineage - Column View
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/column-lineage.gif
link: demo-spec/columnLineage
option:
---
# Data Table Lineage - Column View

This demo shows a data table lineage column view based on vgraph and DataLineageGraph, displaying field-level dependencies within tables. The data source is a remote JSON file, using `@visactor/vgraph` and `@visactor/react-vgraph`.

## Key Configurations

- `GraphStructure`: Directed graph structure with nodes/edges/groups.
- `DataLineageGraph`: Column view mode (`mode: 'column'`), supports configurations like `getGroupTitle`, `getGroupContent`, `getTableContent`, `getTaskTooltipContent`, and `getGroupWidth`.

## Code Demo

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

  if (!data) return <div>Loading...</div>;

  const options = {
    baseTableId: baseTableId,
    mode: 'column',
    tableHeight: 32,
    getGroupTitle(groupData) {
      if (groupData.depth === 0) return 'Main Node';
      const countStr = 'Total';
      const count = groupData.subGroups.length;
      return (
        <div>
          <span>{Math.abs(groupData.depth)} Level {groupData.depth > 0 ? 'Downstream' : 'Upstream'}</span>
          <span style={{ float: 'right', color: 'rgba(20, 20, 20, 0.65)', fontWeight: 'normal' }}>
            {countStr} <b style={{ color: 'rgba(20, 20, 20, 0.9)' }}>{count}</b> items
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
          <div style={{ color: 'rgba(20, 20, 20, 0.65)', fontSize: 12 }}>Processing Task Name</div>
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
