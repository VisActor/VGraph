import { Graph, TreeGraph } from "../../../graph";
import { Edge, Node, Group } from "../../../models/entities";
import { GRAPH_EVENTS } from "../../../consts/meta_events";
import { CommandBase } from "./base";

export const SelectCommand = Object.assign({}, CommandBase, {
  name: "select",
  instack: false,
  mode: ["edit", "read"],
  shouldExecute(graph: Graph, args: { selections: (Node | Edge | Group)[] }) {
    // 选区完全一致时不执行, 减少刷新频率
    const formerSelections = graph.get("_selections");
    const selections = args.selections;
    let changed = false;
    let count = 0;
    for (const type of ["node", "edge", "group"]) {
      const ids = formerSelections[type];
      if (ids.length) {
        count += ids.length;
        ids.forEach((id: string) => {
          const entity = graph.entityMap[type][id];
          if (!selections.includes(entity)) {
            changed = true;
          }
        });
      }
    }
    return changed || selections.length !== count;
  },
  execute(
    snapshot: { selections: (Node | Edge | Group)[] },
    graph: Graph | TreeGraph
  ) {
    const autoDraw = graph.disableAutoDraw();
    const result = {
      node: [] as Node[],
      edge: [] as Edge[],
      group: [] as Group[],
    };
    const formerSelections = graph.get("_selections");
    const selections = snapshot.selections;
    graph.emit(GRAPH_EVENTS.BATCH_STATE_START, {
      targets: selections,
      state: "select",
    });
    graph.set("emitGraphEvents", false);
    const unselect: (Node | Edge | Group)[] = [];
    Object.keys(formerSelections).forEach((type: string) => {
      const entityIds = formerSelections[type];
      entityIds.forEach((id: string) => {
        const entity = graph.entityMap[type][id];
        if (!entity) {
          console.error(`Snapshot contains invalid ${type} id: ${id}`);
        } else {
          entity.removeState("select");
          unselect.push(entity);
        }
      });
    });

    selections.forEach((entity: Node | Edge | Group) => {
      result[entity.type].push(entity.get("id"));
      entity.toFront();
      entity.setState("select");
    });
    graph.set("_selections", result);
    graph.set("emitGraphEvents", true);
    graph.emit(GRAPH_EVENTS.BATCH_STATE_END, {
      targets: selections,
      state: "select",
      unselect,
    });
    graph.enableAutoDraw(autoDraw);
  },
});
