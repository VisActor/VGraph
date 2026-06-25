# 网格组件 Grid

Grid 是在 vGraph 中用于智能路由 Router、连线编辑 EdgeEditor、 节点编辑 NodeMover 、 背景图 Background 等组件的内部数据结构组件。 上述组件通常依赖于 Grid 组件所定义的网格进行工作。 Grid 并不处理具体的渲染，而是提供一个网格数据结构，用于组件内部进行计算。网格的渲染由 Background 负责。

以下是一个网格组件 Grid 的使简单示例。

```javascript
import { Graph, Grid } from "@visactor/vgraph";
const grid = new Grid(this.graph, {
    step: 10, // 网格步长。
    extraWidth: 5, // 节点边界的额外宽度，可有效避免贴边的路由产生。
});
const router = new Router(grid, {...} as RouterOptions);
```

## 配置项
| 字段             | 类型    | 描述                                                                       |
|------------------|---------|--------------------------------------------------------------------------|
| step             | number  | 网格步长。 默认为 10。                                                       |
| extraWidth       | number  | 节点边界的额外宽度，可有效避免贴边的路由产生。 默认为 0。                     |
| ignoreGroupTitle | boolean | 是否忽略分组的标题。默认为 true。如果为 false， 则智能路由不会穿越分组的标题。 |

## 实例方法

| 实例方法                             | 返回值             | 描述                                                                                        |
|--------------------------------------|--------------------|-------------------------------------------------------------------------------------------|
| refresh(alignGrid = false)           | void               | 根据图数据刷新 Grid 内部数据结构。如果 alignGrid 为 true，则会微调节点坐标使节点对齐网格中心。 |
| getStep()                            | number             | 获取网格步长。                                                                               |
| getIndexByCoord()                    | \[number, number\] | graph 坐标转 grid 下标，返回\[col,row\]。                                                     |
| isWalkable(col: number, row: number) | boolean            | 返回该 grid 下标下是否为空。                                                                 |
| getValueByCoord()                    | number             | 获取该 graph 坐标下有多少个实体（节点或未被忽略的分组标题）。                                  |
| destroy()                            | void               | 组件销毁。                                                                                   |
