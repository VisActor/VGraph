# Model Options Quick Reference

Do not try to memorize every shape config. Use these stable patterns:

## Node Config Pattern

```ts
setDefaultNode: data => ({
  id: data.id,
  x: data.x,
  y: data.y,
  label: data.name ?? data.id,
  width: 160,
  height: 48,
  style: {
    fill: "#fff",
    stroke: "#2f80ed"
  }
})
```

## Edge Config Pattern

```ts
setDefaultEdge: data => ({
  ...data,
  style: {
    stroke: "#9aa4b2",
    lineWidth: 1
  },
  label: data.label
})
```

## Group Config Pattern

```ts
setDefaultGroup: data => ({
  ...data,
  title: data.name ?? data.id,
  padding: 16,
  style: {
    fill: "rgba(47, 128, 237, 0.06)",
    stroke: "#2f80ed"
  }
})
```

## State Style Pattern

```ts
setNodeStateStyles: (state, data) => {
  if (state === "selected") return { stroke: "#f04438", lineWidth: 2 };
  if (state === "dim") return { opacity: 0.25 };
}
```

When exact fields matter, inspect `packages/vgraph/src/typings/model.ts` in the repository.
