# 节点编辑 NodeMover

NodeMover 是 vGraph 中适用于图编辑场景的节点编辑组件，用于在图上拖拽节点。与[交互行为 dragNode](/vgraph/guide/behaviors#dragNode/%E6%8B%96%E6%8B%BD%E8%8A%82%E7%82%B9) 相比，NodeMover 更加适用于图编辑场景。在配置了[操作栈 Stack](/vgraph/guide/editor-spec/stack)和[智能路由 Router](/vgraph/guide/editor-spec/router)组件后，NodeMover 组件内会在拖拽节点的过程中，完成操作栈的相关逻辑以支持撤销(undo)和重做(redo)，以及自动更新相关连线的智能路由路径。

以下是节点编辑组件 NodeMover 的使用方法示例。也可以在 demo 中进行体验。

```javascript
import { Graph, NodeMover } from "@visactor/vgraph";
const nodeMover = new NodeMover(graph, {
	stack,
	router,
	...
})
```

## 配置项

`NodeMoverOptions` 定义如下：

| 字段          | 类型                                                    | 描述                                                                                                                                                         |
| ------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| group | boolean | 是否允许移动分组，默认为 false。 |
| stack         | Stack                                                   | 操作栈实例。用于组件在拖拽节点过程中完成操作栈相关逻辑以支持撤销(undo)和重做(redo)。如未传入，则节点拖拽操作无法撤销和重做。         |
| router        | Router      | 智能路由组件实例。用于组件在拖拽节点过程中完成智能路由路径的自动更新。        |
| snapline      | boolean \| {styles?: Record<string, any>;}              | 默认为关闭。是否开启对齐线。styles 可配置对齐线的样式, 可参考[Path](/vgraph/guide/shape-spec/path)样式。。      |
| autoTranslate | boolean                                                 | 默认开启。开启后，拖拽到视图边界后将自动平移画布以扩扩展视图边界。  |
| alignGrid     | boolean                                                 | 默认开启。开启后，拖拽节点的坐标将以网格大小的整数倍进行移动。          |
| debounce      | boolean                                                 | 默认关闭。是否开启路由更新的防抖。在移动的节点涉及较多连线时，连线的路由更新可能较为耗时，开启防抖配置可利于用户专注节点的拖拽避免频繁计算连线路由导致卡顿。 |
| shouldTrigger | (e: GraphEvent, shape?: Shape) =>boolean                | 判断节点此时是否处于可拖拽状态。当组应用同时接入 NodeMover 和 EdgeEditor 时需可以在此根据触发事件的元素判断是否应触发移动节点。              |
| shouldDrop    | (e: GraphEvent, target?: Node) =>boolean                | 判断节点此时是否可放置。如果不可放置，则会回退至起始状态。        |
| onDragStart   | (target: Node\|Group, e: GraphEvent) =>void                    | 拖拽开始的回调函数。                                                                                                                                         |
| onDragEnter   | (target: Node\|Group, e: GraphEvent) =>void                    | 拖拽进入某个其他节点时触发的回调函数。                                                                                                                         |
| onDragLeave   | (target: Node\|Group, e: GraphEvent) =>void                    | 拖拽离开某个其他节点时触发的回调函数。                                                                                                                       |
| onDrag        | (target: Node\|Group, offsetX: number, offsetY: number) =>void | 拖拽时每次移动时触发的回调函数。                                                                                                                             |
| onDrop        | (target: Node\|Group) =>void                                   | 放置后触发的回调。                                                                                                                                           |
| onDropFail    | (target: Node\|Group) =>void                                   | 放置失败时触发的回调。                                                                                                                                       |
| getLimitBox | (target: Node) => { left: number, top: number, width: number, height: number } | 限制当前节点的移动范围，效果和使用可参考[有向图自由编辑-限制分组移动](/vgraph/demo/editor/commonFlowEditorLimitGroup) |

## 实例方法

| 实例方法  | 返回值 | 描述       |
| --------- | ------ | ---------- |
| enable()  | void   | 开启组件。 |
| disable() | void   | 关闭组件。 |
