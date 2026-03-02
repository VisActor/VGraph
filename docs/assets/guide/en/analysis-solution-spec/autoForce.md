# Smart Layout Relationship Graph

AutoForceGraph is a smart layout relationship graph component, an out-of-the-box solution designed for relationship network scenarios. It has been implemented in scenes like ByteGraph online query visualization. This is a pure JS component, imported as follows:
```javascript
import { AutoForceGraph } from '@visactor/vgraph';

const graph = new AutoForceGraph(options);

```

### Configuration Options

| Field | Type | Description |
| --- | --- | --- |
| data | { nodes: \[{ \[id: string\]: any }\], edges: \[{ source: string, target: string, \[k:string\]: any }\] } | This relationship graph component accepts data of type { nodes, edges }. For more details on the structure, see [Data Structure](/vgraph/guide/data-structure). |
| container | string | The id of the graph container dom. |
| size | number[] | The size of the graph container, `size:[800, 600]` means the container is 800px wide and 600px high. |
| maxShowEdgeCount | number | The number of graph elements at which edges will be automatically hidden. Default is 7000. |
| forceEdgeVisibility | boolean | Force show/hide edges on initialization. |
| triggerRelation | 'hover' \| 'click' | The interaction to trigger relationship highlighting. Default is hover. |
| nodeTypeKey | string | A data item key of the node, used as a basis for node classification. |
| edgeTypeKey | string | A data item key of the edge, used as a basis for edge classification. |
| theme | { nodes: string[], edges: string[] } | The color theme for nodes and edges. |
| setDefaultNode | (nodeData: { \[id: string\]: any }) => { \[key: string\]: any } | Customize the default style of the node. The default is a circle with a diameter of 15, with color determined by the node classification. You can override the circle size, add text labels, etc. here. |
| setNodeLabel | (nodeData: { \[id: string\]: any }) => string | Specify the text label content for the node. Returning an empty string means no text label will be displayed. Can be switched in real-time via `updateOption`. |
| setNodeStateStyles | (state: string, <br>nodeData: { \[id: string\]: any },<br> node: Node) => { \[key: string\]: any } | Customize the style of the node under different states. States can be click, hover, and blur. |
| setDefaultEdge | (edgeData: { source: string, target: string, \[k:string\]: any }) => { \[key: string\]: any } | Customize the default style of the edge. The default is a 1px straight line, with color determined by the edge classification. |
| setEdgeStateStyles | (state: string, <br>edgeData: { source: string, target: string, \[k:string\]: any },<br> edge: Edge) => { \[key: string\]: any } | Customize the style of the edge under different states. States can be active or blur. |

### Instance Methods
| Instance Method | Return Value | Description |
| --- | --- | --- |
| updateOption(k:string, v: any) | void | Update the graph configuration. |
| setData(data: { nodes: \[{ \[id: string\]: any }\], edges: \[{ source: string, target: string, \[k:string\]: any }\] }, layout?: boolean) | void | Reset the data in the graph, with the same structure as the data in the configuration. By default, the layout is re-calculated after setting the data. You can set layout to false to draw directly. |
| getGraph() | Graph | Get the Graph instance corresponding to the solution. |
| expandNode: (parent: Node, data: { nodes: NodeData[], edges: EdgeData[] }, layout?: boolean) | void | Expand the adjacent nodes of the parent node. `data` is the relationship data of the adjacent nodes, with the same structure as `data`. `layout` indicates whether to re-layout, which is done by default. |
| collapseNode: (node: Node, layout?: boolean) | void | Collapse the adjacent nodes that were expanded from the `node`. `layout` indicates whether to re-layout, which is done by default. |
| destroy() | void | Destroy the graph. |
