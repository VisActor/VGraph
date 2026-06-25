import { Graph } from "../../../graph";
import { CommandBase } from "../../../components/stack/commands/base";
import {
  getSelectionsSnapshot,
  batchAdd,
  batchRemove,
} from "../../../components/stack/commands/utils";
import { ACTION_TYPES } from "../../../consts/action_types";

type RemoveArgs = {
  nodeId: string;
  subTree: string[];
};

export const RemovePipelineTreeCommand = Object.assign({}, CommandBase, {
  name: "removePipelineTree",
  getSnapshot(graph: Graph, args: RemoveArgs) {
    const selection = {
      node: args.subTree,
      edge: [],
      group: [],
    };
    const currentNode = graph.getNodeById(args.nodeId);
    const parentId = currentNode.sources[0];
    const parentOrder = graph.getNodeById(parentId).targets;
    return {
      ...args,
      selectionConfigs: getSelectionsSnapshot(graph, selection),
      parentId,
      parentOrder,
    };
  },
  execute(snapshot: Record<string, any>, graph: Graph) {
    const autoDraw = graph.disableAutoDraw();
    batchRemove(graph, snapshot.selectionConfigs);
    graph.enableAutoDraw(autoDraw);
    return {
      node: [],
      edge: [],
      group: [],
    };
  },
  undo(snapshot: Record<string, any>, graph: Graph) {
    const autoDraw = graph.disableAutoDraw();
    batchAdd(graph, snapshot.selectionConfigs);
    const parent = graph.getNodeById(snapshot.parentId);
    parent.targets = snapshot.parentOrder.concat([]);
    graph.enableAutoDraw(autoDraw);
    return {
      node: [snapshot.nodeId],
      edge: [],
      group: [],
    };
  },
  redo(snapshot: Record<string, any>, graph: Graph) {
    const autoDraw = graph.disableAutoDraw();
    batchRemove(graph, snapshot.selectionConfigs);
    graph.enableAutoDraw(autoDraw);
    return {
      node: [],
      edge: [],
      group: [],
    };
  },
  getExecuteChanges(snapshot: Record<string, any>) {
    const change = {};
    const type = `${snapshot.type}`;
    change[type] = [snapshot.configs];
    const parentOrder = snapshot.parentOrder.concat([]);
    const index = parentOrder.indexOf(snapshot.nodeId);
    if (index >= 0) {
      parentOrder.splice(index, 1);
    }
    return [
      {
        action: ACTION_TYPES.REMOVE,
        change: snapshot.selectionConfigs,
      },
      {
        action: ACTION_TYPES.UPDATE,
        change: {
          node: [
            {
              id: snapshot.parentId,
              targets: parentOrder,
            },
          ],
          edge: [],
          group: [],
        },
      },
    ];
  },
  getUndoChanges(snapshot: Record<string, any>) {
    const change = {};
    const type = `${snapshot.type}s`;
    change[type] = [snapshot.configs];
    return [
      {
        action: ACTION_TYPES.ADD,
        change: snapshot.selectionConfigs,
      },
      {
        action: ACTION_TYPES.UPDATE,
        change: {
          node: [
            {
              id: snapshot.parentId,
              targets: snapshot.parentOrder,
            },
          ],
          edge: [],
          group: [],
        },
      },
    ];
  },
});
