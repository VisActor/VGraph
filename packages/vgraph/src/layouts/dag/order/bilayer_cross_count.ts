// 算法来自 simple and efficient Bilayer Cross Counting by Wilhelm Barth, Michael Junger, and Petra Mutzel
// northLayer: 上层节点数组
// southLayer: 下层节点数组
// edges: 无权重时非必须，有权重时必须
import { Node, Edge } from "../../../models/entities";
import { EdgeStructure, NodeStructure } from "../../../graph_structure";

export function bilayerCrossCount(
  northLayer: Node[] | NodeStructure[],
  southLayer: Node[] | NodeStructure[],
  edges?: Edge[] | EdgeStructure[]
) {
  const southMap: { [key: string]: number } = {};
  southLayer.forEach((node: Node | NodeStructure, i: number) => {
    const id = node.get("id");
    southMap[id] = i;
  });
  // 梳理边关系
  const orders: { order: number; weight: number }[] = [];
  if (!edges) {
    northLayer.forEach((node: Node | NodeStructure) => {
      const nosortedOrders: { order: number; weight: number }[] = [];
      node.sources.forEach((id: string) => {
        const order = southMap[id];
        if (order !== undefined) {
          nosortedOrders.push({ order, weight: 1 });
        }
      });
      node.targets.forEach((id: string) => {
        const order = southMap[id];
        if (order !== undefined) {
          nosortedOrders.push({ order, weight: 1 });
        }
      });
      nosortedOrders.sort((a, b) => a.order - b.order);
      nosortedOrders.forEach((order) => {
        orders.push(order);
      });
    });
  } else {
    const edgeMaps: Record<string, Record<string, string | number>[]> = {};
    edges.forEach((edge: Edge | EdgeStructure) => {
      const source = edge.get("source");
      const target = edge.get("target");
      const weight = edge.get("weight") || 1;
      if (edgeMaps[source]) {
        edgeMaps[source].push({ link: target, weight });
      } else {
        edgeMaps[source] = [{ link: target, weight }];
      }
      if (edgeMaps[target]) {
        edgeMaps[target].push({ link: source, weight });
      } else {
        edgeMaps[target] = [{ link: source, weight }];
      }
    });
    northLayer.forEach((node: Node | NodeStructure) => {
      const id = node.get("id");
      const nosortedOrders: { order: number; weight: number }[] = [];
      if (edgeMaps[id]) {
        edgeMaps[id].forEach((south: Record<string, string | number>) => {
          const order = southMap[south.link];
          if (order !== undefined) {
            nosortedOrders.push({ order, weight: south.weight as number });
          }
        });
      }
      nosortedOrders.sort((a, b) => a.order - b.order);
      nosortedOrders.forEach((order) => {
        orders.push(order);
      });
    });
  }
  let firstIndex = 1;
  const q = southLayer.length;
  // 求第一个 southLayer node 在树中的 index
  while (firstIndex < q) {
    firstIndex *= 2;
  }
  const tree = new Array(firstIndex * 2 - 1).fill(0);
  firstIndex -= 1;

  let crossCount = 0;
  // 构建 accumulator tree
  orders.forEach((orderData) => {
    let index = orderData.order + firstIndex;
    let weightSum = 0;
    tree[index] += orderData.weight;
    while (index > 0) {
      if (index % 2) {
        weightSum += tree[index + 1];
      }
      // tslint:disable-next-line: no-bitwise
      index = (index - 1) >> 1;
      tree[index] += orderData.weight;
    }
    crossCount += orderData.weight * weightSum;
  });
  return crossCount;
}
