import { Node } from '../../models/entities';
import { NodeStructure } from '../../graph_structure';

export type DAGLayoutOptions = {
  /**
   * Number of pixels between each rank in the layout.
   * 同层节点之间的间隔
   */
  rankSep: number;
  /**
   * Number of pixels that separate nodes horizontally in the layout.
   * 同列节点之间的间隔
   */
  nodeSep: number;
  /**
   * Number of pixels that separate edges horizontally in the layout.
   * 跨列连线的间隔
   */
  edgeSep: number;
  /**
   * Type of algorithm to assign a rank to each node in the input graph.
   * 节点分列方式，默认为 `networkSimplex`
   */
  ranker: 'longestPath' | 'feasibleTree' | 'networkSimplex' | 'bfs' | 'custom';
  /**
   * Start node for bfs, should not be empty when ranker is set to `bfs`.
   * 当 ranker 为 bfs 时配置遍历的初始节点
   */
  bfsRoot?: Node | NodeStructure;
  /**
   * Type of algorithm to order the nodes in a rank.
   * 同列节点中的排序方式，默认 `minCross`
   */
  order: 'minCross' | 'custom' | 'none';
  /**
   * Direction for rank nodes.
   * 布局方向，默认 `TB`
   */
  rankDir: 'TB' | 'BT' | 'LR' | 'RL';
  /**
   * Alignment for rank nodes.
   * 布局方向，默认 `TB`
   */
  align: 'UL' | 'UR' | 'DL' | 'DR' | 'L' | 'R' | 'T' | 'B' | undefined;
  /**
   * Alignment for rank nodes.
   * 指定去环算法, 默认 `dfs`
   */
  acyclicer: 'greedy' | 'dfs';
  /**
   * Whether or not take groups into consideration.
   * 是否忽略分组配置，按纯节点排布, 默认为 `true`
   */
  ignoreGroup: boolean;
  /**
   * Determine how to deal with duplicate edges.
   * 是否忽略重复连线, 默认为 `false`
   */
  ignoreDuplicateEdges: boolean;
  /**
   * Adjust edges' control points to avoid overlap with nodes.
   * 是否调整控制点，在每层节点大小不一或分组场景下能有效避免连线穿过大尺寸节点或分组
   */
  adjustControlPoints: boolean;
  /**
   * Enable all control points, all edges will be step lines.
   * 全量控制点开关，开启后会所有连线会是横平竖直的
   */
  allControlPoints: boolean;
  /**
   * Enable cache of node positions.
   * 缓存节点位置开关，用于展开收起时保持节点之间相对位置
   */
  cache?: boolean;
  /**
   * Rank nodes only, the layout won't assign coordinates to nodes.
   * 仅对节点分列的开关，开启后不会对列中节点排序和分配坐标
   */
  rankOnly?: boolean;
  /**
   * Specify the align of nodes of the same rank.
   * 同层节点排布方式，默认居中
   */
  alignPeerNodes?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /**
   * Enable preOrder to restore cached nodes' positions.
   * 预排序开关，恢复缓存节点位置
   */
  preOrder?: boolean;
  /**
   * Type of algorithm to assign node coordinates.
   * 节点坐标排布方式，默认 `compact`
   */
  coordAssignment: 'compact' | 'treeLike';
};
