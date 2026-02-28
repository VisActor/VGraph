# Data Structures

In vgraph, we have two types of graphs for two types of data structures:
- **Graph**: For relational data with nodes, edges, and groups, used for creating network graphs, directed acyclic graphs, force-directed graphs, etc.
- **TreeGraph**: For nested relational data, suitable for tree diagrams and mind maps.

## Graph Data Structure
The Graph accepts a data structure of nodes, edges, and groups. The node and edge properties must exist, but can be empty, such as `edges: []`. Group property data is optional. If edge and group data exist, it must be ensured that the source and target nodes of the edges, and the child nodes of the groups, are all defined in `nodes`. To ensure runtime performance, vGraph will directly modify the source data. But don't worry, vGraph provides a method for data export. A minimal data sample with nodes, edges, and groups is as follows:
```js
const graphData = {
  // Node data. `id` is the unique identifier of the node and cannot be empty. `groupId` specifies the group to which the node directly belongs.
  nodes: [{
    id: 'node1',
    groupId: 'group1',
  }, {
    id: 'node2',
    groupId: 'group2',
  }],
  // Edge data. `source` and `target` are the ids of the source and target nodes.
  edges: [{
    source: 'node1',
    edge: 'node2',
  }],
  // Group data. `id` is the unique identifier of the group and cannot be empty.
  groups: [{
    id: 'group1',
  }, {
    id: 'group2',
  }],
};
```

## TreeGraph Data Structure
The TreeGraph accepts a nested data structure. Since the nested relationship between nodes itself represents the connection, there is no need to specify `edges`. The following is a minimal data sample:
```js
const treeGraphData = {
  // `id` is still the unique identifier of the node and cannot be empty.
  id: 'root',
  // `children` contains the directly related node data.
  children: [{
    id: 'child1',
    children: [{
      id: 'leaf1',
    }, {
      id: 'leaf2',
    }],
  }, {
    id: 'leaf3',
  }],
};
```


## GraphStructure Data Structure
The scene solutions and graph algorithms in vGraph both accept `GraphStructure` as data input. Generally, the process of developing a graph product is **raw data input** -> **algorithm preprocessing (pruning, filtering, clustering, etc.)** -> **layout** -> **display**. Many of the scenarios we face have a large amount of data, so it is obviously inappropriate to directly pour data into the graph instance and then do various processing. For performance considerations, we want to directly use some intermediate results from preprocessing in the layout and graph to accelerate subsequent calculations and initialization. Therefore, the `GraphStructure` data structure was designed.
### Configuration Items
By default, the Graph assumes that all nodes have an `id`, and the source and target of the edges are specified by `id`. The following configuration items can be used for conversion.

| Field | Type | Description |
| --- | --- | --- |
| directed | boolean | Whether it is a directed graph. |
| nodes | NodeStructure[] | Raw node data. |
| edges | EdgeStructure[] | Raw edge data. |
| groups | GroupStructure[] | Raw group data. |
| getNodeId | (nodeData: any) => string | Specify the node id. Not required if `id` already exists in the raw node data. |
| getEdgeSource | (edgeData: any) => string | Specify the source of the edge. Not required if the `source` field exists in the edge and points to the node's id. |
| getEdgeTarget | (edgeData: any) => string | Specify the target of the edge. Not required if the `target` field exists in the edge and points to the node's id. |
| getGroupData | (groupData: any) => {id: string; children: string\[]; \[key:string]: any; } | Specify the group data. The nodes contained in the group are specified by the `children` field with the node id. |


### Instance Methods
| Instance Method | Return Value | Description |
| --- | --- | --- |
| add(type: 'node' \| 'edge', data: any) | entity | Add a node/edge, returns the entity. |
| remove(entity: any) | void | Remove the entity. |
| getNodes() | NodeStructure[] | Get the array of node entities. |
| getEdges() | EdgeStructure[] | Get the array of edge entities. |
| getEdges() | EdgeStructure[] | Get the array of edge entities. |
| getGroups() | GroupStructure[] | Get the array of group entities. |
| getGroups() | GroupStructure[] | Get the array of group entities. |
| getNodeById(id: string) | NodeStructure \| undefined | Get the corresponding node by id. |
| getGroupById(id: string) | GroupStructure \| undefined | Get the corresponding group by id. |

The usage is as follows:


```javascript
import { GraphStructure } from '@visactor/vgraph';

const graphData = new GraphStructure({
   nodes: data.nodes,
   edges: data.edges,
   getNodeId(nodeData:any) {
       return nodeData.uid;
   }
});

someAlogrithms(graphData);

const data = graphData.getData();
graph.data(data);
```


The elements in `GraphStructure`, `NodeStructure`, `EdgeStructure`, and `GroupStructure`, also correspond to `Node`, `Edge`, and `Group` in `Graph` | `TreeGraph`. Some data acquisition methods are also common, making it very convenient to use `GraphStructure` for data preprocessing.

### NodeStructure
| Instance Method | Return Value | Description |
| --- | --- | --- |
| get(key: string) | any | Get the raw data or attribute of the node. |
| set(key: string) | void | Get the raw data or attribute of the node. |
| getSources() | string[] | Get the source nodes directly connected to the node. |
| getTargets() | string[] | Get the target nodes directly connected to the node. |
| getEdges() | EdgeStructure[] | Get the edge instances directly connected to the node. |
