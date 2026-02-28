# React hooks
vGraph 为 react 用户提供了经典的 hooks，能提高常用逻辑的研发效率和体验。如果你需要的 React hooks 暂不支持欢迎联系我们。

### useNodes
返回当前所有的节点实例，使用这个 hook 的组件会在节点发生：添加、更新、删除、刷新位置、重新布局、重置数据时重新渲染。节点的 api 请见[Node 实例方法](/vgraph/guide/node-spec/api)。
```javascript
import { useNodes } from '@visactor/react-vgraph';
 
export default function (graph: Graph) {
  const nodes = useNodes(graph);
 
  return <div>当前共有{nodes.length}个节点</div>;
}
``` 

### useEdges
返回当前所有的连线实例，使用这个 hook 的组件会在连线发生：添加、更新、删除、刷新位置、重新布局、重置数据时重新渲染。连线的 api 请见[Edge 实例方法](/vgraph/guide/edge-spec/api)。
```javascript
import { useEdges } from '@visactor/react-vgraph';
 
export default function (graph: Graph) {
  const edges = useEdges(graph);
 
  return <div>当前共有{edges.length}条连线</div>;
}
``` 

### useZoomRatio
useZoomRatio 可以与常见的视图控制组件配合使用。当画布缩放比发生更新时组件会重新渲染。使用可见[demo](/vgraph/demo/reactNodes/useZoomRatio)
```javascript
import { useZoomRatio } from '@visactor/react-vgraph';
 
export default function (graph: Graph) {
  const [zoomRatio, setZoomRatio] = useZoomRatio();
 
  return <div>当前缩放比为{zoomRatio}</div>;
}
``` 

### useSelections
useSelections 可以配合[状态机制](/vgraph/guide/states)获取当前选中的节点、连线、分组 (entity.hasState('select'))。用于侧边栏等补充信息的唤起刷新。当图中元素的 select 状态发生变更时组件重新渲染。
```javascript
import { useSelections } from '@visactor/react-vgraph';
 
export default function (graph: Graph) {
  const selections = useSelections(graph);
 
  return <div>当前选中的有{selections.map(entity => entity.get('id')).join(',')}</div>;
}
``` 