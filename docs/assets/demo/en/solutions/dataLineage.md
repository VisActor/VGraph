---
category: examples
group: solutions
title: Data Table Lineage - Table View
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/data-lineage.gif
link: demo-spec/dataLineage
option:
---
# Data Table Lineage - Table View

This demo shows a data table lineage view based on vgraph and DataLineageGraph, supporting interactions like filtering, grouping, and searching. The data source is a remote JSON file, using `@visactor/vgraph` and `@visactor/react-vgraph`.

## Key Configurations

- `GraphStructure`: Directed graph structure with nodes/edges.
- `DataLineageGraph`: Table view lineage component, supporting configurations like `baseTableId`, `filter`, `getGroupData`, `getTableContent`, `getGroupTitle`, and `getTaskTooltipContent`.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Popover, Button } from '@arco-design/web-react';
import { GraphStructure } from '@visactor/vgraph';
import { DataLineageGraph } from '@visactor/react-vgraph';
import { insertStyles } from '@visactor/vgraph';

insertStyles(
  `.relation-table-container {
    display: flex;
    align-items: center;
    height: 40px;
    cursor: pointer;
    padding: 8px;
    line-height: 20px;
  }
  .relation-table-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }`,
  'vgraph-demo-dataLineage'
);

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;

function App() {
  const [data, setData] = useState(null);
  const [baseTableId, setBaseTableId] = useState('');
  const [options, setOptions] = useState({
    baseTableId: '',
    filter: null,
    getGroupData: null,
    getGroupWidth(depth, count) {
      return 250;
    },
    onClickTable() {},
    getTableContent(data) {
      return (
        <Popover title={null} content={data.name} triggerProps={{ mouseEnterDelay: 400 }}>
          <div style={{ padding: '8px', lineHeight: '20px' }} className="relation-table-container">
            <div className="relation-table-name">{data.name}</div>
          </div>
        </Popover>
      );
    },
    getGroupTitle(groupData) {
      const depth = groupData.depth;
      if (depth === 0) return 'Main Node';
      let countStr = 'Total';
      let count = groupData.children.length;
      return (
        <div style={{ height: 64 }}>
          <span>{Math.abs(depth)} Level {depth > 0 ? 'Downstream' : 'Upstream'}</span>
          <span style={{ float: 'right', color: 'rgba(20, 20, 20, 0.65)', fontWeight: 'normal' }}>
            {countStr} <b style={{ color: 'rgba(20, 20, 20, 0.9)' }}>{count}</b> items
          </span>
        </div>
      );
    },
    getTaskTooltipContent(data) {
      return data.edges.map(function(task) {
        return <div key={task.id} className="data-lineage-tooltip-list">{task.name}</div>;
      });
    }
  });

  useEffect(function() {
    const url = 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/DataLineage.json';
    fetch(url)
      .then(function(res) { return res.json(); })
      .then(function(raw) {
        setBaseTableId(raw.baseTableId);
        const graphData = new GraphStructure({
          directed: true,
          nodes: raw.nodes,
          edges: raw.edges
        });
        setData(graphData);
        setOptions(function(prev) {
          return Object.assign({}, prev, { baseTableId: raw.baseTableId });
        });
      });
  }, []);

  useEffect(function() {
    if (!baseTableId) return;
    setOptions(function(prev) {
      return Object.assign({}, prev, { baseTableId: baseTableId });
    });
  }, [baseTableId]);

  function toggleFilter() {
    setOptions(function(prev) {
      return Object.assign({}, prev, {
        filter: prev.filter ? null : { type: 'type', value: ['ProjectCTask'] }
      });
    });
  }

  function toggleGroup() {
    setOptions(function(prev) {
      return Object.assign({}, prev, {
        getGroupData: prev.getGroupData ? null : function(tableData) { return tableData.department; }
      });
    });
  }

  function searchItem() {
    setOptions(function(prev) {
      return Object.assign({}, prev, {
        search: function(nodeData) {
          return nodeData.get('name') === 'random.table0.39944191490440284';
        }
      });
    });
  }

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <div>
        <Button onClick={toggleFilter} style={{ marginRight: 12 }}>
          {options.filter ? 'Clear Filter' : 'Filter'}
        </Button>
        <Button onClick={toggleGroup} style={{ marginRight: 12 }}>
          {options.getGroupData ? 'Ungroup' : 'Group'}
        </Button>
        <Button onClick={searchItem}>Search</Button>
      </div>
      <div style={{ width: width, height: height - 40, marginTop: 8 }}>
        <DataLineageGraph
          data={data}
          options={Object.assign({}, options, { baseTableId: baseTableId || options.baseTableId })}
          size={[width, height - 20]}
          minDepth={-2}
          maxDepth={2}
          details={[]}
        />
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
