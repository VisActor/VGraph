import { Graph, TreeGraph } from "../../../graph";
import { SnapshotData } from "../../../typings/stack";
import { cloneDeep } from "../../../utils";
import { CommandBase } from "./base";

export type BatchArgs = {
  formerData: SnapshotData;
  currentData: SnapshotData;
  afterUndo?: () => void;
  afterRedo?: () => void;
};

// 用于 dorado pipeline 特殊场景
// condition branch 等节点的变化可能引起多个节点属性变化，统一用此方法记录
// 通用限制编辑走 addSource, addTarget & addSibling
export const BatchCommand = Object.assign({}, CommandBase, {
  name: "batch",
  savePosition: false,
  getSnapshot(graph: Graph | TreeGraph, args: BatchArgs) {
    return args;
  },
  execute() {},
  undo(snapshot: BatchArgs, graph: Graph | TreeGraph) {
    if (snapshot.formerData.nodes) {
      //  拷贝一份导入graph。如果不拷贝 graph.data 后变更 configs 会修改到 snapshot 中的值。
      const data = cloneDeep(snapshot.formerData);
      graph.data(data);
    } else {
      graph.clear();
    }
    if (snapshot.formerData.matrix) {
      graph.setMatrix(snapshot.formerData.matrix.concat());
    }
    snapshot.afterUndo?.();
    return snapshot.formerData.selections;
  },
  redo(snapshot: BatchArgs, graph: Graph | TreeGraph) {
    if (snapshot.currentData.nodes) {
      const data = cloneDeep(snapshot.currentData);
      graph.data(data);
    } else {
      graph.clear();
    }
    if (snapshot.currentData.matrix) {
      graph.setMatrix(snapshot.currentData.matrix.concat());
    }
    snapshot.afterRedo?.();
    return snapshot.currentData.selections;
  },
});
