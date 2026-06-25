# Instance Methods

## State Management

| Instance Method | Return Value | Description |
| --- | --- | --- |
| setState(state: string, onlyState=false) | void | Set the edge state. This is a convenient method for when the edge structure does not change, but its appearance does. For more details, see the [State Management](/vgraph/guide/states) section. |
| clearStates() | void | Clear all edge states. |
| removeState(state: string) | void | Remove a specific state from the edge. |
| show() | void | Show the edge. |
| hide() | void | Hide the edge. |
| isVisible() | boolean | Query the visibility state of the edge. |
| toFront() | boolean | Move the edge to the front of all edges. |
| toBack() | boolean | Move the edge to the back of all edges. |

## Relationship Query

| Instance Method | Return Value | Description |
| --- | --- | --- |
| get(key: string) | any | Get a specific configuration item on the edge. |
| set(key: string, value: any) | void | Update a business data item on the edge. This is an operation that does not involve graphic changes. If you need the update to be reflected in the graph, please use `updateData`. |
| updateData(data: NodeData) | void | Update edge data. It supports differential data updates and will be merged with old data, which will cause the edge graphics to update. |
| setSource(sourceId: string) | void | Set the source node of the edge. It may not actually connect to this node, as it depends on the group and configuration of the node. |
| setTarget(targetId: string) | void | Set the target node of the edge. It may not actually connect to this node, as it depends on the group and configuration of the node. |
| getSource() | Node \|Group | Get the source entity to which the edge is actually connected. |
| getTarget() | Node \|Group | Get the target entity to which the edge is actually connected. |

## Graphic Operations

| Instance Method | Return Value | Description |
| --- | --- | --- |
| getBBox() | BBox | Get the bounding box of the edge. |
| getKeyShape() | Shape | Get the key shape of the edge, which is generally a path. |
| getLayer() | void | Get the drawing container of the edge, from which you can further get all internal graphics. |
| getLabel() | Text \|undefined | Get the text label graphic (if configured). |
| setOpacity() | void | Set the opacity of the entire edge, including text labels, etc. |

## Event Operations
| Instance Method | Return Value | Description |
| --- | --- | --- |
| on(eventType: string, callback(e: GraphEvent) => void) | void | Add a handler for a specific event on the edge. For more information about events, see the [Event Guide](/vgraph/guide/events). |
| once(eventType: string, callback(e: GraphEvent) => void) | void | Add a one-time event handler on the edge. |
| emit(eventType: string, args: any) | void | Trigger a specified event on the edge. |
| off(eventType: string, callback(e: GraphEvent) => void) | void | Remove a specific event handler from the edge. |
| removeAllListeners() | void | Remove all event handlers from the edge. |
