# 有向图限制编辑

用户通过简单的点击 icon 轻松构建一个有向图。虽然灵活度不如拖拽节点连线编辑有向图的方式，胜在效率高和有向图质量高，不太需要后期进行数据校验。也可与组件 Viewer 配合使用，react 节点能提供实现更多展示和交互的可能。vGraph 将基础功能封装成了组件，可用如下方式引用：

```javascript
import { DAGFlowEditor } from '@visactor/vgraph';

const editor = new DAGFlowEditor(options);

```

**注意:** 为了保证第一层节点的数据顺序，本组件会生成一个 id 为`vgraphDagFlowRoot` 的虚拟根节点，建议保存此数据以确保保存后再次打开的节点顺序。

### 配置项

| 字段        | 类型                | 描述                                                         |
| ----------- | ------------------- | ------------------------------------------------------------ |
|  data  |  { nodes: Record<string,unknown>[], edges: Record<string,unknown>[] }   |   图中数据，若为空可直接调用 pipelineEditor.initEmptyEditor()    | 
|  container |  string \|  HTMLDivElement   |   \[必填\]流水线容器    | 
|  graphSize  |  number\[\]   |   \[必填\]容器大小, 格式为 \[宽， 高\]       | 
| padding  |  number\[\] \| number  | 画布四边留白  | 
|  layout |  object   |  布局设置     | 
| layout.rankDir  |  'LR' \| 'TB'    |  布局方向，LR 为从左向右，TB 为从上到下布局    | 
| layout.rankSep  |  number    |  不同列节点的间距     | 
|  layout.nodeSep |  number   |  同列节点的间距     | 
|  layout.edgeSep |  number   |  节点与连线的距离     | 
|  layout.ignoreControlPoints |  boolean   |  是否忽略布局计算得出的控制点，默认为 false     | 
|  layout.coordAssignment |  'compact' \| 'treeLike'   | 节点布局方式，默认采用紧凑型。treeLike 布局效不同父节点下子节点位置不会重叠。参考[树图编辑-react节点](/vgraph/demo/editor/dagTreeEditor)  | 
|  scroller |   object  |  滚动条配置    | 
|  scroller.enable |   boolean  |  启用或禁用滚动条    | 
|  scroller.option |   object  |  滚动条样式配置项  | 
|  scroller.option.size |   number  |  调整滚动条粗细  | 
|  setDefaultNode | (nodeData: Record<string,unknown>) =>  Record<string,unknown>  |  设置节点默认样式，用法同 Graph 的 setDefaultNode     | 
|  setDefaultEdge | (edgeData: Record<string,unknown>) => Record<string,unknown>  |  设置连线默认样式，用法同 Graph 的 setDefaultEdge    | 
|  setNodeStateStyles | (state: string, nodeData:  Record<string,unknown>, node: Node) |  根据节点所处状态配置状态样式，与 node.setState 配合使用，用法同 Graph 的 setNodeStateStyles    | 
|  setEdgeStateStyles | (state: string, edgeData:  Record<string,unknown>, edge: Edge) |  根据连线所处状态配置状态样式，与 edge.setState 配合使用，用法同 Graph 的 setEdgeStateStyles    | 
| onClickNode | (node: Node, e: GraphEvent) => void | 节点点击事件  |
| onChange |  () => void; | 数据更新事件 |



### 实例方法                  
| 实例方法                                 | 返回值  | 描述                                                         |
| ---------------------------------------- | ------- | ------------------------------------------------------------ |
| addSource | (nodeId: string, configs?: Record<string,unknown>) => void  | 给 id 为 nodeId 的节点添加直接父节点。会直接选中新增节点。 |
| addTarget | (nodeId: string, configs?: Record<string,unknown>, linkChildren = true) => void  | 给指定节点添加子节点，默认会直接给新节点添加现有的子节点的关联，可以置 linkChildren 为 false 取消这一行为。会直接选中新增节点。 |
| addSiblingBefore | (nodeId: string, configs?: Record<string,unknown>, linkChildren = true) => void | 给指定节点添加前置兄弟节点，默认新节点会继承原节点的子节点，可以置 linkChildren 为 false 取消这一行为。会直接选中新增节点。  |
| addSiblingAfter | (nodeId: string, configs?: Record<string,unknown>, linkChildren = true) => void | 给指定节点添加后置兄弟节点，默认新节点会继承原节点的子节点，可以置 linkChildren 为 false 取消这一行为。会直接选中新增节点。  |
| removeNode | (nodeId: string,  removeChildren?: boolean) => void; | 删除指定节点。如果 removeChildren 为 true，则删除以该节点为根节点的整棵子树。 |
| moveNode | (nodeId: string, relativeId: string, position: 'siblingBefore' \| 'siblingAfter' \| 'source' \| 'target') => void; | 移动指定节点到相对节点的指定位置 |
| updateNode | (nodeId: string, configs: Record<string,unknown>) => void; | 如果有自定义操作，可以在执行操作前后留存数据，通过调用此方法存入操作栈，以便支持 undo 和 redo 操作。 |
| getSnapshot | () => SnapshotData; | 将编辑当前的状态生成一个快照，用于配合批量操作 batchChange 实现自定义操作的撤销和重做。  |
| batchChange | (configs: { formerData: SnapshotData, currentData: SnapshotData }) => void; | 如果有自定义操作，可以在执行操作前后调用实例方法 getSnapshot()留存数据，然后通过此方法存入操作栈，以便支持 undo 和 redo 操作。使用案例请见[批量添加节点](/vgraph/demo/editor/dagFlowEditorBatch)。 |
| selectNode | (nodeId: string) => void; | 选中指定节点。 |
| undo | () => void; | 撤销 |
| redo | () => void; | 重做 |
| expandNode | (nodeId: string) => void; | 展开节点下游 |
| collapseNode | (nodeId: string) => void; | 收起节点下游 |
| setData | (data: { nodes: [], edges: [] }) => void; | 写入数据 |
| exportData | (fn?: (entity: Node \| Edge, type: 'node' \| 'edge') => Record<string,any>) => { nodes: Record<string,unknown>\[\], edges: Record<string,unknown>\[\] } | 导出图中数据 |
| getGraph                              | Graph   |  获取解决方案对应的图实例 Graph。 |
| getSelectedNode    | () => Node \| null |  获取当前选中的节点。由于撤销重做等可能造成节点频繁增删，建议每次都使用此接口获取当前被操作节点。 |
| selectionIntoView    | () => void |  平移画布，以保证当前选中的节点在视窗中。 |
| changeSize    | (width: number, height: number) => void |  更新画布大小。 |
| addNode   | (edge: Edge, nodeConfigs?: Record<string, any>)  => void |  在指定连线的两个节点间插入一个节点。 |
| copy | async (node: Node, children = false)=>boolean | 异步函数。复制指定节点，children 为 true 时则复制该节点为根节点的整颗子树。返回是否复制成功。 |
| paste | async (node: Node, edgeConfigs?: Record<string, any>)=>boolean | 异步函数。 将复制的节点或子树作为指定节点的子节点。 edgeConfigs 为连接指定节点和粘贴节点中根节点的自定义连线属性配置。 |
