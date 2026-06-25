## Node Instance Methods

If you want to call node instance methods in **batch**, it is recommended to first set the graph's `autoDraw` to `false`. After the batch operation is complete, manually call `graph.draw()`. Then reset `autoDraw` to `true`. This can improve runtime performance.

### State Management

| Instance Method | Return Value | Description |
| --- | --- | --- |
| setState(state: string, onlyState=false) | void | Sets the node state. This is a convenient method for when the node structure remains unchanged but its appearance changes. By default, states will be stacked. If you want only one state to exist at a time, you can set `onlyState = true`. For details on usage, see the [State Management](/vgraph/guide/states) section. |
| clearStates() | void | Clears all node states. |
| removeState(state: string) | void | Removes a state. |
| get(key: string) | any | Gets the original data or properties of the node. |
| show(showEdgee=true) | void | Shows the node and its related edges. If `false` is passed, only the node is shown. |
| hide() | void | Hides the node and its related edges. |
| isVisible() | boolean | Queries the visibility state of the node. |
| toFront() | boolean | Moves the node to the front of all nodes. |
| toBack() | boolean | Moves the node to the back of all nodes. |

### Relationship Query

| Instance Method | Return Value | Description |
| --- | --- | --- |
| get(key: string) | any | Gets a configuration item on the node. |
| set(key: string, value: any) | void | Updates a business data item on the node. This is an operation that does not involve graphic changes. If you need the update to be reflected in the graph, please use `updateData`. |
| updateData(data: NodeData) | void | Updates the node data. It supports incremental data updates and will merge with the old data. This will cause the connection graphics to be updated. |
| getEdges() | Edge[] | Gets all edges related to the node. |
| getLinkedNodes() | Node[] | Gets all nodes connected to this node. |
| getDirectParent() | Group \| null | Gets the direct parent group. |
| getRootParent() | Group \|null | Gets the root group. In the case of nested groups, this will return a different group from `getDirectParent`. |

### Graphics Operations

| Instance Method | Return Value | Description |
| --- | --- | --- |
| getBBox() | BBox | Gets the node's position box model. If the node has transformations such as scaling, the box model range will be affected. |
| getKeyShape() | Shape | Gets the key shape of the node. |
| getLayer() | void | Gets the node's drawing container, from which you can further get all internal graphics. |
| getLabel() | Text \|undefined | Gets the text label graphic. |
| translate(x: number, y: number) | void | Translates the node. |
| scale(ratio: number) | void | Scales the node. |
| setOpacity() | void | Sets the opacity of the entire node. |

### Event Operations
| Instance Method | Return Value | Description |
| --- | --- | --- |
| on(eventType: string, callback(e: GraphEvent) => void) | void | Adds a handler for a specific event on the node. For more information about events, see the [Event Guide](/vgraph/guide/events). |
| once(eventType: string, callback(e: GraphEvent) => void) | void | Adds a one-time event handler on the node. |
| emit(eventType: string, args: any) | void | Triggers a specified event on the node. |
| off(eventType: string, callback(e: GraphEvent) => void) | void | Removes a handler for a specific event on the node. |
| removeAllListeners() | void | Removes all event handlers on the node. |
