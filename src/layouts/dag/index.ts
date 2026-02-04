// 预处理 去环 移除自环
// rank
// dummy node
// order
// coord assignment
// controlPoints 计算控制点

import { GRAPH_EVENTS } from '../../consts/meta_events';
import { Edge, Node, Group } from '../../models/entities';
import { Graph } from '../../graph';
import { GraphStructure, NodeStructure, EdgeStructure } from '../../graph_structure';
import { LayoutBase } from '../base';
import { connectedComponents, dealDuplicateEdge } from '../utils';

import { reverseEdge, acyclic } from './preprocess/acyclic';
import { getBBoxForNode, getNestedGraph, recoverFromNestedGraph, nestingGraph } from './preprocess/nested_graph';

import { bfsRank, networkSimplex, feasibleTree, IRanks, longestPath } from './rank';

import { insertDummyNodes, removeDummyNodes } from './order/dummy_nodes';
import { orderNodes, preOrderNestedGraphs } from './order/order_nodes';

import { coordSystem } from './position/coord_system';
import { horizontalCoordAssignment } from './position/horizontal_coord_assignment';
import { treeLayoutCoordAssignment } from './position/treelayout_coord_assignment';
import { DAGLayoutOptions } from '../../typings/layouts/dag';
import { EdgeConfigs } from '../../typings/model';
import { EdgeData } from '../../typings/data';

export type DAGLayoutConfigs = {
  graph: Graph | GraphStructure;
} & Partial<DAGLayoutOptions>;

export class DAGLayout extends LayoutBase {
  graph: Graph | GraphStructure;
  ranks: IRanks = {};
  private repeatEdges: EdgeConfigs[] | EdgeData[] = [];
  private groupEdges: EdgeConfigs[] = [];
  private selfLoop: (Edge | EdgeStructure)[] = [];
  options: DAGLayoutOptions = {
    rankSep: 50,
    edgeSep: 20,
    nodeSep: 30,
    ranker: 'networkSimplex',
    order: 'minCross',
    rankDir: 'TB',
    align: undefined,
    acyclicer: 'dfs',
    bfsRoot: undefined,
    ignoreGroup: false,
    ignoreDuplicateEdges: false,
    adjustControlPoints: false,
    allControlPoints: false,
    rankOnly: false,
    coordAssignment: 'compact',
  };
  constructor(configs: DAGLayoutConfigs) {
    super(configs);
    this.graph = configs.graph;
    this.setOptions(configs);
  }

  data(data: Graph | GraphStructure) {
    super.data(data);
  }

  /**
   * Performs a directed acyclic graph layout for a graph.
   * 进行有向图布局
   * @param [clearRank=true] - Whether to clear the rank information before performing the layout.
   */
  layout(param?: { clearRank: boolean }) {
    const graph = this.graph;
    const clearRank = param ? param.clearRank : true;
    if (!graph || graph.getNodes().length === 0) {
      return;
    }
    graph instanceof Graph && !!this.options.rankOnly && graph.emitEvent(GRAPH_EVENTS.LAYOUT_START);
    graph.set('emitGraphEvents', false);
    const { allControlPoints } = this.options;
    let autoDraw;
    const nestedGraphs: GraphStructure[] = [];
    let tempEdges: any[] = [];
    let ranked = false;
    if (allControlPoints) {
      this.cleanEdgeControlPoints(graph);
    }
    if (graph instanceof Graph) {
      autoDraw = graph.disableAutoDraw();
      // 嵌套布局入口
      if (graph.getGroups().length && !this.options.ignoreGroup) {
        graph.set('groupNodes', []);
        graph.getGroups().forEach((group: Group) => {
          if (!group.children.length) {
            return;
          }
          const { nestedGraph, outerEdges } = getNestedGraph(graph, group);
          nestedGraph.set('groupId', group.get('id'));
          nestedGraphs.push(nestedGraph);
          tempEdges = tempEdges.concat(outerEdges);
          this.layoutSingleGraph(nestedGraph, true, { rankOnly: true });
        });
        tempEdges.forEach((edgeConfigs: any) => {
          graph.add('edge', edgeConfigs, true);
        });
        // 先计算 rank。
        this.layoutSingleGraph(graph, true, { rankOnly: true });
        ranked = true;
        const ranks = this.getRanks(graph);
        if (this.options.order === 'minCross') {
          preOrderNestedGraphs(ranks, nestedGraphs, tempEdges);
        }
        nestedGraphs.forEach((nestedGraph: GraphStructure) => {
          const group = graph.getGroupById(nestedGraph.get('groupId'));
          const gapYs = this.layoutSingleGraph(nestedGraph, true, { ranker: 'custom' }); // 再计算order和position
          getBBoxForNode(nestedGraph);
          group.set('gapYs', gapYs);
        });
      }
      if (graph.getGroups().length > 0 && this.options.ignoreGroup) {
        // 删除 group 连线，布局完以后再添加
        graph.getGroups().forEach((group: Group) => {
          group.edges.forEach((edge: Edge) => {
            this.groupEdges.push(edge.configs);
            graph.remove(edge);
          });
        });
      }
    }
    const gapYs = this.layoutSingleGraph(graph, clearRank, ranked ? { ranker: 'custom' } : {});
    if (this.options.rankOnly) {
      graph.set('emitGraphEvents', true);
      return;
    }
    let vertical = true;
    if (this.options.rankDir === 'LR' || this.options.rankDir === 'RL') {
      vertical = false;
    }
    if (graph instanceof Graph) {
      if (nestedGraphs.length) {
        nestedGraphs.forEach((nestedGraph: GraphStructure) => {
          const node = nestedGraph.get('groupNode');
          const group = graph.getGroupById(node.get('originGroupId'));
          const { offsetX, offsetY } = recoverFromNestedGraph(graph, nestedGraph);
          const offset = vertical ? offsetY : offsetX;
          Object.values(group.get('gapYs')).forEach((rankInfo: any) => {
            group.set('rank', node.get('rank'));
            group.set('_order', node.get('_order'));
            rankInfo.source += offset;
            rankInfo.target += offset;
          });
        });
        tempEdges.forEach((configs: any) => {
          if (configs.originSource) {
            configs.source = configs.originSource;
            delete configs.originSource;
          }
          if (configs.originTarget) {
            configs.target = configs.originTarget;
            delete configs.originTarget;
          }
          delete configs.temp;
          graph.add('edge', configs);
        });
      }
      graph.enableAutoDraw(autoDraw);
    }
    // 处理连线控制点，allControlPoints 或列间节点大小不同
    this.adjustControlPoints(gapYs);
    // 最后统一处理重复连线
    if (!this.options.ignoreDuplicateEdges) {
      dealDuplicateEdge(graph, graph.getEdges() as Edge[], true, this.options.edgeSep);
    }
    if (this.groupEdges.length) {
      this.groupEdges.forEach((edgeConfigs: any) => {
        graph.add('edge', edgeConfigs);
      });
    }
    graph.set('emitGraphEvents', true);
    graph instanceof Graph && graph.emitEvent(GRAPH_EVENTS.LAYOUT_END);
  }

  /**
   * The `layoutSingleGraph` performs a directed acyclic graph layout for
   * algorithms based on specified options, handling node ordering, alignment, and coordination
   * adjustments.
   * @param {Graph | GraphStructure} graph - The `graph` represents the graph data structure that you want to layout.
   *  It can be either a `Graph` object or a `GraphStructure`
   * @param [clearRank=true] - The `clearRank` parameter is a boolean flag that determines whether to
   * clear the rank information after the layout operation is completed. If `clearRank` is set to
   * `true`, the rank information will be cleared at the end of the layout operation.
   * @returns The function `layoutSingleGraph` returns the variable `gapYs`, which represents the
   * vertical gap positions between ranks in the graph layout.
   */
  private layoutSingleGraph(
    graph: Graph | GraphStructure,
    clearRank = true,
    singleLayoutOptions?: { rankOnly?: boolean; ranker?: 'custom' | any }
  ) {
    const options = Object.assign({}, this.options, singleLayoutOptions);
    const { ranker, bfsRoot, rankDir, cache, alignPeerNodes } = options;
    this.removeSelfEdges(graph);
    acyclic.run(graph);
    // 去环之后可能产生重边, 从图中移除
    this.removeRepeatEdges(graph);
    if (Object.keys(this.ranks).length === 0) {
      if (ranker === 'longestPath') {
        longestPath(graph);
        const nest = nestingGraph(graph);
        nest.run();
        nest.cleanup();
      } else if (ranker === 'feasibleTree') {
        longestPath(graph);
        const nest = nestingGraph(graph);
        nest.run();
        feasibleTree(graph);
        nest.cleanup();
      } else if (ranker === 'networkSimplex') {
        networkSimplex(graph);
      } else if (ranker === 'bfs') {
        // for nestingGraph
        longestPath(graph);
        const nest = nestingGraph(graph);
        nest.run();
        bfsRank(graph, bfsRoot);
        nest.cleanup();
      }
      // this.makeRankSpace();
      // 避免空rank
      if (ranker !== 'custom' && ranker !== 'bfs') {
        this.normalizeRank(graph);
      }
      this.ranks = this.getRanks(graph);
      // bfs 和 custom ranker 可能出现逆向边影响布局效果，先翻转逆向边
      if (ranker === 'bfs' || ranker === 'custom') {
        this.markReversedEdge(graph);
      } else if (this.hasReversedEdge(graph)) {
        // 这时候如果有逆向边，就是 ranker 算法有误
        console.error('Reversed edge detected', this.ranks, graph);
      }
    }
    if (options.rankOnly) {
      this.recoverRepeatEdges(graph);
      acyclic.undo(graph);
      this.recoverSelfEdges(graph);
      this.selfLoop = [];
      if (clearRank) {
        this.ranks = {};
      }
      return;
    }

    // 如果有多个component，先按照componentId排序，令不同component分离
    this.dealUnconnected(graph);
    const dummies = insertDummyNodes(graph, this.ranks);
    const bestOrders: any = orderNodes(this.ranks, this.options);
    const nodeMap = graph.getNodeMap();
    const rankers = Object.keys(bestOrders).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const layers: Node[][] | NodeStructure[][] = [];
    rankers.forEach((k: string) => {
      layers.push(
        bestOrders[k].map((id: string, i: number) => {
          const node = nodeMap[id];
          if (cache) {
            // 跨层级节点 cache 住第一个 dummy node 的 order
            if (node._dummy) {
              node.sources.forEach((sourceId: string) => {
                let source = graph.getNodeById(sourceId);
                let dummyOrder = undefined;
                while (source.get('dummy')) {
                  dummyOrder = source.get('_order');
                  source = graph.getNodeById(source.sources[0]);
                }
                if (dummyOrder !== undefined) {
                  node.set(`_dummyOrder${source.get('id')}`, dummyOrder);
                }
              });
            }
            node.set('_order', i);
            node.set('_rank', node.get('rank'));
          }
          if (this.options.preOrder) {
            node.set('_order', i);
          }
          return node;
        })
      );
    });
    if (cache) {
      this.options.cache = false;
    }
    coordSystem.adjust(graph, rankDir);

    // align 参数校验, LR/RL 不可为 L/R， TB/BT 不可为 T/B
    const align = this.validateAlignOption(this.options.rankDir, this.options.align);

    let gapYs: any;
    if (this.options.coordAssignment === 'treeLike') {
      treeLayoutCoordAssignment(graph, this.options);
    } else {
      horizontalCoordAssignment(graph, layers, { ...this.options, align });
      gapYs = this.placeRankPosition(layers);
    }

    removeDummyNodes(graph, this.ranks, dummies, gapYs);
    coordSystem.revert(graph, rankDir);
    if (['LR', 'RL'].includes(rankDir)) {
      if (['left', 'right'].includes(alignPeerNodes!)) {
        coordSystem.alignPeerNodes(layers, alignPeerNodes);
      }
    } else {
      if (['top', 'bottom'].includes(alignPeerNodes!)) {
        coordSystem.alignPeerNodes(layers, alignPeerNodes);
      }
    }

    this.recoverRepeatEdges(graph);
    acyclic.undo(graph);
    this.recoverSelfEdges(graph);
    this.selfLoop = [];
    if (clearRank) {
      this.ranks = {};
    }
    return gapYs;
  }

  reLayout() {
    this.layout();
  }

  private validateAlignOption(rankDir: string, align: DAGLayoutOptions['align']) {
    if (align && ['L', 'R', 'T', 'B'].includes(align)) {
      if (rankDir === 'LR' || rankDir === 'RL') {
        if (align === 'L' || align === 'R') {
          console.warn('While "rankDir" is LR or RL, "align" can only be UL, UR, DL, DR, T or B, but got', align, '.');
          console.warn('"align" will be set to undefined.');
          align = undefined;
        }
      }
      if (rankDir === 'TB' || rankDir === 'BT') {
        if (align === 'T' || align === 'B') {
          console.warn('While "rankDir" is TB or BT, "align" can only be UL, UR, DL, DR, L or R, but got', align, '.');
          console.warn('"align" will be set to undefined.');
          align = undefined;
        }
      }
    }
    return align;
  }

  private removeSelfEdges(graph: Graph | GraphStructure) {
    // remove self edges
    const edges = graph.getEdges();
    edges.forEach((edge: any) => {
      const sourceId = edge.get('source');
      const targetId = edge.get('target');
      // 删除现有 controlPoints 以免最终呈现效果有误
      delete edge.configs.controlPoints;
      if (sourceId === targetId) {
        this.selfLoop.push(edge);
        graph.remove(edge);
      }
    });
  }
  private recoverSelfEdges(graph: Graph | GraphStructure) {
    this.selfLoop.forEach((edge: any) => {
      graph.add('edge', edge.configs, edge.get('temp'));
    });
  }
  private removeRepeatEdges(graph: Graph | GraphStructure) {
    const edges = graph.getEdges();
    const visitedEdges = {};
    edges.forEach((edge: Edge | EdgeStructure) => {
      const sourceId = edge.get('source');
      const targetId = edge.get('target');
      const srcTgt = sourceId + '-and-' + targetId;
      const visitedEdge = visitedEdges[srcTgt];
      if (visitedEdge) {
        const configs = edge.configs;
        const count = visitedEdge.get('repeatCount') || 0;
        visitedEdge.set('repeatCount', count + 1);
        configs.repeat = visitedEdge;
        configs.repeatCount = count + 1;
        configs.tempNode = !(edge as Edge).layer;
        this.repeatEdges.push(configs as EdgeData);
        graph.removeDuplicateEdge(edge as Edge);
      } else {
        visitedEdges[srcTgt] = edge;
      }
    });
  }

  getData() {
    return this.graph;
  }

  private recoverRepeatEdges(graph: Graph | GraphStructure) {
    if (this.repeatEdges.length) {
      this.repeatEdges.forEach((edgeConfigs: any) => {
        const temp = edgeConfigs.tempNode;
        const controlPoints = edgeConfigs.repeat.get('controlPoints');
        if (controlPoints) {
          edgeConfigs.controlPoints = edgeConfigs.reversed ? controlPoints.toReversed() : controlPoints.concat();
        }
        delete edgeConfigs.repeat;
        delete edgeConfigs.repeatCount;
        delete edgeConfigs.tempNode;
        graph.add('edge', edgeConfigs, temp);
        // DAG 布局中不再特殊处理重复连线。
      });
    }
    this.repeatEdges = [];
  }


  private normalizeRank(graph: Graph | GraphStructure) {
    const nodes = graph.getNodes();
    const ranks = Array.from(new Set(nodes.map((n: Node | NodeStructure) => n.get('rank'))));
    ranks.sort((a: number, b: number) => {
      return a - b;
    });
    let rank = 0;
    const mapRank = {};
    ranks.forEach((r: number) => {
      mapRank[r] = rank;
      rank++;
    });
    nodes.forEach((n: Node | NodeStructure) => {
      n.set('rank', mapRank[n.get('rank')]);
    });
  }

  private dealUnconnected(graph: Graph | GraphStructure) {
    const { components } = connectedComponents(graph);
    Object.keys(this.ranks).forEach((rank: string) => {
      const entities = this.ranks[rank];
      entities.sort(
        (a: Node | NodeStructure, b: Node | NodeStructure) => components[a.get('id')] - components[b.get('id')]
      );
    });
  }

  getRanks(graph: Graph | GraphStructure) {
    const ranks = {} as IRanks;
    graph.getNodes().forEach((node: any) => {
      delete node.baryCenter;
      const rank = node.get('rank');
      if (ranks[rank] === undefined) {
        ranks[rank] = [];
      }
      ranks[rank].push(node);
    });
    return ranks;
  }

  private markReversedEdge(graph: Graph | GraphStructure) {
    const nodeMap = graph.getNodeMap();
    graph.getEdges().forEach((edge: Edge | EdgeStructure) => {
      const source = nodeMap[edge.get('source')];
      const target = nodeMap[edge.get('target')];
      if (source.get('rank') > target.get('rank')) {
        reverseEdge(graph, edge);
      }
    });
  }

  private hasReversedEdge(graph: Graph | GraphStructure) {
    const nodeMap = graph.getNodeMap();
    const edges = graph.getEdges() as any;
    const noReversedEdge = edges.every((edge: Edge | EdgeStructure) => {
      const source = nodeMap[edge.get('source')];
      const target = nodeMap[edge.get('target')];
      if (source.get('rank') > target.get('rank')) {
        return false;
      }
      return true;
    });
    return !noReversedEdge;
  }

  private adjustControlPoints(gapYs: Record<string, Record<string, number>>) {
    const { allControlPoints, adjustControlPoints, ignoreGroup, rankDir } = this.options;
    if (!allControlPoints && !adjustControlPoints) {
      return;
    }
    const graph = this.graph;
    const vertical = rankDir === 'TB' || rankDir === 'BT';
    const height = vertical ? 'height' : 'width';
    graph.getEdges().forEach((edge: Edge | EdgeStructure) => {
      // 已经存在控制点的不需要 adjust
      if (edge.get('controlPoints') && !allControlPoints) {
        return;
      }
      const source = graph.getNodeById(edge.get('source'));
      const target = graph.getNodeById(edge.get('target'));
      // 对齐的节点连线是直线不需要计算
      if ((vertical && source.get('y') === target.get('y')) || (!vertical && source.get('x') === target.get('x'))) {
        return;
      }
      const sourceHeight = source.get(height);
      const targetHeight = target.get(height);
      const sourceGroup = source.get('groupId') ? graph.getGroupById(source.get('groupId')) : null;
      const targetGroup = target.get('groupId') ? graph.getGroupById(target.get('groupId')) : null;
      // 取参与计算的真实 source 和 target 信息
      let sourceRank = gapYs[source.get('rank')];
      let targetRank = gapYs[target.get('rank')];
      if (!ignoreGroup) {
        if (sourceGroup) {
          // 同一 group 取 group 的 gapYs
          if (sourceGroup === targetGroup) {
            sourceRank = sourceGroup.get('gapYs')[source.get('rank')];
            targetRank = targetGroup.get('gapYs')[target.get('rank')];
          } else {
            sourceRank = gapYs[sourceGroup.get('rank')];
          }
        }
        if (targetGroup && sourceGroup !== targetGroup) {
          targetRank = gapYs[targetGroup.get('rank')];
        }
      }

      const controlPoints = edge.get('controlPoints') || [];
      // 前插起始节点控制点
      if (allControlPoints || sourceHeight < sourceRank.height) {
        // 如果连线连到分组，使用分组位置，否则使用节点位置
        controlPoints.unshift(
          vertical
            ? [!sourceGroup || sourceGroup.get('linkNode') ? source.get('x') : sourceGroup.get('x'), sourceRank.source]
            : [sourceRank.source, !sourceGroup || sourceGroup?.get('linkNode') ? source.get('y') : sourceGroup.get('y')]
        );
      }
      // 后插目标节点控制点
      if (allControlPoints || targetHeight < targetRank.height) {
        controlPoints.push(
          vertical
            ? [!targetGroup || targetGroup.get('linkNode') ? target.get('x') : targetGroup.get('x'), targetRank.target]
            : [targetRank.target, !targetGroup || targetGroup.get('linkNode') ? target.get('y') : targetGroup.get('y')]
        );
      }
      edge.set('controlPoints', controlPoints.length > 0 ? controlPoints : undefined);
    });
  }

  private placeRankPosition(layers: Node[][] | NodeStructure[][]) {
    // const { rankSep, allControlPoints } = this.options;
    const { rankSep } = this.options;
    const halfSep = rankSep / 2;
    let prevY = 0;
    const gapYs: Record<string, Record<string, number>> = {};
    layers.forEach((row: Node[] | NodeStructure[]) => {
      let maxHeight = 0;
      row.forEach((node) => {
        maxHeight = Math.max(node.get('height'), maxHeight);
      });
      const y = prevY + maxHeight / 2;
      row.forEach((node) => {
        node.configs.y = y;
        // if (allControlPoints || (!node.configs.dummy && node.configs.height < maxHeight)) {
        //   const id = node.get('id');
        //   node.edges.forEach((edge: any) => {
        //     let controlPoints = edge.get('controlPoints') || [];
        //     if (edge.get('source') === id) {
        //       controlPoints = [];
        //       controlPoints.push([node.configs.x, sourceY]);
        //     } else {
        //       if (controlPoints[0] && controlPoints[0][0] === node.configs.x && controlPoints[0][1] === targetY) {
        //         controlPoints = undefined;
        //       } else {
        //         controlPoints.push([node.configs.x, targetY]);
        //       }
        //     }
        //     edge.set('controlPoints', controlPoints);
        //   });
        // }
      });
      gapYs[row[0].get('rank')] = {
        target: prevY - halfSep,
        source: y + maxHeight / 2 + halfSep,
        height: maxHeight,
      };
      prevY += maxHeight + rankSep;
    });
    return gapYs;
  }
  private makeRankSpace(graph: Graph | GraphStructure) {
    graph.getNodes().forEach((node: Node | NodeStructure) => {
      node.set('rank', node.get('rank') * 2 || 0);
    });
  }
  private cleanEdgeControlPoints(graph: Graph | GraphStructure) {
    graph.getEdges().forEach((edge: Edge | EdgeStructure) => {
      edge.set('controlPoints', undefined);
    });
  }
}
