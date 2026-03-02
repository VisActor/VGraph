# 连线编辑 EdgeEditor

EdgeEditor 是 vGraph 中适用于图编辑场景的连线编辑组件，用于从锚点中拖拽新增连线、修改连线端点等操作。在配置了[操作栈 Stack](docs/)和[智能路由 Router](docs/)组件后，EdgeEditor组件内会在拖拽连线的过程中，完成操作栈的相关逻辑以支持撤销(undo)和重做(redo)，以及自动更新相关连线的智能路由路径。

以下是连线编辑组件 EdgeEditor 的使用方法示例。也可以在 demo 中进行体验。

```javascript
import { Graph, EdgeEditor } from "@visactor/vgraph";
const edgeEditor = new EdgeEditor(graph, {
	stack,
	router,
	...
})
```

## 配置项

`EdgeEditorOptions` 定义如下。

| 字段               | 类型                                                                               | 描述                                                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| stack              | Stack                                                                              | 操作栈实例。用于组件在拖拽锚点连线过程中完成操作栈相关逻辑以支持撤销(undo)和重做(redo)。如未传入，则节点拖拽导致的数据变更将不进入操作栈。 |
| router             | Router                                                                             | 智能路由组件实例。用于组件在拖拽锚点连线过程中完成智能路由路径的自动更新。                                                                 |
| autoTranslate      | boolean                                                                            | 默认开启。开启后，拖拽到视图边界后将自动平移画布以扩扩展视图边界。                                                                         |
| tempEdgeStyles     | Record<string, any>                      | 拖拽过程中临时连线的样式。默认为蓝色虚线，即：{ strokeStyle: '#3073F2', lineDash: \[4, 4\] }                                                  |
| editTerminal       | boolean                                                                            | 是否可编辑连线的端点。默认为 true。开启后用户可以选中连线拖拽两头端点编辑连线。              |
| dragEdgeToEdit     | boolean                                         | 是否允许直接拖拽连线来编辑节点，需同时打开 editTerminal 配合使用。              |
| editAnchorStyles   | Record<string, any>                                                                | 处于连线编辑状态下连线两头锚点的样式。 可参考[Circle](/vgraph/guide/shape-spec/circle)样式。           |
| magnet             | boolean                                                                            | 是否自动吸附锚点。                                |
| magnetDist         | number                                                                             | 自动吸附锚点的生效距离，默认 28px。                          |
| magnetAnchorStyles | Record<string, any>                                                                | 被吸附锚点的样式, 可参考[Circle](/vgraph/guide/shape-spec/circle)样式。                               |
| shouldTrigger      | (e: GraphEvent, shape: Shape, target: Node, edge?: Edge) =>boolean                 | 判断是否可触发的函数。                                                                                                                     |
| shouldMagnet       | (source: Node, target: Node, anchor: AnchorConfigs) =>boolean                      | 判断是否可吸附的函数。                                                                                                                     |
| shouldDrop         | (source: Node, target: Node, sourceAnchor: number, targetAnchor: number, edit: boolean) =>boolean | 判断是否可放置的函数。                                                                                                                     |
| onDragStart        | (node: Node, e: GraphEvent) =>void                                                 | 拖拽开始时触发的函数。                                                                                                                     |
| onDragEnter         | (node: Node, e: GraphEvent) =>void                                                 | 拖拽过程中经过节点时触发的函数。                                                                                                           |
| onDragLeave        | (node: Node, e: GraphEvent) =>void                                                 | 拖拽过程中离开节点时触发的函数。                                                                                                           |
| onDrag             | () =>void                                                                          | 拖拽过程中移动鼠标时触发的函数。                                                                                                           |
| onDrop             | (source: Node, target: Node) =>void                                                | 放置成功后触发的函数。                                                                                                                     |
| showAnchors        | (anchorConfigs: AnchorConfigs, anchorShape?: Layer, node: Node) =>boolean           | 在拖拽过程中，哪些锚点应当显示（一般情况下代表可连接）。例如业务仅允许从节点的输出锚点连接到另一个节点的输入锚点，可以用这个方法将所有输出锚点隐藏。                                                                                 |

## 实例方法

| 实例方法  | 返回值 | 描述       |
| --------- | ------ | ---------- |
| enable()  | void   | 开启组件。 |
| disable() | void   | 关闭组件。 |
| destroy() | void   | 组件销毁。 |
