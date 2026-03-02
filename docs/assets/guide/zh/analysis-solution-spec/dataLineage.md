# 血缘图谱场景解决方案

DataLineageGraph 是数据血缘图谱组件，为血缘图谱场景打造的开箱即用解决方案。目前已经落地的场景有 coral 血缘图。此组件支持[表视图](/vgraph/demo/solutions/dataLineage)和[列视图](/vgraph/demo/solutions/columnLineage)两种展示形式。引用方式为
```javascript
import { DataLineageGraph } from '@visactor/react-vgraph';

() => <DataLineageGraph ...options />
```

### 配置项

| 字段        | 类型                | 描述                                                         |
| ----------- | ------------------- | ------------------------------------------------------------ |
| data        | GraphStructure      | 数据血缘组件接受 GraphStructure 类型的数据，表视图和列视图(mode = 'table' \|\| mode = 'column') 结构略有不同。表视图组件节点数据对应 nodes，关系为 edges, 无须指定 groups。分组由 getGroupData 内部实现。列视图字段数据对应 nodes，关系为 edges，表数据对应 groups，一个表中包含若干字段。 |
| baseTableId | string              | 主节点 id。表模式下是节点 id，列模式下应是对应分组的 id。    |
| mode        | 'table' \| 'column' | 表视图 \| 列视图                                             |
| size     | number[] | 图容器大小，`size:[800, 600]` 表示容器宽为 800px，高为 600 px |
| minDepth | number   | 血缘层级，上游为负数。-1 代表上游一层。表视图必须。用于保证筛选前后列数量不变 |
| maxDepth | number   | 血缘层级，下游为正数。1 代表下游一层。表视图必须。用于保证筛选前后列数量不变 |
| options | IOptions | 个性化定制配置 |


IOptions 中包含的个性化定制配置如下：





| 字段        | 类型   | 描述                                                         |
| ----------- | ------ | ------------------------------------------------------------ |
| tableHeight | number | 节点高度，有 60px, 40px, 32px 三档，对应表视图更多属性，表视图常规，列视图常规三种情况 |
| groupGap               | number                                                    | 每层之间的间隔宽度，默认 50                                  |
| getGroupWidth          | (depth: number, count: number) => number                  | 获取层宽。表视图 304，列视图 240                             |
| activeColumn           | string[]                                                  | \[列视图\]主表目前勾选的字段                                   |
| getGroupData           | (data: tableData) => string;                              | \[表视图\]分组方法，给定每个节点数据，返回分组值               |
| filter                 | { type: string; value: string[];}                         | \[表视图\]给定筛选的类型和筛选值进行筛选。 |
| minDepth               | number                                                    | 最小层级限制，上游为负数                                     |
| maxDepth               | number                                                    | 最大层级限制，下游为正数                                     |
| getEdgeStyles          | (sourceId: string, targetId: string) => object            | 默认状态下边的样式。默认为：{ strokeStyle: '#D1D5DA',lineWidth: 1,hitWidth: 6, } |
| getEdgeHighlightStyles | (*sourceId*: *string*, *targetId*: *string*) *=>* object; | 高亮状态下边的样式，会 merge 默认状态样式展示。默认为：{ strokeStyle: '#3073F2'} |
| getGroupTitle          | (groupData: any) => ReactNode                             | \[表视图\]获取每个层级分组头的展示内容                         |
| getGroupContent        | (groupData: any) => ReactNode                             | \[列视图\]获取表头的展示内容                                   |
| getGroupName          | (groupData: any) => string                                | 获取分组名称，用默认样式渲染分组头                           |
| getTableContent        | (tableData, group: any) => ReactNode \| string            | 获取节点内容                                                 |
| getEmptyContent        | (group: any) => ReactNode \| string          |  获取空列显示的内容，默认为 null 不做展示                      |
| getTaskTooltipContent  | (edgeData.taskEntity[]) => string \| ReactNode            | 获取连线 tooltip 内容。需连线数据中有 taskEntity 字段对应任务数据 |
| onClickTable           | (tableData) => void                                       | 点击节点事件                                                 |
| onClickEdge           | (edgeData) => void                                       | 点击连线事件                                                 |
| highlightEdge | boolean   | 是否开启连线 hover 和 tooltip 展示交互 |
| highlightMode | "MAIN" \| "ALL"   | 点击节点后的高亮模式， 默认为 "MAIN"， 仅高亮上游或下游。 设置为 "ALL" 则高亮上游和下游 |
| search | (nodeData: any) => boolean   | 定义如何精确搜索节点，如无满足条件的节点则将调用 onEmptySearch 方法  |
| onEmptySearch | () => void   | search 结果为空时触发调用  |
