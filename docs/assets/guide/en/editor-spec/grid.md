# Grid Component

Grid is an internal data structure component in vGraph used by components such as intelligent Router, EdgeEditor, NodeMover, and Background. These components usually rely on the grid defined by the Grid component to work. Grid does not handle specific rendering, but provides a grid data structure for internal calculations within the components. The rendering of the grid is handled by Background.

The following is a simple example of using the Grid component.

```javascript
import { Graph, Grid } from "@visactor/vgraph";
const grid = new Grid(this.graph, {
    step: 10, // Grid step size.
    extraWidth: 5, // Extra width of the node boundary, which can effectively avoid routing that sticks to the edge.
});
const router = new Router(grid, {...} as RouterOptions);
```

## Configuration Items
| Field | Type | Description |
|---|---|---|
| step | number | Grid step size. Default is 10. |
| extraWidth | number | Extra width of the node boundary, which can effectively avoid routing that sticks to the edge. Default is 0. |
| ignoreGroupTitle | boolean | Whether to ignore the group title. Default is true. If false, the intelligent router will not cross the group title. |

## Instance Methods

| Instance Method | Return Value | Description |
|---|---|---|
| refresh(alignGrid = false) | void | Refresh the internal data structure of the Grid according to the graph data. If `alignGrid` is true, it will fine-tune the node coordinates to align the node with the center of the grid. |
| getStep() | number | Get the grid step size. |
| getIndexByCoord() | \[number, number] | Convert graph coordinates to grid subscripts, returns \[col,row]. |
| isWalkable(col: number, row: number) | boolean | Returns whether the grid at this subscript is empty. |
| getValueByCoord() | number | Get the number of entities (nodes or non-ignored group titles) at this graph coordinate. |
| destroy() | void | Destroy the component. |
