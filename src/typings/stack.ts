import { Graph, TreeGraph } from '../graph';
import { NodeData, EdgeData, GroupData, TreeData } from './data';

export type StackSelections = {
  node: string[];
  edge: string[];
  group: string[];
};

export type SnapshotData =
  | {
      nodes: NodeData[];
      edges: EdgeData[];
      groups?: GroupData[];
      matrix?: number[];
      selections?: StackSelections;
    }
  | (TreeData & {
      matrix?: number[];
      selections?: StackSelections;
    });

export type StackOptions = {
  /**
   * The commands of the stack.
   * 操作栈接受的指令
   */
  commands: Record<string, Command>;
  /**
   * The capacity of the stack.
   * 操作栈容量
   */
  capacity?: number;
  /**
   * The capacity of the stack.
   * 操作栈容量
   */
  mode?: string;
  /**
   * Enable collaborative editing.
   * 是否开启协同编辑
   */
  collab?: boolean;
  /**
   * Process data according to tree-like structure.
   * 是否按树结构处理编辑数据
   */
  treeLike?: boolean;
};

export type Command = {
  name: string;
  mode?: string[];
  multiple: boolean;
  instack?: boolean;
  savePosition?: boolean;

  shouldExecute: (graph: Graph | TreeGraph, args?: Record<string, unknown>) => boolean;
  getSnapshot: (graph: Graph | TreeGraph, args?: Record<string, unknown>) => Record<string, unknown>;
  execute: (snapshot: Record<string, unknown>, graph: Graph | TreeGraph) => void;
  undo: (snapshot: Record<string, unknown>, graph: Graph | TreeGraph) => void;
  afterUndo: (snapshot: Record<string, unknown>, graph: Graph | TreeGraph) => void;
  redo: (snapshot: Record<string, unknown>, graph: Graph | TreeGraph) => void;
  getExecuteChanges: (
    snapshot: Record<string, unknown>
  ) => { action: string; change: Record<string, unknown> } | { action: string; change: Record<string, unknown> }[];
  getUndoChanges: (
    snapshot: Record<string, unknown>
  ) => { action: string; change: Record<string, unknown> } | { action: string; change: Record<string, unknown> }[];
};
