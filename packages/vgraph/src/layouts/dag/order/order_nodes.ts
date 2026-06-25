import { Node } from "../../../models/entities";
import { GraphStructure, NodeStructure } from "../../../graph_structure";
import { IRanks } from "../rank";

import { clusterNodes } from "./cluster_nodes";
import { sortLayers } from "./sort_layers";
import { bilayerBaryCenter } from "./bilayer_bary_center";
import { bilayerCrossCount } from "./bilayer_cross_count";
import { adjustOrder, sortByBaryCenter } from "../../nested_dag/pre_order";

function preOrder(ranks: any, direction: "down" | "up") {
  const rankIndexes = Object.keys(ranks).sort((a, b) => {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    return direction === "down" ? na - nb : nb - na;
  });
  for (let i = 0; i < rankIndexes.length - 1; i++) {
    const rank = rankIndexes[i];
    const nextRank = rankIndexes[i + 1];
    // 单节点没必要排序
    if (ranks[nextRank].length === 1) {
      continue;
    }
    // 仅为没有_order的节点排序
    if (
      !ranks[nextRank].some(
        (node: Node | NodeStructure) => node.get("_order") === undefined
      )
    ) {
      continue;
    }
    const baryCenter = bilayerBaryCenter(ranks[rank], ranks[nextRank]);
    const baryCenterMap = {};
    baryCenter.forEach((d) => {
      baryCenterMap[d.node.get("id")] = d.baryCenter;
    });
    const nodes = baryCenter
      .filter((d: any) => d.baryCenter !== undefined)
      .sort((a: any, b: any) => {
        return a.baryCenter - b.baryCenter;
      });
    const newRank = ranks[nextRank];
    let idx = 0;
    for (let i = 0; i < newRank.length; i++) {
      if (baryCenterMap[newRank[i].get("id")] !== undefined) {
        newRank[i] = nodes[idx].node;
        idx++;
      }
    }
    ranks[nextRank] = newRank;
  }
  // 有_order的恢复原有的顺序
  Object.keys(ranks).forEach((rank: string) => {
    const nodes = ranks[rank]
      .filter((node: Node | NodeStructure) => node.get("_order") !== undefined)
      .sort((a: Node | NodeStructure, b: Node | NodeStructure) => {
        return a.get("_order") - b.get("_order");
      }); // 有 order 的排序
    const newRank = ranks[rank];
    let idx = 0;
    for (let i = 0; i < newRank.length; i++) {
      if (newRank[i].get("_order") !== undefined) {
        newRank[i] = nodes[idx];
        idx++;
      }
      // 没 _order 的占据原来的位置
    }
    ranks[rank] = newRank;
  });
}

function dfsInitOrder(ranks: IRanks) {
  let count = 0;
  const visitedMap = {};
  const dfsOrderMap = {};
  const nodeMap = {};

  Object.keys(ranks).forEach((rank: string) => {
    ranks[rank].forEach((node: Node | NodeStructure) => {
      nodeMap[node.get("id")] = node;
    });
  });

  function dfsOrder(node: Node | NodeStructure) {
    const id = node.get("id");
    if (visitedMap[id]) {
      return;
    }
    visitedMap[id] = true;
    dfsOrderMap[id] = count;
    count++;
    for (const target of node.targets) {
      if (!visitedMap[target] && nodeMap[target]) {
        dfsOrder(nodeMap[target]);
      }
    }
  }

  Object.keys(ranks).forEach((rank: string) => {
    ranks[rank].forEach((node: Node | NodeStructure) => {
      if (!visitedMap[node.get("id")]) {
        dfsOrder(node);
      }
    });
  });

  Object.keys(ranks).forEach((rank: string) => {
    ranks[rank] = ranks[rank].sort(
      (a: Node | NodeStructure, b: Node | NodeStructure) => {
        return dfsOrderMap[a.get("id")] - dfsOrderMap[b.get("id")];
      }
    );
  });
}

export function orderNodes(
  ranks: IRanks,
  options: {
    order: "minCross" | "custom" | "none";
    ranker:
      | "longestPath"
      | "feasibleTree"
      | "networkSimplex"
      | "bfs"
      | "custom";
    preOrder?: boolean;
  }
) {
  const { ranker, order } = options;
  // 自定义顺序直接处理
  if (order === "custom") {
    Object.keys(ranks).forEach((rank: string) => {
      ranks[rank] = ranks[rank].sort(
        (a: Node | NodeStructure, b: Node | NodeStructure) => {
          return a.get("order") - b.get("order");
        }
      );
    });
    return getIdsFromRanks(ranks);
  }

  if (order !== "none") {
    dfsInitOrder(ranks);
  }

  // 按照节点层级判定使用的 order
  Object.keys(ranks).forEach((rank: string) => {
    ranks[rank].forEach((node: Node | NodeStructure) => {
      const rank = node.get("_rank");
      if (rank !== undefined && rank !== node.get("rank")) {
        node.set("_order", undefined);
      }
    });
  });

  // 按照节点的 order 预排序，展开/收起的时候尽量保持原本的结构
  Object.keys(ranks).forEach((rank: string) => {
    ranks[rank] = ranks[rank].sort(
      (a: Node | NodeStructure, b: Node | NodeStructure) => {
        if (a.get("_order") === undefined) {
          return 1;
        }
        if (b.get("_order") === undefined) {
          return -1;
        }
        return a.get("_order") - b.get("_order");
      }
    );
  });

  if (options.preOrder) {
    preOrder(ranks, "down");
    preOrder(ranks, "up");
    preOrder(ranks, "down");
    preOrder(ranks, "up");
  }

  if (order === "none") {
    return getIdsFromRanks(ranks);
  }

  let rankClusters: any = null;
  // 可能产生同层级节点连线的先聚类,聚类内部先排序
  if (ranker === "bfs" || ranker === "custom") {
    rankClusters = {};
    Object.keys(ranks).forEach((rank: string) => {
      const entities = clusterNodes(ranks[rank]);
      rankClusters[rank] = entities;
      // 根据聚类内部关系先梳理好默认顺序，避免没有层级间的连线交叉导致太多本层交叉
      // eslint-disable-next-line prefer-spread
      ranks[rank] = [].concat.apply([], entities);
    });
  }

  const defaultOrders = getIdsFromRanks(ranks);
  const defaultCC = calculateCrossCount(ranks);
  if (defaultCC === 0) {
    return defaultOrders;
  }
  let bestCC = defaultCC;
  let bestOrders: { [k: string]: string[] } = {};
  // 上下两个方向 + 两种 sort 方式计算最小 crossing
  for (let i = 0, lastBest = 0; lastBest < 4; ++i, ++lastBest) {
    const odd = i % 2;
    sortLayers(ranks, rankClusters, odd ? "up" : "down", i % 4 >= 2);
    const cc = calculateCrossCount(ranks);
    if (cc < bestCC) {
      lastBest = 0;
      bestOrders = getIdsFromRanks(ranks);
      bestCC = cc;
    }
  }
  if (bestCC === defaultCC) {
    return defaultOrders;
  }
  return bestOrders;
}

function calculateCrossCount(ranks: IRanks) {
  const rankIndexes = Object.keys(ranks).sort(
    (a, b) => parseInt(a, 10) - parseInt(b, 10)
  );
  let cc = 0;
  for (let i = 0; i < rankIndexes.length - 1; i++) {
    cc += bilayerCrossCount(ranks[rankIndexes[i]], ranks[rankIndexes[i + 1]]);
  }
  return cc;
}

export function preOrderNestedGraphs(
  ranks: IRanks,
  nestGraphs: GraphStructure[],
  tempEdges: Record<string, any>
) {
  const rootGroup = {} as any;
  rootGroup.children = [];
  rootGroup.entityEdges = [];
  const rankKeys = Object.keys(ranks);
  const entityMap = {};
  nestGraphs.forEach((graph: GraphStructure) => {
    const nodes = graph.getNodes();
    const rankMap = {};
    const group: any = {};
    group.id = graph.get("id");
    group.children = [];
    nodes.forEach((node: Node | NodeStructure) => {
      const rank = node.get("rank");
      if (rankMap[rank] === undefined) {
        rankMap[rank] = [node];
      } else {
        rankMap[rank].push(node);
      }
      group.children.push(node);
    });
    group.parent = null;
    group.rankMap = rankMap;
    group.rankKeys = Object.keys(rankMap).sort(
      (a, b) => parseInt(a, 10) - parseInt(b, 10)
    );
    entityMap[group.id] = group;
  });

  const rankIndexes = rankKeys.sort(
    (a, b) => parseInt(a, 10) - parseInt(b, 10)
  );

  const rankMap = {};
  // 计算 absoluteRank 并分配 entityEdges
  for (const rank of rankIndexes) {
    rankMap[rank] = [];
    ranks[rank].forEach((node: Node | NodeStructure) => {
      const group = entityMap[node.get("id")] ?? node;
      group.id = node.get("id");
      group.absoluteRank = rank;
      rootGroup.children.push(group);
      rankMap[rank].push(group);
      group.entityEdges = [];
      getEntityEdges(group.entityEdges, node);
      if (group?.children) {
        group.rank = rank;
        group.absoluteRank = rank;
        group.children.forEach((child: Node | NodeStructure) => {
          child.absoluteRank = rank + 0.01 * child.get("rank");
          child.rank = rank;
          child.entityEdges = [];
          child.parent = group;
          child.id = child.get("id");
          getEntityEdges(child.entityEdges, child);
          entityMap[child.get("id")] = child;
        });
      }
      entityMap[node.get("id")] = group;
    });
  }

  rootGroup.rankKeys = rankIndexes;
  rootGroup.rankMap = rankMap;

  rootGroup.absoluteOrder = 0;
  rootGroup.absoluteRank = 0;
  rootGroup.startOrder = 0;
  // 排绝对序 adjustOrder
  adjustOrder(rootGroup);

  tempEntityEdges(entityMap, tempEdges);

  // sortByBaryCenter
  for (let i = 0; i < 4; i++) {
    sortByBaryCenter(rootGroup, i % 2 ? "up" : "down", entityMap);
  }

  // 分配 order
  for (const rank of rankIndexes) {
    ranks[rank].forEach((node: Node | NodeStructure) => {
      const group = entityMap[node.get("id")];
      node.set("_order", group.order);
      delete group.entityEdges;
      delete group.rankMap;
      delete group.rankKeys;
      delete group.parent;
      if (group.children) {
        group.children.forEach((child: Node | NodeStructure) => {
          child.set("_order", child.order);
          delete child.entityEdges;
          delete child.parent;
        });
      }
    });
  }
}

function getEntityEdges(entityEdges: any[], node: Node | NodeStructure) {
  node.sources.forEach((source: string) => {
    entityEdges.push({
      source: source,
      target: node.get("id"),
    });
  });
  node.targets.forEach((target: string) => {
    entityEdges.push({
      source: node.get("id"),
      target: target,
    });
  });
}

function tempEntityEdges(entityMap: any, tempEdges: any) {
  const entityTargetsMap = {}; // 将 tempEdges 作为 targets 挂在对应的节点/分组上。
  tempEdges.forEach((edge: any) => {
    const source = edge.source;
    const target = edge.target;
    const originSource = edge.originSource ?? source;
    const originTarget = edge.originTarget ?? target;
    const array = [source, target, originSource, originTarget];
    array.forEach((item: string, index: number) => {
      const entity = entityMap[item];
      const otherEntity = entityMap[array[2 + (index % 2)]];
      if (entity && otherEntity) {
        entity.entityEdges.push({
          source: index % 2 ? originSource : item,
          target: (index + 1) % 2 ? originTarget : item,
        });
      }
    });
  });
  return entityTargetsMap;
}

function getIdsFromRanks(ranks: IRanks) {
  const ids: { [key: string]: string[] } = {};
  Object.keys(ranks).forEach((rank: string) => {
    ids[rank] = ranks[rank].map((node: Node | NodeStructure) => node.get("id"));
  });
  return ids;
}
