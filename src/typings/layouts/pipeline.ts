import { TreeData } from '../data';

export type PipelineLayoutOptions = {
  /**
   * Specify the id of root node.
   * 指定根节点
   */
  rootId: string;
  /**
   * Type of algorithm to assign node coordinates.
   * 节点坐标排布方式，默认紧凑型 `compact`
   */
  coordAssignment?: 'compact';
  /**
   * Number of pixels between each rank in the layout.
   * 同层节点之间的间隔
   */
  rankSep?: number;
  /**
   * Number of pixels that separate nodes horizontally in the layout.
   * 同列节点之间的间隔
   */
  nodeSep?: number;
  /**
   * Specify the coordinates of root node.
   * 指定根节点坐标，旧版流水线用一般用不到
   */
  rootCoord?: number[];
  /**
   * Direction for rank nodes.
   * 布局方向，默认 `TB`
   */
  rankDir?: 'TB' | 'LR';
  /**
   * Whether or not take control points of edges into consideration.
   * 是否不计算连线控制点, 默认为 `false`
   */
  ignoreControlPoints?: boolean;
} | {
  /**
   * Specify the id of root node.
   * 指定根节点
   */
  rootId: string;
  /**
   * Type of algorithm to assign node coordinates.
   * 节点坐标排布方式，指定为树形
   */
  coordAssignment: 'treeLike';
  /**
   * Number of pixels between each rank in the layout.
   * 同层节点之间的间隔
   */
  rankSep?: number;
  /**
   * Number of pixels that separate nodes horizontally in the layout.
   * 同列节点之间的间隔
   */
  nodeSep?: number;
  /**
   * Direction for rank nodes.
   * 布局方向，默认 `TB`
   */
  rankDir?: 'TB' | 'LR';
  setTreePosition?: (data: TreeData) => { leftTree: TreeData, rightTree: TreeData };
};
