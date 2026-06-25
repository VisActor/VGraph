# Tree Graph Instance Methods
After creating a TreeGraph instance, you can apply the following API to flexibly build graph analysis applications.

## Data Operations
| Instance Method | Return Value | Description |
| --- | --- | --- |
| data(data: TreeDataStructure) | void | Sets the data. If there is existing data, it will be replaced. |
| updateData(data: TreeDataStructure) | void | Updates the data, including adding, deleting, and modifying elements, as well as their positions and properties. If there is existing data, a merge operation will be performed. |
| updatePositions(data?: DataStructure) | void | Updates the positions of all elements without changing their properties. Suitable for layout updates, full-graph animations, etc. If data is passed, it will only update the positions of elements based on the passed data, without adding, deleting, or modifying them. |
| refresh() | void | If the graph only contains nodes and edges, and the node data has been directly modified, this method can be used to further improve the performance of updating instance positions. |
| getTreeData(fn?:() => {}) | TreeDataStructure | Exports the current graph data in a nested data format. You can pass a function to filter the specific data to be exported. |
| clear() | void | Clears the data. |
| layout(treeData?: TreeData, focus?: Node) | void | \[NEW] Refreshes the layout. By default, it lays out based on the current data, but you can also pass new data. You can configure a `focus` node instance to fix its position and maintain a stable viewport for an optimized experience after the layout refresh. |

## Instance Operations
| Instance Method | Return Value | Description |
| --- | --- | --- |
| expand(node: Node, focusNode?: boolean) | Void | Expands the subtree under the specified node. The corresponding data will be modified to `collapsed = false`. Therefore, you must ensure that the `collapsed` field has no business meaning, otherwise it will be overwritten. Setting `focusNode` will fix the position of the operated node. |
| collapse(node: Node, focusNode?: boolean) | void | Collapses the subtree under the specified node. The corresponding data will be modified to `collapsed = true`. Therefore, you must ensure that the `collapsed` field has no business meaning, otherwise it will be overwritten. Setting `focusNode` will fix the position of the operated node. |
| toggleCollapse(node: Node) | void | Toggles the expand/collapse state of the specified node. |
| addChild(data: any, parent: Node \| string) | Node | Adds a child node or subtree to the specified parent node. See [Node Configuration Options](/vgraph/guide/node-spec/options) for configuration details. Returns the newly added node instance. |
| removeChild(child: Node, parent: Node \| string) | void | Deletes the specified child node or subtree under the parent node. |
| moveNode(node: Node, parent: Node) | void | Moves the specified node `node` under the `parent` node, making it a child of the `parent` node. |
| setLayout(layout: TreeLayout) | void | Updates the tree layout method. |
| getNodeById(id: string) | Node \| undefined | Gets a node instance by its ID. Returns `undefined` if not found. |
| getNodes() | Node[] | Gets all node instances in the Graph. Returns an array of node instances. |
| getEdgeById(id: string) | Edge \| undefined | Gets an edge instance by its ID. Returns `undefined` if not found. |
| getEdges() | Edge[] | Gets all edge instances in the Graph. Returns an array of edge instances. |
| getGroupById(id: string) | Group \| undefined | Gets a group instance by its ID. Returns `undefined` if not found. |
| getGroups() | Group[] | Gets all group instances in the Graph. Returns an array of group instances. |
| destroy() | void | Destroys the TreeGraph instance, clearing all data and removing the canvas. |

## Rendering Operations
By default, `autoDraw = true`. Calling any instance method will directly trigger a redraw, resulting in a view change. Therefore, it is recommended to disable `autoDraw` during batch operations for better performance.

| Instance Method | Return Value | Description |
| --- | --- | --- |
| autoDraw() | void | Determines whether to redraw based on the `autoDraw` configuration item. |
| draw() | void | Redraws directly. |

## Viewport Operations
| Instance Method | Return Value | Description |
| --- | --- | --- |
| changeSize(width: number, height: number) | void | Adjusts the size of the graph. |
| fitView() | void | Scales and translates the content of the graph according to the configured width and height, and centers the entire graph. Suitable for viewing the entire graph structure. Note: If `minRatio` and `maxRatio` are configured, this range will not be exceeded. |
| focus(entity: Node \| Edge \| Group, animate?: boolean \| { duration?: number, easing?: string) | void | Accepts a node, edge, or group instance as an input parameter and moves the current viewport to the center of the instance. The move animation can be configured. When `focus(node, true)` is executed, the default animation effect is performed. The animation duration and effect can be overwritten. |
| getViewCenter() | void | Gets the center of the current viewport, which is related to width, height, and padding. |
| translate(x: number, y: number) | void | Translates the viewport horizontally (x) and vertically (y). |
| scale(ratio: number, center?: number[]) | void | Scales the viewport. When ratio > 1, it zooms in; when ratio < 1, it zooms out. By default, it scales from the viewport origin (0, 0). You can specify the scaling center `center [x, y]`. |
| setZoomRatio(ratio: number) | void | Scales the viewport from the center of the canvas. When ratio > 1, it zooms in; when ratio < 1, it zooms out. |
| getZoomRatio() | number | Gets the current zoom size of the Graph. |

## Coordinate Transformation
Generally, three types of coordinates are converted during graph analysis:
- client: Window coordinates, with the top-left corner of the browser display area as (0, 0).
- viewport: Graph visible area coordinates, with the top-left corner of the graph container as (0, 0).
- canvas: Actual canvas coordinates. When there are no scaling, translation, or other operations, it is consistent with the viewport coordinates.

vGraph provides convenient coordinate conversion methods, which are usually used to determine the clicked canvas position in the event handler, or to position the dom based on the instance's position.

| Instance Method | Return Value | Description |
| --- | --- | --- |
| clientToViewport(clientX: number, clientY: number) | {x: number, y: number} | Converts window coordinates to graph visible area viewport coordinates. |
| clientToCanvas(clientX: number, clientY: number) | {x: number, y: number} | Converts window coordinates to canvas coordinates. |
| canvasToViewport(x: number, y: number) | {x: number, y: number} | Converts canvas coordinates to visible area viewport coordinates. |
| viewportToCanvas(vx: number, vy: number) | {x: number, y: number} | Converts visible area viewport coordinates to canvas coordinates. |

## Configuration Operations
| Instance Method | Return Value | Description |
| --- | --- | --- |
| get(key:string) | any | Gets the current graph configuration item information. |
| set(options: {\[key: string]: any}) | void | Sets the current graph configuration item. Note: This operation will not trigger automatic redrawing. You need to manually call `graph.draw()`. |

## Interaction Operations
Graph interactions are generally achieved by listening to multiple events and giving corresponding responses. vgraph has built-in a series of common interactions. See the [Behaviors](/vgraph/guide/behaviors) section for details.

| Instance Method | Return Value | Description |
| --- | --- | --- |
| addBehavior(Behavior, Options) | void | Enables an interaction based on the configuration item `options`. |
| removeBehavior(Behavior) | void | Disables and removes an interaction. |

## Export Operations

| Instance Method | Return Value | Description |
| --- | --- | --- |
| getData(fn?:() => entityData) | { nodes: NodeData[], edges: EdgeData: [] } | Exports the current data in the graph in a flat manner. You can pass a function to filter the data to be exported. |
| getTreeData(fn?:() => entityData) | TreeData | Exports the current data in the graph in a tree structure. You can pass a function to filter the data to be exported. |
| downloadImage(name?: string, maxWidth?: number, maxHeight?: number, onDownloadFinish?: () => void, backgroundColor?: string) | void | Exports an image. The image size is `maxWidth * maxHeight`, which defaults to the actual size of the graph. `onDownloadFinish` is the callback for when the export is complete. `backgroundColor` is the custom background color of the graph, which is transparent by default. |

**Note** `downloadImage` is only for canvas nodes. For graphs with react nodes, vGraph (>= 1.6.1) provides the utility method `resizeToExport` to be used with third-party dom-to-canvas libraries for exporting.
``` javascript
import domtocanvas from 'third-party-export-lib';
import { Graph, resizeToExport } from '@visactor/vgraph';

const graph = new Graph({ container, ....});
// Viewport information before exporting
const { matrix } = resizeToExport(graph);
// After the view is re-rendered
onDomRendered(() => {
  domtocanvas(container);
  // Restore the viewport information before exporting
  graph.setMatrix(matrix);
  // Restore the original graph size
  graph.changeSize(containerWidth, containerHeight);
});
```
