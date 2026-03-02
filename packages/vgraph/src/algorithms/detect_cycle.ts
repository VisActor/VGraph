import { Graph, TreeGraph, GraphStructure } from "../";
import { depthFirstSearch } from "./";

type ISetType = {
  [key: string]: any;
};

/**
 * Detect cycle in directed graph using Depth First Search.
 *
 * @param {Graph} graph
 */
export function detectCycle(graph: GraphStructure | Graph | TreeGraph) {
  let cycle: any = null;
  // 存储之前遍历的节点，用于最后展示自环节点
  const dfsParentMap: ISetType = {};
  // 所有未被访问的节点
  const whiteSet: ISetType = {};
  // 所有正在被访问的节点，如果遍历过程中遇到在灰集中的节点，意味着有环。
  const graySet: ISetType = {};
  // 已全部访问完毕的节点
  const blackSet: ISetType = {};

  const nodeMap = graph.getNodeMap();
  Object.keys(nodeMap).forEach((id: string) => {
    whiteSet[id] = nodeMap[id];
  });

  // Describe BFS callbacks.
  const callbacks = {
    enterNode: ({
      currentNode,
      previousNode,
    }: {
      currentNode: any;
      previousNode: any;
    }) => {
      const currentId = currentNode.get("id");
      if (graySet[currentId]) {
        // 如果访问到灰集节点，有环
        cycle = [currentId];

        let previousCycleNode = previousNode;

        while (previousCycleNode.get("id") !== currentId) {
          const previousId = previousCycleNode.get("id");
          cycle.unshift(previousId);
          previousCycleNode = dfsParentMap[previousId];
        }
        cycle.unshift(previousCycleNode.get("id"));
      } else {
        graySet[currentId] = currentNode;
        delete whiteSet[currentId];
        dfsParentMap[currentId] = previousNode;
      }
    },
    leaveNode: ({ currentNode }: { currentNode: any }) => {
      const currentId = currentNode.get("id");
      blackSet[currentId] = currentNode;
      delete graySet[currentId];
    },
    shouldVisit: ({ nextNode }: { nextNode: any }) => {
      if (cycle) {
        return false;
      }
      return !blackSet[nextNode.get("id")];
    },
  };

  while (Object.keys(whiteSet).length) {
    const startNode = Object.values(whiteSet)[0];
    depthFirstSearch(graph, startNode, callbacks);
  }

  return cycle;
}
