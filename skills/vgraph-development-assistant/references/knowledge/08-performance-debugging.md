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

## Edges Missing

Likely causes:

- `source` or `target` ID does not exist.
- IDs are numbers in one place and strings in another.
- Edge style makes stroke invisible.
- Edge anchor configuration points to hidden or invalid anchors.

## Layout Not Updating

Check:

- `layout` exists.
- `autoLayout` is true, or `graph.layout()` is called manually.
- Batch code restored `autoLayout` after disabling it.
- Data update preserved IDs as intended.

## Slow Interaction

Most common causes:

- DOM/React render mode on too many nodes.
- Heavy handlers on `mousemove`, `transformed`, `moving`, or animation-frame.
- Repeated `updateData()` calls in tight loops.
- Auto layout/draw active during bulk mutations.
- Large force layouts running continuously.

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
