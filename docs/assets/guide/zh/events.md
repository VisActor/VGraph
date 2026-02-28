# 事件
vgraph 共有三种粒度的事件，满足不同场景下的交互需求。分别是
- 关系图级：对应 Graph 和 TreeGraph 事件。
- 实例级：对应 Node, Edge, Group 实例的事件
- 图形级：对应视觉上组成每种实例的基本图形对象事件

事件会从图形上冒泡到实例再到 graph。例如用户点击了节点上的一个 icon，依次会触发：
- icon 的 click 事件
- node 的 click 事件
- graph 的 node:click 事件
- graph 的 click 事件

<p><img src="/vgraph/guide/event.png" width="400"></p>

vgraph 事件对象组成如下：

```typescript
const e = {
    // 事件类型，例如 click, mouseenter
    type: string;
    // 作用的目标对象，往往与上述的事件粒度对应
    target: Graph |  Node | Edge | Group | Shape;
    // 事件的目标对象相关的节点，就是真正触发事件的图形对象。仅在 graph 事件和实例事件存在
    relatedTarget: Shape;
    // 事件触发时鼠标指针相对于浏览器视口左上角的的水平x坐标和垂直y坐标
    clientX: number;
    clientY: number;
    // 浏览器原生事件
    nativeEvent: Event;
    // 阻止事件冒泡
    stopPropagation(): void;
};
```

## graph 事件
其中最常用的是 graph 级别的事件。在 graph 上可以分类对实例事件监听并做出反应，支持 node、edge、group 上的原生事件类型。事件格式为 `${entity.type}:${eventType}`。例如定义节点点击事件为 `graph.on('node:click', eventHandler)`。目前支持的事件类型有：
- `click`
- `dblclick`
- `mouseenter`
- `mouseleave`
- `mouseover`
- `mouseout`
- `mousedown`
- `mouseup` 
- `mousemove` 
- `contextmenu`

由于实际业务中有很多与画布空白处交互的需求，graph 也设计了空白处交互事件事件，比如想监听点击空白处的事件，推荐使用 `graph.on('canvas:click', callback)`。
同时 graph 作为图的顶层容器，也可以直接监听原子事件，那么在图的任意位置发生相应事件都会触发。这时候可以通过 `e.relatedTarget` 来区分触发事件的对象。



除此之外 graph 实例上也支持交互粒度的事件，vGraph 导出了常量 `GRAPH_EVENTS` 方便引用。具体事件罗列如下
|  事件名称       |    常量       | 描述                                                         |
| ---------------------------------------------------- | ------------------ | ------------------------------------------------------------ |
| change |  GRAPH_EVENTS.CHANGE   | 图中数据变更的通用事件，包括增删改图元，布局等 |
| transformed | GRAPH_EVENTS.TRANSFORMED    |  图的视窗发生变化事件 |
| changesize | GRAPH_EVENTS.CHANGE_SIZE         |  更新画布大小事件 |
| add:start | GRAPH_EVENTS.ADD_START        |  即将新增数据 |
| add:end | GRAPH_EVENTS.ADD_END       |  新增数据完成 |
| update:start | GRAPH_EVENTS.UPDATE_START      |  即将更新数据 |
| update:end | GRAPH_EVENTS.UPDATE_END    |  更新数据完成 |
| visibility:end | GRAPH_EVENTS.VISIBILITY_END    |  图元可见性发生变化 |
| remove:start | GRAPH_EVENTS.REMOVE_START    |  即将删除数据 |
| remove:end | GRAPH_EVENTS.REMOVE_END    |  删除数据完成 |
| state:start | GRAPH_EVENTS.STATE_START    |  图元状态即将变化 |
| state:end | GRAPH_EVENTS.STATE_END   |  图元状态已更新 |
| state:start | GRAPH_EVENTS.STATE_START    |  图元状态即将变化，用于主动通过 setState 的方式更新状态 |
| state:end | GRAPH_EVENTS.STATE_END   |  图元状态已更新，用于主动通过 setState 的方式更新状态 |
| batchstate:start | GRAPH_EVENTS.BATCH_STATE_START    |  图元状态即将变化，用于监听编辑场景中批量场景，不会同时触发 state:start |
| batchstate:end | GRAPH_EVENTS.BATCH_STATE_END   |  图元状态已更新，用于监听编辑场景中批量场景，不会同时触发 state:end |
| layout:start | GRAPH_EVENTS.LAYOUT_START   |  即将重布局 |
| layout:end | GRAPH_EVENTS.LAYOUT_END   |  布局完成|
| data:start | GRAPH_EVENTS.DATA_START   |  即将切换到新数据 |
| data:end | GRAPH_EVENTS.DATA_END   |  已切换到新数据 |
| updatedata:start | GRAPH_EVENTS.UPDATE_DATA_START   |  即将用新数据更新图 |
| updatedata:end | GRAPH_EVENTS.UPDATE_DATA_END   |  用新数据更新图完成 |
| clear:start | GRAPH_EVENTS.CLEAR_START   |  即将清除数据 |
| clear:end | GRAPH_EVENTS.CLEAR_END   |  数据已清除 |
| animationframe | GRAPH_EVENTS.ANIMATION_FRAME   |  动画帧刷新 |
| animation:start | GRAPH_EVENTS.ANIMATION_START   |  开始动画 |
| animation:end | GRAPH_EVENTS.ANIMATION_END   |  当前动画全部完成 |
| draw:start | GRAPH_EVENTS.DRAW_START   | 即将重新渲染 |
| draw:end | GRAPH_EVENTS.DRAW_END   |  渲染完成事件 |

## 实例事件
实例级别的事件就是监听单个实例并做出反应。例如 `node.on('click', callback)`。节点上的 click 事件会冒泡到 graph 上，因此 graph 上的 `node:click` 事件也会随后被触发。推荐用于单个节点特殊操作的情况。

## 图形事件
图形级别的事件多用于自定义节点，连线，分组的个性化图形交互操作。例如上述冒泡的例子，有些情况下点击 icon 不希望触发 node 级别的 click 事件等，就可以监听 icon 事件处理。