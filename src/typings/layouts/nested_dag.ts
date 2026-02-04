import { DAGLayoutOptions } from './dag';
import { Graph } from '../../graph';
import { GraphStructure } from '../../graph_structure';

export type NestedDAGOptions = {
  /**
   * General configurations of DAG.
   * 有向图通用配置
   */
  dagOptions?: Partial<DAGLayoutOptions>;
  /**
   * Whether to generate control points of edges.
   * 是否生成连线控制点
   */
  controlPoints?: boolean;
  /**
   * Whether to enable pre-sorting to reduce edge crossings.
   * 是否开启预排序以减少连线交叉
   */
  minCross?: boolean;
  /**
   * The padding between group and child nodes is the same as the group configuration by default.
   * 分组与子节点之间的留白，默认与分组配置相同
   */
  padding?: number | number[];
  /**
   * Customize DAG layout method of each layer.
   * 自定义单层有向图布局方式
   */
  customLayout?: (graph: Graph | GraphStructure, reuse?: { rank?: boolean; order?: boolean }) => void;
};
