# Operation Stack (Stack)

The Stack component is an operation stack component in vGraph, suitable for graph editing scenarios. It is used to record user operations and supports functions like undo and redo.
Operations in the stack are undone or redone in units of commands. vGraph has a series of common built-in commands, and you can also customize commands. For more details on commands, see [Command](/vgraph/guide/editor-spec/command).

Here is an example of how to use the Stack component. You can also try it in the demo.

```javascript
import { Graph, Stack, 
    AddCommand, SelectCommand, RemoveCommand, CopyCommand,CutCommand,
    PasteCommand, MoveNodeCommand, BatchCommand, UpdateCommand, InsertNodeCommand
} from "@visactor/vgraph";
const graph = new Graph({...});
const stack = new Stack(graph, {
    capacity: 20,
    commands: {
        // A series of built-in commands that can be flexibly configured
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

## Configuration

| Field | Type | Description |
| --- | --- | --- |
| commands | Record<string, Command> | \[Required] Supported Command instructions. vGraph has a series of common built-in commands, and you can also customize commands. For more details, see [Command](/vgraph/guide/editor-spec/command). |
| capacity | number | The capacity of the operation stack, storing snapshots of 20 commands by default. When operations exceed the maximum capacity, the earliest command snapshots are discarded one by one. |
| mode | string | The current mode of the operation stack. **By default, there is no mode, meaning any command can be executed**. You can set modes like 'read', 'edit', etc. A command will only be executed if its mode includes the current mode of the operation stack. This is often used for switching between editing and reading states. |

## Instance Methods

| Instance Method | Return Value | Description |
| --- | --- | --- |
| execute(name: string, args: Record<string, any> = {}, ignoreSnapshot = false) | boolean | Executes a command in the operation stack. `args` are the parameters required by the command. If `ignoreSnapshot` is true, the snapshot of this operation will not be pushed to the stack. Returns whether the execution was successful. |
| undo() | void | Undoes the last operation. Returns whether the undo was successful. |
| redo() | void | Redoes the last undone operation. Returns whether the redo was successful. |
| setMode(mode: string) | void | Sets the current mode of the stack. |
| getMode() | string | Gets the current mode of the stack. |
| addCommand(name: string, command: Command) | void | Adds a new supported command to the stack. |
| removeCommand(name: string) | void | Removes a supported command from the stack. |
| hasCommand(name: string) | boolean | Checks if the stack supports a certain command. |
| destroy() | void | Destroys the component. |
