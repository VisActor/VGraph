## Node 实例方法

如果要**批量调用** node 实例方法，建议先将图 `autoDraw` 置为 `false` 。在批量操作结束后手动调用 `graph.draw()`。再将 `autoDraw` 重置为 `true`。可以提升运行时性能。

### 状态管理

| 实例方法                                 | 返回值  | 描述                                                         |
| ---------------------------------------- | ------- | ------------------------------------------------------------ |
| setState(state: string, onlyState=false) | void    | 设置节点状态，用于节点结构不变，外观发生改变的时候的简便方法。默认状态下状态会叠加，如果想同时仅存在一个状态，可以置 `onlyState = true`。使用详情可见 [状态管理](/vgraph/guide/states) 一节。 |
| clearStates()                            | void    | 清除所有节点状态。                                           |
| removeState(state: string)               | void    | 移除状态。                                                   |
| get(key: string)                         | any     | 获取节点原始数据或属性。                                     |
| show(showEdgee=true)                                   | void    | 展示节点以及相关连线。 若传入 false 则仅展示节点。                                      |
| hide()                                   | void    | 隐藏节点以及相关连线。                                       |
| isVisible()                              | boolean | 查询节点的显隐状态。                                         |
| toFront()                             | boolean |   将节点移动到所有节点之前。        |
| toBack()                              | boolean |                将节点移动到所有节点之后。              |

### 关系查询

| 实例方法                   | 返回值        | 描述                                                         |
| -------------------------- | ------------- | ------------------------------------------------------------ |
| get(key: string)            | any  | 获取节点上的某个配置项。 |
| set(key: string, value: any)  | void  | 更新节点上的业务数据项，这是一个不涉及图形变更的操作，如果需要将更新反应到图中请使用 updateData。 |
| updateData(data: NodeData)  | void         | 更新节点数据，支持差量数据更新会和旧数据进行 merge，会引起连线图形更新。                           |
| getEdges()                 | Edge[]        | 获取与节点相关的所有连线。                                   |
| getLinkedNodes()           | Node[]        | 获取与本节点相关联的所有节点。                               |
| getDirectParent()          | Group \| null | 获取直接父分组。                                             |
| getRootParent()            | Group \|null  | 获取根分组。在分组嵌套的情况下会与 `getDirectParent`返回不同分组。 |

### 图形操作

| 实例方法                        | 返回值           | 描述                                                         |
| ------------------------------- | ---------------- | ------------------------------------------------------------ |
| getBBox()                       | BBox             | 获取节点位置盒模型。如果节点存在缩放等变换，会影响盒模型范围。 |
| getKeyShape()                   | Shape            | 获取节点的关键图形。                                         |
| getLayer()                      | void             | 获取节点绘图容器，可以进一步得到所有内部图形。               |
| getLabel()                      | Text \|undefined | 获取文本标签图形。                                           |
| translate(x: number, y: number) | void             | 平移节点。                                                   |
| scale(ratio: number)            | void             | 放大节点。                                                   |
| setOpacity()                            | void    | 设置整个节点的透明度。                                       |

### 事件操作
| 实例方法                        | 返回值           | 描述                                                         |
| ------------------------------- | ---------------- | ------------------------------------------------------------ |
| on(eventType: string, callback(e: GraphEvent) => void)     | void             | 在节点上添加一个特定事件的处理程序。更多事件相关的说明可见[事件指南](/vgraph/guide/events) |
| once(eventType: string, callback(e: GraphEvent) => void)     | void             | 在节点上添加一个只触发一次的事件处理程序 |
| emit(eventType: string, args: any)     | void             | 触发节点上的一个指定事件|
| off(eventType: string, callback(e: GraphEvent) => void)     | void             | 在节点上解除一个特定事件的处理程序 |
| removeAllListeners()     | void             | 移除节点上所有的事件处理程序 |