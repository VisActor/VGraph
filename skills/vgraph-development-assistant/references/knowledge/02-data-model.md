# Data Model

Core public data shapes from `packages/vgraph/src/typings/data.ts`:

```ts
type NodeData = { id: string; groupId?: string; [key: string]: any };
type EdgeData = { id?: string; source: string; target: string; [key: string]: any };
type GroupData = { id: string; children: string[]; groupId?: string; [key: string]: any };
type TreeNodeData = NodeData & { children?: TreeNodeData[] };
```

For generated examples, prefer:

- Stable string IDs.
- Explicit edge IDs when users will update/remove edges.
- Domain fields on data, then map to visual configs through `setDefaultNode`, `setDefaultEdge`, and `setDefaultGroup`.

## ID Checklist

Before debugging rendering or missing edges:

1. Every node has a unique `id`.
2. Every edge `source` and `target` exists in `nodes`.
3. Group `children` references existing node/group IDs.
4. IDs are not mixed between numbers and strings.
5. Update operations preserve IDs for objects that should be updated rather than recreated.

## Data-Driven Styling Pattern

Keep raw data semantic:

```ts
nodes: [{ id: "api", status: "running", level: "service" }]
```

Map visuals in `setDefaultNode`:

```ts
setDefaultNode: node => ({
  id: node.id,
  x: node.x,
  y: node.y,
  label: node.name ?? node.id,
  style: {
    fill: node.status === "error" ? "#f04438" : "#2f80ed"
  }
})
```

This keeps updates predictable and avoids mutating visual properties across the raw data pipeline.
