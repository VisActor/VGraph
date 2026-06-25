# EdgeEditor

EdgeEditor is an edge editing component in vGraph suitable for graph editing scenarios, used for operations such as dragging and adding new edges from anchor points, and modifying edge endpoints. After configuring the [Stack](docs/) and [Router](docs/) components, the EdgeEditor component will complete the relevant logic of the operation stack during the process of dragging edge anchor points to support undo and redo, as well as automatically updating the intelligent routing paths of related edges.

The following is an example of how to use the EdgeEditor component. You can also experience it in the demo.

```javascript
import { Graph, EdgeEditor } from "@visactor/vgraph";
const edgeEditor = new EdgeEditor(graph, {
	stack,
	router,
	...
})
```

## Configuration Items

`EdgeEditorOptions` is defined as follows.

| Field | Type | Description |
| --- | --- | --- |
| stack | Stack | Operation stack instance. Used by the component to complete the relevant logic of the operation stack during the process of dragging anchor point edges to support undo and redo. If not passed in, data changes caused by node dragging will not enter the operation stack. |
| router | Router | Intelligent routing component instance. Used by the component to automatically update the intelligent routing path during the process of dragging anchor point edges. |
| autoTranslate | boolean | Enabled by default. When enabled, dragging to the view boundary will automatically pan the canvas to expand the view boundary. |
| tempEdgeStyles | Record<string, any> | The style of the temporary edge during the drag process. The default is a blue dashed line, i.e., { strokeStyle: '#3073F2', lineDash: \[4, 4] }. |
| editTerminal | boolean | Whether the endpoints of the edge can be edited. The default is true. When enabled, users can select an edge and drag its two endpoints to edit the edge. |
| dragEdgeToEdit | boolean | Whether to allow dragging the edge directly to edit the node. This needs to be used in conjunction with `editTerminal`. |
| editAnchorStyles | Record<string, any> | The style of the anchor points at both ends of the edge when it is in the edge editing state. You can refer to the [Circle](/vgraph/guide/shape-spec/circle) style. |
| magnet | boolean | Whether to automatically snap to anchor points. |
| magnetDist | number | The effective distance for automatically snapping to anchor points. The default is 28px. |
| magnetAnchorStyles | Record<string, any> | The style of the snapped anchor point. You can refer to the [Circle](/vgraph/guide/shape-spec/circle) style. |
| shouldTrigger | (e: GraphEvent, shape: Shape, target: Node, edge?: Edge) =>boolean | A function to determine whether it can be triggered. |
| shouldMagnet | (source: Node, target: Node, anchor: AnchorConfigs) =>boolean | A function to determine whether it can be snapped. |
| shouldDrop | (source: Node, target: Node, sourceAnchor: number, targetAnchor: number, edit: boolean) =>boolean | A function to determine whether it can be dropped. |
| onDragStart | (node: Node, e: GraphEvent) =>void | A function triggered when the drag starts. |
| onDragEnter | (node: Node, e: GraphEvent) =>void | A function triggered when passing through a node during the drag process. |
| onDragLeave | (node: Node, e: GraphEvent) =>void | A function triggered when leaving a node during the drag process. |
| onDrag | () =>void | A function triggered when the mouse is moved during the drag process. |
| onDrop | (source: Node, target: Node) =>void | A function triggered after a successful drop. |
| showAnchors | (anchorConfigs: AnchorConfigs, anchorShape?: Layer, node: Node) =>boolean | Which anchor points should be displayed during the drag process (generally means connectable). For example, if the business only allows connecting from the output anchor point of a node to the input anchor point of another node, you can use this method to hide all output anchor points. |

## Instance Methods

| Instance Method | Return Value | Description |
| --- | --- | --- |
| enable() | void | Enable the component. |
| disable() | void | Disable the component. |
| destroy() | void | Destroy the component. |
