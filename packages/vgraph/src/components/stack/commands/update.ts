import { Graph } from "../../../graph";
import { Edge, Node, Group } from "../../../models/entities";
import { cloneDeep } from "../../../utils";
import { CommandBase } from "./base";
import { ACTION_TYPES } from "../../../consts/action_types";

type UpdateArgs = {
  type: "node" | "edge" | "group";
  id: string;
  configs:
    | Partial<Node["configs"]>
    | Partial<Edge["configs"]>
    | Partial<Group["configs"]>;
};

type UpdateSnapshot = {
  type: "node" | "edge" | "group";
  id: string;
  originConfigs:
    | Partial<Node["configs"]>
    | Partial<Edge["configs"]>
    | Partial<Group["configs"]>;
  configs:
    | Partial<Node["configs"]>
    | Partial<Edge["configs"]>
    | Partial<Group["configs"]>;
  [key: string]: any;
};

export const UpdateCommand = Object.assign({}, CommandBase, {
  name: "update",
  shouldExecute(graph: Graph, args: UpdateArgs) {
    const entity = graph.entityMap[args.type][args.id];
    if (!entity) {
      return false;
    }
    return true;
  },
  getSnapshot(graph: Graph, args: UpdateArgs) {
    const entity = graph.entityMap[args.type][args.id];
    const originConfigs = {};
    Object.keys(args.configs).forEach((k: string) => {
      originConfigs[k] = cloneDeep(entity.configs[k]);
    });
    return {
      ...args,
      originConfigs,
    };
  },
  execute(snapshot: UpdateSnapshot, graph: Graph) {
    const entity = graph.entityMap[snapshot.type][snapshot.id];
    graph.update(entity, snapshot.configs);
  },
  undo(snapshot: UpdateSnapshot, graph: Graph) {
    const entity = graph.entityMap[snapshot.type][snapshot.id];
    const originConfigs = cloneDeep(snapshot.originConfigs);
    graph.update(entity, originConfigs);
  },
  redo(snapshot: UpdateSnapshot, graph: Graph) {
    const entity = graph.entityMap[snapshot.type][snapshot.id];
    graph.update(entity, snapshot.configs);
    const selections = {
      node: [] as string[],
      edge: [] as string[],
      group: [] as string[],
    };
    selections[snapshot.type] = [snapshot.id];
    return selections;
  },
  getExecuteChanges(snapshot: Record<string, any>) {
    const change = { node: [], edge: [], group: [] };
    change[snapshot.type] = [
      {
        id: snapshot.id,
        ...snapshot.configs,
      },
    ];
    return {
      action: ACTION_TYPES.UPDATE,
      change,
    };
  },
  getUndoChanges(snapshot: Record<string, any>) {
    const change = { node: [], edge: [], group: [] };
    change[snapshot.type] = [
      {
        id: snapshot.id,
        ...snapshot.configs,
      },
    ];
    return {
      action: ACTION_TYPES.UPDATE,
      change,
    };
  },
});
