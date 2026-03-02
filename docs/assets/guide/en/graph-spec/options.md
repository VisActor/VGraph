# Graph Configuration

The Graph accepts data in a node-edge-group structure (see the [Data Structure](/vgraph/guide/data-structure) section for details) and is typically used for displaying and analyzing directed graphs, force-directed graphs, and network graphs. The general usage is as follows:

```typescript
import { Graph } from '@visactor/vgraph';

const graph = new Graph(options);  // Graph configuration options
graph.data(someData);              // Write data, which will generally render the result directly
```

## Configuration Options

| Field | Type | Description |
| --- | --- | --- |
| container | DOMNode \| string | \[Required] The graph container, which can be a DOM node or the ID of a DOM. |
| width | number | \[Required] Sets the graph width. |
| height | number | \[Required] Sets the graph height. |
| renderMode | 'canvas' \| 'dom' | \[NEW] Specifies whether to use canvas or an external DOM component to render nodes. Defaults to `canvas`. Used with vgraph-react or vgraph-vue. |
| layout | { type: string, options: LayoutOptions } \| LayoutBase | \[NEW] Specifies the graph layout type and custom configuration options, or directly passes a layout instance to specify the graph layout. See "Layout" for layout types and configuration options. |
| autoLayout | boolean | \[NEW] Automatic layout switch, on by default. When on, the layout will automatically refresh after adding, deleting, or modifying nodes using graph methods. It is recommended to temporarily turn this off for batch additions, deletions, or modifications to improve performance. |
| setDefaultNode | (nodeData) => NodeConfigs | Batch sets the configuration of nodes in the graph. See [Node Configuration Options](/vgraph/guide/node-spec/options) for specific configuration items. |
| setNodeStateStyles | (state: string, nodeData: any, node: Node) => keyShapeStyles | Sets the style of the node's keyShape in a specific state. |
| setDefaultEdge | (edgeData) => StateConfigs | Batch sets the configuration of edges in the graph. See [Edge Configuration Options](/vgraph/guide/edge-spec/options) for specific configuration items. |
| setEdgeStateStyles | (state:string, edgeData: any, edge: Edge) => keyShapeStyles | Sets the style of the edge's keyShape in a specific state. |
| setDefaultGroup | (groupData) => GroupConfigs | Batch sets the configuration of groups in the graph. See [Group Configuration Options](/vgraph/guide/group-spec/options) for specific configuration items. |
| setGroupStateStyles | (state: string, groupData: any, group: Group) => keyShapeStyles | Sets the style of the group's keyShape in a specific state. |
| padding | number \| number[] | Specifies the padding at the edge of the graph, used for situations like viewport adaptation. |
| minRatio | number | Specifies the minimum zoom ratio of the graph. |
| maxRatio | number | Specifies the maximum zoom ratio of the graph. |
| autoDraw | boolean | Whether to automatically redraw after updating graph settings or calling instance methods. Defaults to true. When performing batch operations, setting this to false first and then actively drawing after the operations can provide better performance. |
| linkCenter | boolean | Whether the edge directly connects to the center of the node. Defaults to false. Batch calculating the connection points of edges has a certain cost. If there are no requirements for the connection points of nodes and edges (no Anchor is set) and when the nodes are opaque, setting this to true can improve performance. |
| throwError | boolean | Whether to throw exceptions directly, defaults to true. If in a production environment, or if you believe some exceptions can be tolerated, you can set this to false. In that case, exception information will be reminded in the form of `console.error`. |

## setDefault[Node | Edge | Group]
Typically, after the front end obtains the original data through a request, it needs to traverse and write the configuration for the corresponding instances. Therefore, we provide the shortcut method `setDefault[Node | Edge | Group]` for configuration. The advantage of this is that if there are subsequent data additions or modifications, vGraph can directly get the corresponding configuration and apply it through the corresponding method. It is recommended to use this method to configure each instance. Taking nodes as an example, the configuration priority is:

```
Original data configuration > setDefaultNode configuration > vGraph default configuration
```

## set[Node | Edge | Group]StateStyles
vGraph provides a state mechanism for common micro-interaction responses in graphs. It is recommended to use the state mechanism to quickly implement simple hover, highlight, and disable states. For a detailed introduction, please see [State Management](/vgraph/guide/states).
