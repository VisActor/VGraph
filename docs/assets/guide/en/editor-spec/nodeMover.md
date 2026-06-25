# NodeMover

NodeMover is a node editing component in vGraph suitable for graph editing scenarios, used for dragging nodes on the graph. Compared to the [dragNode interaction behavior](/vgraph/guide/behaviors#dragNode), NodeMover is more suitable for graph editing scenarios. After configuring the [Stack](/vgraph/guide/editor-spec/stack) and [Router](/vgraph/guide/editor-spec/router) components, the NodeMover component will complete the relevant logic of the operation stack during the process of dragging nodes to support undo and redo, as well as automatically updating the intelligent routing paths of related edges.

The following is an example of how to use the NodeMover component. You can also experience it in the demo.

```javascript
import { Graph, NodeMover } from "@visactor/vgraph";
const nodeMover = new NodeMover(graph, {
	stack,
	router,
	...
})
```

## Configuration Items

`NodeMoverOptions` is defined as follows:

| Field | Type | Description |
| --- | --- | --- |
| group | boolean | Whether to allow moving groups, default is false. |
| stack | Stack | Operation stack instance. Used by the component to complete the relevant logic of the operation stack during the process of dragging nodes to support undo and redo. If not passed in, the node drag operation cannot be undone and redone. |
| router | Router | Intelligent routing component instance. Used by the component to automatically update the intelligent routing path during the process of dragging nodes. |
| snapline | boolean \| {styles?: Record<string, any>;} | Default is off. Whether to enable alignment lines. `styles` can configure the style of the alignment lines, you can refer to the [Path](/vgraph/guide/shape-spec/path) style. |
| autoTranslate | boolean | Enabled by default. When enabled, dragging to the view boundary will automatically pan the canvas to expand the view boundary. |
| alignGrid | boolean | Enabled by default. When enabled, the coordinates of the dragged node will be moved in integer multiples of the grid size. |
| debounce | boolean | Default is off. Whether to enable debouncing for route updates. When the moved node involves many edges, the route update of the edges may be time-consuming. Enabling the debounce configuration can help users focus on dragging nodes and avoid frequent calculation of edge routes causing lag. |
| shouldTrigger | (e: GraphEvent, shape?: Shape) =>boolean | Determine whether the node is currently in a draggable state. When the group application accesses both NodeMover and EdgeEditor at the same time, it can be judged whether to trigger the move node based on the element that triggers the event. |
| shouldDrop | (e: GraphEvent, target?: Node) =>boolean | Determine whether the node can be dropped at this time. If it cannot be dropped, it will revert to the initial state. |
| onDragStart | (target: Node\|Group, e: GraphEvent) =>void | The callback function when the drag starts. |
| onDragEnter | (target: Node\|Group, e: GraphEvent) =>void | The callback function triggered when dragging into another node. |
| onDragLeave | (target: Node\|Group, e: GraphEvent) =>void | The callback function triggered when dragging away from another node. |
| onDrag | (target: Node\|Group, offsetX: number, offsetY: number) =>void | The callback function triggered each time it is moved during dragging. |
| onDrop | (target: Node\|Group) =>void | The callback triggered after placement. |
| onDropFail | (target: Node\|Group) =>void | The callback triggered when placement fails. |
| getLimitBox | (target: Node) => { left: number, top: number, width: number, height: number } | Limit the movement range of the current node. For effects and usage, please refer to [Directed Graph Free Editing - Limit Group Movement](/vgraph/demo/editor/commonFlowEditorLimitGroup). |

## Instance Methods

| Instance Method | Return Value | Description |
| --- | --- | --- |
| enable() | void | Enable the component. |
| disable() | void | Disable the component. |
