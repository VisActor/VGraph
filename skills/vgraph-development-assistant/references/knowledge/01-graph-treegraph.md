# Graph, TreeGraph, GraphStructure

## Choose The Correct Data Model

Use `Graph` when the user has explicit edges:

```ts
const data = {
  nodes: [{ id: "a" }, { id: "b" }],
  edges: [{ source: "a", target: "b" }],
  groups: [{ id: "g1", children: ["a", "b"] }]
};
```

Use `TreeGraph` when hierarchy is intrinsic:

```ts
const data = {
  id: "root",
  children: [{ id: "child" }]
};
```

Use `GraphStructure` when raw data has custom field names or you need helper methods for lineage-like graph structures. Normalize first, then feed the normalized records to `Graph`.

## Non-Obvious Boundaries

- `Graph` edges require `source` and `target` node IDs.
- `TreeGraph` does not need edge records for parent-child links.
- `GroupData.children` is a list of child node/group IDs, not embedded child objects.
- `groupId` on a node can place it under a group, but group `children` should still stay consistent when hand-authoring data.
- `updateData()` is ID-driven. Reusing IDs updates existing entities; changing IDs creates/removes entities.

## Common Mistakes

- Passing nested `children` data to `Graph`.
- Passing `{ nodes, edges }` to `TreeGraph`.
- Mixing numeric and string IDs. Source and target lookups are string-keyed in practice; keep IDs as strings.
- Generating edges before all target nodes exist.
