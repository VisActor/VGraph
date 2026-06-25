# 操作栈 Stack

Stack 组件是 vGraph 中适用于图编辑场景的操作栈组件，用于记录用户的操作，并支持撤销、重做等功能。
操作栈中的操作以指令 (Command) 为单位进行撤销或重做，vGraph 内置了一系列常用内置指令，也可以自定义指令。指令具体可见[指令 Command](/vgraph/guide/editor-spec/command)。

以下是 Stack 组件的使用示例，也可以在 demo 中进行体验。

```javascript
import { Graph, Stack, 
    AddCommand, SelectCommand, RemoveCommand, CopyCommand,CutCommand,
    PasteCommand, MoveNodeCommand, BatchCommand, UpdateCommand, InsertNodeCommand
} from "@visactor/vgraph";
const graph = new Graph({...});
const stack = new Stack(graph, {
    capacity: 20,
    commands: {
        // 一系列内置指令，可灵活配置
        add: AddCommand,
        select: SelectCommand,
        remove: RemoveCommand,
        copy: CopyCommand,
        cut: CutCommand,
        paste: PasteCommand,
        moveNode: MoveNodeCommand,
        batch: BatchCommand,
        update: UpdateCommand,
        insertNode: InsertNodeCommand,
    }
});
stack.execute('add', {type:'node', configs: {id: '1', ...}});
stack.undo();
stack.redo();
```

## 配置项

| 字段  | 类型                | 描述                               |
| ----- | ------------------- | ---------------------------------- |
| commands  | Record<string, Command> | \[必填\] 支持的 Command指令。vGraph 内置了一系列常用内置指令，也可以自定义指令。指令具体可见[指令 Command](/vgraph/guide/editor-spec/command)|
| capacity | number | 操作栈容积，默认存 20 个指令的快照。当操作超过最大容积时会逐个舍去最早的指令快照。 |
| mode | string | 操作栈当前模式，**默认无模式，也就是可以执行任意指令**。可以设置例如 'read', 'edit' 等。当 command 的 mode 包含了当前操作栈的 mode， command 才会被执行。常用于编辑态/阅读态的切换。 |

## 实例方法 

| 实例方法  | 返回值 | 描述       |
| --------- | ------ | ---------- |
| execute(name: string, args: Record<string, any> = {}, ignoreSnapshot = false)  | boolean   | 操作栈执行某一指令。args 是指令所需参数。 ignoreSnapshot 为 true 则代表本次操作快照不入栈。 返回是否执行成功。|
| undo() | void   | 撤销。返回是否撤销成功。 |
| redo() | void   | 重做。返回是否重做成功。 |
| setMode(mode: string) | void   | 设置 stack 当前所处模式。 |
| getMode() | string   | 获取 stack 当前所处模式。 |
| addCommand(name: string, command: Command) | void   | 为 stack 新增一个支持的指令。 |
| removeCommand(name: string) | void   |  为 stack 删除一个支持的指令。 |
| hasCommand(name: string) | boolean   | 获取 stack 是否支持某个指令。 |
| destroy() | void   | 组件销毁。 |
