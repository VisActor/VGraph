# Task Instance Lineage Solution

InstanceLineageGraph is a task instance lineage graph component, an out-of-the-box solution designed for task instance lineage scenarios. It has been implemented in scenes like dorado instance DAG. This component supports two display forms: [Common Mode](/vgraph/demo/solutions/commonInst) and [Stats Mode](/vgraph/demo/solutions/statsInst), corresponding to relationship viewing and impact analysis scenarios. This is a pure JS component, imported as follows:
```javascript
import { InstanceLineageGraph } from '@visactor/vgraph';

const graph = new InstanceLineageGraph(options);

```

### Configuration Options

| Field | Type | Description |
| --- | --- | --- |
| data | GraphStructure | The task lineage component accepts data of type GraphStructure, with a structure roughly like { nodes, edges }. For more details on the structure, see [GraphStructure](/vgraph/guide/data-structure#GraphStructure-Data-Structure). |
| container | string | The id of the graph container dom. |
| size | number[] | The size of the graph container, `size:[800, 600]` means the container is 800px wide and 600px high. |
| baseNodeId | string | The id of the main instance node. |
| mode | 'COMMON' \| 'STATS' | COMMON: Common mode <br> STATS: Stats mode |
| nodeSep | number | The distance between adjacent nodes in the layout. Default is 20. It is recommended to be greater than half the node height for proper display of self-loops and other relationships. |
| rankSep | number | The distance between two layers of nodes in the layout. Default is 50. |
| minRatio | number | The minimum zoom ratio of the graph. |
| maxRatio | number | The maximum zoom ratio of the graph. |
| onClickNode | (nodeData: any) => void | The click event for a node. |
| maxChildCount | number | [Common Mode] The maximum number of detail nodes to display under a parent node at the same level. If this number is exceeded, a stats node will be displayed. |
| onClickClusterNode | (showedIds: string[], childrenIds: string[], clusterData: any) => void | [Common Mode] Event to quickly expand a certain category of nodes in a stats node. <br>showedIds: ids of expanded nodes <br> childrenIds: ids of all collapsed nodes <br> clusterData: cluster node data |
| onShowNodesFromCluster | (clusterData: any, idsToShow: string[], showedIds: string[]) => void | [Common Mode] Event to quickly expand a certain category of nodes in a stats node. <br> clusterData: cluster node data <br>idsToShow: ids of nodes to be expanded <br>showedIds: ids of expanded nodes |
| display | 'ALL' \| 'RANKS' | [Stats Mode] Display mode. <br> ALL: All nodes are counted together <br> RANKS: Nodes are counted by layer |
| setGroupData | (nodeData: any) => string \| { value: string, color: string } | [Stats Mode] Specify the data dimension for grouping, where `color` is the theme color of the node. |
| onExpandStatsGroup | (nodeIds: string[]) => void; | [Stats Mode] Event to expand a single stats node. `nodeIds`: The instance ids included in this stats node. |
| renderGroupTitle | (groupData: any, layer: Layer, width: number, options: any) => void | [Stats Mode] Customize the style of the stats mode group title. <br>groupData: group data <br> layer: drawing layer, add graphics to this layer <br> width: the length of the group title, varies with the viewport and the number of stats nodes <br> options: all configuration items |
| setNodeStyles | (nodeData: any) => any | Set the default style of the node, can also configure the node type here. |
| setNodeStateStyles | (state: string, nodeData: any, node: Node) => any | Set the style of the node in different states. If using a built-in node, the return value can be configured here directly. |

### Instance Methods
| Instance Method | Return Value | Description |
| --- | --- | --- |
| changeMode(mode: 'COMMON' \| 'STATS' ) | void | Switch the graph mode. |
| updateOption(k:string, v: any) | void | Update the graph configuration. |
| setData(data: GraphStructure) | void | Reset the data in the graph. |
| expandNode(parentId: string, nodes: nodeData[], edges: [], type: 'UPSTREAM' \| 'DOWNSTREAM',) | void | Expand a node. <br> parentId: parent node id <br> nodes: expanded node data, same data structure as node in GraphStructure <br> edges: relationship between expanded nodes, same data structure as edge in GraphStructure <br> type: expand UPSTREAM or DOWNSTREAM |
| collapseNode(nodeId: string, direction: 'DOWNSTREAM' \| 'UPSTREAM') | void | Collapse all upstream and downstream of the node with id `nodeId`. |
| hideNode(nodeId: string) | void | Hide a node, which will also hide all its child nodes. |
| showNodesFromCluster(clusterId: string, nodeIds: string[]) | void | Expand detail nodes from a cluster node. |
| focusNode(nodeId: string) | void | Display the specified node in the center of the viewport. |
| getGraph() | Graph | Get the Graph instance corresponding to the solution. |
| destroy() | void | Destroy the graph. |

### Built-in Nodes
**Note: Due to information security needs, versions after 1.3.6 no longer have built-in status image links for nodes. Please use the register method for configuration, or configure it to any type of node. For the latest access method, see [Task Instance Lineage - Common Mode](/vgraph/demo/solutions/commonInst).**

To meet the needs of more scenarios, InstanceLineage does not specify node types but provides recommended node registration methods for reuse. Users can also register nodes that better fit their business scenarios and set the `type` in the `setNodeStyles` configuration item to the name of the registered node. The recommended node registration methods are as follows:

```javascript
import { registerInstanceNode, registerClusterNode } from '@visactor/vgraph';
// Automatically generate a function for updating node status display based on configuration items, recommended to be configured on the component's setNodeStateStyles.
const setNodeStateStyleFn = registerInstanceNode(options);
registerClusterNode(graphStructure, {
  // Image resource for the arrow on the right of the aggregation details
  arrowImg: IMG_URL
});
```

The configuration items for each part are as follows:

| Field | Type | Description |
| --- | --- | --- |
| expandImgUrl | string | Image link for the expand/collapse node upstream/downstream icon. |
| collapseImgUrl | string | Image link for the collapse node upstream/downstream icon. |
| setDefaultNode | (nodeData: any) => { bkg: string; text: string; icon: string; } | Return different node styles based on node data, where `bkg` represents the title background color, `text` is the text color, and `icon` is the image link before the title. |
| setHighlightNode | (nodeData: any) => { color: string; icon: string; } | Return different highlighted node styles based on node data, where `color` is the title background color when highlighted, and `icon` is the image link before the title text. |
