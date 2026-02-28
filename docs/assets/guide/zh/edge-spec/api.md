# 实例方法

## 状态管理

| 实例方法                                 | 返回值  | 描述                                                         |
| ---------------------------------------- | ------- | ------------------------------------------------------------ |
| setState(state: string, onlyState=false) | void    | 设置连线状态，用于连线结构不变，外观发生改变的时候的简便方法。使用详情可见 [状态管理](/vgraph/guide/states) 一节 |
| clearStates()                            | void    | 清除所有连线状态                                             |
| removeState(state: string)               | void    | 移除连线某状态                                               |
| show()                                   | void    | 显示连线                                                     |
| hide()                                   | void    | 隐藏连线                                                     |
| isVisible()                              | boolean | 查询连线的显隐状态。                                         |
| toFront()                             | boolean |   将连线移动到所有连线之前。              |
| toBack()                              | boolean |     将连线移动到所有连线之后。           |

## 关系查询

| 实例方法                    | 返回值       | 描述                                                         |
| --------------------------- | ------------ | ------------------------------------------------------------ |
| get(key: string)            | any  | 获取连线上的某个配置项。 |
| set(key: string, value: any)  | void  | 更新连线上的业务数据项，这是一个不涉及图形变更的操作，如果需要将更新反应到图中请使用 updateData。 |
| updateData(data: NodeData)  | void         | 更新连线数据，支持差量数据更新会和旧数据进行 merge，会引起连线图形更新。                           |
| setSource(sourceId: string) | void         | 设置连线的来源节点。设置的不一定真实连接到此节点，由根据节点所在分组和配置共同决定 |
| setTarget(targetId: string) | void         | 设置连线的去向节点。设置的不一定真实连接到此节点，由根据节点所在分组和配置共同决定 |
| getSource()                 | Node \|Group | 获取连线真实连接的来源实体                                   |
| getTarget()                 | Node \|Group | 获取连线真实连接的去向实体                                   |

## 图形操作

| 实例方法      | 返回值           | 描述                                         |
| ------------- | ---------------- | -------------------------------------------- |
| getBBox()     | BBox             | 获取连线盒模型                               |
| getKeyShape() | Shape            | 获取连线的关键图形，一般是 path              |
| getLayer()    | void             | 获取连线绘图容器，可以进一步得到所有内部图形 |
| getLabel()    | Text \|undefined | 获取文本标签图形(如有配置)                   |
| setOpacity()                            | void    | 设置整个连线的透明度，包括文本标签等。                                       |

## 事件操作
| 实例方法                        | 返回值           | 描述                                                         |
| ------------------------------- | ---------------- | ------------------------------------------------------------ |
| on(eventType: string, callback(e: GraphEvent) => void)     | void             | 在连线上添加一个特定事件的处理程序。更多事件相关的说明可见[事件指南](/vgraph/guide/events) |
| once(eventType: string, callback(e: GraphEvent) => void)     | void             | 在连线上添加一个只触发一次的事件处理程序 |
| emit(eventType: string, args: any)     | void             | 触发连线上的一个指定事件|
| off(eventType: string, callback(e: GraphEvent) => void)     | void             | 在连线上解除一个特定事件的处理程序 |
| removeAllListeners()     | void             | 移除连线上所有的事件处理程序 |