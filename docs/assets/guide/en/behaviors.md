# Behaviors

vGraph has carefully polished and accumulated some high-frequency interactions in graph analysis scenarios, which can be referenced and registered to the graph instance as needed. The general usage is as follows:

## panZoom Pan and Zoom
panZoom adapts to the pan and zoom operations of both touchpads and mice. Two-finger panning on a touchpad pans the canvas, while two-finger pinching zooms the canvas. The mouse wheel scrolls to zoom the canvas. This is the most commonly used interactive behavior in graph analysis. Each time a pan or zoom operation is triggered, a `transformed` event is triggered on the graph instance. You can use the `graph.on('transformed', e => {...})` event to update the zoom ratio of the zoom UI with the `graph.getZoomRatio()` method.
<p><img src="/vgraph/guide/pan-zoom.gif" width="400"></p>

```typescript
import { panZoom } from '@visactor/vgraph';

// Add pan and zoom interaction
graph.addBehavior(panZoom, { ...options });
// Remove interaction
graph.removeBehavior(panZoom);
```


| Configuration Item | Type | Description |
| --- | --- | --- |
| sensitivity | number | Zoom sensitivity, default is 2. The larger the value, the larger the zoom ratio. |
| keyShapeOnly | boolean | Whether to only display key shapes during pan and zoom. It is recommended to enable this when the data volume is large. |
| showKeyShapeDelay | number | The delay (ms) for displaying all shapes after pan and zoom. |
| xOnly | boolean | Only enable horizontal panning. |
| yOnly | boolean | Only enable vertical panning. |
| limit | boolean | Only allow panning in the area with shapes. |
| padding | number | Used with `limit`, allows for a margin in the panning range. |
| zoom | boolean | Whether to allow zooming, default is true. |
| autoPreventDefault | boolean | Whether to automatically prevent the browser's default behavior, such as left swipe to go back. Default is true. Can be used with `shouldTrigger`. |
| shouldTrigger | (evt: WheelEvent, graph: Graph \| TreeGraph) => boolean | Whether to allow the current zoom and pan operation. |





## dragCanvas Drag Canvas
Drag the blank area of the canvas with the mouse to pan the canvas. It is generally used together with panZoom as a supplementary interaction for mouse panning.
<p><img src="/vgraph/guide/drag-canvas.gif" width="400"></p>


```typescript
import { dragCanvas } from '@visactor/vgraph';

// Add mouse drag canvas interaction
graph.addBehavior(dragCanvas, { ...options });
// Remove interaction
graph.removeBehavior(dragCanvas);
```



| Configuration Item | Type | Description |
| --- | --- | --- |
| canvasOnly | boolean | Default `canvasOnly:true`, this interaction is only triggered when dragging the blank canvas. Set to `false` to respond to global dragging. Do not set to `false` if there are other drag operations on nodes or edges. |
| limit | boolean | Only allow panning in the area with shapes. |
| padding | number | Used with `limit`, allows for a margin in the panning range. |

## dragNode Drag Node

Dragging nodes is also a common interaction in graph analysis, often used to allow users to reorganize the structure of the graph.

<p><img src="/vgraph/guide/drag-node.gif" width="400"></p>

```typescript
import { dragNode } from '@visactor/vgraph';

// Add drag node interaction
graph.addBehavior(dragNode, { ...options });
// Remove interaction
graph.removeBehavior(dragNode);
```


| Configuration Item | Type | Description |
| --- | --- | --- |
| delegate | boolean | Default `delegate:true`, a new shape is created for dragging, and the original layout is not changed during the drag process. When `false`, the node itself is dragged directly. The image below shows the effect of `delegate: true`. |
| delegateStyles | Drawing properties, see [rect configuration](/vgraph/guide/shape-spec/rect) for details | Specify the style of the created shape, effective for `delegate:true` configuration. |
| shouldTrigger | (e: GraphEvent, shape: Shape) => boolean | Whether to allow dragging the node. |
| shouldDrop | (e: GraphEvent) => boolean | Whether to allow dropping the node. |
| autoTranslate | boolean | Whether to automatically scroll the canvas when the mouse is dragged to the edge of the viewport. |
| onDragStart | (node: Node, e: GraphEvent) => void | The event for when a node starts to be dragged. |
| onDrag | (node: Node, x: number, y: number) => void | The event for when a node's drag position is updated. |
| onDrop | (node: Node) => void | The event for when a node is dropped. |
| onDragEnter | (node: Node, x: number, y: number) => void | Triggered when the mouse drag point enters the node's range. |
| onDragLeave | (node: Node) => void | Triggered when the mouse drag point leaves the node's range. |
| xOnly | boolean | Only enable horizontal dragging. |
| yOnly | boolean | Only enable vertical dragging. |



## highlightRelations Highlight Relations
Hover/click on a node to highlight its direct neighbors. This, combined with the state of the entities in the graph, can help to view the connections between nodes.
<p><img src="/vgraph/guide/hover-relation.gif" width="400"></p>

```typescript
import { highlightRelations } from '@visactor/vgraph';

// Add highlight related nodes interaction
graph.addBehavior(highlightRelations, { ...options });
// Remove interaction
graph.removeBehavior(highlightRelations);
```



| Configuration Item | Type | Description |
| --- | --- | --- |
| trigger | 'hover' \| 'click' | Default is `hover`. The trigger method for highlighting relationships. |
| activeNodeState | string | Default is `active`. You need to configure the corresponding style change for the `active` state in the graph. |
| activeEdgeState | string | Default is `active`. You need to configure the corresponding style change for the `active` state in the graph. |
| blurNodeState | string | Default is `blur`. You need to configure the corresponding style change for the `blur` state in the graph. |
| blurEdgeState | string | Default is `blur`. You need to configure the corresponding style change for the `blur` state in the graph. |


The following is a simple example of using `highlightRelations` interaction in conjunction with states.
```typescript
import { Graph, highlightRelations } from '@visactor/vgraph';
const graph = new Graph({
    ...
    setNodeStateStyles(state: string) {
      if (state === 'active') {
        return {
          fillStyle: '#dd8452',
        };
      }
      return { opacity: 0.2 };
    },
    setEdgeStateStyles(state: string) {
      if (state === 'active') {
        return {
          strokeStyle: '#55a868',
        };
      }
      return { opacity: 0.2 };
    },
  });
  graph.addBehavior(highlightRelations);
  // Add configuration item `trigger` to switch to click to highlight relationships
  // graph.addBehavior(highlightRelations, { trigger: 'click' });
```



## hideDetails Hide Details
When the zoom ratio of the graph is too small, it is generally believed that users are more concerned with the overall distribution of the data rather than the details of individual nodes. This interaction can highlight the information on the overall structure while hiding the details of the nodes. Combined with the state of the entities in the graph, it can highlight some key information when zooming out.
<p><img src="/vgraph/guide/hide-details.gif" width="400"></p>

| Configuration Item | Type | Description |
| --- | --- | --- |
| hideRatio | number | The percentage of the current graph zoomed to the original graph that will trigger hiding, default is 0.2. |
| hideState | string | The state to add to the node when its details are hidden. |

The following is a simple example of using `hideDetails` in conjunction with node states to get an overview of the overall structure while still being able to see the grouping of each node when the graph is zoomed out.
```typescript
import { Graph, hideDetails } from '@visactor/vgraph';

const graph = new Graph({
    ...
    setNodeStateStyles(state: string, nodeData: any) {
      if (state === 'hide') {
        return { fillStyle: nodeData.color };
      }
    },
  });
  graph.addBehavior(hideDetails, {
      hideRatio: 0.4,
      hideState: 'hide',
  });
```



## showDetails Show Details
When there are many nodes in the graph, it is often the case that the text labels of the nodes overlap and are difficult to see. `showDetails` is used to solve this problem. When using this interaction, it is assumed that the user is viewing the overall structure of the graph in the default state, and the details of the nodes, etc., are displayed when zooming in.
<p><img src="/vgraph/guide/show-details.gif" width="400"></p>

| Configuration Item | Type | Description |
| --- | --- | --- |
| showRatio | number | The percentage of the current graph zoomed in to the original graph that will trigger showing details, default is 1.5. |
| targets | string[] | Which entities' labels to display. Default is `[ node ]`. |
| showNodeState | string | The state to add to the node when its details are shown. |
| showEdgeState | string | The state to add to the edge when its details are shown, you need to configure `'edge'` in `targets`. |



## attachableDragNode Attachable Drag Node
Dragging tree nodes is a common method of data reorganization in tree graph applications. vGraph has built-in attachable drag interaction, which organizes data in a WYSIWYG manner and can significantly improve user experience. For an application, please refer to [Reorganize Tree Nodes](/vgraph/demo/practiceCases/MoveNode).

```typescript
import { attachableDragNode } from '@visactor/vgraph';

// Add attachable drag node interaction
graph.addBehavior(attachableDragNode, { ...options });
// Remove interaction
graph.removeBehavior(attachableDragNode);
```

| Configuration Item | Type | Description |
| --- | --- | --- |
| delegate | boolean | When `delegate` is `true`, a new shape is created for dragging, and the original layout is not changed during the drag process. When `false`, the node itself is dragged directly. |
| delegateStyles | Drawing properties, see [rect configuration](/vgraph/guide/shape-spec/rect) for details | The style of the proxy shape defaults to the style of the moved node's keyShape, which can be configured by yourself. |
| tempEdgeStyles | Drawing properties, see [path configuration](/vgraph/guide/shape-spec/path) for details | The style of the temporary edge that is displayed when the dragged node automatically attaches to another node. |
| shouldTrigger | (e: GraphEvent, target: Shape) => boolean | Whether to allow dragging the current node. |
| shouldDrop | (e: GraphEvent, target: Node, parent: Node) => boolean | Whether to allow dragging `target` as a child node of `parent`. |
| onDragStart | (target: Node, e: GraphEvent) => void | The event for when a node starts to be dragged. |
| onDrag | (overNode: Node, e: GraphEvent) => boolean | The event is continuously triggered while the user is dragging a node. |
| onDrop | (target: Node, parent: Node, e:GraphEvent) => boolean | Triggered when the node can be effectively attached. |
| onAttachNode | (parent: Node) => Node | Whether to allow attaching to the specified node. |
| findClosestNode | (target: Node) => boolean | Calculate the position of the attachable node based on the position of the dragged node. The default is to find the node with the smallest distance. For an application, please refer to [Reorganize Tree Nodes](/vgraph/demo/practiceCases/MoveNode). |



## brushSelect Brush Select
Brush select is a convenient component for batch data selection. vGraph has built-in brush select interaction, which can be used for batch selection of nodes, edges, and groups. For an application, please refer to [Brush Select Demo](/vgraph/demo/behaviors/brushSelect).

```typescript
import { brushSelect } from '@visactor/vgraph';

// Add brush select interaction
graph.addBehavior(brushSelect, { ...options });
// Remove interaction
graph.removeBehavior(brushSelect);
```

| Configuration Item | Type | Description |
| --- | --- | --- |
| targets | string[] | The objects that can be selected. Can be one or more, optional values are `'node'`, `'edge'`, `'group'`. |
| bkgStyles | Record<string, any> | The style of the selection box, see [rect configuration](/vgraph/guide/shape-spec/rect) for details, note to configure `opacity`. |
| autoTranslate | boolean | Whether to automatically scroll the canvas when the mouse is selected to the edge of the viewport, default is `true`. |
| canvasOnly | boolean | Whether to start brush selection only when selecting on the blank canvas, default is `true`. It is recommended to enable this when there is also a `dragNode` interaction in the graph. |
| shouldTrigger | (e: GraphEvent) => boolean | Whether to allow starting brush selection. |
| onSelect | (entity: Node \| Edge \| Group) => boolean | The event for selecting an object during dragging. When `false` is returned, the node will not be selected. |
| onDeSelect | (entity: Node \| Edge \| Group) => void | The event for deselecting an object during dragging. |
| onChange | (entity: (Node \| Edge \| Group)\[]) => void | The event for when the brush selection is completed. |


## multipleSelect Multiple Select
Multiple select is a general data selection component that allows users to select/deselect elements in the graph by holding down a modifier key, achieving more precise and flexible data selection than brush select.

```typescript
import { multipleSelect } from '@visactor/vgraph';

// Add multiple select interaction
graph.addBehavior(multipleSelect, { ...options });
// Remove interaction
graph.removeBehavior(multipleSelect);
```

| Configuration Item | Type | Description |
| --- | --- | --- |
| multiple | boolean | Whether to allow multiple selection, default is `true`. |
| targets | string[] | The types of elements that can be selected, default is `['node', 'edge', 'group']`. |
| modifierKey | string[] | Custom modifier keys, default is `[ 'ctrlKey', 'metaKey' ]`. |
| selectState | string | The state name to add to the element when it is selected, this state will also be removed when it is deselected. |
| clickCanvasToReset | boolean | Whether to deselect all selected elements when clicking on a blank area. |
| shouldSelectItem | (ev: GraphEvent, selections: \[]) => boolean | Whether the currently clicked node can be selected. |
| onSelectionsChange | (selections: \[]) => void | The callback for when the selected elements change. |


