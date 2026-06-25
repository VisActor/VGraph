import { Graph } from "../../../graph";
import { Edge } from "../../../models/entities";
import { GraphStructure } from "../../../graph_structure";
import { IRanks } from "../rank";

export function insertDummyNodes(data: Graph | GraphStructure, ranks: IRanks) {
  const dummies = [];
  const nodeMap = data.getNodeMap();
  const edges = data.getEdges();
  const len = edges.length;

  let dummyCnt = 0;
  for (let i = 0; i < len; i++) {
    const edge = edges[i];
    if (!((edge as Edge).isVisible?.() ?? edge.get("visible") ?? true)) {
      // for pipeline
      continue;
    }
    const sourceId = edge.get("source");
    const targetId = edge.get("target");
    const source = nodeMap[sourceId];
    const target = nodeMap[targetId];
    const sourceRank = parseInt(source.get("rank"), 10);
    const targetRank = parseInt(target.get("rank"), 10);
    if (Math.abs(sourceRank - targetRank) > 1) {
      const dummyConfig: any = {
        source: sourceId,
        target: targetId,
        nodes: [],
        relatedEdge: (edge as Edge).configs ? (edge as Edge).configs : edge,
      };
      dummies.push(dummyConfig);
      let upNode = sourceRank > targetRank ? target : source;
      let rank = (sourceRank > targetRank ? targetRank : sourceRank) + 1;
      target._dummy = true;
      // for PipelineLayout, 保持 source 节点的 targets 顺序
      const targetIndex = source.targets.indexOf(targetId);
      source.targets[targetIndex] = `_dummy${dummyCnt}`;
      while (rank !== Math.max(sourceRank, targetRank)) {
        const id = "_dummy" + dummyCnt;
        dummyCnt++;
        const dummyNode = data.add(
          "node",
          {
            id,
            rank,
            width: 0,
            height: 0,
            dummy: true,
            _order: target.get(`_dummyOrder${sourceId}`),
          },
          true
        );
        ranks[rank] = ranks[rank] || [];
        ranks[rank].push(dummyNode);
        dummyConfig.nodes.push(dummyNode);
        data.add(
          "edge",
          {
            source: upNode.get("id"),
            target: id,
            dummy: true,
          },
          true
        );
        rank++;
        upNode = dummyNode;
      }
      data.add(
        "edge",
        {
          source: upNode.get("id"),
          target: sourceRank > targetRank ? source.get("id") : target.get("id"),
          dummy: true,
        },
        true
      );
      data.remove(edge as any);
    }
  }
  return dummies;
}

export function removeDummyNodes(
  data: Graph | GraphStructure,
  ranks: IRanks,
  dummies: any,
  gapYs: any,
  ignoreControlPoints = false
) {
  dummies.forEach((dummyConfigs: any) => {
    const edge = dummyConfigs.relatedEdge;
    const controlPoints: number[][] = [];
    const dummies = dummyConfigs.nodes;
    const len = dummies.length;
    // for PipelineLayout 保持节点 targets 顺序
    const source = data.getNodeById(edge.source);
    const index = source.targets.indexOf(dummies[0].get("id"));
    if (index >= 0) {
      source.targets[index] = edge.target;
    }
    dummies.forEach((node: any, i: number) => {
      const { rank, x, y } = node.configs;
      // 紧凑布局取对应层级的 y，treeLike 直接取 dummyNode 的 y
      controlPoints.push([x, gapYs ? gapYs[rank].target : y]); // y 为 treeLayout 产生
      if (i === len - 1) {
        controlPoints.push([x, gapYs ? gapYs[rank].source : y]);
      }
      const index = ranks[rank].indexOf(node);
      if (index >= 0) {
        ranks[rank].splice(index, 1);
      }
      data.remove(node);
    });
    const e = data.add("edge", edge, edge.temp);
    if (!ignoreControlPoints) {
      e.set(
        "controlPoints",
        e.get("reversed") ? controlPoints.reverse() : controlPoints
      );
    }
  });
}
