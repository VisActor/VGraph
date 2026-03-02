# Graph Instance Methods
After creating a Graph instance, you can apply the following API to flexibly build graph analysis applications.

## Data Operations
| Instance Method | Return Value | Description |
| --- | --- | --- |
| data(data: DataStructure) | void | Sets the data. If there is existing data, it will be replaced. |
| updateData(data: DataStructure) | void | Updates the data, including adding, deleting, and modifying elements, as well as their positions and properties. If there is existing data, a merge operation will be performed. |
| updatePositions(data?: DataStructure) | void | Updates the positions of all elements without changing their properties. Suitable for layout updates, full-graph animations, etc. If data is passed, it will only update the positions of elements based on the passed data, without adding, deleting, or modifying them. |
| refresh() | void | If the graph only contains nodes and edges, and the node data has been directly modified, this method can be used to further improve the performance of updating instance positions. |
| clear() | void | Clears the data. |
| layout(id?: string, args?: LayoutOptions) | void | \[NEW] Refreshes the layout. You can configure an ID to fix node positions and maintain a stable viewport for an optimized experience after the layout refresh. You can pass `args` as configuration items for a single layout. Supports declarative layout. If you instantiate the layout configuration yourself, please use `graph.set('layout', layoutInstance)` to use this method. |

## Instance Operations
| Instance Method | Return Value | Description |
| --- | --- | --- |
| add(type: 'node' \| 'edge' \| 'group', configs: any) | Entity | Adds a single instance based on the configuration. See the configuration items for each instance for details. Returns the newly added instance. |
| update(entity: Node \| Edge \| Group, configs: any) | void | Updates the configuration of a single instance. |
| remove(entity: Node \| Edge \| Group) | void | Deletes an instance. This method will also delete the corresponding data for the instance. Deleting a Group will not delete all node instances under the Group. |
| getNodeById(id: string) | Node \| undefined | Gets a node instance by its ID. Returns `undefined` if not found. |
| getNodes() | Node[] | Gets all node instances in the Graph. Returns an array of node instances. |
| getEdgeById(id: string) | Edge \| undefined | Gets an edge instance by its ID. Returns `undefined` if not found. |
| getEdges() | Edge[] | Gets all edge instances in the Graph. Returns an array of edge instances. |
| getGroupById(id: string) | Group \| undefined | Gets a group instance by its ID. Returns `undefined` if not found. |
| getGroups() | Group[] | Gets all group instances in the Graph. Returns an array of group instances. |
| destroy() | void | Destroys the Graph instance, clearing all data and removing the canvas. |

## Rendering Operations
By default, `autoDraw = true`. Calling any instance method will directly trigger a redraw, resulting in a view change. Therefore, it is recommended to disable `autoDraw` during batch operations for better performance.

| Instance Method | Return Value | Description |
| --- | --- | --- |
| updateRenderMode(mode: 'canvas' \| 'dom') | void | Updates the rendering mode of the nodes. |
| autoDraw() | void | Determines whether to redraw based on the `autoDraw` configuration item. |
| draw() | void | Redraws directly. |
| animate() | string | vGraph encapsulates a series of out-of-the-box animations. See [Animation](/vgraph/guide/animate) for details. |
| stopAnimate(id?: string) | void | Stops the animation with the specified ID. If the ID is empty, all animations will be stopped. |

## Viewport Operations
| Instance Method | Return Value | Description |
| --- | --- | --- |
| changeSize(width: number, height: number) | void | Adjusts the size of the graph. |
| fitView() | void | Scales and translates the content of the graph according to the configured width and height, and centers the entire graph. Suitable for viewing the entire graph structure. Note: If `minRatio` and `maxRatio` are configured, this range will not be exceeded. |
| alignView(align: 'lt' \| 'ct' \| 'rt' \| 'lc' \| 'cc' \| 'rc' \| 'lb' \| 'cb' \| 'rb') | void | Maintains the current zoom ratio and aligns the content of the graph with the specified direction. l: left; c: center; r: right; t: top; b: bottom. The default is lt. |
| focus(entity: Node \| Edge \| Group, animate?: boolean \| { duration?: number, easing?: string}) | void | Accepts a node, edge, or group instance as an input parameter and moves the current viewport to the center of the instance. The move animation can be configured. When `focus(node, true)` is executed, the default animation effect is performed. The animation duration and effect can be overwritten. |
| getViewCenter() | void | Gets the center of the current viewport, which is related to width, height, and padding. |
| getViewPadding() | number \| number[] | Gets the padding value of the current Graph's edge. |
| translate(x: number, y: number) | void | Translates the viewport horizontally (x) and vertically (y). |
| scale(ratio: number, center?: number[]) | void | Scales the viewport, relative to the current zoom ratio. For example, if the current zoom ratio is 0.5, after `graph.scale(2)`, the zoom ratio will be 1. By default, it scales from the viewport origin (0, 0). You can specify the scaling center `center [x, y]`. |
| setZoomRatio(ratio: number) | void | Scales the viewport from the center of the canvas. When ratio > 1, it zooms in; when ratio < 1, it zooms out. This is an absolute zoom ratio. For example, if the current zoom ratio is 0.5, after `graph.setZoomRatio(2)`, the zoom ratio will be 2. |
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
| enableBehavior(type: string) | void | Enables the specified interaction. |
| disableBehavior(type: string) | void | Disables the specified interaction. |
| getBehavior(type: string) | void | Gets the interaction configuration based on the interaction type. |
| removeBehavior(type: string) | void | Disables and removes an interaction. |
| handleEvent(e: MouseEvent \| TouchEvent) | void | Triggers a native event on the graph. This is mostly used in scenarios where you need elements in the graph to respond when you drag a DOM element into the graph. |

## Export Operations

| Instance Method | Return Value | Description |
| --- | --- | --- |
| getData(fn?:() => entityData) | DataStructure | Exports the current data in the graph. You can pass a function to filter the data to be exported. |
| downloadImage(name?: string, maxWidth?: number, maxHeight?: number, onDownloadFinish?: () => void, backgroundColor?: string) | void | Exports an image. The image size is `maxWidth * maxHeight`, which defaults to the actual size of the graph. `onDownloadFinish` is the callback for when the export is complete. `backgroundColor` is the custom background color of the graph, which is transparent by default. |
| downloadImageWithImageCheck({name?: string, maxWidth?: number, maxHeight?: number, maxWaitTime?: number, onDownloadFinish?: (failImageUrls: string[]) => void, backgroundColor?: string}) | void | Waits for the images in the graph to finish loading before exporting the image, waiting for a maximum of `maxWaitTime` ms. The image size is `maxWidth * maxHeight`, which defaults to the actual size of the graph. `onDownloadFinish` is the callback for when the export is complete. `backgroundColor` is the custom background color of the graph, which is transparent by default. |
|||

**Note** `downloadImage` is only for canvas nodes. For graphs with react and vue nodes, vGraph provides the utility method `resizeToExport` to be used with third-party dom-to-canvas libraries for exporting.
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
