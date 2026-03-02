import { Graph } from "../../../graph";
import { GRAPH_EVENTS } from "../../../consts/meta_events";
import { CommandBase } from "./base";
import { isEmptySelections } from "./utils";
import { ACTION_TYPES } from "../../../consts/action_types";

export type MoveNodeArgs = {
  targetId?: string; // selections 或 targetId 必有其一
  batch: boolean;
  lastPositions: Record<string, { x: number; y: number }>;
  originPositions: Record<string, { x: number; y: number }>;
  originGroupBox: Record<
    string,
    { left: number; top: number; width: number; height: number }
  >;
  edgeOriginControlPointsMap: Record<string, number[] | null | undefined>; // <id, controlPoints>
};

type MoveNodeSnapshot = {
  selections?: {
    node: string[];
    edge: string[];
    group: string[];
  };
  edgeIds: string[];
  lastPositions: Record<string, { x: number; y: number }>;
  originPositions: Record<string, { x: number; y: number }>;
  edgeOriginControlPointsMap: Record<string, number[] | null>;
  edgeNewControlPointsMap: Record<string, number[] | null>;
  currentGroupBox: Record<
    string,
    { left: number; top: number; width: number; height: number }
  >;
  [key: string]: any; // others
};

export const MoveNodeCommand = Object.assign({}, CommandBase, {
  name: "moveNode",
  savePosition: false,
  shouldExecute(graph: Graph, args: MoveNodeArgs) {
    const targetId = args.targetId as string;
    const entity = graph.getNodeById(targetId) || graph.getGroupById(targetId);
    if (entity) {
      if (entity.isDestroyed()) {
        return false;
      } else {
        return true;
      }
    } else if (isEmptySelections(graph.get("_selections"))) {
      return false;
    } else {
      return true;
    }
  },
  getSnapshot(graph: Graph, args: MoveNodeArgs) {
    const edgeIds = args.edgeOriginControlPointsMap
      ? Object.keys(args.edgeOriginControlPointsMap)
      : [];
    const edgeNewControlPointsMap = {};
    const currentGroupBox = {};
    edgeIds.forEach((edgeId: string) => {
      const edge = graph.getEdgeById(edgeId);
      edgeNewControlPointsMap[edge.get("id")] = edge
        .get("controlPoints")
        ?.concat();
    });
    Object.keys(args.originGroupBox).forEach((groupId: string) => {
      const group = graph.getGroupById(groupId);
      currentGroupBox[groupId] = group.getBBox();
    });
    // 默认已经已经将 ControlPoints 更新，即现在的 ControlPoints 为最新的 ControlPoints。
    return {
      ...args,
      edgeIds,
      edgeNewControlPointsMap,
      currentGroupBox,
      currentMatrix: graph.getMatrix().concat([]),
    };
  },
  execute(snapshot: MoveNodeSnapshot, graph: Graph) {
    // fix: 选中分组时，选区异常
    // return {
    //   node: Object.keys(snapshot.originPositions),
    //   edge: [],
    //   group: [],
    // };
  },

  undo(snapshot: MoveNodeSnapshot, graph: Graph) {
    batchMoveNode(graph, snapshot.originPositions, snapshot.originGroupBox);
    const autoDraw = graph.disableAutoDraw();
    for (const edgeId of snapshot.edgeIds) {
      const edge = graph.getEdgeById(edgeId);
      edge.set("controlPoints", snapshot.edgeOriginControlPointsMap[edgeId]);
      edge.updatePosition();
    }
    graph.setMatrix(snapshot.originMatrix.concat([]));
    graph.enableAutoDraw(autoDraw);
  },

  redo(snapshot: MoveNodeSnapshot, graph: Graph) {
    batchMoveNode(graph, snapshot.lastPositions, snapshot.currentGroupBox);
    const autoDraw = graph.disableAutoDraw();
    for (const edgeId of snapshot.edgeIds) {
      const edge = graph.getEdgeById(edgeId);
      edge.set("controlPoints", snapshot.edgeNewControlPointsMap[edgeId]);
      edge.updatePosition();
    }
    graph.setMatrix(snapshot.currentMatrix.concat([]));
    graph.enableAutoDraw(autoDraw);
    return snapshot.batch
      ? snapshot.selections
      : {
          node: Object.keys(snapshot.originPositions),
          edge: [],
          group: [],
        };
  },
  // TODO 第一期看情况能不能做实时同步，先实现一个结果同步
  getExecuteChanges(snapshot: Record<string, any>) {
    const change: any = { node: [], edge: [] };
    const { lastPositions, edgeNewControlPointsMap } = snapshot;
    Object.keys(lastPositions).forEach((id: string) => {
      const coord = lastPositions[id];
      change.node.push({
        id,
        x: coord.x,
        y: coord.y,
      });
    });

    snapshot.edgeIds.forEach((id: string) => {
      change.edge.push({
        id,
        controlPoints: edgeNewControlPointsMap[id],
      });
    });
    return {
      action: ACTION_TYPES.UPDATE,
      change,
    };
  },
  getUndoChanges(snapshot: Record<string, any>) {
    const change: any = { node: [], edge: [] };
    const { originPositions, edgeOriginControlPointsMap } = snapshot;
    Object.keys(originPositions).forEach((id: string) => {
      const coord = originPositions[id];
      change.node.push({
        id,
        x: coord.x,
        y: coord.y,
      });
    });

    snapshot.edgeIds.forEach((id: string) => {
      change.edge.push({
        id,
        controlPoints: edgeOriginControlPointsMap[id],
      });
    });
    return {
      action: ACTION_TYPES.UPDATE,
      change,
    };
  },
});

function batchMoveNode(
  graph: Graph,
  positions: Record<string, { x: number; y: number }>,
  groupBoxes: Record<
    string,
    { left: number; top: number; width: number; height: number }
  >,
  emitEvent = true
) {
  const nodes = Object.keys(positions).map((id) => graph.getNodeById(id));
  const batch = nodes.length > 1;
  const autoDraw = graph.disableAutoDraw();
  const target = nodes[0];
  emitEvent &&
    graph.emitEvent(GRAPH_EVENTS.MOVE_START, { batch, targets: nodes, target });
  for (const node of nodes) {
    if (node) {
      const { x, y } = positions[node.get("id")];
      node.configs.x = x;
      node.configs.y = y;
      node.layer.set({ x, y });
    }
  }

  Object.keys(groupBoxes).forEach((groupId: string) => {
    const group = graph.getGroupById(groupId);
    group.setBBox(groupBoxes[groupId]);
  });

  emitEvent &&
    graph.emitEvent(GRAPH_EVENTS.MOVE_END, { batch, targets: nodes, target });
  graph.enableAutoDraw(autoDraw);
}
