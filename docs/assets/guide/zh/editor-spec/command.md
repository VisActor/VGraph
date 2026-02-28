# 指令 Command
 
 指令 (Command) 是操作栈 (Stack) 中的操作基本单元，用于执行、撤销、重做用户的指令，以最小的代价留存当前用户操作快照，灵活高效。 vGraph 中已内置大多数常用指令，并支持自定义指令。

## 内置指令

vGraph 中已内置多种常用指令，其中名称多用于操作栈调用指令，默认 mode 与操作栈 mode 配合使用多用于读写模式切换。

| 指令  | 名称 |执行参数                | 默认 mode |  是否入栈  |描述                               |
| ----- | ---- |------------------- | -- | ----- |---------------------------------- |
| SelectCommand | select | { selections: (Node \| Edge \| Group)[] } |  edit \| read | 否  | 选中一个或多个实体，可与 setStateStyle 的 select 状态配合实现选中样式变化。 |
| AddCommand  | add | { type?: 'node' \| 'edge' \| 'group'; configs?: Record<string, any>;} |  edit | 是  |添加一个节点, 连线或分组，默认为添加节点，属性为configs。  |
| RemoveCommand | remove |  { entity?: Node \| Edge \| Group;} |  edit | 是  |删除指定实体。如未指定实体，则将删除处于选中状态的实体。 |
| UpdateCommand | update |  { type: 'node' \| 'edge' \| 'group'; id: string; configs: Record<string, any>;} | edit | 是  | 更新类型为 type 的指定 id 的实体。所更新的属性为configs，更新操作为增量更新。 |
| CopyCommand  | copy | { event: ClipboardEvent } | edit \| read | 是  |复制处于选中状态的实体，将所复制信息存储于剪切板中。  |
| CutCommand | cut | { event: ClipboardEvent }  | edit | 是  |剪切处于选中状态的实体，将所剪切信息存储于剪切板中。  |
| PasteCommand | paste | { event: ClipboardEvent }  | edit | 是  |读取剪切板中的信息，粘贴其所存储的实体。注：信息存储在剪切板中，所以可支持跨 Graph 实例的复制粘贴，但也因此需要避免实体的 configs 存在循环引用。 |
| BatchCommand | batch | { formerData: SnapshotData; currentData: SnapshotData; afterUndo?: () => void;afterRedo?: () => void;} | edit | 是  |批量操作， SnapshotData 可通过工具方法 generateSnapshot(graph) 得到。常用于如记录布局更新、多个指令合并操作等。 |
| MoveNodeCommand | moveNode | { targetId?: string; lastPositions: Record<string, { x: number; y: number }>;  originPositions: Record<string, { x: number; y: number }>;  edgeOriginControlPointsMap: Record<string, number[] \| null \| undefined>; } |  edit | 是  |一般与 NodeMover 组件配合使用，当用户拖拽节点到适合为止后放开鼠标执行此指令。移动指定节点，如果未指定targetId，则移动处于选中状态的节点。lastPositions 为节点的最新位置 Map，originPositions 为之前位置 Map。edgeOriginControlPointsMap 为移动节点所关联的连线的原始控制点。 |
| AddSourceCommand | addSource |  { configs?: Record<string, any>; relativeNodeId: string;  }    |edit | 是  | 在 relativeNodeId 节点前侧添加一个前置节点，该节点会继承原节点的所有父亲节点之间的连接关系。具体交互可见[有向图限制编辑](/vgraph/demo/editor/dagFlowEditor) |   
| AddTargetCommand | addTarget | { configs?: Record<string, any>; relativeNodeId: string; undoMap?: Record<string, number>;  linkChildren?: boolean; }    |edit | 是  | 在 relativeNodeId 节点后侧侧添加一个后置节点，默认为添加 relativeNodeId 与后置节点的连线，当配置 linkChildren 为 true 时该节点会继承原节点连接关系。具体交互可见[有向图限制编辑](/vgraph/demo/editor/dagFlowEditor) |  
| AddSiblingCommand | addSibling |  {  configs?: Record<string, any>;  type?: 'before' \| 'after';  relativeNodeId: string; linkChildren?: boolean;}  | edit | 是  | 为 relativeNodeId 节点新增一个兄弟节点，type 用于指定两个节点之间的相对位置，type 为 before 时则新增节点在相对节点的前侧。当配置 linkChildren 为 true 时该节点会继承原节点连接关系。具体交互可见[有向图限制编辑](/vgraph/demo/editor/dagFlowEditor) |   
| ProcessRemoveCommand | processRemove | {  id: string;   orderMap: Record<string, number>; } | edit | 是  | 删除指定id节点。删除行为符合流水线的删除行为。具体交互可见[有向图限制编辑](/vgraph/demo/editor/dagFlowEditor) | 
| InsertNodeCommand | insertNode | { edge: Edge;   position?: number;  nodeConfigs?: Record<string, any>;}    | edit | 是  | 在连线中位置为 position 处插入一个节点。 position 为 0 到 1 的值，0 代表起始点位置，1 代表终点位置。 |  

## 指令组成

| 字段  | 类型                | 描述                               |
| ----- | ------------------- | ---------------------------------- |
| name  | number              |  \[必填\]  指令名称，名称与 stack 调用时的名称对应，必须唯一。                 |
| mode | string[] | 指令支持的模式。 当 command 的 mode 包含 stack 的 mode，或 stack 未设置 mode，command 才会被执行。 |
| multiple | boolean | 是否支持多选。但 multiple 为 false 且选中多个实体时，指令将会执行失败。 |
| instack | boolean | 是否入栈。默认为 true。需要入栈的指令需在 getSnapshot 中返回入栈的快照。 |
| savePosition | boolean | 该指令是否记录位置坐标，默认为 true，在 undo 时不仅恢复数据操作，同时恢复视口坐标。 |
| shouldExecute | (graph: Graph \| TreeGraph, args?: Record<string, any>) => boolean | 是否应该被执行。 |
| getSnapshot | (graph: Graph \| TreeGraph, args?: Record<string, any>) => Record<string, any> | 返回当前操作快照。**返回的快照会进行深拷贝留存以保证多次实现不会互相影响，因此不要返回循环引用的数据。** |
| execute |  (snapshot: Record<string, any>, graph: Graph \| TreeGraph) => selection | 定义执行函数。 |
| undo | (snapshot: Record<string, any>, graph: Graph \| TreeGraph) => void | 定义撤销函数。 |
| afterUndo | (snapshot: Record<string, any>, graph: Graph \| TreeGraph) => void | 撤销后的清理函数。 |
| redo | (snapshot: Record<string, any>, graph: Graph \| TreeGraph) => selection | 定义重做函数，若未指定则会调用 execute。 |



## 部分自定义指令
有时候业务上仅需要对 vGraph 的内置指令进行部分更新，或者进行一些微小改动，这时候直接自定义一个指令的成本很高。vGraph 支持自行覆写指令的部分。下面以四个简单场景举例：

- 我想在 CopyCommand 执行之前添加一个鉴权逻辑，仅允许有权限的用户复制
``` javascript
import { CopyCommand } from '@visactor/vgraph';
CopyCommand.shouldExecute = (graph: Graph, args: { event: ClipboardEvent }) => {
  return isAuthorizedUser();
}
stack.addCommand(CopyCommand);
```

- 我想在添加节点指令撤销/重做以后进行一遍布局, 使节点分布更紧凑
``` javascript
import { AddCommand } from '@visactor/vgraph';
AddCommand.afterUndo = () => {
  dag.layout();
  graph.refresh();
}
```

- 我想能一次添加多个节点，并且把这个操作存在一个指令中。可以使用批量操作 BatchCommand。建议配合通用快照生成方法 generateSnapshot 使用。如果是接入编辑器解决方案，一般会内置提供 batchChange 方法以处理更贴合场景的快照，具体可见 [批量添加节点](/vgraph/demo/editor/dagFlowEditorBatch)。
``` javascript
import { BatchCommand, generateSnapshot } from '@visactor/vgraph';

stack.addCommand(BatchCommand);

function batchAdd() {
  // 操作执行前的数据快照，用于 undo
  const formerData = generateSnapshot(graph);
  // 添加三个节点
  graph.add('node');
  graph.add('node');
  graph.add('node');
  // 操作后数据快照，用于 redo
  const currentData = generateSnapshot(graph);
  stackk.execute('batch', { formerData, currentData });
}
```

- 批量操作目前仅在 edit 模式下有效，业务有读写模式，希望在读模式也能执行一些批量操作。
``` javascript
import { BatchCommand } from '@visactor/vgraph';
const readableBatchCommand = Object.assign({}, BatchCommand, {
  name: 'readableBatch',
  mode: ['read', 'write']
});
stack.addCommand(BatchCommnand);
stack.addCommand(readableBatchCommand);
// 执行只有写模式的批量操作
stack.execute('batch', {...});
// 执行读写模式都支持的批量操作
stack.execute('readableBatch', {...});

```



## 完全自定义指令

 完全自定义指令适合高定制高性能要求场景使用。如果需要完全自定义指令，可以参考以下添加节点的实现示例。

 ```javascript
import { Graph, CommandBase, uuid } from "@visactor/vgraph";
const AddCommand = Object.assign({}, CommandBase, {
  // 指令唯一标识，则调用的时候使用 stack.execute('add', {...});
  name: 'add', 
  // 是否入栈，默认为 true，此项可缺省
  instack: true,
  // 在什么模式下可执行，可以是任意业务化含义的字符串，与 stack.setMode 的值对应即可。默认为 edit，此项在这个场景下也可缺省
  mode: ['edit'],
  // 是否可以添加此配置的节点，以下实现了一个 id 去重判断
  shouldExecute(graph: Graph, args: Record<string, any>) {
    const id = args.configs?.id;
    if (id && graph.getNodeById(id)) {
      console.error(`Duplicate ${type} id ${id}, add failed.`);
      return false;
    }
    return true;
  },
  // 准备快照，执行，撤销，重做都会根据快照中的数据执行
  getSnapshot(graph: Graph, args: Record<string, any>) {
    let id = args.configs?.id;
    // 因为 id 是节点的唯一标识，如果没有则需要在此处生成，用于 undo 的时候删除
    if (!id) {
      id = uuid(10);
      while (graph.getNodeById(id)) {
        id = uuid(10);
      }
      args.configs = args.configs || {};
      args.configs.id = id;
    }
    // 这时操作栈的数据包括两项，configs 是执行操作时的节点配置，id 是新增节点的唯一标识
    // 操作栈会自动在执行前保存选区快照，以免在撤销以后丢失之前的选区，因此无需再在此处返回选区信息
    // 返回的快照会进行深拷贝留存以保证多次实现不会互相影响，因此不要返回循环引用的数据
    return {
      configs: args,
      id,
    };
  },
  // 开始执行指令
  execute(snapshot: { configs: Record<string, any>, id: string }, graph: Graph) {
    // 添加节点
    graph.add('node', snapshot.configs);
    // 返回的选区，操作栈会处理选中新增的节点
    const selections = {
      node: [snapshot.configs.id],
      edge: [],
      group: []
    };
    return selections;
  },
  // 撤销操作就是将快照中留存的节点删除
  undo(snapshot: Record<string, any>, graph: Graph) {
    graph.remove(graph.getNodeById(snapshot.id));
  },
  // redo 缺省，则操作栈会再次调用 execute
});

```

