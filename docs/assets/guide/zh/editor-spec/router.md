# 智能路由 Router

在图编辑场景中，通常需要自动计算避障路由来避免连线穿越节点。通过智能路由组件 Router 所提供智能路径规划方法可计算得到自动避障的最短路径，常用于图编辑场景配合[节点编辑组件 NodeMover](/vgraph/guide/editor-spec/nodeMover) 使用，也可以用于图分析场景中用于。

以下是节点编辑组件Router 的使用方法示例。也可以在 demo 中进行体验。

```javascript
import { Graph, Grid, Router } from "@visactor/vgraph";
const grid = new Grid(graph, {...});
const router = new Router(grid, {...} as RouterOptions);
```

## 配置项

`RouterOptions` 定义如下。


| 字段          | 类型                                     | 描述                                                                                                                       |
| ------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| algorithm     | 'AStar' \| 'BStar'                       | 路径规划算法，默认为AStar。其中 AStar 结果更优但效率更低，BStar 则效率更快，数据规模较大时可选用 BStar 作为路径规划算法。 |
| heuristic     | 'manhattan' \| 'euclidean' \| 'chebyshev' | 距离函数。默认为曼哈顿距离 'manhattan'。                                                                                   |
| allowDiagonal | 'always' \| 'never' \| 'onlyNoObstacles'  | 是否允许走斜线。默认为  never 。                                                                                           |
| lessDiversion | boolean                                  | 默认为true。是否尽量减少折角。                                                                                             |
| minDist       | number                                   | 默认为20。起始位置的最短距离，用于避免路径贴边。                                                                           |
| throwWarning  | boolean                                  | 默认为true。在无法找到避障路径时是否抛出警告。                                                                             |
| fallback      | 'unchanged' \| 'aligned'                  | 默认为 aligned。无法找到避障路径时的降级方案，unchanged 为不做改变，aligned 为将控制点在x或y轴对齐节点。                  |

## 实例方法


| 实例方法                                                                      | 返回值                    | 描述                                                                                                          |
| ----------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| setGrid(grid: Grid)                                                           | void                      | 重新配置grid组件。                                                                                            |
| setDefaultOptions(options: RouterOptions)                                     | void                      | 重新设置Router组件默认参数。                                                                                  |
| updateEdgePath(edge: Edge, fixAnchor?: boolean)                               | void                      | 更新连线路径。如果未配置 fixAnchor 且连线未指定 sourceAnchor 和 targetAnchor 时会自动计算路径最短的两个锚点。 |
| destroy()                                                                     | void                      | 组件销毁。                                                                                                    |
