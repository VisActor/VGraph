# Nodes, Edges, Groups, States

Use default mapping functions when styling is derived from data:

- `setDefaultNode(nodeData) => NodeConfigs`
- `setDefaultEdge(edgeData) => EdgeConfigs`
- `setDefaultGroup(groupData) => GroupConfigs`
- `setNodeStateStyles(state, nodeData, node) => styles`
- `setEdgeStateStyles(state, edgeData, edge) => styles`
- `setGroupStateStyles(state, groupData, group) => styles`

## Node Guidance

- Put stable identity and domain fields in data.
- Put visual defaults in `setDefaultNode`.
- Include coordinates only when no layout should compute them.
- Use anchors when edges need explicit connection points.
- Use node addon utilities (`CountBadgeUtils`, `TagUtils`, `LinkUtils`, `ProgressUtils`, `NoteMarkerUtils`) for common node decorations instead of custom drawing from scratch.

## Edge Guidance

- Always validate `source` and `target`.
- Use edge labels sparingly on dense graphs.
- For interactive edge editing, prefer editor utilities/components over manually binding many drag events.

## Group Guidance

- Groups are explicit entities with `children`.
- Nested groups use `groupId` and child IDs; keep both directions consistent.
- Use `nestedDag` layout when groups are part of DAG structure, not just visual decoration.

## State Guidance

Use graph/entity state when interaction changes visual emphasis:

```ts
graph.on("node:click", ev => {
  graph.setState(ev.target, "selected", true);
});
```

Do not implement selection by mutating raw data in high-frequency events. State styles are cheaper and match VGraph internals.
