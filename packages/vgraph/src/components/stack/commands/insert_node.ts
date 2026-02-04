import { Graph } from "../../../graph";
import { Edge } from "../../../models/entities";
import { uuid } from "../../../utils";
import { CommandBase } from "./base";

type InsertNodeArgs = {
  edge: Edge;
  position?: number;
  nodeConfigs?: Record<string, any>;
};

function alignGrid(
  configs: { x: number; y: number } | Record<string, any> | undefined,
  step: number
) {
  if (configs?.x && configs?.y) {
    configs.x = Math.round(configs.x / step) * step;
    configs.y = Math.round(configs.y / step) * step;
  }
}

export const InsertNodeCommand = Object.assign({}, CommandBase, {
  name: "insertNode",
  shouldExecute(graph: Graph, args: InsertNodeArgs) {
    const edge = args.edge;
    const source = edge.get("source");
    const target = edge.get("target");

    if (!graph.getNodeById(source) || !graph.getNodeById(target)) {
      console.error(
        `The source or target of edge ${edge.get(
          "id"
        )} is not exist, insert failed.`
      );
      return false;
    }
    return true;
  },
  getSnapshot(graph: Graph, args: InsertNodeArgs) {
    const edge = args.edge;
    const point = edge.getKeyShape().getPointAt(args.position ?? 0.5);
    const nodeId = args.nodeConfigs?.id ?? uuid(10);
    const grid = graph.get("_grid");
    const step = grid?.getStep() || 10;
    alignGrid(args.nodeConfigs, step);
    alignGrid(point, step);
    return {
      configs: edge.configs,
      nodeConfigs: { id: nodeId, x: point.x, y: point.y, ...args.nodeConfigs },
      edgeSourceId: uuid(10),
      edgeTargetId: uuid(10),
    };
  },
  execute(snapshot: Record<string, any>, graph: Graph) {
    const { configs, nodeConfigs, edgeSourceId, edgeTargetId } = snapshot;
    const { id, source, target } = configs;
    const newNode = graph.add("node", nodeConfigs);
    const edge = graph.getEdgeById(id);
    const sourceNode = edge.source;
    // 用于 DAGFlowEditor 保持子节点顺序
    const index = sourceNode.targets.indexOf(target);
    sourceNode.targets[index] = newNode.get("id");
    graph.remove(edge);
    const newSourceAnchor = configs.sourceAnchor;
    let newTargetAnchor = configs.targetAnchor;
    if (
      newTargetAnchor !== undefined &&
      newSourceAnchor === newTargetAnchor &&
      newNode.get("anchors")?.length > 1
    ) {
      // 新增的节点从两个不同端口。
      const length = newNode.get("anchors")?.length;
      newTargetAnchor = (newSourceAnchor + 1) % length;
    }
    const edgeSourceConfigs = {
      id: edgeSourceId,
      source: source,
      sourceAnchor: configs.sourceAnchor,
      target: newNode.get("id"),
      targetAnchor: newTargetAnchor,
    };
    const edgeTargetConfigs = {
      id: edgeTargetId,
      source: newNode.get("id"),
      sourceAnchor: newSourceAnchor,
      target: target,
      targetAnchor: configs.targetAnchor,
    };
    graph.add("edge", edgeSourceConfigs);
    graph.add("edge", edgeTargetConfigs);

    // 选中新增节点
    return {
      node: [newNode.get("id")],
      edge: [],
      group: [],
    };
  },
  undo(snapshot: Record<string, any>, graph: Graph) {
    const nodeId = snapshot.nodeConfigs.id;
    const source = graph.getNodeById(snapshot.configs.source);
    const index = source.targets.indexOf(nodeId);
    source.targets[index] = snapshot.configs.target;
    graph.remove(graph.getNodeById(nodeId));
    graph.add("edge", snapshot.configs);
  },
});
