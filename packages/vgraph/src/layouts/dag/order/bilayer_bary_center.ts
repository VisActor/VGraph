// 计算barycenter的值
// northLayer: 排序好的上层节点数组
// southLayer: 需要计算的barycenter的下层节点数组（可无序）
// edges: 无权重时非必须，有权重时必须
// 返回值: {node: Node | NodeStructure, barycenter?: Number, weight?: Number}[]
// 按照southLayer给的顺序返回上述数组。

import { Node, Edge } from "../../../models/entities";
import { EdgeStructure, NodeStructure } from "../../../graph_structure";

export function bilayerBaryCenter(
  northLayer: Node[] | NodeStructure[],
  southLayer: Node[] | NodeStructure[],
  edges?: Edge[] | EdgeStructure[]
) {
  // 读取上一层的order序
  const northOrderMap: { [key: string]: number } = {};
  northLayer.forEach((node: Node | NodeStructure, i: number) => {
    const id = node.get("id");
    northOrderMap[id] = i + 1;
  });
  const edgeWeightMaps: Record<string, Record<string, number>> = {};
  if (!edges) {
    return southLayer.map((node: Node | NodeStructure) => {
      let barycenterSum = 0;
      let weightSum = 0;
      node.sources.forEach((source: string) => {
        const order = northOrderMap[source];
        const weight = 1;
        if (order !== undefined) {
          barycenterSum += order * weight;
          weightSum += weight;
        }
      });

      node.targets.forEach((target: string) => {
        const order = northOrderMap[target];
        const weight = 1;
        if (order !== undefined) {
          barycenterSum += order * weight;
          weightSum += weight;
        }
      });

      // 有上层连接边正常计算
      if (weightSum !== 0) {
        node.baryCenter = barycenterSum / weightSum;
        node.weight = weightSum;
        return {
          node,
          baryCenter: node.baryCenter,
          weight: node.weight,
        };
      } else {
        // weightSum=0说明没有上层连接边，直接返回节点即可
        node.baryCenter = undefined;
        return { node };
      }
    });
  } else {
    edges.forEach((edge: Edge | EdgeStructure) => {
      const source = edge.get("source");
      const target = edge.get("target");
      const weight = edge.get("weight") || 1;
      if (edgeWeightMaps[source]) {
        edgeWeightMaps[source][target] = weight;
      } else {
        edgeWeightMaps[source] = {};
        edgeWeightMaps[source][target] = weight;
      }
    });
  }

  // 返回结果
  return southLayer.map((node: Node | NodeStructure) => {
    let barycenterSum = 0;
    let weightSum = 0;
    const id = node.get("id");
    node.sources.forEach((source: string) => {
      const order = northOrderMap[source];
      let weight = 1;
      if (edgeWeightMaps[source]) {
        weight = edgeWeightMaps[source][id] || 1;
      }
      if (order !== undefined) {
        barycenterSum += order * weight;
        weightSum += weight;
      }
    });
    node.targets.forEach((target: string) => {
      const order = northOrderMap[target];
      let weight = 1;
      if (edgeWeightMaps[id]) {
        weight = edgeWeightMaps[id][target] || 1;
      }
      if (order !== undefined) {
        barycenterSum += order * weight;
        weightSum += weight;
      }
    });

    // 有上层连接边正常计算
    if (weightSum !== 0) {
      node.baryCenter = barycenterSum / weightSum;
      node.weight = weightSum;
      return {
        node,
        baryCenter: node.baryCenter,
        weight: weightSum,
      };
    } else {
      // weightSum=0说明没有上层连接边，直接返回节点即可
      node.baryCenter = undefined;
      return { node };
    }
  });
}
