# 有向图自由编辑

用户通过拖拉拽等方式自由编排节点的位置布局、连接关系，从而自由灵活地构建和编辑有向图。该方式自由度和灵活度较高，可以构建和编辑较为复杂的有向图，因此也导致可能需要进行后期数据校验，否则将可能导致得到数据不符合业务预期的有向图。该组件也可与组件 Viewer 配合使用，react 节点能提供实现更多展示和交互的可能。vGraph 将基础功能封装成了组件，可用如下方式引用：

```javascript
import { CommonFlowEditor } from '@visactor/vgraph';

const editor = new CommonFlowEditor(options);
```

也可以在 demo [有向图自由编排](/vgraph/demo/editor/commonFlowEditor) 中体验。

**什么时候应该使用有向图自由编辑解决方案？**
- 如任务流编排、算子编排等场景。用户可以随意进行关系编辑，从而不受限制的得到任意DAG图（甚至任意图）结构。
例如包含以下情况的关系调整：

|  环/自环  | 逆向边  | 跨层级连线  |  重复边    |      非连通     |
|:--------------------------------------:|:-----------------------------------------:|:---------------------------------------:|:-----------------------------------------------:|:------------------------------------------:|
| ![](/vgraph/guide/editor/self_loop.gif) | ![](/vgraph/guide/editor/reserve_edge.gif) | ![](/vgraph/guide/editor/cross_rank.gif) | ![](/vgraph/guide/editor/reduplicative_edge.gif) | ![](/vgraph/guide/editor/non_connected.gif) |

**有向图自由编辑包含哪些交互能力？**



有向图自由编辑包含流程图编辑场景下的通用能力：
- **移动节点**：鼠标拖拽节点时，连线会自动计算合适的路径躲避其他节点，在合适位置显示对齐线辅助排版。
<img src="/vgraph/guide/api/drag_node.gif" width="600px" />
- **拖拽连线**：不仅内置连线智能路由，也可以通过自定义[连线编辑组件](/vgraph/guide/editor-spec/edgeEditor)的配置项,精确辅助用户连接合法的连线，也支持重编辑连线。内置体验友好的锚点自动吸附功能，内置设计成熟的样式，也可以自定义锚点各种状态的样式。
<img src="/vgraph/guide/api/drag_edge.gif" width="600px" />
- **快捷键**：内置通用快捷键，包括复制、剪切、粘贴、删除、撤销、重做、全选。详情可见[快捷键](/vgraph/guide/editor-spec/shortcuts)
  - **复制/剪切/粘贴**：内置体验友好的粘贴方法。相对于传统的粘贴到原节点附近再自行拖拽的交互，本方案的粘贴会在使用快捷键粘贴时直接粘贴到鼠标处，省去了拖拽节点的过程，操作更高效。



<img src="/vgraph/guide/api/paste.gif" width="600px" />




- **撤销/重做**：实例方法中的数据操作均默认支持撤销和重做，对于自定义数据操作，我们也提供了自定义方法，可见[指令 Command](/vgraph/guide/editor-spec/command#部分自定义指令)
- **React 节点**：组件可以与 react 节点组件 Viewer 配合使用，不仅可以自定义节点样式，还可以自定义锚点。


### 配置项

| 字段                | 类型             | 描述         |
|------------|----------------|-------------------------------|
| container           | string \|  HTMLDivElement    | \[必填\]编辑器容器                         |
| graphSize           | number\[\]  | \[必填\]容器大小, 格式为 \[宽， 高\]        |
| padding             | number\[\] \| number   | 画布四边留白  |
| data                | GraphData  | 图中初始化数据。不填则初始化为空白画布。     |
| setDefaultNode      | (nodeData) => NodeConfigs | 与 Graph 一致。批量设置图中节点配置，具体配置项请见[节点配置项](/vgraph/guide/node-spec/options)  |
| setNodeStateStyles  | (state: string, nodeData: any, node: Node) => keyShapeStyles  | 与 Graph 一致。设置图中节点 keyShape 在特定状态下的样式  |
| setDefaultEdge      | (edgeData) => StateConfigs  | 与 Graph 一致。批量设置图中连线的配置，具体配置项请见[连线配置项](/vgraph/guide/edge-spec/options) |
| setEdgeStateStyles  | (state:string, edgeData: any, edge: Edge) => keyShapeStyles | 与 Graph 一致。设置图中连线 keyShape 在特定状态下的样式  |
| setDefaultGroup     | (groupData) => GroupConfigs | 与 Graph 一致。批量设置图中分组的配置，具体配置项请见[分组配置项](/vgraph/guide/group-spec/options)  |
| setGroupStateStyles | (state: string, groupData: any, group: Group) => keyShapeStyles  | 与 Graph 一致。设置图中分组 keyShape 在特定状态下的样式  |
| scroller            | { enable: boolean; options?: ScrollerOptions; } | 滚动画布组件 Scroller 配置。 默认关闭。 具体配置项参考：[Scroller组件](/vgraph/guide/editor-spec/scroller)|
| nodeMover           | { enable: boolean; options?: NodeMoverOptions; }| 节点编辑组件 nodeMover 配置。 默认开启。 具体配置项参考：[nodeMover组件](/vgraph/guide/editor-spec/nodeMover) |
| edgeEditor          | { enable: boolean; options?: edgeEditorOptions; } | 连线编辑组件 edgeEditor 配置。 默认开启。 具体配置项参考：[edgeEditor组件](/vgraph/guide/editor-spec/edgeEditor)    |
| gridStep            | number     | 网格步长。默认为 10 。  |
| background          | 'grid'  \| 'dot'  \| 'none' | 背景图样式。默认为'dot'  |
| router              | boolean | 是否开启智能路由。默认为 true。  |
| shortcuts           | {  enable?: boolean; customShortcuts?: { \[type: string\]: HandlerOption; } \| <br> ((defaultShortcuts: { \[type: string\]: HandlerOption }, stack?: Stack) => {  \[type: string\]: HandlerOption; }); } | 快捷键配置。 可以从[默认快捷键](/vgraph/guide/editor-spec/shortcuts#内置默认快捷键)中修改，也可以完全自定义快捷键。 |
| select           | { multiple?: boolean, modifierKey?: string[]; shouldSelectItem?: (ev: GraphEvent, selections: (Node\|Edge\|Group)\[\]) => boolean; } | 选择图元的配置，默认单选，任何图元都可被选中。multiple 控制是否可多选。modifierKey 配置按住什么键点选实现多选。默认是 Ctrl 和 ⌘。shouldSelectItem 会在每次点选时触发，返回 false 则不可选中。  |


### 实例方法                  
| 实例方法     | 返回值| 描述                |
|-----------|----------------------------|-------------------|
| undo()           | void    | 撤销。  |
| redo()           | void    | 重做。  |
| async copy()     | boolean | 复制，返回是否执行成功。由剪切板实现，数据将存储于剪切板中，因此是一个异步方法。可跨页面复制粘贴。 |
| async cut()      | boolean | 剪切，返回是否执行成功。 |
| async paste()    | boolean | 粘贴，返回是否执行成功。 |
| getCommands()    | Command[]    | 获取当前 editor 中所配置的 commands。 也可以获取后对 commands 进行一定的修改。 例如修改 copy 指令的是否执行逻辑。指令使用请见[指令 Command](/vgraph/guide/editor-spec/command) |
| getLastMousePosition()   | \[number, number\]  | 获取执行该指令前鼠标在图中的最新位置。   |
| alignGrid()      | void | 微调节点坐标。令编辑器中的节点中心对齐网格中心。   |
| refreshEdgesPath(edges?: Edge[]) | void | 更新指定连线的连线智能路由，如未指定，则更新所有连线的路由。|
| selectNode(node: Node) | void | 选中指定节点。选中操作不入操作栈。 |
| addNode(nodeData: nodeData)  | boolean | 添加一个节点。返回是否执行成功。可由操作栈撤销和重做。 |
| removeNode(node: Node)  | boolean          | 删除指定节点。返回是否执行成功。可由操作栈撤销和重做。        |
| updateNode(node: Node, configs: Record<string, any>)   | boolean  | 更新指定节点。返回是否执行成功。可由操作栈撤销和重做。        |
| insertNode(edge: any, nodeConfigs?: NodeData, position?: number) | boolean | 在连线的两个端点间插入一个节点，position 为 0 到 1 的值。返回是否执行成功。可由操作栈撤销和重做。|
| selectEdge(edge: Edge)  | void  | 选中指定连线。选中操作不入操作栈。|
| addEdge(edgeData: EdgeData)  | boolean | 添加一条连线。返回是否执行成功。可由操作栈撤销和重做。  |
| removeEdge(edge: Edge)  | boolean | 删除指定连线。返回是否执行成功。可由操作栈撤销和重做。   |
| updateEdge(edge: Edge, configs: Record<string, any>) | boolean | 更新指定连线。返回是否执行成功。可由操作栈撤销和重做。|
| selectEntities(entities: (Node  \| Edge\| Group)\[\]) | void  | 选中指定节点、边、分组实例。   |
| getSelection()   | { node: string\[\], edge: string\[\], group: string\[\] } | 获取当前选中的实体。 |
| selectionIntoView(autoScale = true)   | void | 将选中的实体移动到视口中。autoScale 决定是否采取缩放的方式。 |
| getGraph()   | Graph | 获取 editor 中的 graph 实例。 |
| getStack()   | Stack | 获取 editor 中的操作栈实例。 |
| changeMode(mode: 'edit' \| 'read' \| string)   | void | 改变编辑器模式。 组件以默认配置 'edit' 和 'read' 两种模式，其他自定义模式可通过获取并修改 stack 和 command 相关内容实现，参考 [Stack 组件](/vgraph/guide/editor-spec/stack)。  |
| getComponent(key: string)   | Component | key 为 'grid', 'router', 'nodeMover', 'edgeEditor', 'scroller', 'background', 'shortcuts' 中的一项。获取 editor 中对应的组件实例。|
| setComponent(key: string, Component) | void | 将 editor 中的指定组件设置为指定实例。 |
| changeSize(width: number, height: number) | void | 修改 editor 的画布大小。 |
| getSnapshot() | snapshotData | 获取当前图数据快照。一般可配合 batchChange 使用。 |
| batchChange(configs: { formerData: GraphData, currentData: GraphData }) | void | 批量更新操作。配合 getSnapshot 使用。 常用于布局更新、多项数据变更等场景。 |
| data(graphData: GraphData) | void | 加载替换图数据。可由操作栈撤销和重做。 |
| exportData() | GraphData | 导出图数据。 |
| clear() | void | 清空图数据。可由操作栈撤销和重做。 |

### 工具方法
| 实例方法     | 返回值| 描述                |
|-----------|----------------------------|-------------------|
| getDuplicateEdgeConfigs(edge: Edge, newConfigs: Record<string, unknown>, count: number, scale?: number)   | Record<string, unknown>  | 给重复的连线计算新路径，edge 为已有连线实例，newConfigs 是新连线配置,count 为重复次数， scale 是相邻连线之间的距离  |