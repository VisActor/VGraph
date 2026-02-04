import { GRAPH_EVENTS } from "../../consts/meta_events";
import { LayoutBase } from "../base";
import { Graph } from "../../graph";
import { Edge } from "../..//models/entities";
import { GraphStructure, EdgeStructure } from "../../graph_structure";
import { normalizePadding, uuid } from "../../utils";
import { DAGLayout } from "../dag";
import { edgeReallocate } from "./edge_reallocate";
import { getBBoxForParent, normalizePosition } from "./normalize";
import { sortByBaryCenter } from "./pre_order";
import { NestedDAGOptions } from "../../typings/layouts/nested_dag";
import { DAGLayoutOptions } from "../../typings/layouts/dag";

// 布局步骤
// 构造一颗满树 (即从根节点向下可以遍历得到所有节点) ，赋予深度信息， 记住 parent
// LCA 算法寻找公共祖
// 遍历所有边， 通过LCA算法找公共祖先，将节点的连线转换到具有相同父节点的同层节点上
// 递归子图，一个group下的所有同层节点即为子图
// 每个子图都用DAGLayout进行布局

export type NestedDAGConfigs = {
  graph?: Graph | GraphStructure;
} & NestedDAGOptions;

export class NestedDAG extends LayoutBase {
  declare graph: Graph | GraphStructure;
  groups: any;
  options: any = {
    dagOptions: {
      rankDir: "LR",
      nodeSep: 20,
      edgeSep: 10,
      rankSep: 50,
      acyclicer: "greedy",
      ranker: "networkSimplex",
      cache: true,
    } as DAGLayoutOptions,
    minCross: true,
    controlPoints: true,
    padding: 20,
    customLayout: undefined,
  };
  topGroups: any[] = [];
  rootGroup: any;
  groupMap: Record<string, any> = {};
  groupNodes: any[] = [];
  entityMap: Record<string, any> = {};
  customLayout:
    | ((
        graph: Graph | GraphStructure,
        reuse?: { rank?: boolean; order?: boolean },
        rankOnly?: boolean
      ) => void)
    | undefined;

  constructor(configs: NestedDAGConfigs) {
    super(configs);
    this.graph = configs.graph!;
    this.groups = this.graph.getGroups();
    this.setOptions(configs);
  }

  setOptions(configs: NestedDAGConfigs & { graph?: Graph | GraphStructure }) {
    if (configs.graph) {
      this.graph = configs.graph;
      delete configs.graph;
    }
    if (configs.dagOptions) {
      Object.assign(this.options.dagOptions, configs.dagOptions);
      delete configs.dagOptions;
    }
    Object.assign(this.options, configs);
    if (configs.customLayout) {
      this.customLayout = configs.customLayout;
    }
    if (this.graph && this.graph.getNodes().length > 0) {
      this.layout();
    }
  }

  reLayout(reuse?: { rank?: boolean; order?: boolean }) {
    this.layout(reuse ?? { rank: true, order: true });
  }
  layout(reuse?: { rank?: boolean; order?: boolean }) {
    const graph = this.graph;
    if (graph.getNodes().length === 0 && graph.getGroups().length === 0) {
      // node 和 group 都为空时说明是空数据。直接退出。
      return;
    }
    if (graph instanceof Graph) {
      graph.emitEvent(GRAPH_EVENTS.LAYOUT_START);
      graph.set("emitGraphEvents", false);
    }
    this.init();
    if (this.options.minCross) {
      this.preOrder(this.rootGroup);
      this.options.minCross = false; // 仅第一次执行。
    }
    this.layoutSubgraphs(this.rootGroup, reuse);
    normalizePosition(this.rootGroup);
    this.layoutAssign();
    if (graph instanceof Graph) {
      graph.set("emitGraphEvents", true);
      graph.emitEvent(GRAPH_EVENTS.LAYOUT_END);
    }
  }

  init() {
    this.groups = this.graph.getGroups();
    // 构造一颗满树 (即从根节点向下可以遍历得到所有节点) ，赋予深度信息， 记住 parent
    const entityMap = this.buildTree();
    const edges = this.graph.getEdges();
    edgeReallocate(edges, this.rootGroup, entityMap);
  }

  buildTree() {
    const rootGroup = {
      id: "_nested_dag_mock_root",
      depth: 0,
      children: [],
      edges: [],
      parent: null,
      x: 0,
      y: 0,
      isRoot: true,
    } as any;
    const nodes = this.graph.getNodes();
    const nodeMap = this.graph.getNodeMap();
    const entityMap = {} as any; // Map node id to parent group
    entityMap._nested_dag_mock_root = rootGroup;
    const groupMap = {} as any;

    for (const group of this.groups) {
      // 创建新的 Group
      const groupId = group.get("id") ?? group.id ?? uuid(8);
      group.id = groupId; // 避免原 group 没有id
      const padding = normalizePadding(
        group.get("padding") ?? this.options.padding ?? 20
      );
      const { width, height } = group.getBBox();
      const titleSize = group.get("titleSize");
      const newGroup = {
        id: groupId,
        children: [],
        padding: padding,
        edges: [],
        childEdges: [],
        collapsed: group.get("collapsed") ?? false,
        x: group.get("x") ?? 0,
        y: group.get("y") ?? 0,
        rank: group.get("rank") ?? group.get("_rank"),
        order: group.get("order") ?? group.get("_order"),
        _order: group.get("_order"),
        width: width || 80,
        height: height || 20, // 先赋值，如果没有收起则会重新计算，否则就用这个值
        titleHeight: titleSize || 20,
      };

      groupMap[groupId] = newGroup;
      entityMap[groupId] = newGroup;
    }
    const topGroups = [] as any[];
    for (const group of this.groups) {
      // 获取嵌套关系，groups 是平铺的，需要从 children 里面获取嵌套关系
      const children = group.get("children") ?? group.children;
      const id = group.get("id") ?? group.id;
      if (!group.belong) {
        topGroups.push(groupMap[id]);
      }
      for (const child of children) {
        const groupId = (child.get ? child.get("id") : child) ?? uuid(8);
        const childGroup = groupMap[groupId];
        const parent = groupMap[id];
        if (childGroup) {
          // 说明子节点是一个 group
          childGroup.parent = parent;
          parent.children = parent.children || [];
          parent.children.push(childGroup);
          entityMap[groupId] = childGroup;
        } else {
          // 说明子节点是一个 node
          const id = (child.get ? child.get("id") : child.id) ?? child;
          const node = nodeMap[id];
          // 未被定义过的 child, 跳过。
          if (!node) {
            console.warn(" Undefined child in the group, child id:", id);
            continue;
          }

          const newNode = {
            id,
            width: node.get("width") ?? 40,
            height: node.get("height") ?? 20,
            x: node.get("x") ?? 0,
            y: node.get("y") ?? 0,
            rank: node.get("_rank"),
            order: node.get("order") ?? node.get("_order"),
            _order: node.get("_order"),
            parent: parent,
          };
          parent.children.push(newNode);
          entityMap[id] = newNode;
        }
      }
    }
    for (const topGroup of topGroups) {
      topGroup.parent = rootGroup;
      rootGroup.children.push(topGroup);
    }

    for (const node of nodes) {
      if (!entityMap[node.get("id")]) {
        // 不在任何分组的节点，挂在 root 上
        const id = node.get("id");
        const newNode = {
          id,
          depth: 1,
          width: node.get("width"),
          height: node.get("height"),
          x: node.get("x") ?? 0,
          y: node.get("y") ?? 0,
          order: node.get("order") ?? node.get("_order"),
          _order: node.get("_order"),
          rank: node.get("_rank"),
          parent: rootGroup,
        };
        rootGroup.children.push(newNode);
        entityMap[id] = newNode;
      }
    }
    this.rootGroup = rootGroup;
    this.entityMap = entityMap;
    return entityMap;
  }

  rankSubgraphs(group: any) {
    if (group.children && !group.collapsed) {
      const nodes = [] as any[];
      const edges = [] as any[];
      const visId = {};
      for (const child of group.children) {
        if (child.children) {
          this.rankSubgraphs(child);
        }
        nodes.push(child);
        visId[child.id] = true;
      }
      const edgeMap = {} as any;
      for (const edge of group.edges) {
        if (visId[edge.source] && visId[edge.target]) {
          if (edgeMap[`${edge.source}-to-${edge.target}`]) {
            edgeMap[`${edge.source}-to-${edge.target}`].weight += 1;
          } else {
            edgeMap[`${edge.source}-to-${edge.target}`] = edge;
            edge.weight = 1;
            edges.push(edge);
          }
        } else {
          console.error(
            `error: ${edge.source} or ${edge.target} are not in the same subgraph.`
          );
        }
      }
      group.uniqueEdges = edges;
      // 边只存在于子图下同层兄弟节点之间，带权重

      const subGraph = new GraphStructure({
        nodes,
        edges,
      });
      if (this.customLayout) {
        this.customLayout(subGraph, {}, true);
        // 兼容现有的灵活定制层级的需求。
        // 要求 customLayout 对 rankOnly=true 时仅执行 rank 操作。否则会全量执行。
      } else {
        new DAGLayout({
          graph: subGraph,
          ...this.options.dagOptions,
          rankOnly: true, // 只排序，不布局
        });
      }
      const rankMap = {};
      for (const node of nodes) {
        const rank = node.rank;
        if (!rankMap[rank]) {
          rankMap[rank] = [];
        }
        rankMap[rank].push(node);
      }
      group.rankMap = rankMap;
      group.rankKeys = Object.keys(rankMap).sort(
        (a, b) => parseInt(a) - parseInt(b)
      );
    }
  }

  preOrder(rootGroup: any) {
    // 先计算 rank
    this.rankSubgraphs(rootGroup);
    // 从上传递rank到下
    // entity.absoluteRank = parent.absoluteRank + entity.depthCoefficient * entity.rank
    // entity.absoluteOrder = parent.absoluteOrder + entity.depthCoefficient * entity.order
    const edges = this.graph.getEdges();
    // 所有边，在 entity.entityEdges 挂上
    for (const edge of edges) {
      const source = edge.get("source");
      const target = edge.get("target");
      const sourceNode = this.entityMap[source];
      const targetNode = this.entityMap[target];
      if (sourceNode && targetNode) {
        sourceNode.entityEdges.push(edge);
        targetNode.entityEdges.push(edge);
        // 将连线挂载于每一个父代
        sourceNode.parent && this.backwardEdge(sourceNode.parent, edge);
        targetNode.parent && this.backwardEdge(targetNode.parent, edge);
      }
    }
    rootGroup.absoluteOrder = 0;
    rootGroup.absoluteRank = 0;
    rootGroup.startOrder = 0;
    this.initOrder(rootGroup);
    this.adjustOrder(rootGroup);
    for (let i = 0; i < 2; i++) {
      sortByBaryCenter(rootGroup, i % 2 ? "up" : "down", this.entityMap);
    }
    this.assignOrder(rootGroup);
  }

  // 按从上往下给节点排绝对序
  adjustOrder(group: any) {
    const order = group.startOrder;
    if (group.children && !group.collapsed) {
      const keys = group.rankKeys;
      const length = keys.length;
      let maxOrder = -Infinity;
      for (let i = 0; i < length; i++) {
        let startOrder = order;
        group.rankMap[keys[i]].forEach((child: any, index: number) => {
          child.startOrder = startOrder;
          child.absoluteOrder = startOrder;
          startOrder += this.adjustOrder(child);
        });
        // 取最长的层级
        maxOrder = Math.max(maxOrder, startOrder);
      }
      // group 的长度取决于最长的部分
      return maxOrder - order;
    } else {
      // 叶子节点长度为1
      return 1;
    }
  }

  initOrder(group: any) {
    // 初始化 order
    if (group.children && !group.collapsed) {
      const keys = group.rankKeys;
      const length = keys.length;
      for (let i = 0; i < length; i++) {
        group.rankMap[keys[i]].forEach((child: any, index: number) => {
          child.order = child._order ?? index;
          child.absoluteRank =
            child.parent.absoluteRank + child.depthCoefficient * child.rank;
          this.initOrder(child);
        });
        group.rankMap[keys[i]].sort((a: any, b: any) => a.order - b.order);
      }
    }
  }
  assignOrder(group: any) {
    group._order = group.order;
    if (group.children) {
      group.children.forEach((child: any, index: number) => {
        this.assignOrder(child);
      });
    }
  }
  backwardEdge(group: any, edge: Edge | EdgeStructure) {
    if (group.isRoot) {
      return;
    }
    group.entityEdges.push(edge);
    if (group.parent) {
      this.backwardEdge(group.parent, edge);
    }
  }

  layoutSubgraphs(group: any, reuse?: { rank?: boolean; order?: boolean }) {
    if (group.children && !group.collapsed) {
      const nodes = [] as any[];
      const edges = [] as any[];
      const visId = {};
      for (const child of group.children) {
        if (child.children) {
          this.layoutSubgraphs(child, reuse);
        }
        nodes.push(child);
        visId[child.id] = true;
      }
      const edgeMap = {} as any;
      for (const edge of group.edges) {
        if (visId[edge.source] && visId[edge.target]) {
          if (edgeMap[`${edge.source}-to-${edge.target}`]) {
            edgeMap[`${edge.source}-to-${edge.target}`].weight += 1;
          } else {
            edgeMap[`${edge.source}-to-${edge.target}`] = edge;
            edge.weight = 1;
            edges.push(edge);
          }
        } else {
          console.error(
            `error: ${edge.source} or ${edge.target} are not in the same subgraph.`
          );
        }
      }
      group.uniqueEdges = edges;
      // 边只存在于子图下同层兄弟节点之间，带权重

      const subGraph = new GraphStructure({
        nodes,
        edges,
      });
      if (this.customLayout) {
        this.customLayout(subGraph, reuse, false);
      } else {
        const options = {
          graph: subGraph,
          ...this.options.dagOptions,
        };
        const ranks = nodes.map((d) => d.rank);
        const orders = nodes.map((d) => d.order);
        if (reuse?.rank) {
          if (!ranks.some((d) => d === undefined)) {
            options!.ranker = "custom";
          } else {
            console.warn("Some nodes have no rank, so not reuse rank.");
          }
        }
        if (reuse?.order) {
          if (!orders.some((d) => d === undefined)) {
            options!.order = "custom";
          } else {
            console.warn("Some nodes have no order, so not reuse order.");
          }
        }
        new DAGLayout(options);
      }
      getBBoxForParent(subGraph, group, this.options.padding);
      // 子图计算完毕，随后计算父图的宽高
    }
  }

  // 将布局信息赋值回原来的 node 和 group
  // 这么做的原因是 layout 会递归构造很多虚拟的 graph。
  // 如果在原 node 和 group 上操作可能太重
  // 因此采取布局完赋值回原 group 和 node 的方式
  layoutAssign() {
    this.groupMap = {};
    for (const oldGroup of this.groups) {
      this.groupMap[oldGroup.get("id")] = oldGroup;
    }
    const nodeMap = this.graph.getNodeMap();
    this.dfsAssign(this.rootGroup, nodeMap);

    // 控制点透。仅考虑未被代理端点的连线。
    // 即: edge.source === edge.originSource && edge.target === edge.originTarget

    if (this.options.controlPoints) {
      this.clearEdgeControlPoints();
      const edgeControlPointsMap = {};
      for (const entity of Object.values(this.entityMap)) {
        if (entity.uniqueEdges) {
          for (const edge of entity.uniqueEdges) {
            if (
              edge.source === edge.originSource &&
              edge.target === edge.originTarget
            ) {
              const id = edge.source + "_to_" + edge.target;
              edgeControlPointsMap[id] = edge.controlPoints;
            }
          }
        }
      }
      for (const edge of this.graph.getEdges()) {
        const id = edge.get("source") + "_to_" + edge.get("target");
        if (edgeControlPointsMap[id]) {
          edge.set("controlPoints", edgeControlPointsMap[id]);
        }
      }
    }
  }
  clearEdgeControlPoints() {
    const edges = this.graph.getEdges();
    for (const edge of edges) {
      edge.set("controlPoints", null);
    }
  }

  dfsAssign(group: any, nodeMap: { [x: string]: any }) {
    if (group.children) {
      if (group.id !== "_nested_dag_mock_root") {
        // root 是虚拟的,不做任何处理
        const oldGroup = this.groupMap[group.id] as any;

        // oldGroup 是 group 实例
        // groups 是 newGroups 的子节点
        Object.assign(oldGroup.configs, {
          x: group.x,
          y: group.y,
          _rank: group.rank,
          _order: group._order,
          width: group.width,
          height: group.height,
          padding: group.padding,
          uniqueEdges: group.uniqueEdges,
        });
        this.groupNodes.push(oldGroup);
      }
      for (const child of group.children) {
        this.dfsAssign(child, nodeMap);
      }
    } else {
      if (nodeMap[group.id]) {
        const node = nodeMap[group.id].configs;
        node.x = group.x;
        node.y = group.y;
        node.width = group.width;
        node.height = group.height;
        node._rank = group.rank;
        node._order = group._order;
      }
    }
  }
}
