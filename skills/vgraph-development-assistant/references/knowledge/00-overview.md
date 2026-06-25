# VGraph Overview

VGraph is a canvas-first graph visualization library with optional DOM/React rendering for custom node content.

Use this mental model:

| Need | Surface |
| --- | --- |
| Nodes, edges, optional groups | `Graph` |
| Nested tree data with `children` | `TreeGraph` |
| Normalize custom node/edge/group records | `GraphStructure` |
| Freeform flow editing | `CommonFlowEditor` |
| Constrained DAG/pipeline editing | `DAGFlowEditor` |
| React node bodies, anchors, group titles | `Viewer` from `@visactor/react-vgraph` |
| Tooltip/context menu overlays | `@visactor/react-vgraph-ui` |

Minimum graph requirements:

- A real container: DOM element or element id.
- Positive `width` and `height`.
- Data passed through `graph.data(...)` after construction.
- Data shape matching the graph class.
- Layout matching the data shape.

Typical public imports:

```ts
import {
  Graph,
  TreeGraph,
  GraphStructure,
  panZoom,
  dragCanvas,
  dragNode,
  brushSelect,
  highlightRelations,
  GRAPH_EVENTS
} from "@visactor/vgraph";
```

Default recommendation:

- Start with canvas nodes through `Graph` or `TreeGraph`.
- Add React `Viewer` only when the node content cannot be expressed well with built-in canvas shapes.
- Add editor surfaces only when users must create, connect, or rearrange graph data interactively.
