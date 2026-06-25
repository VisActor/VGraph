# React Integration

Use `@visactor/react-vgraph` when node bodies, anchors, or group titles need React/DOM rendering.

Core pattern:

1. Create `Graph` or `TreeGraph` inside `useEffect`.
2. Store graph in state or ref.
3. Render `<Viewer graph={graph} setNode={...} />`.
4. Destroy the graph in cleanup.

Never create graph instances during React render. React re-renders would create duplicate canvases and event listeners.

## Viewer Props To Remember

`Viewer` requires:

- `graph`
- `setNode(node) => ReactNode | string`

Useful optional props:

- `setGroupTitle(group)`
- `setAnchor(node, anchor)`
- `hideDetails`
- `responsiveNode`
- `adjustNodeSize`
- `localRendering`

## Performance Boundary

React/DOM node rendering is powerful but expensive. Prefer canvas render mode for large graphs. Use React `Viewer` when:

- Node content requires real DOM controls or complex React composition.
- The graph size is moderate.
- The user accepts extra lifecycle and measurement complexity.

For large graphs, prefer canvas nodes plus tooltip/context menu overlays.
