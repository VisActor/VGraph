import { ACTION_TYPES } from "../../../consts/action_types";
import { Graph } from "../../../graph";
import { CommandBase } from "../../../components/stack/commands/base";

type AddSiblingArgs = {
  configs?: Record<string, any>;
  type?: "before" | "after";
  relativeNodeId: string;
  linkChildren?: boolean;
};

export const AddSiblingCommand = Object.assign({}, CommandBase, {
  name: "addSibling",
  shouldExecute(graph: Graph, args: AddSiblingArgs) {
    const id = args.configs?.id;
    if (id && graph.getNodeById(id)) {
      console.error(`Duplicate node id ${id}, add failed.`);
      return false;
    }
    if (!graph.getNodeById(args.relativeNodeId)) {
      return false;
    }
    return true;
  },
  getSnapshot(graph: Graph, args: AddSiblingArgs) {
    const id = graph.getEntityId(args.configs, "node");
    args.configs = args.configs || {};
    args.configs.id = id;
    const targetsOrderMap = {};
    const addedEdgesConfigs = [] as any[];
    const { type, relativeNodeId, linkChildren } = args;
    const relativeNode = graph.getNodeById(relativeNodeId);
    relativeNode.sources.forEach((source: string) => {
      if (type) {
        // 维护子节点的顺序
        const sourceNode = graph.getNodeById(source);
        const targets = sourceNode.targets.concat();
        const index = targets.indexOf(relativeNodeId);
        targets.splice(type === "after" ? index + 1 : index, 0, id);
        targetsOrderMap[source] = targets;
      }
      const edgeId = graph.getEntityId({}, "edge");
      addedEdgesConfigs.push({
        id: edgeId,
        source,
        target: id,
      });
    });

    if (linkChildren !== false) {
      // 继承原节点的后置节点
      relativeNode.targets.forEach((target: string) => {
        const edgeId = graph.getEntityId({}, "edge");
        addedEdgesConfigs.push({
          id: edgeId,
          source: id,
          target,
        });
      });
    }
    return {
      ...args,
      targetsOrderMap,
      addedEdgesConfigs,
      id,
    };
  },
  execute(snapshot: Record<string, any>, graph: Graph) {
    const { configs, targetsOrderMap, addedEdgesConfigs } = snapshot;
    graph.add("node", configs);
    for (const configs of addedEdgesConfigs) {
      const source = configs.source;
      if (targetsOrderMap[source]) {
        const sourceNode = graph.getNodeById(source);
        sourceNode.targets = targetsOrderMap[source];
      }
      graph.add("edge", configs);
    }
    // 选中新增节点
    return {
      node: [snapshot.id],
      edge: [],
      group: [],
    };
  },
  undo(snapshot: Record<string, any>, graph: Graph) {
    graph.remove(graph.getNodeById(snapshot.id));
  },
  redo(snapshot: AddSiblingArgs, graph: Graph) {
    const selections = this.execute(snapshot, graph);
    return selections;
  },
  getExecuteChanges(snapshot: Record<string, any>) {
    const { type, targetsOrderMap, addedEdgesConfigs } = snapshot;
    const actionChanges = [
      {
        action: ACTION_TYPES.ADD,
        change: {
          node: [snapshot.configs],
          edges: addedEdgesConfigs,
        },
      },
    ] as { action: string; change: Record<string, any> }[];
    if (type) {
      actionChanges.push({
        action: ACTION_TYPES.UPDATE,
        change: {
          node: Object.keys(targetsOrderMap).map((id) => {
            return {
              id,
              targets: targetsOrderMap[id],
            };
          }),
        },
      });
    }
    return actionChanges;
  },
  getUndoChanges(snapshot: Record<string, any>) {
    const { addedEdgesConfigs } = snapshot;
    return {
      action: ACTION_TYPES.REMOVE,
      change: {
        node: [snapshot.configs],
        edges: addedEdgesConfigs,
      },
    };
  },
});
