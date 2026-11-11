# React 节点组件
React 节点组件 Viewer 允许用于以 React 组件的形式定义节点，主要用于**可交互节点展示**的**小数据量**图分析场景中。在使用本组件之前请先考虑以下几点：
- 如果是简单的节点样式，并不包含例如标签页 (Tab) 等复杂 UI, 鼓励使用 vGraph [内置节点](/vgraph/guide/node-spec/prebuilt)配合[原子组件](/vgraph/guide/node-addon-spec/tag)实现自定义节点样式。
- Viewer 自带局部渲染配置项(localRendering)以提升展示性能，但是出现在屏幕中总的 dom 个数(并非节点个数)不宜超过 **2k**，可能会出现明显的使用不流畅问题。
- 开启局部渲染后节点仅支持**无状态组件**(Stateless Component), 业务数据请存储到节点上 (node.set)，然后调用 Viewer 的 refresh 方法刷新视图。或者关闭局部渲染配置项以支持**有状态组件**(Stateful Component)。
- 组件支持内置连线和布局重组动画，节点动画请使用 React 相关机制实现。

### Viewer 使用方法
Viewer 会在 Graph 的数据基础上渲染 React 组件节点，因此用户可以直接按照 Graph 或 TreeGraph 的用法来实现交互逻辑，然后在 Viewer 刷新节点样式以达到同步的修改。Viewer 会感知 panZoom 等 Graph 内置交互并实现自动更新视图，因此仅在用户自定义交互需要手动刷新。
```javascript
import React, { useEffect, useState, useRef } from "react";
import { Graph, GraphEvent } from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';

export default () => {
  // Graph 实例
  const [graph, setGraph] = useState<null | Graph>(null);
  const viewer = useRef();

  useEffect(() => {
    const g = new Graph(...);
    setGraph(g);

    // 自定义交互举例：点击节点展开下游数据
    g.on('node:click', (e: GraphEvent) => {
      e.target.set('expand', true);
      expandNode(...);
      // 更新完 graph 后手动刷新节点视图
      viewer.current.refresh();
    });
  }, []);

  return <div id="graphContainer">
    {graph && <Viewer graph={graph} ref={viewer} ...props />}
  </div>;
}
``` 

### Viewer 配置项

| 配置项    | 类型                                                         | 描述                                               |
| --------- | ------------------------------------------------------------ | -------------------------------------------------- |
| graph     | Graph \| TreeGraph                                            |  \[必填\] 指定 Viewer 对应的图实例                    |
| setNode   | (node: Node ) => ReactNode | \[必填\] React 节点组件       |
| setNodeClassName | (node: Node) => string \| string\[\]    | 给节点容器添加 className         |
| setAnchor   |  (node: Node, anchor: AnchorConfigs) => ReactNode | React 锚点组件       |
| setAnchorClassName | (node: Node) => string \| string\[\]    | 给锚点容器添加 className         |
| setGroupTitle | (group: Group) => ReactNode    |  \[NEW\] React 分组标题组件。请在 group 上配置 `titleSize` 配合使用。   |
| setRenderOrder | (items: (Node \| Group)[]) => (Node \| Group)[] | 自定义可见节点与分组标题的 DOM 顺序。默认先分组标题、后节点；回调接收新的混合数组，返回期望的排列。 |
| localRendering | boolean | 是否开启局部渲染，开启后节点仅支持无状态组件，关闭后支持有状态组件。默认开启。 |
| hideDetails  | object    | 当缩放比很小时屏幕中可能有很多节点，而这些节点内容基本看不清，可以配置此选项显示概要信息并提升流畅度   |
| hideDetails.ratio    | number | 当缩放比小于 ratio 时隐藏节点细节  |
| hideDetails.getNodeStyles    | (node: Node) => Record<string, any> |  隐藏节点时加到容器上的 css 样式，可以在节点很小的时候展示节点分类等帮助用户快速定位节点。  |
| responsiveNode | boolean | 是否开启响应式 React 节点，如果开启，则会响应 React 节点的宽高变化并触发连线位置的重新绘制。 |
| onResizeNode | (node: Node, bbox: BBox) => void  | 节点宽高发生变化时的回调函数。 |

### 自定义节点与分组标题的顺序

```tsx
<Viewer
  graph={graph}
  setNode={setNode}
  setGroupTitle={setGroupTitle}
  setRenderOrder={(items) => items.reverse()}
/>
```

这里将默认的“分组标题 → 节点”反转。回调接收当前可见元素的新数组，
原地排序不会改变 Viewer 的节点或分组状态数组。回调可能在每次渲染时执行，
包括初次渲染的空数组，应只返回排列结果，避免在其中更新 React 状态。
同一层叠上下文中，后面的元素通常覆盖前面的元素；显式 CSS 层级仍会影响最终遮挡。

本地 `render_order.html` 示例提供默认与反转顺序的对照，并校验回调与 DOM 顺序。

### Viewer ref 方法
| 方法   | 类型                                                         | 描述                                               |
| --------- | ------------------------------------------------------------ | -------------------------------------------------- |
| refresh     | (forced=false) => void;            |  刷新 react 视图。Viewer 仅会在 graph 发生平移缩放时进行自动刷新，其余情况请按需手动刷新。当数据刷新时建议配置 force 为 true 强制刷新一次。         |
| updateSize   | () => void; | 当图实例的大小发生变化时请调用 updateSize 保持组件的大小一致 |
