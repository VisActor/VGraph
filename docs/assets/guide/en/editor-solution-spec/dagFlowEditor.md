# Directed Graph Restricted Editing

Users can easily build a directed graph with simple icon clicks. Although not as flexible as dragging nodes and connecting lines to edit a directed graph, it is more efficient and produces a higher quality directed graph, with less need for post-data verification. It can also be used with the Viewer component, and react nodes can provide more possibilities for display and interaction. vGraph encapsulates the basic functions into a component, which can be referenced as follows:

```javascript
import { DAGFlowEditor } from '@visactor/vgraph';

const editor = new DAGFlowEditor(options);

```

**Note:** In order to ensure the data order of the first layer of nodes, this component will generate a virtual root node with an id of `vgraphDagFlowRoot`. It is recommended to save this data to ensure the order of the nodes when it is opened again after saving.

### Configuration Items

| Field | Type | Description |
|---|---|---|
| data | { nodes: Record<string,unknown>[], edges: Record<string,unknown>[] } | Data in the graph. If empty, you can directly call `pipelineEditor.initEmptyEditor()`. |
| container | string \| HTMLDivElement | [Required] Pipeline container |
| graphSize | number\[] | [Required] Container size, in the format [width, height] |
| padding | number\[] \| number | Padding on all four sides of the canvas |
| layout | object | Layout settings |
| layout.rankDir | 'LR' \| 'TB' | Layout direction, LR is from left to right, TB is from top to bottom |
| layout.rankSep | number | Spacing between nodes in different columns |
| layout.nodeSep | number | Spacing between nodes in the same column |
| layout.edgeSep | number | Distance between nodes and connection lines |
| layout.ignoreControlPoints | boolean | Whether to ignore the control points calculated by the layout, default is false |
| layout.coordAssignment | 'compact' \| 'treeLike' | Node layout method, default is compact. In treeLike layout, the positions of child nodes under different parent nodes will not overlap. Refer to [Tree Editing - React Node](/vgraph/demo/editor/dagTreeEditor) |
| scroller | object | Scrollbar configuration |
| scroller.enable | boolean | Enable or disable the scrollbar |
| scroller.option | object | Scrollbar style configuration items |
| scroller.option.size | number | Adjust the thickness of the scrollbar |
| setDefaultNode | (nodeData: Record<string,unknown>) => Record<string,unknown> | Set the default node style, usage is the same as Graph's `setDefaultNode` |
| setDefaultEdge | (edgeData: Record<string,unknown>) => Record<string,unknown> | Set the default connection line style, usage is the same as Graph's `setDefaultEdge` |
| setNodeStateStyles | (state: string, nodeData: Record<string,unknown>, node: Node) | Configure the state style according to the node's state, used with `node.setState`, usage is the same as Graph's `setNodeStateStyles` |
| setEdgeStateStyles | (state: string, edgeData: Record<string,unknown>, edge: Edge) | Configure the state style according to the connection line's state, used with `edge.setState`, usage is the same as Graph's `setEdgeStateStyles` |
| onClickNode | (node: Node, e: GraphEvent) => void | Node click event |
| onChange | () => void; | Data update event |



### Instance Methods
| Instance Method | Return Value | Description |
|---|---|---|
| addSource | (nodeId: string, configs?: Record<string,unknown>) => void | Add a direct parent node to the node with id `nodeId`. The new node will be selected directly. |
| addTarget | (nodeId: string, configs?: Record<string,unknown>, linkChildren = true) => void | Add a child node to the specified node. By default, the new node will be directly associated with the existing child nodes. You can set `linkChildren` to false to cancel this behavior. The new node will be selected directly. |
| addSiblingBefore | (nodeId: string, configs?: Record<string,unknown>, linkChildren = true) => void | Add a preceding sibling node to the specified node. By default, the new node will inherit the child nodes of the original node. You can set `linkChildren` to false to cancel this behavior. The new node will be selected directly. |
| addSiblingAfter | (nodeId: string, configs?: Record<string,unknown>, linkChildren = true) => void | Add a subsequent sibling node to the specified node. By default, the new node will inherit the child nodes of the original node. You can set `linkChildren` to false to cancel this behavior. The new node will be selected directly. |
| removeNode | (nodeId: string, removeChildren?: boolean) => void; | Delete the specified node. If `removeChildren` is true, the entire subtree with this node as the root will be deleted. |
| moveNode | (nodeId: string, relativeId: string, position: 'siblingBefore' \| 'siblingAfter' \| 'source' \| 'target') => void; | Move the specified node to the specified position relative to the relative node |
| updateNode | (nodeId: string, configs: Record<string,unknown>) => void; | If you have custom operations, you can save the data before and after performing the operation, and use this method to store it in the operation stack to support undo and redo operations. |
| getSnapshot | () => SnapshotData; | Generate a snapshot of the current state of the editor, which is used to implement undo and redo for custom operations in conjunction with batch operations `batchChange`. |
| batchChange | (configs: { formerData: SnapshotData, currentData: SnapshotData }) => void; | If you have custom operations, you can call the instance method `getSnapshot()` before and after performing the operation to save the data, and then use this method to store it in the operation stack to support undo and redo operations. For a usage case, please see [Batch Add Nodes](/vgraph/demo/editor/dagFlowEditorBatch). |
| selectNode | (nodeId: string) => void; | Select the specified node. |
| undo | () => void; | Undo |
| redo | () => void; | Redo |
| expandNode | (nodeId: string) => void; | Expand the downstream of the node |
| collapseNode | (nodeId: string) => void; | Collapse the downstream of the node |
| setData | (data: { nodes: [], edges: [] }) => void; | Write data |
| exportData | (fn?: (entity: Node \| Edge, type: 'node' \| 'edge') => Record<string,any>) => { nodes: Record<string,unknown>\[], edges: Record<string,unknown>\[] } | Export the data in the graph |
| getGraph | Graph | Get the Graph instance corresponding to the solution. |
| getSelectedNode | () => Node \| null | Get the currently selected node. Since operations such as undo and redo may cause frequent addition and deletion of nodes, it is recommended to use this interface every time to get the currently operated node. |
| selectionIntoView | () => void | Pan the canvas to ensure that the currently selected node is in the viewport. |
| changeSize | (width: number, height: number) => void | Update the canvas size. |
| addNode | (edge: Edge, nodeConfigs?: Record<string, any>) => void | Insert a node between the two nodes of the specified connection line. |
| copy | async (node: Node, children = false)=>boolean | Asynchronous function. Copy the specified node. If `children` is true, the entire subtree with this node as the root will be copied. Returns whether the copy was successful. |
| paste | async (node: Node, edgeConfigs?: Record<string, any>)=>boolean | Asynchronous function. Paste the copied node or subtree as a child of the specified node. `edgeConfigs` is the custom connection line attribute configuration for connecting the specified node and the root node in the pasted node. |
