import { Graph } from "../../../graph";
import { uuid, cloneDeep } from "../../../utils";
import { CommandBase } from "../../../components/stack/commands/base";

import {
  batchAdd,
  batchRemove,
} from "../../../components/stack/commands/utils";
import { ACTION_TYPES } from "../../../consts/action_types";

export const PasteAsChildrenCommand = Object.assign({}, CommandBase, {
  name: "pasteAsChildren",
  shouldExecute(
    graph: Graph,
    args: { event: ClipboardEvent; position?: number[] }
  ) {
    const event = args.event;
    const text = event.clipboardData?.getData("text/plain");
    if (!text) {
      return false;
    }
    let copyInfo;
    try {
      copyInfo = JSON.parse(text);
    } catch (e) {
      return false;
    }
    if (!copyInfo || copyInfo.id !== "vgraphEditor") {
      return false;
    }

    const targets: string[] = [];
    copyInfo.edge.forEach((configs: any) => {
      targets.push(configs.target);
    });
    const rootIds = copyInfo.node.filter(
      (configs: Record<string, any>) => !targets.includes(configs.id)
    );
    // 找不到根节点不能成功复制
    return rootIds.length > 0;
  },

  getSnapshot(
    graph: Graph,
    args: {
      event: ClipboardEvent;
      parentId: string;
      edgeConfigs?: Record<string, any>;
      getNodeConfigs?: (nodeData: any) => Record<string, any>;
    }
  ) {
    const { event, parentId, getNodeConfigs } = args;
    const text = event.clipboardData?.getData("text/plain");
    const copyInfo = JSON.parse(text!);
    if (!graph.get("_paste")) {
      graph.set("_paste", {});
    }
    const nodeMap = {};
    ["group", "node"].forEach((type: string) => {
      copyInfo[type].forEach((configs: any) => {
        const originId = configs.id;
        let id;
        if (type === "node" && getNodeConfigs) {
          const newConfigs = getNodeConfigs(configs);
          id = newConfigs?.id;
          Object.assign(configs, newConfigs);
        }
        if (originId === configs.id) {
          delete configs.id;
          id = graph.getEntityId(configs, type);
          configs.id = id;
        }
        nodeMap[originId] = id;
      });
    });
    const targets: string[] = [];
    copyInfo.edge.forEach((configs: any) => {
      configs.id = uuid(10);
      // FIXME: 目前单个连线的复制会与原连线重合，之后遇到相关场景再结合诉求看怎么展示
      configs.source = nodeMap[configs.source] || configs.source;
      configs.target = nodeMap[configs.target] || configs.target;
      targets.push(configs.target);
    });

    copyInfo.group.forEach((configs: any) => {
      configs.children.forEach((id: string, index: number) => {
        configs.children[index] = nodeMap[id];
      });
    });
    // 找到没有 source 的节点, 即为复制的根节点
    const rootIds = copyInfo.node.filter(
      (configs: Record<string, any>) => !targets.includes(configs.id)
    );
    rootIds.forEach((nodeInfo: Record<string, any>) => {
      const edgeConfigs = args.edgeConfigs ? cloneDeep(args.edgeConfigs) : {};
      edgeConfigs.source = parentId;
      edgeConfigs.target = nodeInfo.id;
      let id = edgeConfigs?.id;
      if (!id) {
        id = uuid(10);
        while (graph.getEdgeById(id)) {
          id = uuid(10);
        }
        edgeConfigs.id = id;
      }
      copyInfo.edge.push(edgeConfigs);
    });
    return {
      addConfigs: copyInfo,
      parentId,
    };
  },
  execute(snapshot: Record<string, any>, graph: Graph) {
    const autoDraw = graph.disableAutoDraw();
    const { addConfigs } = snapshot;

    batchAdd(graph, addConfigs);
    graph.enableAutoDraw(autoDraw);
    return {
      node: addConfigs.node.map((configs: any) => configs.id),
      edge: addConfigs.edge.map((configs: any) => configs.id),
      group: addConfigs.group.map((configs: any) => configs.id),
    };
  },
  undo(snapshot: Record<string, any>, graph: Graph) {
    const autoDraw = graph.disableAutoDraw();
    const { addConfigs } = snapshot;
    batchRemove(graph, addConfigs);
    graph.enableAutoDraw(autoDraw);
  },
  getExecuteChanges(snapshot: Record<string, any>) {
    return {
      action: ACTION_TYPES.ADD,
      change: snapshot.addConfigs,
    };
  },
  getUndoChanges(snapshot: Record<string, any>) {
    return {
      action: ACTION_TYPES.REMOVE,
      change: snapshot.addConfigs,
    };
  },
});
