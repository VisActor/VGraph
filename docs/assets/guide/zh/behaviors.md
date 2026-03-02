# 交互行为

vGraph 精心打磨沉淀了一些在图分析场景下高频使用的交互，可按需自行引用注册到 graph 示例中即可使用。一般用法如下：

## panZoom 平移缩放
panZoom 适配了触摸板和鼠标的平移缩放操作。触摸板双指平移即画布平移，双指捏合即画布缩放。鼠标滚轮滚动画布缩放。是图分析中最常用的交互行为。每次触发平移缩放操作，即会在 graph 实例上触发 transformed 事件。可用 `graph.on('transformed', e => {...})` 事件中使用 `graph.getZoomRatio()` 方法更新缩放 ui 的缩放比。
<p><img src="/vgraph/guide/pan-zoom.gif" width="400"></p>

```typescript
import { panZoom } from '@visactor/vgraph';

// 添加平移缩放交互
graph.addBehavior(panZoom, { ...options });
// 删除交互
graph.removeBehavior(panZoom);
```


| 配置项      | 类型   | 描述                                     |
| ----------- | ------ | ---------------------------------------- |
| sensitivity | number | 缩放灵敏度，默认为 2。数值越大缩放比越大 |
| keyShapeOnly | boolean | 是否在平移缩放期间仅显示关键图形，建议数据量大时开启 |
| showKeyShapeDelay | number | 平移缩放后显示全量图形的延迟 (ms) |
| xOnly | boolean | 仅开启水平方向平移 |
| yOnly | boolean | 仅开启垂直方向平移 |
| limit | boolean | 仅允许在有图形的区域平移 |
| padding | number | 与 limit 配合使用，允许平移范围的留白 |
| zoom | boolean | 是否允许缩放，默认为 true |
| autoPreventDefault | boolean  | 是否自动阻止浏览器默认行为，例如左滑后退等。默认为 true。可与 shouldTrigger 配合使用。  |
| shouldTrigger  | (evt: WheelEvent, graph: Graph \| TreeGraph) => boolean                                      | 是否允许执行本次缩放平移                                |




## dragCanvas 拖拽画布
鼠标拖拽画布空白区域平移画布，一般与 panZoom 一同使用，作为鼠标平移的交互补充
<p><img src="/vgraph/guide/drag-canvas.gif" width="400"></p>


```typescript
import { dragCanvas } from '@visactor/vgraph';

// 添加鼠标拖拽画布交互
graph.addBehavior(dragCanvas, { ...options });
// 删除交互
graph.removeBehavior(dragCanvas);
```



| 配置项         | 类型                                                | 描述                                                         |
| -------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| canvasOnly      | boolean        | 默认 canvasOnly:true 只有拖拽空白画布处会触发此交互。置为 false 则会响应全局拖拽。若节点连线上有其他拖拽操作请勿置 false。|
| limit | boolean | 仅允许在有图形的区域平移 |
| padding | number | 与 limit 配合使用，允许平移范围的留白 |

## dragNode 拖拽节点

拖拽节点也是图分析中常见的交互，在图分析中往往用于让用户对图的结构进行重新组织整理。

<p><img src="/vgraph/guide/drag-node.gif" width="400"></p>

```typescript
import { dragNode } from '@visactor/vgraph';

// 添加拖拽节点交互
graph.addBehavior(dragNode, { ...options });
// 删除交互
graph.removeBehavior(dragNode);
```


| 配置项         | 类型                                                | 描述                                                         |
| -------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| delegate       | boolean                                             | 默认 delegate:true 新创建一个图形拖拽在拖拽过程中不改变原来布局。false 时直接拖拽节点本身。下图为 delegate: true 的效果。 |
| delegateStyles | 绘图属性，详细可见[rect 配置](/vgraph/guide/shape-spec/rect) | 指定创建的图形样式，对 delegate:true 的配置有效              |
| shouldTrigger  | (e: GraphEvent, shape: Shape) => boolean                                      | 是否允许拖拽节点                                             |
| shouldDrop     | (e: GraphEvent) => boolean                                      | 是否允许放置节点                                             |
| autoTranslate     | boolean          |  鼠标拖拽到视窗边缘时是否自动滚动画布    |
| onDragStart    | (node: Node, e: GraphEvent) => void                                   | 节点开始拖拽事件                                             |
| onDrag         | (node: Node, x: number, y: number) => void          | 节点拖拽位置更新事件                                         |
| onDrop         | (node: Node) => void                                | 节点放置事件                                                 |
| onDragEnter | (node: Node, x: number, y: number) => void | 拖拽鼠标点进入了节点范围内触发 |
| onDragLeave | (node: Node) => void                       | 拖拽鼠标点移出了节点范围后触发 |
| xOnly | boolean | 仅开启水平方向拖拽 |
| yOnly | boolean | 仅开启垂直方向拖拽 |



## highlightRelations 展示联系
鼠标 hover/click 节点高亮直接邻居节点，与图中实体的状态结合能辅助查看节点之间的联系。
<p><img src="/vgraph/guide/hover-relation.gif" width="400"></p>

```typescript
import { highlightRelations } from '@visactor/vgraph';

// 添加高亮关联节点交互
graph.addBehavior(highlightRelations, { ...options });
// 删除交互
graph.removeBehavior(highlightRelations);
```



| 配置项          | 类型   | 描述                                                       |
| --------------- | ------ | ---------------------------------------------------------- |
| trigger | 'hover' \| 'click' | 默认为 hover。高亮关系的触发方式 |
| activeNodeState | string | 默认为 active。需要在 graph 中配置 active 状态对应样式变化 |
| activeEdgeState | string | 默认为 active。需要在 graph 中配置 active 状态对应样式变化 |
| blurNodeState   | string | 默认为 blur。需要在 graph 中配置 blur 状态对应样式变化     |
| blurEdgeState   | string | 默认为 blur。需要在 graph 中配置 blur 状态对应样式变化     |


以下是 highlightRelations 交互与状态结合使用的简单例子。
```typescript
import { Graph, highlightRelations } from '@visactor/vgraph';
const graph = new Graph({
    ...
    setNodeStateStyles(state: string) {
      if (state === 'active') {
        return {
          fillStyle: '#dd8452',
        };
      }
      return { opacity: 0.2 };
    },
    setEdgeStateStyles(state: string) {
      if (state === 'active') {
        return {
          strokeStyle: '#55a868',
        };
      }
      return { opacity: 0.2 };
    },
  });
  graph.addBehavior(highlightRelations);
  // 添加配置项 trigger 可切换为点击高亮关系
  // graph.addBehavior(highlightRelations, { trigger: 'click' });
```



## hideDetails 隐藏细节
当图的缩放比过小时通常认为用户会更关注数据的整体分布情况，而不是单个节点细节。此交互能在此突出整体结构上的信息而隐藏节点细节，与图中实体的状态结合可以在缩小时突出一些关键信息。
<p><img src="/vgraph/guide/hide-details.gif" width="400"></p>

| 配置项    | 类型   | 描述                                         |
| --------- | ------ | -------------------------------------------- |
| hideRatio | number | 现有图缩放到原图的百分比会触发隐藏，默认 0.2 |
| hideState | string | 当节点隐藏细节时给节点添加状态               |

以下是 hideDetails 与节点状态结合使用，在图缩小时总览整体结构同时能看清每个节点分组的简单示例。
```typescript
import { Graph, hideDetails } from '@visactor/vgraph';

const graph = new Graph({
    ...
    setNodeStateStyles(state: string, nodeData: any) {
      if (state === 'hide') {
        return { fillStyle: nodeData.color };
      }
    },
  });
  graph.addBehavior(hideDetails, {
      hideRatio: 0.4,
      hideState: 'hide',
  });
```



## showDetails 展示细节
当图中节点较多往往会遇到节点的文本标签相互重叠看不清的问题。showDetails 用于解决这个问题。使用这个交互时会认为默认状态下用户是看全图结构，而在放大时展示节点等的细节。
<p><img src="/vgraph/guide/show-details.gif" width="400"></p>

| 配置项        | 类型     | 描述                                                       |
| ------------- | -------- | ---------------------------------------------------------- |
| showRatio     | number   | 现有图放大到原图的百分比会触发隐藏，默认 1.5               |
| targets       | string[] | 展示哪些实体的 label。默认为 [ node ]。                    |
| showNodeState | string   | 当节点展示细节时给节点添加状态                             |
| showEdgeState | string   | 当连线展示细节时给连线添加状态，需在 targets 中配置 'edge' |



## attachableDragNode 吸附式拖拽节点
拖拽树节点是树图应用中一种常用的数据重组手段，vGraph 内置了吸附式拖拽交互，所见即所得地组织数据，能显著提升用户体验。应用可参考[重组树节点](/vgraph/demo/practiceCases/MoveNode)。

```typescript
import { attachableDragNode } from '@visactor/vgraph';

// 添加吸附式拖拽节点交互
graph.addBehavior(attachableDragNode, { ...options });
// 删除交互
graph.removeBehavior(attachableDragNode);
```

| 配置项        | 类型     | 描述                                                       |
| ------------- | -------- | ---------------------------------------------------------- |
| delegate     |  boolean  | delegate 为 true 时会新创建一个图形拖拽在拖拽过程中不改变原来布局。false 时直接拖拽节点本身。     |
| delegateStyles       | 绘图属性，详细可见[rect 配置](/vgraph/guide/shape-spec/rect) |  代理图形样式默认为被移动节点 keyShape 的样式，可以自行配置      |
| tempEdgeStyles | 绘图属性，详细可见[path 配置](/vgraph/guide/shape-spec/path)  | 当被拖拽节点自动吸附到另一节点时，示意的连线样式    |
| shouldTrigger | (e: GraphEvent, target: Shape) => boolean  |  是否允许拖拽当前节点 |
| shouldDrop | (e: GraphEvent, target: Node, parent: Node) => boolean  |  是否允许拖拽 target 为 parent 的子节点 |
| onDragStart | (target: Node, e: GraphEvent) => void  |  开始退拽节点事件 |
| onDrag | (overNode: Node, e: GraphEvent) => boolean  | 事件在用户拖拽节点过程中持续被触发 |
| onDrop | (target: Node, parent: Node, e:GraphEvent) => boolean  | 节点能被有效吸附时触发 |
| onAttachNode | (parent: Node) => Node |  是否允许吸附到指定节点 |
| findClosestNode | (target: Node) => boolean  |  根据被拖拽节点的位置自行计算可吸附节点位置，默认为找到距离最小的节点。应用可参考[重组树节点](/vgraph/demo/practiceCases/MoveNode) |



## brushSelect 框选
框选是一种便利的批量数据选择组件，vGraph 内置了框选交互，可以用于对节点、连线、分组进行批量选中。应用可参考[框选 demo](/vgraph/demo/behaviors/brushSelect)。

```typescript
import { brushSelect } from '@visactor/vgraph';

// 添加框选交互
graph.addBehavior(brushSelect, { ...options });
// 删除交互
graph.removeBehavior(brushSelect);
```

| 配置项        | 类型     | 描述                                                       |
| ------------- | -------- | --------------------------------------------------------- |
| targets    |  string[]  |  可选中对象，可以是一种或多种，可选值有 'node', 'edge', 'group'   |
| bkgStyles    |  Record<string, any>  |  选中范围方框的样式，详细可见[rect 配置](/vgraph/guide/shape-spec/rect)，注意请配置 opacity 透明度   |
| autoTranslate    |  boolean |  是否在鼠标选中到视窗边缘时自动滚动画布，默认为 true   |
| canvasOnly   |  boolean |  是否仅在空白画布上选中时开始框选，默认为 true。当图中同时有 dragNode 交互时建议开启。   |
| shouldTrigger   |  (e: GraphEvent) => boolean |  是否允许开始框选   |
| onSelect   |  (entity: Node \| Edge \| Group) => boolean |  拖拽过程中选中某个对象的事件, 当返回 false 时该节点不会被选中   |
| onDeSelect   |  (entity: Node \| Edge \| Group) => void |  拖拽过程中取消选中某个对象的事件   |
| onChange   |  (entity: (Node \| Edge \| Group)\[\]) => void |  框选完成事件   |


## multipleSelect 多选
多选是一种通用的数据选择组件，允许用户按住修饰键的同时点选/反选图中元素，达到比框选更精确灵活的数据选择效果。

```typescript
import { multipleSelect } from '@visactor/vgraph';

// 添加框选交互
graph.addBehavior(multipleSelect, { ...options });
// 删除交互
graph.removeBehavior(multipleSelect);
```

| 配置项        | 类型     | 描述                                                       |
| ------------- | -------- | --------------------------------------------------------- |
| multiple  |  boolean  |  是否允许多选，默认为 true   |
| targets    |  string\[\]  |  可以选中的元素类型，默认为 \['node', 'edge', 'group'\]  |
| modifierKey    |  string\[\] |  自定义修饰键，默认为 \[ 'ctrlKey', 'metaKey' \]  |
| selectState   |  string |  选中元素时给元素添加状态名，反选时也会取消此状态  |
| clickCanvasToReset   |  boolean |  点击空白区域时取消所有选中态   |
| shouldSelectItem  |  (ev: GraphEvent, selections: \[\]) => boolean |  当前点击的节点是否可以被选中  |
| onSelectionsChange   |  (selections: \[\]) => void |  选中元素发生变化回调   |

