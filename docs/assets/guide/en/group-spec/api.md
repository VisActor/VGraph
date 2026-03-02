# Group Instance Methods

## Visibility and State Management
| Instance Method | Return Value | Description |
| --- | --- | --- |
| show() | void | Shows the group. |
| hide() | void | Hides the group. |
| isVisible() | boolean | Queries the visibility state of the group. |
| collapse() | void | Collapses the nodes within the group, leaving only the title and connections. If no title is defined, the effect is the same as `hide`. The corresponding data will be modified to `collapsed = true`. Therefore, you must ensure that the `collapsed` field has no business meaning, otherwise it will be overwritten. If it is a custom title, the title will also be refreshed at this time. |
| expand() | Void | Expands the nodes within the group. The corresponding data will be modified to `collapsed = false`. Therefore, you must ensure that the `collapsed` field has no business meaning, otherwise it will be overwritten. If it is a custom title, the title will also be refreshed at this time. |
| setState(state: string, onlyState=false) | void | Sets the group state. This is a convenient method for when the group structure remains unchanged but its appearance changes. For details on usage, see the [State Management](/vgraph/guide/states) section. |
| clearStates() | void | Clears all group states. |
| removeState(state: string) | void | Removes the specified state of the group. |

## Relationship Query
| Instance Method | Return Value | Description |
| --- | --- | --- |
| get(key: string) | any | Gets a configuration item on the group. |
| set(key: string, value: any) | void | Updates a business data item on the group. This is an operation that does not involve graphic changes. If you need the update to be reflected in the graph, please use `updateData`. |
| updateData(data: NodeData) | void | Updates the group data. It supports incremental data updates and will merge with the old data. This will cause the connection graphics to be updated. |
| addChild(child: Node \| Group) | void | Adds a child node or group. If you are adding in batches, you can use `addChildrenByIds` for better performance. |
| addChildrenByIds(ids: string[]) | void | Adds child nodes or groups in batches. |
| removeChild(child: Node \| Group, destroy = true) | void | Removes an instance from the group. By default, the removed instance will be destroyed. You can set `destroy = false` to keep the instance. If you are removing in batches, you can use `removeChildrenByIds` for better performance. |
| removeChildrenByIds(id: string[], desroy = true) | void | Removes child nodes in batches. By default, the removed instances will be destroyed. You can set `destroy = false` to keep the instances. |

## Graphics Operations
| Instance Method | Return Value | Description |
| --- | --- | --- |
| getBBox() | BBox | Gets the group's box model. |
| translate(x: number, y: number) | void | Translates the entire group, including the child nodes and groups within the group. |
| getKeyShape() | Shape | Gets the key shape of the group. |
| getLayer() | Layer | Gets the group's drawing container, from which you can further get all internal graphics. |
| getTitleLayer() | Layer \| null | Gets the group title container (if configured). |

## Event Operations
| Instance Method | Return Value | Description |
| --- | --- | --- |
| on(eventType: string, callback(e: GraphEvent) => void) | void | Adds a handler for a specific event on the group. For more information about events, see the [Event Guide](/vgraph/guide/events). |
| once(eventType: string, callback(e: GraphEvent) => void) | void | Adds a one-time event handler on the group. |
| emit(eventType: string, args: any) | void | Triggers a specified event on the group. |
| off(eventType: string, callback(e: GraphEvent) => void) | void | Removes a handler for a specific event on the group. |
| removeAllListeners() | void | Removes all event handlers on the group. |
