# Smart Routing: Router

In graph editing scenarios, it's often necessary to automatically calculate obstacle-avoiding routes to prevent lines from passing through nodes. The smart routing component, Router, provides intelligent path-planning methods to calculate the shortest path for automatic obstacle avoidance. It is commonly used in graph editing scenarios in conjunction with the [NodeMover component](/vgraph/guide/editor-spec/nodeMover), but can also be used in graph analysis scenarios.

The following is an example of how to use the NodeMover component, Router. You can also experience it in the demo.

```javascript
import { Graph, Grid, Router } from "@visactor/vgraph";
const grid = new Grid(graph, {...});
const router = new Router(grid, {...} as RouterOptions);
```

## Configuration

`RouterOptions` are defined as follows.

| Field | Type | Description |
| --- | --- | --- |
| algorithm | 'AStar' \| 'BStar' | Pathfinding algorithm, defaults to AStar. AStar produces better results but is less efficient. BStar is faster and can be used for larger datasets. |
| heuristic | 'manhattan' \| 'euclidean' \| 'chebyshev' | Distance function. Defaults to Manhattan distance, 'manhattan'. |
| allowDiagonal | 'always' \| 'never' \| 'onlyNoObstacles' | Whether to allow diagonal paths. Defaults to 'never'. |
| lessDiversion | boolean | Defaults to true. Whether to minimize corners as much as possible. |
| minDist | number | Defaults to 20. The minimum distance from the starting position, used to prevent paths from sticking to edges. |
| throwWarning | boolean | Defaults to true. Whether to throw a warning when an obstacle-avoiding path cannot be found. |
| fallback | 'unchanged' \| 'aligned' | Defaults to 'aligned'. The fallback solution when an obstacle-avoiding path cannot be found. 'unchanged' means no changes are made, while 'aligned' aligns the control points with the node on the x or y axis. |

## Instance Methods

| Instance Method | Return Value | Description |
| --- | --- | --- |
| setGrid(grid: Grid) | void | Reconfigures the grid component. |
| setDefaultOptions(options: RouterOptions) | void | Resets the default parameters of the Router component. |
| updateEdgePath(edge: Edge, fixAnchor?: boolean) | void | Updates the edge path. If `fixAnchor` is not configured and the edge does not specify `sourceAnchor` and `targetAnchor`, it will automatically calculate the two anchor points with the shortest path. |
| destroy() | void | Destroys the component. |
