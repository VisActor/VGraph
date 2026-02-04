import { Graph,GraphStructure, TreeGraph } from '../';
import { tarjanScc } from './';

let blockSet: string[] = [];
let blockMap: any = [];
const stack: string[] = [];

// Finding All the Elementary Circuits of A Directed Graph, Donald B. Johnson
export function detectAllCycles(graph: GraphStructure | Graph | TreeGraph) {
  const cycles: any = [];
  const nodeMap = graph.getNodeMap();
  const nodes = Object.keys(nodeMap).filter((nodeId: string) => {
    const node = nodeMap[nodeId];
    return node.sources.length > 0 || node.targets.length > 0;
  });

  function getNodeFromSccGraph(sccs: any) {
    let startId = null;
    let childCount = 0;
    sccs.forEach((singleScc: string[]) => {
      if (singleScc.length === 1) {
        // 检测到单连通分量以后就不参与子图构建和遍历了
        const index = nodes.indexOf(singleScc[0]);
        nodes.splice(index, 1);
        return;
      }
      singleScc.forEach((id: string) => {
        const childLen = nodeMap[id].targets.length;
        if (childLen > childCount) {
          childCount = childLen;
          startId = id;
        }
      });
    });
    return startId;
  }

  while (nodes.length) {
    const subGraph = buildSubGraph(nodes, graph);
    const sccs = tarjanScc(subGraph);
    const nodeId = getNodeFromSccGraph(sccs);
    if (nodeId) {
      blockSet = [];
      blockMap = {};
      findCycleInScc(subGraph, nodeMap[nodeId], nodeMap[nodeId], cycles);
      const index = nodes.indexOf(nodeId);
      nodes.splice(index, 1);
    } else {
      break;
    }
  }
  return cycles;
}

function buildSubGraph(nodes: string[], graph: GraphStructure | Graph | TreeGraph) {
  const sccNodes: any = {};
  graph.getEdges().forEach((edge: any) => {
    const sourceId = edge.get('source');
    const targetId = edge.get('target');
    if (nodes.includes(sourceId) && nodes.includes(targetId)) {
      if (!sccNodes[sourceId]) {
        sccNodes[sourceId] = {
          id: sourceId,
          sources: [],
          targets: [targetId],
        };
      } else if (!sccNodes[sourceId].targets.includes(targetId)) {
        sccNodes[sourceId].targets.push(targetId);
      }
      if (!sccNodes[targetId]) {
        sccNodes[targetId] = {
          id: targetId,
          sources: [sourceId],
          targets: [],
        };
      } else if (!sccNodes[targetId].sources.includes(sourceId)) {
        sccNodes[targetId].sources.push(sourceId);
      }
    }
  });
  const subGraph = new GraphStructure({ nodes: Object.values(sccNodes), edges: [] });
  return subGraph;
}

function findCycleInScc(subGraph: any, startNode: any, currentNode: any, cycles: any) {
  let findCycle = false;
  const currentId = currentNode.get('id');
  stack.push(currentId);
  blockSet.push(currentId);
  const nodeMap = subGraph.getNodeMap();
  currentNode.targets.forEach((childId: string) => {
    const startId = startNode.get('id');
    // 找到起始节点的环
    if (childId === startId) {
      cycles.push(stack.concat([startId]));
      findCycle = true;
    } else if (!blockSet.includes(childId)) {
      const childNode = nodeMap[childId];
      if (childNode) {
        const hasSubCycle = findCycleInScc(subGraph, startNode, childNode, cycles);
        findCycle = findCycle || hasSubCycle;
      }
    }
  });

  if (findCycle) {
    // 从当前节点发现了环，递归将节点和依赖节点解除阻塞，
    unblock(currentId);
  } else {
    // 如果从当前节点没有发现环，不阻塞。加入周围节点的解除阻塞依赖中
    currentNode.targets.forEach((childId: string) => {
      if (blockMap[childId]) {
        blockMap[childId].push(currentId);
      } else {
        blockMap[childId] = [currentId];
      }
    });
  }

  stack.pop();
  return findCycle;
}

function unblock(nodeId: string) {
  const index = blockSet.indexOf(nodeId);
  blockSet.splice(index, 1);
  if (blockMap[nodeId]) {
    const data = blockMap[nodeId];
    delete blockMap[nodeId];
    data.forEach((id: string) => {
      // 递归解除依赖
      unblock(id);
    });
  }
}
