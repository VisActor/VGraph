# Layouts

`GraphConfigs.layout` supports these built-in layout types:

- `dag`: directed acyclic graph layout.
- `force`: force-directed graph.
- `compactBox`: compact tree.
- `dendrogram`: balanced tree.
- `mindMap`: mind map tree.
- `indented`: indented tree.
- `pipeline`: pipeline layout.
- `nestedDag`: nested grouping DAG.

## Layout Selection

| Data / intent | Layout |
| --- | --- |
| Directional dependency graph | `dag` |
| Large relationship exploration without strict levels | `force` |
| Parent-child tree | `compactBox`, `dendrogram`, `mindMap`, or `indented` |
| Process/pipeline hierarchy | `pipeline` |
| DAG with meaningful nested groups | `nestedDag` |

## Auto Layout Rules

- If `layout` is configured, graph construction enables `autoLayout`.
- `updateData()` triggers `autoLayout()` when `autoLayout` is true.
- For many changes, disable auto layout and redraw/layout once.

Batch pattern:

```ts
const autoDraw = graph.disableAutoDraw();
const autoLayout = graph.disableAutoLayout();

graph.updateData(nextData);

graph.enableAutoLayout(autoLayout);
graph.enableAutoDraw(autoDraw);
```

If layout still does not appear to run:

1. Confirm the graph has a `layout` config.
2. Confirm `autoLayout` was restored.
3. Confirm data shape matches layout type.
4. Confirm container/graph dimensions are non-zero.
