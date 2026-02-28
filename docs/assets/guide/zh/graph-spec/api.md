# 图实例方法
在创建 Graph 实例后，可以应用以下 api 灵活构建图分析应用。

## 数据操作
| 实例方法                                             | 返回值             | 描述                                                         |
| ---------------------------------------------------- | ------------------ | ------------------------------------------------------------ |
| data(data: DataStructure)                            | void               | 设置数据，如果当前已有数据将被替换                           |
| updateData(data: DataStructure)                      | void               | 更新数据，包括增删图元，修改图元的位置，属性等。如果当前已有数据将进行 merge 操作。 |
| updatePositions(data?: DataStructure)                | void               | 更新全量图元位置，不改变图元属性。适用于布局更新，全图动画等操作。如果传入数据，也不会增删改图元，仅会根据传入数据更新图元位置。 |
| refresh()                | void               | 如果图中仅存在节点和连线，节点数据被直接修改，可以用此方法进一步提升更新实例位置的运行性能。 |
| clear()                             | void | 清空数据                 |
| layout(id?: string, args?: LayoutOptions             | void |  \[NEW\] 刷新布局，可以配置 id 以固定节点位置保持布局刷新后的视窗稳定优化体验，可以传入 args 作为单次布局的配置项。支持配置式布局，如果自行实例化布局配置请使用 `graph.set('layout', layoutInstance)` 以使用此方法。            |


## 实例操作
| 实例方法                                             | 返回值             | 描述                                                         |
| ---------------------------------------------------- | ------------------ | ------------------------------------------------------------ |
| add(type: 'node' \| 'edge' \| 'group', configs: any) | Entity             | 根据配置单独新增一个实例，配置详情请见各实例配置项。返回新增的实例。 |
| update(entity: Node \| Edge \| Group, configs: any) | void            |  更新单个实例的配置。 |
| remove(entity: Node \| Edge \| Group)                | void               | 删除一个实例，此方法会同步删除实例对应的数据。删除 Group 并不会删除 Group 下的所有节点实例。 |
| getNodeById(id: string)                              | Node \| undefined  | 根据 id 获取节点实例，未找到则返回 undefined                 |
| getNodes()                              | Node[]  | 获取 Graph 全部节点实例，返回节点实例数组                 |
| getEdgeById(id: string)                              | Edge \| undefined  | 根据 id 获取连线实例，未找到则返回 undefined                 |
| getEdges()                              | Edge[]  | 获取 Graph 全部连线实例，返回连线实例数组                 |
| getGroupById(id: string)                             | Group \| undefined | 根据 id 获取分组实例，未找到则返回 undefined                 |
| getGroups()                              | Group[]  | 获取 Graph 全部分组实例，返回分组实例数组                 |
| destroy()                              | void  | 销毁 Graph 实例，清除全部数据并移除画布                 |



## 渲染操作
默认情况下`autoDraw = true`,调用任何实例方法会直接进行重绘从而产生视图变化。因此建议在批量操作时禁用 autoDraw 以获得更好的性能。

| 实例方法   | 返回值 | 描述                             |
| ---------- | ------ | -------------------------------- |
| updateRenderMode(mode: 'canvas' \| 'dom') | void  | 更新节点的渲染模式 |
| autoDraw() | void   | 根据配置项 autoDraw 决定是否重绘 |
| draw()     | void   | 直接重绘                         |
| animate()     | string   |  vGraph 封装了一系列开箱即用的动画，详情请见[动画](/vgraph/guide/animate)                   |
| stopAnimate(id?: string)     | void   | 停止指定 id 的动画，若 id 为空则停止所有动画          |


## 视口操作
| 实例方法                                  | 返回值 | 描述                                                         |
| ----------------------------------------- | ------ | ------------------------------------------------------------ |
| changeSize(width: number, height: number) | void   | 调整图的尺寸                                                 |
| fitView()                                 | void   | 将图中内容根据配置项中的宽高进行缩放平移，居中展示整个图。适用于看整图结构的情况。注：若配置了minRatio与 maxRatio则不会超过这个范围。 |
| alignView(align: 'lt' \| 'ct' \| 'rt' \| 'lc' \| 'cc' \| 'rc' \| 'lb' \| 'cb' \| 'rb')  | void   | 保持当前缩放比，将图中内容与指定方位对齐。其中 l：左；c：中；r: 右；t: 上；b: 下。默认 lt。 |
| focus(entity: Node \| Edge \| Group, animate?: boolean \| { duration?: number, easing?: string})      | void   | 接受一个节点、连线、分组实例作为入参，将当前视口移动到实例中心。可配置移动动画，当 focus(node, true) 时执行默认动画效果，可覆写动画执行时长和动效。 |
| getViewCenter()                           | void   | 获取当前视口中心，与 width， height， padding 相关。         |
| getViewPadding()   | number \| number[]   | 获取当前 Graph 的图边缘留白值。 |
| translate(x: number, y: number)           | void   | 将视口进行水平 (x) 和垂直 (y) 向的平移                       |
| scale(ratio: number, center?: number[])   | void   | 缩放视口，是相对于当前的缩放比的。例如当然缩放比 0.5, graph.scale(2) 以后则缩放比为 1。默认以视口原点 (0, 0) 为中心缩放，可以指定缩放中心 center \[x, y\]。 |
| setZoomRatio(ratio: number)   | void   | 以画布中心为原点缩放视口，ratio ＞ 1 时放大，ratio < 1 时缩小。是绝对缩放比。例如当然缩放比 0.5, graph.setZoomRatio(2) 以后则缩放比为 2。 |
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
图上交互一般是监听多个事件给出对应响应。vgraph 内置了一系列常用交互，详情可见[交互行为](/vgraph/guide/behaviors)一小节。




| 实例方法                       | 返回值 | 描述                            |
| ------------------------------ | ------ | ------------------------------- |
| addBehavior(Behavior, Options) | void   | 根据配置项 options 启用一个交互 |
| enableBehavior(type: string)       | void   | 启用指定交互            |
| disableBehavior(type: string)       | void   | 禁用指定交互              |
| getBehavior(type: string)       | void   | 根据交互类型获取交互配置             |
| removeBehavior(type: string)       | void   | 禁用并移除一个交互              |
| handleEvent(e: MouseEvent \| TouchEvent)     | void   |  将一个原生事件在 graph 上触发，多用于在 dom 拖拽节点到图中需要图中元素响应的场景。    |


## 导出操作

| 实例方法                       | 返回值 | 描述                            |
| ------------------------------ | ------ | ------------------------------- |
| getData(fn?:() => entityData)                | DataStructure              | 导出当前图中数据，可以传入一个 function 筛选应该导出的数据 |
|downloadImage(name?: string, maxWidth?: number, maxHeight?: number, onDownloadFinish?: () => void, backgroundColor?: string)| void | 导出图片，图片大小为maxWidth * maxHeight，默认为图的实际大小。 onDownloadFinish 为导出结束回调，backgroundColor 为自定义图背景色，默认透明。 |
|downloadImageWithImageCheck({name?: string, maxWidth?: number, maxHeight?: number, maxWaitTime?: number,onDownloadFinish?: (failImageUrls: string[]) => void, backgroundColor?: string})| void | 等待图中图片加载完成后再导出图片，最多等待 maxWaitTime ms。图片大小为maxWidth * maxHeight，默认为图的实际大小。 onDownloadFinish 为导出结束回调，backgroundColor 为自定义图背景色，默认透明。 |
|||

**注意** `downloadImage`仅用于 canvas 节点。vGraph 为 react 和 vue 节点的图提供了工具方法 `resizeToExport`配合三方 dom to canvas 库实现导出。
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