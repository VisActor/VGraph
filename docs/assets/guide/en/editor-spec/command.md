# Command
 
 A Command is the basic unit of operation in the operation stack (Stack), used to execute, undo, and redo user commands. It retains a snapshot of the current user operation at a minimal cost, making it flexible and efficient. Most commonly used commands are already built into vGraph, and custom commands are also supported.

## Built-in Commands

vGraph has a variety of commonly used commands already built-in. The name is mostly used for calling commands in the operation stack, and the default `mode` is used in conjunction with the operation stack's `mode` for read/write mode switching.

| Command | Name | Execution Parameters | Default Mode | In Stack | Description |
|---|---|---|---|---|---|
| SelectCommand | select | { selections: (Node \| Edge \| Group)[] } | edit \| read | No | Select one or more entities. Can be used with the `select` state of `setStateStyle` to implement selection style changes. |
| AddCommand | add | { type?: 'node' \| 'edge' \| 'group'; configs?: Record<string, any>;} | edit | Yes | Add a node, edge, or group. Defaults to adding a node with properties from `configs`. |
| RemoveCommand | remove | { entity?: Node \| Edge \| Group;} | edit | Yes | Delete the specified entity. If no entity is specified, the selected entity will be deleted. |
| UpdateCommand | update | { type: 'node' \| 'edge' \| 'group'; id: string; configs: Record<string, any>;} | edit | Yes | Update the entity of the specified `id` and `type`. The properties to be updated are in `configs`. The update operation is incremental. |
| CopyCommand | copy | { event: ClipboardEvent } | edit \| read | Yes | Copy the selected entities and store the copied information in the clipboard. |
| CutCommand | cut | { event: ClipboardEvent } | edit | Yes | Cut the selected entities and store the cut information in the clipboard. |
| PasteCommand | paste | { event: ClipboardEvent } | edit | Yes | Read the information from the clipboard and paste the stored entities. Note: Since the information is stored in the clipboard, it supports copy and paste across Graph instances, but it also means that the entity's `configs` should not have circular references. |
| BatchCommand | batch | { formerData: SnapshotData; currentData: SnapshotData; afterUndo?: () => void;afterRedo?: () => void;} | edit | Yes | Batch operation. `SnapshotData` can be obtained through the utility method `generateSnapshot(graph)`. Often used for recording layout updates, merging multiple commands, etc. |
| MoveNodeCommand | moveNode | { targetId?: string; lastPositions: Record<string, { x: number; y: number }>; originPositions: Record<string, { x: number; y: number }>; edgeOriginControlPointsMap: Record<string, number[] \| null \| undefined>; } | edit | Yes | Generally used with the NodeMover component. This command is executed when the user releases the mouse after dragging a node to a suitable position. Moves the specified node. If `targetId` is not specified, it moves the selected node. `lastPositions` is the latest position map of the nodes, and `originPositions` is the previous position map. `edgeOriginControlPointsMap` is the original control points of the edges associated with the moved node. |
| AddSourceCommand | addSource | { configs?: Record<string, any>; relativeNodeId: string; } | edit | Yes | Add a preceding node before the `relativeNodeId` node. This node will inherit the connection relationships of all the parent nodes of the original node. For specific interactions, see [Directed Graph Restricted Editing](/vgraph/demo/editor/dagFlowEditor). |
| AddTargetCommand | addTarget | { configs?: Record<string, any>; relativeNodeId: string; undoMap?: Record<string, number>; linkChildren?: boolean; } | edit | Yes | Add a subsequent node after the `relativeNodeId` node. By default, it adds a connection between `relativeNodeId` and the subsequent node. When `linkChildren` is configured as true, this node will inherit the connection relationships of the original node. For specific interactions, see [Directed Graph Restricted Editing](/vgraph/demo/editor/dagFlowEditor). |
| AddSiblingCommand | addSibling | { configs?: Record<string, any>; type?: 'before' \| 'after'; relativeNodeId: string; linkChildren?: boolean;} | edit | Yes | Add a sibling node for the `relativeNodeId` node. `type` is used to specify the relative position between the two nodes. When `type` is 'before', the new node is added before the relative node. When `linkChildren` is configured as true, this node will inherit the connection relationships of the original node. For specific interactions, see [Directed Graph Restricted Editing](/vgraph/demo/editor/dagFlowEditor). |
| ProcessRemoveCommand | processRemove | { id: string; orderMap: Record<string, number>; } | edit | Yes | Delete the specified id node. The deletion behavior conforms to the deletion behavior of the pipeline. For specific interactions, see [Directed Graph Restricted Editing](/vgraph/demo/editor/dagFlowEditor). |
| InsertNodeCommand | insertNode | { edge: Edge; position?: number; nodeConfigs?: Record<string, any>;} | edit | Yes | Insert a node at the `position` in the edge. `position` is a value from 0 to 1, where 0 represents the start point and 1 represents the end point. |

## Command Composition

| Field | Type | Description |
|---|---|---|
| name | number | [Required] Command name, which corresponds to the name used when calling from the stack and must be unique. |
| mode | string[] | Supported modes for the command. The command will only be executed if the command's `mode` includes the stack's `mode`, or if the stack has not set a `mode`. |
| multiple | boolean | Whether to support multiple selections. If `multiple` is false and multiple entities are selected, the command will fail. |
| instack | boolean | Whether to push to the stack. Defaults to true. Commands that need to be pushed to the stack must return a snapshot to be pushed in `getSnapshot`. |
| savePosition | boolean | Whether this command records the position coordinates. Defaults to true. When undoing, it not only restores the data operation, but also restores the viewport coordinates. |
| shouldExecute | (graph: Graph \| TreeGraph, args?: Record<string, any>) => boolean | Whether it should be executed. |
| getSnapshot | (graph: Graph \| TreeGraph, args?: Record<string, any>) => Record<string, any> | Returns the current operation snapshot. **The returned snapshot will be deep-copied and retained to ensure that multiple implementations will not affect each other, so do not return data with circular references.** |
| execute | (snapshot: Record<string, any>, graph: Graph \| TreeGraph) => selection | Defines the execution function. |
| undo | (snapshot: Record<string, any>, graph: Graph \| TreeGraph) => void | Defines the undo function. |
| afterUndo | (snapshot: Record<string, any>, graph: Graph \| TreeGraph) => void | The cleanup function after undoing. |
| redo | (snapshot: Record<string, any>, graph: Graph \| TreeGraph) => selection | Defines the redo function. If not specified, `execute` will be called. |



## Partial Custom Commands
Sometimes, in business, you only need to partially update or make minor changes to vGraph's built-in commands. In this case, the cost of completely customizing a command is high. vGraph supports overwriting parts of commands. Here are four simple scenarios as examples:

- I want to add an authentication logic before executing `CopyCommand`, allowing only authorized users to copy.
```javascript
import { CopyCommand } from '@visactor/vgraph';
CopyCommand.shouldExecute = (graph: Graph, args: { event: ClipboardEvent }) => {
  return isAuthorizedUser();
}
stack.addCommand(CopyCommand);
```

- I want to perform a layout after undoing/redoing the add node command to make the node distribution more compact.
```javascript
import { AddCommand } from '@visactor/vgraph';
AddCommand.afterUndo = () => {
  dag.layout();
  graph.refresh();
}
```

- I want to be able to add multiple nodes at once and store this operation in one command. You can use the batch operation `BatchCommand`. It is recommended to use it with the general snapshot generation method `generateSnapshot`. If you are integrating an editor solution, a `batchChange` method is generally built-in to handle snapshots that are more suitable for the scene. For details, see [Batch Add Nodes](/vgraph/demo/editor/dagFlowEditorBatch).
```javascript
import { BatchCommand, generateSnapshot } from '@visactor/vgraph';

stack.addCommand(BatchCommand);

function batchAdd() {
  // Data snapshot before the operation, used for undo
  const formerData = generateSnapshot(graph);
  // Add three nodes
  graph.add('node');
  graph.add('node');
  graph.add('node');
  // Data snapshot after the operation, used for redo
  const currentData = generateSnapshot(graph);
  stack.execute('batch', { formerData, currentData });
}
```

- Batch operations are currently only effective in edit mode. The business has read and write modes, and I hope to be able to perform some batch operations in read mode as well.
```javascript
import { BatchCommand } from '@visactor/vgraph';
const readableBatchCommand = Object.assign({}, BatchCommand, {
  name: 'readableBatch',
  mode: ['read', 'write']
});
stack.addCommand(BatchCommand);
stack.addCommand(readableBatchCommand);
// Execute a batch operation that is only in write mode
stack.execute('batch', {...});
// Execute a batch operation that is supported in both read and write modes
stack.execute('readableBatch', {...});

```



## Complete Custom Command

 A completely custom command is suitable for scenarios with high customization and high performance requirements. If you need to completely customize a command, you can refer to the following implementation example of adding a node.

 ```javascript
import { Graph, CommandBase, uuid } from "@visactor/vgraph";
const AddCommand = Object.assign({}, CommandBase, {
  // The unique identifier of the command, used when calling with stack.execute('add', {...});
  name: 'add', 
  // Whether to push to the stack, defaults to true, this item can be omitted
  instack: true,
  // The mode in which it can be executed, can be any business-meaningful string, corresponding to the value of stack.setMode. Defaults to edit, this item can also be omitted in this scenario
  mode: ['edit'],
  // Whether this configured node can be added, the following implements an id deduplication check
  shouldExecute(graph: Graph, args: Record<string, any>) {
    const id = args.configs?.id;
    if (id && graph.getNodeById(id)) {
      console.error(`Duplicate ${type} id ${id}, add failed.`);
      return false;
    }
    return true;
  },
  // Prepare the snapshot, execute, undo, and redo will be executed based on the data in the snapshot
  getSnapshot(graph: Graph, args: Record<string, any>) {
    let id = args.configs?.id;
    // Because id is the unique identifier of the node, if it does not exist, it needs to be generated here for deletion during undo
    if (!id) {
      id = uuid(10);
      while (graph.getNodeById(id)) {
        id = uuid(10);
      }
      args.configs = args.configs || {};
      args.configs.id = id;
    }
    // At this time, the data in the operation stack includes two items, configs is the node configuration during the operation, and id is the unique identifier of the new node
    // The operation stack will automatically save the selection snapshot before execution to avoid losing the previous selection after undoing, so there is no need to return the selection information here
    // The returned snapshot will be deep-copied and retained to ensure that multiple implementations will not affect each other, so do not return data with circular references
    return {
      configs: args,
      id,
    };
  },
  // Start executing the command
  execute(snapshot: { configs: Record<string, any>, id: string }, graph: Graph) {
    // Add the node
    graph.add('node', snapshot.configs);
    // The returned selection, the operation stack will handle the selection of the new node
    const selections = {
      node: [snapshot.configs.id],
      edge: [],
      group: []
    };
    return selections;
  },
  // The undo operation is to delete the node retained in the snapshot
  undo(snapshot: Record<string, any>, graph: Graph) {
    graph.remove(graph.getNodeById(snapshot.id));
  },
  // redo is omitted, so the operation stack will call execute again
});

```

