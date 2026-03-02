import { Graph, GraphStructure } from "@visactor/vgraph";

export type DotLayoutConfigs = {
  graph: Graph | GraphStructure;
  options?: {
    lineType?: "line" | "polyline" | "ortho" | "spline";
    rankDir?: "TB" | "BT" | "LR" | "RL";
    rankSep?: number;
    nodeSep?: number;
    ranker?: "networkSimplex" | "tightTree" | "longestPath";
    compassAnchor?: boolean; // 依据 rankDir 自适应 上下 或 左右 锚点
  };
};
