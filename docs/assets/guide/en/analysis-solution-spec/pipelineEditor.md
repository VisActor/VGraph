# Pipeline - Editor Mode

PipelineEditor is a process orchestration tool built with vgraph, commonly used for arranging workflows. It has been implemented in scenes like Dorado project management pipelines. This is a pure JS component, imported as follows:
```javascript
import { PipelineEditor } from '@visactor/vgraph';

const pipelineEditor = new PipelineEditor(options);

```

### Configuration Options

| Field | Type | Description |
| --- | --- | --- |
| data | { nodes: Record<string,unknown>[], edges: Record<string,unknown>[] } | Data in the graph. If empty, you can directly call `pipelineEditor.initEmptyEditor()`. |
| container | string \| HTMLDivElement | [Required] The pipeline container. |
| graphSize | number[] | [Required] The container size, in the format `[width, height]`. |
| nodeSize | number[] | The node size, in the format `[width, height]`. |
| layout | object | Layout settings. |
| layout.rankSep | number | The spacing between nodes in different columns. |
| layout.nodeSep | number | The spacing between nodes in the same column. |
| padding | number[] | The padding on four sides, in the format `[top/bottom padding, left/right padding]`. |
| setDefaultNode | (nodeData: Record<string,unknown>) => Record<string,unknown> | Set the default node style, usage is the same as Graph's `setDefaultNode`. |
| setDefaultEdge | (edgeData: Record<string,unknown>) => Record<string,unknown> | Set the default edge style, usage is the same as Graph's `setDefaultEdge`. |
| setNodeStateStyles | (state: string, nodeData: Record<string,unknown>, node: Node) | Configure the state style based on the node's state, used with `node.setState`, usage is the same as Graph's `setNodeStateStyles`. |
| setEdgeStateStyles | (state: string, edgeData: Record<string,unknown>, edge: Edge) | Configure the state style based on the edge's state, used with `edge.setState`, usage is the same as Graph's `setEdgeStateStyles`. |
| onClickNode | (node: Node, e: GraphEvent) => void | The click event for a node. |
| shouldDrag | (e: GraphEvent, target: Node) => boolean | Whether to allow dragging the current node. |
| shouldDrop | (ev: GraphEvent, target: Node, relativeNode: Node, pos: 'L' \| 'M' \| 'R') => boolean | Whether to allow dropping the node at the current position. If false, the node returns to its original position. |
| onDropNode | (target: Node) => void | The event for when a node drag is completed. |


### Instance Methods
| Instance Method | Return Value | Description |
| --- | --- | --- |
| addNode | (relativeId: string, pos: 'L' \| 'M' \| 'R') | Add a node at a position relative to the node with id `relativeId`. L: left, M: bottom, R: right. |
| removeNode | (node: Node) => void | Remove a node. |
| moveNode | (node: Node, relativeNode: Node, pos: 'L' \| 'M' \| 'R') => void | Move a node to a position relative to another node. |
| updateNode | (node: Node, configs: Record<string,any>) => void | Update node data. |
| focusNode | (node: Node) => void; | Highlight and display a node. |
| exportData | (fn?: (entity: Node \| Edge, type: 'node' \| 'edge') => Record<string,any>) => { nodes: Record<string,unknown>[], edges: Record<string,unknown>[] } | Export the data in the graph. |
| getGraph | Graph | Get the Graph instance corresponding to the solution. |


### Built-in Nodes
To meet the needs of more scenarios, `pipelineEditor` does not specify node types, but provides recommended node registration methods for reuse. Users can also register nodes that better fit their business scenarios and set the `type` in the `setDefaultNode` configuration item to the name of the registered node. The recommended node registration method is as follows:

```javascript
import { registerPipelineEditorNode } from '@visactor/vgraph';
registerPipelineEditorNode(options);
```

<img src="/vgraph/guide/node/pipeline_editor_node.png" width="300">

The configuration items for each part are as follows:

| Field | Type | Description |
| --- | --- | --- |
| addImage | string | The cdn of the image for the add node icon. |
| onClickImage | (e: ShapeEvent, nodeData: any) | The event for when a user clicks the add icon. |
| errorImage | string | The cdn of the image for the node error icon, which appears when the `error` parameter in the node data is true. |


The node fields used by the built-in nodes are as follows:


| Field | Type | Description |
| --- | --- | --- |
| label | string | The node name. |
| error | boolean | If true, an error image is displayed after the node name. |
