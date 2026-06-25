# Behaviors And Events

Public behaviors exported by `@visactor/vgraph` include:

- `panZoom`
- `dragCanvas`
- `dragNode`
- `hideDetails`
- `showDetails`
- `highlightRelations`
- `dragEdge`
- `attachableDragNode`
- `brushSelect`
- `multipleSelect`

Use:

```ts
graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);
graph.addBehavior(dragNode);
```

Some behaviors accept options:

```ts
graph.addBehavior(panZoom, { sensitivity: 5 });
graph.addBehavior(dragCanvas, { eventType: "right" });
```

Remove by behavior config or type string:

```ts
graph.removeBehavior("dragCanvas");
```

## Event Families

Entity/native event strings:

```ts
graph.on("node:click", ev => {});
graph.on("edge:mouseenter", ev => {});
graph.on("group:contextmenu", ev => {});
```

The format is `${entity.type}:${eventType}`. Native event types include `click`, `dblclick`, `mouseenter`, `mouseover`, `mouseout`, `mouseleave`, `mousedown`, `mouseup`, `mousemove`, `contextmenu`, `touchstart`, `touchmove`, and `touchend`.

Lifecycle/change events use `GRAPH_EVENTS`:

```ts
graph.on(GRAPH_EVENTS.LAYOUT_END, () => {});
graph.on(GRAPH_EVENTS.TRANSFORMED, ev => {});
graph.on(GRAPH_EVENTS.BATCH_STATE_END, ev => {});
```

## Behavior Conflict Rules

- `brushSelect` and `dragCanvas` can compete for pointer gestures. Remove or re-add behaviors when switching modes.
- `highlightRelations` is a good default for dependency graphs but may surprise users in editors where selection has separate semantics.
- Avoid expensive work in `mousemove`, `transformed`, `moving`, and animation-frame events; throttle or defer.
