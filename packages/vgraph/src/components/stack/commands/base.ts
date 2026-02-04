import { Graph, TreeGraph } from "../../../graph";
import { Command } from "../../../typings/stack";

export const CommandBase: Command = {
  // 指令名称，stack 通过快照内名称调度指令
  name: "base",
  // 是否可作用于多个实例
  multiple: true,
  // 是否留存快照
  instack: true,
  // 快照中是否留存当前操作视口位置
  savePosition: true,
  // 支持的模式
  mode: ["edit"],

  // 是否可执行
  shouldExecute() {
    return true;
  },

  // 获取操作快照
  getSnapshot(graph: Graph | TreeGraph, args?: Record<string, any>) {
    let snapshotData;
    args = args || {};
    if (graph instanceof Graph) {
      snapshotData = graph.getData();
    } else {
      snapshotData = graph.getTreeData();
    }
    args.snapshotData = snapshotData;
    return args;
  },

  // @override 执行
  execute(snapshot: Record<string, any>, graph: Graph | TreeGraph) {},

  // 撤销
  undo(snapshot: Record<string, any>, graph: Graph | TreeGraph) {
    const data = snapshot.snapshotData;
    if (data) {
      graph.data(data);
    }
  },

  // 撤销后置状态整理
  afterUndo(snapshot: Record<string, any>, graph: Graph | TreeGraph) {},

  // 重做
  redo(snapshot: Record<string, any>, graph: Graph | TreeGraph) {
    return this.execute(snapshot, graph);
  },

  // 执行指令的协同数据准备
  getExecuteChanges(snapshot: Record<string, any>) {
    return {
      action: "base",
      change: {},
    };
  },

  // 撤销得到协同数据准备
  getUndoChanges(snapshot: Record<string, any>) {
    return {
      action: "base",
      change: {},
    };
  },
};
