# Pipeline - Reader Mode

PipelineReader is a process orchestration tool built with vgraph, commonly used for arranging workflows. It has been implemented in scenes like Dorado project management pipelines. This is a pure JS component, imported as follows:
```javascript
import { PipelineReader } from '@visactor/vgraph';

const pipelineReader = new PipelineReader(options);

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



### Instance Methods
| Instance Method | Return Value | Description |
| --- | --- | --- |
| updateNode | (node: Node, configs: Record<string,any>) => void | Update node data. |
| focusNode | (node: Node) => void; | Move the node to the center of the viewport. |
| getGraph | Graph | Get the Graph instance corresponding to the solution. |


### Built-in Nodes
To meet the needs of more scenarios, `pipelineReader` does not specify node types, but provides recommended node registration methods for reuse. Users can also register nodes that better fit their business scenarios and set the `type` in the `setDefaultNode` configuration item to the name of the registered node. Recommended registration method:

```javascript
import { registerPipelineReaderNode } from '@visactor/vgraph';
registerPipelineReaderNode(options);
```

**Note:**
- The built-in node will lay out up to two actions from the `actions` field of the node to the bottom right corner of the node. When there are more than two actions, a "more" menu will be added to display more actions in conjunction with the Trigger component.

<img src="/vgraph/guide/node/pipeline_reader_node.png" width="300">

The configuration items for registering built-in nodes are as follows:

| Field | Type | Description |
| --- | --- | --- |
| moreIcon | string | The cdn of the image for the "more" node actions icon. |
| maxActionCount | number | The number of actions beyond which they will be hidden and the `moreIcon` will be displayed. |


The node fields used by the built-in nodes are as follows:


| Field | Type | Description |
| --- | --- | --- |
| label | string | The node name. |
| imgUrl | string | The cdn of the image before the node name. |
| duration | string | The duration in the bottom left corner of the node. |
| actions | { name: string, callback: (nodeData: Record<string,unknown>) => void; }[] | The actions in the bottom right corner of the node. |
