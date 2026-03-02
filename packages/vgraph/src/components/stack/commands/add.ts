import { Graph } from "../../../graph";
import { CommandBase } from "./base";
import { ACTION_TYPES } from "../../../consts/action_types";

type AddArgs = {
  type?: string;
  configs?: Record<string, any>;
};

export const AddCommand = Object.assign({}, CommandBase, {
  name: "add",
  shouldExecute(graph: Graph, args: AddArgs) {
    const type = args.type || "node";
    const id = args.configs?.id;
    if (id && graph.entityMap[type][id]) {
      console.error(`Duplicate ${type} id ${id}, add failed.`);
      return false;
    }
    return true;
  },
  getSnapshot(graph: Graph, args: AddArgs) {
    const type = args.type || "node";
    args.type = type;
    const id = graph.getEntityId(args.configs, type);
    args.configs = args.configs || {};
    args.configs.id = id;
    const grid = graph.get("_grid");
    const step = grid?.getStep() || 10;
    if (args.configs?.x) {
      args.configs.x = Math.round(args.configs.x / step) * step;
    }
    if (args.configs?.y) {
      args.configs.y = Math.round(args.configs.y / step) * step;
    }
    return {
      ...args,
      type,
      id,
    };
  },
  execute(snapshot: Record<string, any>, graph: Graph) {
    graph.add(snapshot.type!, snapshot.configs);
    const selections = {
      node: [],
      edge: [],
      group: [],
    };
    selections[snapshot.type!] = [snapshot.configs.id];
    return selections;
  },
  undo(snapshot: Record<string, any>, graph: Graph) {
    graph.remove(graph.entityMap[snapshot.type][snapshot.id]);
  },
  getExecuteChanges(snapshot: Record<string, any>) {
    const change = {};
    const type = `${snapshot.type}`;
    change[type] = [snapshot.configs];
    return {
      action: ACTION_TYPES.ADD,
      change,
    };
  },
  getUndoChanges(snapshot: Record<string, any>) {
    const change = {};
    const type = `${snapshot.type}`;
    change[type] = [snapshot.configs];
    return {
      action: ACTION_TYPES.REMOVE,
      change,
    };
  },
});
