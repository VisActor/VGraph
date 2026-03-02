import { NodeStructure } from "../../../graph_structure";
import { Node } from "../../../models/entities";
import { bilayerBaryCenter } from "./bilayer_bary_center";
import { IRanks } from "../rank";

// 应该和order放在一起
export function sortLayers(
  ranks: IRanks,
  rankClusters: any,
  direction: "down" | "up",
  bias: boolean
) {
  const rankIndexes = Object.keys(rankClusters || ranks).sort((a, b) => {
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
    bilayerBaryCenter(ranks[rank], ranks[nextRank]);
    if (rankClusters) {
      ranks[nextRank] = sortClusterRank(rankClusters[nextRank], bias);
    } else {
      ranks[nextRank] = ranks[nextRank].sort(
        (a: Node | NodeStructure, b: Node | NodeStructure) => {
          if (a.baryCenter === b.baryCenter) {
            return bias ? -1 : 1;
          }
          if (a.baryCenter === undefined) {
            return 1;
          }
          if (b.baryCenter === undefined) {
            return -1;
          }
          return a.baryCenter - b.baryCenter;
        }
      );
    }
  }
}

export function sortNestedLayers(
  nodeRanks: IRanks,
  groupMap: any,
  ranks: IRanks,
  direction: "down" | "up",
  bias: boolean
) {
  const rankIndexes = Object.keys(nodeRanks).sort((a, b) => {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    return direction === "down" ? na - nb : nb - na;
  });

  const rank = ranks[rankIndexes[0]];
  let sorted: any = [];
  rank.forEach((node: any) => {
    const id = node.get("id");
    const nodes = (nodeRanks[rankIndexes[0]] as NodeStructure[])
      .filter((node: NodeStructure) => node.belong === id)
      .sort((a: any, b: any) => a.get("x") - b.get("x"));
    sorted = sorted.concat(nodes);
  });
  // 第一层先根据分组的先后顺序把节点做个排序
  nodeRanks[rankIndexes[0]] = sorted;

  for (let i = 0; i < rankIndexes.length - 1; i++) {
    const nextRank = rankIndexes[i + 1];
    const downLayer = formNodeClusters(nodeRanks[nextRank] as NodeStructure[]);
    if (downLayer.length === 1) {
      nodeRanks[nextRank] = downLayer[0];
      continue;
    }
    bilayerBaryCenter(nodeRanks[rankIndexes[i]], nodeRanks[nextRank]);
    nodeRanks[nextRank] = sortClusterRank(downLayer, bias);
  }
}

function formNodeClusters(nodes: NodeStructure[]) {
  const nodeClusters: NodeStructure[][] = [];
  const groupIndex: Record<string, number> = {};
  nodes.forEach((node: NodeStructure) => {
    const groupId = node.get("groupId");
    let index = groupIndex[groupId];
    if (groupIndex[groupId] !== undefined) {
      nodeClusters[index].push(node);
    } else {
      index = nodeClusters.length;
      groupIndex[groupId] = index;
      nodeClusters[index] = [node];
    }
  });
  for (const cluster of nodeClusters) {
    cluster.sort(
      (a: NodeStructure, b: NodeStructure) => a.get("x") - b.get("x")
    );
  }
  return nodeClusters;
}

function sortClusterRank(rankClusters: any, bias: boolean) {
  const avgs: Record<string, number> = {};
  rankClusters.forEach((cluster: Node[], i: number) => {
    const sum = cluster.reduce((res: number, node: Node) => {
      return res + ((node.baryCenter as number) || i);
    }, 0);
    avgs[cluster[0].get("id")] = sum / cluster.length;
  });
  rankClusters.sort((aCluster: Node[], bCluster: Node[]) => {
    const a = avgs[aCluster[0].get("id")];
    const b = avgs[bCluster[0].get("id")];
    if (a === b) {
      return bias ? -1 : 1;
    }
    return a - b;
  });
  // eslint-disable-next-line prefer-spread
  return [].concat.apply([], rankClusters);
}
