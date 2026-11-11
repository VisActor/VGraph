# Performance And Debugging

Use symptom-driven diagnosis.

## Blank Canvas

Check in order:

1. Container exists.
2. Container and graph `width`/`height` are non-zero.
3. Graph instance is created after the DOM container exists.
4. `graph.data(...)` was called after construction.
5. Data shape matches `Graph` or `TreeGraph`.
6. Edge endpoints reference existing node IDs.
7. Layout is configured or coordinates are provided.
8. Old graph instances were destroyed before recreating in the same container.

Fast falsification checks:

```ts
console.log(graph.get("width"), graph.get("height"));
console.log(graph.getNodes().length, graph.getEdges().length);
graph.on(GRAPH_EVENTS.LAYOUT_END, () => console.log("layout end"));
graph.on(GRAPH_EVENTS.DRAW_END, () => console.log("draw end"));
```

If node/edge counts are zero, inspect the data path first. If counts are
positive but nothing is visible, inspect layout completion, viewport transform,
style opacity/stroke/fill, and whether the graph was created in a hidden or
zero-size container.

## Edges Missing

Likely causes:

- `source` or `target` ID does not exist.
- IDs are numbers in one place and strings in another.
- Edge style makes stroke invisible.
- Edge anchor configuration points to hidden or invalid anchors.

Use a concrete endpoint check before changing layout:

```ts
const nodeIds = new Set(graph.getNodes().map(node => node.get("id")));
for (const edge of graph.getEdges()) {
  const source = edge.get("source");
  const target = edge.get("target");
  if (!nodeIds.has(source) || !nodeIds.has(target)) {
    console.warn("invalid edge endpoint", edge.get("id"), source, target);
  }
}
```

## Layout Not Updating

Check:

- `layout` exists.
- `autoLayout` is true, or `graph.layout()` is called manually.
- Batch code restored `autoLayout` after disabling it.
- Data update preserved IDs as intended.
- The container was not hidden or zero-size when layout ran.
- `fitViewAfterLayout` or a manual `fitView()` is used when newly laid-out data
  can land outside the current viewport.

## Slow Interaction

Most common causes:

- DOM/React render mode on too many nodes.
- Heavy handlers on `mousemove`, `transformed`, `moving`, or animation-frame.
- Repeated `updateData()` calls in tight loops.
- Auto layout/draw active during bulk mutations.
- Large force layouts running continuously.

VGraph-specific checks:

- If using `@visactor/react-vgraph`, compare DOM node count against graph node
  count. Large graphs should usually stay canvas-first.
- If interactions slow down after repeated page/component mounts, verify old
  graph instances were destroyed and high-frequency listeners were removed.
- If force layout keeps consuming CPU, check whether the force layout is still
  ticking after the user expects it to settle.

## Batch Mutation Pattern

```ts
const autoDraw = graph.disableAutoDraw();
const autoLayout = graph.disableAutoLayout();

try {
  graph.updateData(nextData);
} finally {
  graph.enableAutoLayout(autoLayout);
  graph.enableAutoDraw(autoDraw);
}
```

Use `try/finally` in app code so exceptions do not leave drawing/layout disabled.
