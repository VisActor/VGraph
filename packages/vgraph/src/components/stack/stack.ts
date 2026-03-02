import { Graph } from "../../graph";
import { Edge, Node, Group } from "../../models/entities";
import { cloneDeep } from "../../utils";
import { GRAPH_EVENTS } from "../../consts/meta_events";
import { StackOptions, Command } from "../../typings/stack";
import { ACTION_TYPES } from "../../consts/action_types";
import { batchAddRemote, batchRemove } from "./commands/utils";
import { ShapeBase } from "../../renderer";

export class Stack {
  // 当前操作对象
  selections: (Node | Edge | Group)[] = [];
  // 操作堆栈
  stack: {
    name: string;
    data: Record<string, any>;
  }[] = [];
  // 操作指针,指向最近一次操作栈
  at = -1;
  // 操作栈容量
  capacity: number;
  // 图实例
  graph: Graph;
  // 可执行指令
  commands: Record<string, Command> = {};
  // 模式
  mode = "";
  // 是否开启数据协同
  collab = false;
  // 是否是树状场景（影响新增节点的 visibility 策略）
  treeLike = false;

  constructor(graph: Graph, options: StackOptions) {
    this.graph = graph;
    this.capacity = options.capacity || 20;
    this.mode = options.mode || "";
    this.collab = options.collab || false;
    this.treeLike = options.treeLike || false;
    Object.values(options.commands).forEach((command: Command) => {
      this.addCommand(command.name, command);
    });
    graph.addComponent(this as any);
    graph.set("_selections", {
      node: [],
      edge: [],
      group: [],
    });
  }

  execute(
    name: string,
    args: Record<string, unknown> = {},
    ignoreSnapshot = false
  ) {
    const cmd = this.commands[name];
    const graph = this.graph;
    const selections = graph.get("_selections");
    if (!cmd) {
      console.error(`Command ${name} does not exist`);
      return false;
    }
    if (this.mode && !cmd.mode?.includes(this.mode)) {
      return false;
    }

    const entityCount = selections
      ? selections.node.length +
        selections.edge.length +
        selections.group.length
      : 0;

    if (entityCount > 1 && !cmd.multiple) {
      return false;
    }

    if (!cmd.shouldExecute(graph, args)) {
      return false;
    }
    let input = args || {};
    let snapshot: Record<string, unknown> = {};
    if (cmd.instack) {
      input = cmd.getSnapshot(graph, args);
      input.selections = cloneDeep(graph.get("_selections"));
      snapshot = this.getSnapshot(input);
      if (cmd.savePosition) {
        snapshot.undoMatrix = graph.getMatrix().concat();
      }
    }
    const newSelections = cmd.execute(input, graph) as unknown as any;
    if (newSelections) {
      this.select(newSelections);
    }
    if (cmd.instack && !ignoreSnapshot) {
      this.push(name, snapshot);
      if (this.collab) {
        const changes = cmd.getExecuteChanges(snapshot!);
        this.emitCollabEvent(changes);
      } else {
        graph.emit("stackchange");
      }
    }
    return true;
  }

  canUndo() {
    return this.at >= 0;
  }

  canRedo() {
    return this.at < this.stack.length - 1;
  }

  undo() {
    if (!this.canUndo()) {
      return false;
    }
    const graph = this.graph;
    const stackData = this.stack[this.at];
    const { data, name } = stackData;
    this.at--;
    const command = this.commands[name];
    command.undo(data, graph);
    if (data.selections) {
      this.select(data.selections);
    }
    if (data.undoMatrix) {
      graph.setMatrix(data.undoMatrix.concat());
    }
    command.afterUndo(data, graph);
    if (this.collab) {
      const changes = command.getUndoChanges(data);
      this.emitCollabEvent(changes);
    } else {
      graph.emit("stackchange");
    }
    return stackData;
  }

  redo() {
    if (!this.canRedo()) {
      return false;
    }
    const graph = this.graph;
    const at = this.at + 1;
    const stackData = this.stack[at];
    if (!stackData) {
      return false;
    }
    const { data, name } = stackData;
    this.at++;
    const command = this.commands[name];
    if (data.selections) {
      this.select(data.selections);
    }
    const newSelections = command.redo(
      this.getSnapshot(data),
      graph
    ) as unknown as any;
    if (newSelections) {
      this.select(newSelections);
    }
    if (this.collab) {
      this.emitCollabEvent(command.getExecuteChanges(data));
    } else {
      graph.emit("stackchange");
    }
    return stackData;
  }

  emitCollabEvent(changes: Record<string, any>) {
    const graph = this.graph;
    if (Array.isArray(changes)) {
      for (const change of changes) {
        graph.emit("stackchange", change);
      }
    } else {
      if (changes.action !== "base") {
        graph.emit("stackchange", changes);
      }
    }
  }

  clear() {
    this.stack = [];
    this.at = -1;
    this.graph.set("_selections", {
      node: [],
      edge: [],
      group: [],
    });
  }

  setMode(mode: string) {
    this.mode = mode;
  }

  getMode() {
    return this.mode;
  }

  select(selections: { node: string[]; edge: string[]; group: string[] }) {
    const graph = this.graph;
    const autoDraw = graph.disableAutoDraw();
    const formerSelections = graph.get("_selections");
    const entitiesToSelect: (Node | Edge | Group)[] = [];
    Object.keys(selections).forEach((type: string) => {
      const entityIds = selections[type];
      entityIds.forEach((id: string) => {
        if (graph.entityMap[type][id]) {
          entitiesToSelect.push(graph.entityMap[type][id]);
        }
      });
    });
    const emitEvent = graph.get("emitGraphEvents");
    graph.emitEvent(GRAPH_EVENTS.BATCH_STATE_START, {
      targets: entitiesToSelect,
      state: "select",
    });
    graph.set("emitGraphEvents", false);
    const unselect: (Node | Edge | Group)[] = [];
    Object.keys(formerSelections).forEach((type: string) => {
      const entityIds = formerSelections[type];
      entityIds.forEach((id: string) => {
        const entity = graph.entityMap[type][id];
        if (entity) {
          entity.removeState("select");
          unselect.push(entity);
        }
      });
    });

    entitiesToSelect.forEach((entity: Node | Edge | Group) => {
      entity.setState("select");
    });
    graph.set("_selections", selections);
    graph.set("emitGraphEvents", emitEvent);
    graph.emitEvent(GRAPH_EVENTS.BATCH_STATE_END, {
      targets: entitiesToSelect,
      state: "select",
      unselect,
    });
    graph.enableAutoDraw(autoDraw);
  }

  push(name: string, data: any) {
    const stack = this.stack;
    this.at++;
    stack[this.at] = { name, data };
    if (stack.length > this.capacity) {
      stack.shift();
      this.at--;
    }
    this.stack.length = this.at + 1;
  }

  addCommand(name: string, command: Command) {
    if (this.commands[name]) {
      console.error(`Command ${name} existed, add failed`);
      return;
    }
    this.commands[name] = Object.assign(
      Object.create(Object.getPrototypeOf(command)),
      command
    );
  }

  removeCommand(name: string) {
    delete this.commands[name];
  }

  hasCommand(name: string) {
    return !!this.commands[name];
  }

  getSnapshot(data?: Record<string, any>) {
    const result: Record<string, any> = {};
    if (data) {
      Object.keys(data).forEach((key: string) => {
        if (key === "selections") {
          result[key] = cloneDeep(this.graph.get("_selections"));
        } else if (
          data[key] instanceof Node ||
          data[key] instanceof Edge ||
          data[key] instanceof Group
        ) {
          result[key] = cloneDeep(data[key].configs);
        } else if (data[key] instanceof ShapeBase) {
          // 如果配置项中带有 shape 实例，不生成快照
          return;
        } else {
          result[key] = cloneDeep(data[key]);
        }
      });
    }
    return result;
  }

  executeRemote(remoteChange: Record<string, any>) {
    const { action, change } = remoteChange;
    const graph = this.graph;
    switch (action) {
      case ACTION_TYPES.ADD:
        batchAddRemote(graph, change, this.treeLike);
        break;
      case ACTION_TYPES.REMOVE:
        batchRemove(graph, change);
        break;
      case ACTION_TYPES.UPDATE:
        Object.keys(change).forEach((type: string) => {
          change[type].forEach((configs: any) => {
            const entity = graph.entityMap[type][configs.id];
            // DAGFlowEditor 保持节点间顺序临时做法
            if (configs.targets) {
              entity.targets = configs.targets;
              delete configs.targets;
            }
            entity && graph.update(entity, configs);
          });
        });
        graph.refresh();
        break;
      default:
        break;
    }
    // 修正选区，以免选中图元已经被删除
    let changed = false;
    const selections = graph.get("_selections");
    const newSelections = {
      node: [],
      edge: [],
      group: [],
    };
    Object.keys(selections).forEach((type: string) => {
      selections[type].forEach((id: string) => {
        if (graph.entityMap[type][id]) {
          newSelections[type].push(id);
        } else {
          changed = true;
        }
      });
    });
    changed && this.select(newSelections);
    this.graph.emit("remotechanged");
  }

  destroy() {
    this.clear();
    this.commands = {};
  }
}
