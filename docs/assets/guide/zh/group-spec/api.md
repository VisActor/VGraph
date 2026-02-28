# 分组实例方法

## 可见性与状态管理
| 实例方法    | 返回值  | 描述                                                         |
| ----------- | ------- | ------------------------------------------------------------ |
| show()      | void    | 显示分组                                                     |
| hide()      | void    | 隐藏分组                                                     |
| isVisible() | boolean | 查询分组的显隐状态                                           |
| collapse()  | void    | 收起分组内节点，仅保留 title 和连线。当没有定义 title 时效果同 hide。数据对应会修改collapsed = true。因此需保证 collapsed 字段没有业务含义，否则会被覆盖。若是自定义 title，此时也会刷新 title。 |
| expand()    | Void    | 展开分组内节点。数据对应会修改collapsed = false。因此需保证 collapsed 字段没有业务含义，否则会被覆盖。若是自定义 title，此时也会刷新 title。 |
| setState(state: string, onlyState=false) | void | 设置分组状态，用于分组结构不变，外观发生改变的时候的简便方法。使用详情可见 [状态管理](/vgraph/guide/states) 一节。 |
| clearStates()                            | void | 清除所有分组状态                                             |
| removeState(state: string)               | void | 移除分组的指定状态                                           |

## 关系查询
| 实例方法                                          | 返回值 | 描述                                                         |
| ------------------------------------------------- | ------ | ------------------------------------------------------------ |
| get(key: string)            | any  | 获取分组上的某个配置项。 |
| set(key: string, value: any)  | void  | 更新分组上的业务数据项，这是一个不涉及图形变更的操作，如果需要将更新反应到图中请使用 updateData。 |
| updateData(data: NodeData)  | void         | 更新分组数据，支持差量数据更新会和旧数据进行 merge，会引起连线图形更新。                           |
| addChild(child: Node \| Group)                    | void   | 添加孩子节点或分组。如果批量添加可以使用addChildrenByIds以获得更好的性能。 |
| addChildrenByIds(ids: string[])                   | void   | 批量添加孩子节点或分组                                       |
| removeChild(child: Node \| Group, destroy = true) | void   | 从分组中移除实例，默认会销毁被移除实例，可以设置 destroy = false 保留实例。如果批量添加可以使用removeChildrenByIds以获得更好的性能 |
| removeChildrenByIds(id: string[], desroy = true)  | void   | 批量移除孩子节点。默认会销毁被移除实例，可以设置 destroy = false 保留实例 |

## 图形操作
| 实例方法                        | 返回值        | 描述                                         |
| ------------------------------- | ------------- | -------------------------------------------- |
| getBBox()                       | BBox          | 获取分组盒模型                               |
| translate(x: number, y: number) | void          | 分组整体平移，包括分组内的孩子节点与分组     |
| getKeyShape()                   | Shape         | 获取分组的关键图形                           |
| getLayer()                      | Layer         | 获取分组绘图容器，可以进一步得到所有内部图形 |
| getTitleLayer()                 | Layer \| null | 获取分组标题容器(如有配置)                   |


## 事件操作
| 实例方法                        | 返回值           | 描述                                                         |
| ------------------------------- | ---------------- | ------------------------------------------------------------ |
| on(eventType: string, callback(e: GraphEvent) => void)     | void             | 在分组上添加一个特定事件的处理程序。更多事件相关的说明可见[事件指南](/vgraph/guide/events) |
| once(eventType: string, callback(e: GraphEvent) => void)     | void             | 在分组上添加一个只触发一次的事件处理程序 |
| emit(eventType: string, args: any)     | void             | 触发分组上的一个指定事件|
| off(eventType: string, callback(e: GraphEvent) => void)     | void             | 在分组上解除一个特定事件的处理程序 |
| removeAllListeners()     | void             | 移除分组上所有的事件处理程序 |