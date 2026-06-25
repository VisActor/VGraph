# Event Types Quick Reference

Entity event strings:

```ts
graph.on("node:click", handler);
graph.on("edge:mouseenter", handler);
graph.on("group:contextmenu", handler);
```

Event string pattern:

```text
${entity.type}:${nativeEventType}
```

Native event types include:

- `click`
- `dblclick`
- `mouseenter`
- `mouseover`
- `mouseout`
- `mouseleave`
- `mousedown`
- `mouseup`
- `mousemove`
- `contextmenu`
- `touchstart`
- `touchmove`
- `touchend`

Lifecycle events via `GRAPH_EVENTS`:

- `MOVE_START`, `MOVING`, `MOVE_END`
- `ADD_START`, `ADD_END`
- `UPDATE_START`, `UPDATE_END`
- `REMOVE_START`, `REMOVE_END`
- `STATE_START`, `STATE_END`
- `BATCH_STATE_START`, `BATCH_STATE_END`
- `LAYOUT_START`, `LAYOUT_END`
- `DATA_START`, `DATA_END`
- `UPDATE_DATA_START`, `UPDATE_DATA_END`
- `TRANSFORMED`
- `CHANGE`
- `CLEAR_START`, `CLEAR_END`
- `DRAW_START`, `DRAW_END`
- `ANIMATION_START`, `ANIMATION_END`

Use entity strings for user input on nodes/edges/groups. Use `GRAPH_EVENTS` for graph lifecycle, layout, selection state, viewport transform, and change notifications.
