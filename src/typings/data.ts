import { NodeConfigs, EdgeConfigs, GroupConfigs } from './model';

/**
 * 通用有向图内节点数据格式
 * The NodeData type represents required data for a node in the general graph.
 */
export type NodeData = { id: string; groupId?: string;[key: string]: any };

/**
 * 树图节点数据格式
 * The TreeNodeData type represents required data for a node in the tree graph.
 */
export type TreeNodeData = NodeData & { children?: TreeNodeData[] };

/**
 * 通用有向图和树图中分组数据格式
 * The EdgeData type represents required data for an edge in the general graph and tree graph.
 */
export type EdgeData = { id?: string, source: string; target: string; [key: string]: any };

/**
 * 通用有向图中分组数据格式
 * The GroupData type represents required data for a group in the general graph.
 */
export type GroupData = { id: string; children: string[]; groupId?: string;[key: string]: any };

/**
 * 通用有向图输入的数据格式，考虑对 setDefaultXxx 中进行数据转换的场景，对数据约束较弱
 * The GraphData type represents input data for a general graph.
 */
export type GraphData = {
  nodes: NodeConfigs[];
  edges: EdgeConfigs[];
  groups?: GroupConfigs[];
};

/**
 * 通用有向图内部计算数据格式，对数据约束较强
 * The ValidData type represents required data for a general graph.
 */
export type ValidData = {
  nodes: NodeData[];
  edges: EdgeData[];
  groups?: GroupData[];
};

/**
 * 树状图输入数据格式，对数据约束较弱
 * The ValidData type represents input data for a general graph.
 */
export type TreeData = NodeConfigs & {
  children?: TreeData[];
};

/**
 * GraphStructure 输入配置
 * The `GraphStructureData` type defines the input structure for GraphStructure
 */
export type GraphStructureData = {
  nodes: Partial<NodeData>[];
  edges: Partial<EdgeData>[];
  groups?: Partial<GroupData>[];
  directed?: boolean;
  getNodeId?: (node: Partial<NodeData>) => string;
  getEdgeId?: (edge: Partial<EdgeData>) => string;
  getEdgeSource?: (edge: Partial<EdgeData>) => string;
  getEdgeTarget?: (edge: Partial<EdgeData>) => string;
  getGroupData?: (data: Partial<GroupData>) => GroupData;
};

