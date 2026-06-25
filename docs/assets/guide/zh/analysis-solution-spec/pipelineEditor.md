# 流水线-编辑模式

PipelineEditor 是用 vgraph 打造的流程编排工具，常用于安排工作流程。目前已经落地的场景有 Dorado 项目管理流水线等。这是一个纯 js 组件，引用方式为：
```javascript
import { PipelineEditor } from '@visactor/vgraph';

const pipelineEditor = new PipelineEditor(options);

```

### 配置项

| 字段        | 类型                | 描述                                                         |
| ----------- | ------------------- | ------------------------------------------------------------ |
|  data  |  { nodes: Record<string,unknown>[], edges: Record<string,unknown>[] }   |   图中数据，若为空可直接调用 pipelineEditor.initEmptyEditor()    | 
|  container |  string \|  HTMLDivElement   |   \[必填\]流水线容器    | 
|  graphSize  |  number[]   |   \[必填\]容器大小, 格式为 \[宽， 高\]       | 
| nodeSize  |  number[]  | 节点大小, 格式为 \[宽， 高\]      | 
|  layout |  object   |  布局设置     | 
| layout.rankSep  |  number    |  不同列节点的间距     | 
|  layout.nodeSep |  number   |  同列节点的间距     | 
|  padding |   number[]  |  四边间距，格式为 \[上下间距， 左右间距\]     | 
|  setDefaultNode | (nodeData: Record<string,unknown>) =>  Record<string,unknown>  |  设置节点默认样式，用法同 Graph 的 setDefaultNode     | 
|  setDefaultEdge | (edgeData: Record<string,unknown>) => Record<string,unknown>  |  设置连线默认样式，用法同 Graph 的 setDefaultEdge    | 
|  setNodeStateStyles | (state: string, nodeData:  Record<string,unknown>, node: Node) |  根据节点所处状态配置状态样式，与 node.setState 配合使用，用法同 Graph 的 setNodeStateStyles    | 
|  setEdgeStateStyles | (state: string, edgeData:  Record<string,unknown>, edge: Edge) |  根据连线所处状态配置状态样式，与 edge.setState 配合使用，用法同 Graph 的 setEdgeStateStyles    | 
| onClickNode | (node: Node, e: GraphEvent) => void | 节点点击事件  |
| shouldDrag |  (e: GraphEvent, target: Node) => boolean | 是否允许拖拽当前节点 |
| shouldDrop |  (ev: GraphEvent, target: Node, relativeNode: Node, pos: 'L' \| 'M' \| 'R') => boolean | 是否允许将节点放置到当前位置，返回 false 则恢复原状 |
| onDropNode | (target: Node) => void | 节点拖拽完成事件  |



### 实例方法                  
| 实例方法                                 | 返回值  | 描述                                                         |
| ---------------------------------------- | ------- | ------------------------------------------------------------ |
| addNode | (relativeId: string, pos: 'L' \| 'M' \| 'R')  | 相对于 id 为 relativeId 的节点定位添加节点。L: 左边, M: 下方，R: 右边。 |
| removeNode | (node: Node) => void  | 删除节点 |
| moveNode | (node: Node, relativeNode: Node, pos: 'L' \| 'M' \| 'R') => void | 将节点移动到另一节点的相对位置  |
| updateNode | (node: Node, configs: Record<string,any>) => void | 更新节点数据  |
| focusNode | (node: Node) => void; | 突出展示节点 |
| exportData | (fn?: (entity: Node \| Edge, type: 'node' \| 'edge') => Record<string,any>) => { nodes: Record<string,unknown>\[\], edges: Record<string,unknown>\[\] } | 导出图中数据 |
| getGraph                              | Graph   |  获取解决方案对应的图实例 Graph      |


### 内置节点
为了满足更多场景的需求，pipelineEditor 并没有指定的节点类型，但提供了推荐的节点注册方法可以复用。用户也可自行注册更贴合你业务场景的节点，在 `setDefaultNode` 配置项中设置 `type` 为你注册的节点名称即可。以下是推荐节点的注册方法：

``` javascript
import { registerPipelineEditorNode } from '@visactor/vgraph';
registerPipelineEditorNode(options);
```

<img src="/vgraph/guide/node/pipeline_editor_node.png" width="300">

各部分配置项如下：

| 字段        | 类型                | 描述                                                         |
| ----------- | ------------------- | ------------------------------------------------------------ |
| addImage                | string  |    添加节点图标的图片 cdn   |
| onClickImage            | (e: ShapeEvent, nodeData: any)  |  用户点击添加图标事件   |
| errorImage             | string  |    节点异常图标的图片 cdn，在节点数据的 error 参数为 true 时出现   |


内置节点使用的节点字段如下：


| 字段        | 类型                | 描述                                                         |
| ----------- | ------------------- | ------------------------------------------------------------ |
| label       | string  |  节点名称   |
| error         | boolean  |  为 true 时在节点名称后展示异常图片 |
