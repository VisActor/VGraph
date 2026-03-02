# 流水线-阅读模式

PipelineEditor 是用 vgraph 打造的流程编排工具，常用于安排工作流程。目前已经落地的场景有 Dorado 项目管理流水线等。这是一个纯 js 组件，引用方式为：
```javascript
import { PipelineReader } from '@visactor/vgraph';

const pipelineReader = new PipelineReader(options);

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



### 实例方法                  
| 实例方法                                 | 返回值  | 描述                                                         |
| ---------------------------------------- | ------- | ------------------------------------------------------------ |
| updateNode | (node: Node, configs: Record<string,any>) => void | 更新节点数据  |
| focusNode | (node: Node) => void; | 将节点移动到视窗中心 |
| getGraph                                  | Graph   |  获取解决方案对应的图实例 Graph      |


### 内置节点
为了满足更多场景的需求，pipelineReader 并没有指定的节点类型，但提供了推荐的节点注册方法可以复用。用户也可自行注册更贴合你业务场景的节点，在 `setDefaultNode` 配置项中设置 `type` 为你注册的节点名称即可。推荐注册方法：

``` javascript
import { registerPipelineReaderNode } from '@visactor/vgraph';
registerPipelineReaderNode(options);
```

**注意：**
- 内置节点会根据节点上的 `actions` 字段平铺至多两个操作到节点右下角，当 `actions` 多于默认两个时会添加更多菜单，与 Trigger 组件配合展示更多操作。

<img src="/vgraph/guide/node/pipeline_reader_node.png" width="300">

注册内置节点的配置项如下：

| 字段        | 类型                | 描述                                                         |
| ----------- | ------------------- | ------------------------------------------------------------ |
| moreIcon               | string  |    更多节点操作图标的图片 cdn   |
| maxActionCount           | number  |  多于几个操作会隐藏，展示 moreIcon  |


内置节点使用的节点字段如下：


| 字段        | 类型                | 描述                                                         |
| ----------- | ------------------- | ------------------------------------------------------------ |
| label       | string  |  节点名称   |
| imgUrl         | string  |  节点名称前的图片 cdn |
| duration         | string  |  节点左下角耗时 |
| actions       | { name: string, callback: (nodeData: Record<string,unknown>) => void; }\[\]  |  节点右下角操作 |