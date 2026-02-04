import { TreeData } from "../data";

export type TreeLayoutConfigs = {
  /**
   * Direction of the layout.
   * 布局方向, 默认为 `TB`
   */
  direction?: "LR" | "RL" | "TB" | "BT";
  /**
   * The spacing between nodes at the same rank.
   * 同层级节点之间的间距
   */
  nodeSep?: (nodeData: TreeData) => number;
  /**
   * The spacing between nodes of different ranks.
   * 指定跨层级节点间距
   */
  rankSep?: (nodeData: TreeData) => number;
  /**
   * Specify size of the node.
   * 指定节点大小
   */
  nodeSize?: (nodeData: { [k: string]: any }) => number[];
};

export type DendrogramConfigs = TreeLayoutConfigs & {
  /**
   * Whether to use the radial tree layout.
   * 是否采用径向树布局
   */
  radial?: boolean;
  /**
   * The graph size. For radial tree layout.
   * 绘图区域大小。用于 radial 布局。
   */
  size?: () => number[];
};

export type CompactBoxConfigs = TreeLayoutConfigs & {
  /**
   * Whether to use the radial tree layout.
   * 是否采用径向树布局
   */
  radial?: boolean;
  /**
   * The graph size. For radial tree layout.
   * 绘图区域大小。用于 radial 布局。
   */
  size?: () => number[];
  /**
   * Whether to align nodes at the same rank.
   * 同层节点是否对齐
   */
  alignPeerNodes?: boolean;
  /**
   * The alignment method of sibling nodes.
   * 兄弟节点的对齐方式
   */
  alignParent?: "front" | "mid" | "back";
};

export type IndentedConfigs = TreeLayoutConfigs & {
  /**
   * The spacing between parent and child nodes in Indented.
   * Indented 布局中父子节点间的间距
   */
  indent?: number;
  /**
   * Child node should align to parent node horizontally.
   * Indented 布局中子节点与父节点是否水平对齐
   */
  alignTop?: boolean;
};

export type MindMapConfigs = TreeLayoutConfigs & {
  /**
   * Whether to use the compact layout.
   * 是否采用紧凑布局。
   * 默认为 false
   */
  compact?: boolean;
  /**
   * Set node position in MindMap.
   * 配置脑图中子节点与根节点的位置关系
   */
  setTreePosition?: (nodeData: TreeData) => {
    leftTree: TreeData;
    rightTree: TreeData;
  };
};
