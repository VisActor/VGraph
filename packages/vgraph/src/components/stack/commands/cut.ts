import { Graph } from "../../../graph";
import { uuid } from "../../../utils";
import { CommandBase } from "./base";
import {
  isEmptySelections,
  getSelectionsSnapshot,
  getCleanSnapshot,
  batchRemove,
  batchAdd,
} from "./utils";
import { ACTION_TYPES } from "../../../consts/action_types";

export const CutCommand = Object.assign({}, CommandBase, {
  name: "cut",
  shouldExecute(graph: Graph, args: { event: ClipboardEvent }) {
    if (isEmptySelections(graph.get("_selections"))) {
      return false;
    }
    return true;
  },
  getSnapshot(graph: Graph, args: { event: ClipboardEvent }) {
    const selections = graph.get("_selections");
    const event = args.event;
    const configs = getCleanSnapshot(graph, selections);
    configs.id = "vgraphEditor";
    configs.type = "cut";
    configs.uuid = uuid(10);
    graph.set("_paste", {});
    // configs.selections = cloneDeep(selections);
    // graph.set('pasteSelections', configs.selections);
    event.clipboardData?.setData("text/plain", JSON.stringify(configs));
    event.preventDefault();
    return {
      removeConfigs: getSelectionsSnapshot(graph, selections),
    };
  },
  execute(
    snapshot: { removeConfigs: { node: any[]; edge: any[]; group: any[] } },
    graph: Graph
  ) {
    const autoDraw = graph.disableAutoDraw();
    batchRemove(graph, snapshot.removeConfigs);
    graph.enableAutoDraw(autoDraw);
    return {
      node: [],
      edge: [],
      group: [],
    };
  },
  undo(snapshot: Record<string, any>, graph: Graph) {
    if (snapshot.entity) {
      graph.add(snapshot.type, snapshot.entity);
      return;
    }
    const autoDraw = graph.disableAutoDraw();
    batchAdd(graph, snapshot.removeConfigs);
    graph.enableAutoDraw(autoDraw);
  },
  getExecuteChanges(snapshot: Record<string, any>) {
    return {
      action: ACTION_TYPES.REMOVE,
      change: snapshot.removeConfigs,
    };
  },
  getUndoChanges(snapshot: Record<string, any>) {
    const change = {};
    const type = `${snapshot.type}`;
    change[type] = [snapshot.configs];
    return {
      action: ACTION_TYPES.ADD,
      change: snapshot.removeConfigs,
    };
  },
});
