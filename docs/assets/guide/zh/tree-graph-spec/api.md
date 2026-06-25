# 树图实例方法
在创建 TreeGraph 实例后，可以应用以下 api 灵活构建图分析应用。

## 数据操作
| 实例方法                                             | 返回值             | 描述                                                         |
| ---------------------------------------------------- | ------------------ | ------------------------------------------------------------ |
| data(data: TreeDataStructure)                            | void               | 设置数据，如果当前已有数据将被替换                           |
| updateData(data: TreeDataStructure)                      | void               | 更新数据，包括增删图元，修改图元的位置，属性等。如果当前已有数据将进行 merge 操作。 |
| updatePositions(data?: DataStructure)                | void               | 更新全量图元位置，不改变图元属性。适用于布局更新，全图动画等操作。如果传入数据，也不会增删改图元，仅会根据传入数据更新图元位置。 |
| refresh()                | void               | 如果图中仅存在节点和连线，节点数据被直接修改，可以用此方法进一步提升更新实例位置的运行性能。 |
| getTreeData(fn?:() => {}) | TreeDataStructure | 以嵌套数据的形式导出当前图数据，可以传入一个 function 筛选指定导出的数据 |
| clear()                             | void | 清空数据                 |
| layout(treeData?: TreeData, focus?: Node             | void |  \[NEW\] 刷新布局，默认根据当前数据布局，也可以传入新数据。可以配置 focus 节点实例 以固定节点位置保持布局刷新后的视窗稳定优化体验。         |



## 实例操作
| 实例方法                                             | 返回值             | 描述                                                         |
| ---------------------------------------------------- | ------------------ | ------------------------------------------------------------ |
| expand(node: Node, focusNode?: boolean)            | Void | 展开指定节点下的子树，数据对应会修改`collapsed = false`。因此需保证 collapsed 字段没有业务含义，否则会被覆盖。设置 focusNode 后会固定被操作节点位置。 |
| collapse(node: Node, focusNode?: boolean)          | void | 收起指定节点下的子树，数据对应会修改`collapsed = true`。因此需保证 collapsed 字段没有业务含义，否则会被覆盖。设置 focusNode 后会固定被操作节点位置。 |
| toggleCollapse(node: Node)    | void | 切换指定节点的展开/收起状态。                                |
| addChild(data: any, parent: Node \| string) | Node             | 给指定父节点 parent 新增一个子节点或子树，配置详情请见[节点配置项](/vgraph/guide/node-spec/options)。返回新增的节点实例。 |
| removeChild(child: Node, parent: Node \| string)                | void               | 删除父节点下的指定子节点或子树 |
| moveNode(node: Node, parent: Node) | void | 将指定节点 node 移动到 parent 节点下成为 parent 节点的子节点 |
| setLayout(layout: TreeLayout) | void | 更新树布局方式                                               |
| getNodeById(id: string)                              | Node \| undefined  | 根据 id 获取节点实例，未找到则返回 undefined                 |
| getNodes()                              | Node[]  | 获取 Graph 全部节点实例，返回节点实例数组                 |
| getEdgeById(id: string)                              | Edge \| undefined  | 根据 id 获取连线实例，未找到则返回 undefined                 |
| getEdges()                              | Edge[]  | 获取 Graph 全部连线实例，返回连线实例数组                 |
| getGroupById(id: string)                             | Group \| undefined | 根据 id 获取分组实例，未找到则返回 undefined                 |
| getGroups()                              | Group[]  | 获取 Graph 全部分组实例，返回分组实例数组                 |
| destroy()                              | void  | 销毁 TreeGraph 实例，清除全部数据并移除画布                 |



## 渲染操作
默认情况下`autoDraw = true`,调用任何实例方法会直接进行重绘从而产生视图变化。因此建议在批量操作时禁用 autoDraw 以获得更好的性能。



| 实例方法   | 返回值 | 描述                             |
| ---------- | ------ | -------------------------------- |
| autoDraw() | void   | 根据配置项 autoDraw 决定是否重绘 |
| draw()     | void   | 直接重绘                         |

## 视口操作
| 实例方法                                  | 返回值 | 描述                                                         |
| ----------------------------------------- | ------ | ------------------------------------------------------------ |
| changeSize(width: number, height: number) | void   | 调整图的尺寸                                                 |
| fitView()                                 | void   | 将图中内容根据配置项中的宽高进行缩放平移，居中展示整个图。适用于看整图结构的情况。注：若配置了minRatio与 maxRatio则不会超过这个范围。 |
| focus(entity: Node \| Edge \| Group, animate?: boolean \| { duration?: number, easing?: string)      | void   | 接受一个节点、连线、分组实例作为入参，将当前视口移动到实例中心。可配置移动动画，当 focus(node, true) 时执行默认动画效果，可覆写动画执行时长和动效。 |
| getViewCenter()                           | void   | 获取当前视口中心，与 width， height， padding 相关。         |
| translate(x: number, y: number)           | void   | 将视口进行水平 (x) 和垂直 (y) 向的平移                       |
| scale(ratio: number, center?: number[])   | void   | 缩放视口，ratio ＞ 1 时放大，ratio < 1 时缩小。默认以视口原点 (0, 0) 为中心缩放，可以指定缩放中心 center \[x, y\]。 |
| setZoomRatio(ratio: number)   | void   | 以画布中心为原点缩放视口，ratio ＞ 1 时放大，ratio < 1 时缩小。 |
| getZoomRatio()   | number   | 获取当前 Graph 的缩放大小。 |


## 坐标变换
一般来说在图分析过程中会遇到三种坐标的相互转换，三种坐标分别是：
- client: 窗口坐标，以浏览器显示区域的左上角为 (0, 0)
- viewport: 图可见区域坐标，以图容器的左上角为 (0, 0)
- canvas: 实际画布坐标，在没有缩放平移等操作时与 viewport 坐标一致。

vGraph 提供了便捷的坐标转换方法，通常用于在事件 handler 中确定点击画布位置，或根据实例的位置来做 dom 的定位等。



| 实例方法                                           | 返回值                 | 描述                             |
| -------------------------------------------------- | ---------------------- | -------------------------------- |
| clientToViewport(clientX: number, clientY: number) | {x: number, y: number} | 窗口坐标转换为图可见区域视口坐标 |
| clientToCanvas(clientX: number, clientY: number)   | {x: number, y: number} | 窗口坐标转换为画布坐标           |
| canvasToViewport(x: number, y: number)             | {x: number, y: number} | 画布坐标转换为可见区域视口坐标   |
| viewportToCanvas(vx: number, vy: number)           | {x: number, y: number} | 可见区域视口坐标转换为画布坐标   |

## 配置项操作
| 实例方法                           | 返回值 | 描述                                                         |
| ---------------------------------- | ------ | ------------------------------------------------------------ |
| get(key:string)                    | any    | 获取当前 graph 配置项信息                                    |
| set(options: {\[key: string\]: any}) | void   | 设置当前 graph 配置项。注意: 此操作不会触发自动重绘，需要手动调用 graph.draw() |

## 交互操作
图上交互一般是监听多个事件给出对应响应。vgraph 内置了一系列常用交互，，详情可见[交互行为](/vgraph/guide/behaviors)一小节。



| 实例方法                       | 返回值 | 描述                            |
| ------------------------------ | ------ | ------------------------------- |
| addBehavior(Behavior, Options) | void   | 根据配置项 options 启用一个交互 |
| removeBehavior(Behavior)       | void   | 禁用并移除一个交互              |


## 导出操作

| 实例方法                       | 返回值 | 描述                            |
| ------------------------------ | ------ | ------------------------------- |
| getData(fn?:() => entityData)     |   { nodes: NodeData[], edges: EdgeData: [] }    |  以平铺方式导出当前图中数据，可以传入一个 function 筛选应该导出的数据 |
| getTreeData(fn?:() => entityData)    |   TreeData        | 以树形结构导出当前图中数据，可以传入一个 function 筛选应该导出的数据 |
|downloadImage(name?: string, maxWidth?: number, maxHeight?: number, onDownloadFinish?: () => void, backgroundColor?: string)| void | 导出图片，图片大小为maxWidth * maxHeight，默认为图的实际大小。 onDownloadFinish 为导出结束回调，backgroundColor 为自定义图背景色，默认透明。 |


**注意** `downloadImage`仅用于 canvas 节点。vGraph( >= 1.6.1) 为 react 节点的图提供了工具方法 `resizeToExport`配合三方 dom to canvas 库实现导出。
``` javascript
import domtocanvas from 'third-party-export-lib';
import { Graph, resizeToExport } from '@visactor/vgraph';

const graph = new Graph({ container, ....});
// 导出前的视口信息
const { matrix } = resizeToExport(graph);
// 视图重渲染后
onDomRendered(() => {
  domtocanvas(container);
  // 恢复导出前视口信息
  graph.setMatrix(matrix);
  // 恢复原本图大小
  graph.changeSize(containerWidth, containerHeight);
});
```