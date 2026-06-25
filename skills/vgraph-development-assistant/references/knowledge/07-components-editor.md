# Components And Editors

Use editor or component surfaces when the user is building an application workflow, not just a static visualization.

## CommonFlowEditor

Use `CommonFlowEditor` when users need:

- Free placement of nodes.
- Drag/drop graph editing.
- Flexible edge creation.
- Flowchart-like authoring.

Trade-off: more freedom means the application may need post-edit validation to ensure the graph is semantically valid.

## DAGFlowEditor

Use `DAGFlowEditor` when users need:

- Directed/pipeline editing.
- Add source/target/sibling commands.
- More constrained graph construction.
- Higher quality DAG structure with less manual cleanup.

Trade-off: less freeform than common flow editing, but safer for directed workflows.

## Components

Common exported utilities/components include minimap, node mover, edge editor, fisheye, router helpers, tooltip-like utilities, and stack/command types. Prefer these when user asks for editor capabilities instead of manually rebuilding the behavior from raw pointer events.

## Decision Rule

If the user asks "how do I let users edit/build/connect nodes", start from an editor. If they ask "how do I display this graph and respond to clicks", start from `Graph`/`TreeGraph` with behaviors/events.
