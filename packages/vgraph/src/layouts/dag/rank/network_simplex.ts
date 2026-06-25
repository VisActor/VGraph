import { Graph } from "../../../graph";
import { GraphStructure } from "../../../graph_structure";
import { nestingGraph } from "../preprocess/nested_graph";
import { longestPath } from "./longest_path";
import { getNodeEdges } from "./utils";
import { feasibleTree, getSlack } from "./feasible_tree";

export function networkSimplex(graph: Graph | GraphStructure) {
  longestPath(graph);
  const nest = nestingGraph(graph);
  nest.run();
  const tree = feasibleTree(graph);
  initTree(tree, graph);
  // console.log(tree);
  // 数据结构都挂在tree上，避免污染源数据, 后续应该把这些数据整合到一个新的GraphStructure里面
  initLowLimValues(tree, tree.root);
  initCutValues(tree, graph);
  let edge = leaveEdge(tree);
  while (edge !== null) {
    const exEdge = enterEdge(tree, graph, edge);
    if (!exEdge) {
      break;
    }
    exchangeEdges(tree, graph, edge, exEdge);
    edge = leaveEdge(tree);
  }
  nest.cleanup();
}

export function initTree(tree: any, graph: Graph | GraphStructure) {
  // TODO: 把这套逻辑整合到GraphStructure里面去
  tree.graphEdges = {};
  tree.getEdge = (source: string, target: string) => {
    return tree.edges[source + "-" + target]; // id暂定为source-target的格式
  };
  graph.getEdges().forEach((e: any) => {
    tree.graphEdges[e.get("source") + "-" + e.get("target")] = e;
  });
  tree.getGraphEdge = (source: string, target: string) => {
    return tree.graphEdges[source + "-" + target];
  };
  // 挂在tree上，避免污染源graph
  tree.low = {};
  tree.lim = {};
  tree.parent = {};
  tree.neighbors = treeNeighbors(tree);
  tree.cutValue = {};
  tree.getCutValue = (source: string, target: string) => {
    return (
      tree.cutValue[source + "-" + target] ??
      tree.cutValue[target + "-" + source]
    );
  };
  tree.addEdge = (edge: any) => {
    const source = edge.get("source");
    const target = edge.get("target");
    if (tree.neighbors[source] === undefined) {
      tree.neighbors[source] = [];
    }
    if (tree.neighbors[target] === undefined) {
      tree.neighbors[target] = [];
    }
    tree.neighbors[source].push(target);
    tree.neighbors[target].push(source);
    tree.edges[source + "-" + target] = edge;
  };
  tree.removeEdge = (source: string, target: string) => {
    delete tree.edges[source + "-" + target];
    delete tree.edges[target + "-" + source];
    const index1 = tree.neighbors[source].indexOf(target);
    if (index1 > -1) {
      tree.neighbors[source].splice(index1, 1);
    }
    const index2 = tree.neighbors[target].indexOf(source);
    if (index2 > -1) {
      tree.neighbors[target].splice(index2, 1);
    }
  };
}

function treeNeighbors(tree: any) {
  const neighbors = {} as any;
  Object.keys(tree.nodes).forEach((v: string) => {
    neighbors[v] = [];
  });
  Object.keys(tree.edges).forEach((e: string) => {
    const edge = tree.edges[e];
    if (edge !== undefined) {
      const source = edge.get("source");
      const target = edge.get("target");
      if (neighbors[source] === undefined) {
        neighbors[source] = [];
      }
      if (neighbors[target] === undefined) {
        neighbors[target] = [];
      }
      neighbors[source].push(target);
      neighbors[target].push(source);
    }
  });
  return neighbors;
}

export function initLowLimValues(tree: any, root?: any) {
  // if (root === undefined) {
  //   root = tree.root;
  //   if (!root) {
  //     throw Error('Tree structure exception: no root');
  //   }
  // }
  if (root === undefined) {
    root = Object.keys(tree.nodes)[0];
    tree.root = root; // add root
  }
  function dfs(visited: any, nextLim: number, source: string, parent?: string) {
    const low = nextLim;
    visited[source] = true;
    if (tree.neighbors[source] === undefined) {
      throw new Error(source + ": neighbors is undefined");
    }
    tree.neighbors[source].forEach((n: string) => {
      if (!visited[n]) {
        nextLim = dfs(visited, nextLim, n, source);
      }
    });
    tree.low[source] = low;
    tree.lim[source] = nextLim++;

    if (parent !== undefined) {
      tree.parent[source] = parent;
    } else {
      delete tree.parent[source];
    }
    return nextLim;
  }
  dfs({}, 1, root);
}

export function initCutValues(tree: any, graph: Graph | GraphStructure) {
  const vs = postOrderAcc(tree, tree.root).slice(0, -1);
  const nodeEdges = getNodeEdges(graph);
  vs.forEach((v: string) => {
    cutValue(tree, nodeEdges, v);
  });
}

export function cutValue(tree: any, nodeEdges: any, nodeId: string) {
  const parent = tree.parent[nodeId];
  let cutVal = 0;
  const edge =
    tree.getGraphEdge(parent, nodeId) ?? tree.getGraphEdge(nodeId, parent);
  const childIsTail = edge.get("source") === nodeId;
  cutVal = edge.get("weight") ?? 1;
  nodeEdges[nodeId].forEach((e: any) => {
    const isOutEdge = e.get("source") === nodeId;
    const otherNodeId = isOutEdge ? e.get("target") : e.get("source");
    if (otherNodeId !== parent) {
      const pointsToHead = isOutEdge === childIsTail;
      const otherWeight = e.get("weight") ?? 1;
      cutVal += pointsToHead ? otherWeight : -otherWeight;
      if (
        tree.getEdge(nodeId, otherNodeId) !== undefined ||
        tree.getEdge(otherNodeId, nodeId) !== undefined
      ) {
        const otherCutValue = tree.getCutValue(nodeId, otherNodeId);
        cutVal += pointsToHead ? -otherCutValue : otherCutValue;
      }
    }
  });
  // Note: tree is undirected
  if (tree.getEdge(nodeId, parent) !== undefined) {
    tree.cutValue[nodeId + "-" + parent] = cutVal;
  }
  if (tree.getEdge(parent, nodeId) !== undefined) {
    tree.cutValue[parent + "-" + nodeId] = cutVal;
  }
  // console.log(nodeId, parent, cutValue);
}

export function leaveEdge(tree: any) {
  let outEdge = null;
  Object.entries(tree.edges).every(([key, edge]: any) => {
    if (edge && tree.getCutValue(edge.get("source"), edge.get("target")) < 0) {
      outEdge = edge;
      return false;
    }
    return true;
  });
  return outEdge;
}

export function enterEdge(tree: any, graph: Graph | GraphStructure, edge: any) {
  let source = edge.get("source");
  let target = edge.get("target");
  if (tree.getGraphEdge(source, target) === undefined) {
    source = edge.get("target");
    target = edge.get("source");
  }
  const flip = tree.lim[source] > tree.lim[target];
  const tail = flip ? target : source;
  let minSlackEdge = null;
  let minSlack = Infinity;
  graph.getEdges().forEach((e: any) => {
    const v = e.get("source");
    const w = e.get("target");
    if (
      flip === isDescendant(tree, v, tail) &&
      flip !== isDescendant(tree, w, tail)
    ) {
      const slack = getSlack(graph, e);
      if (slack < minSlack) {
        minSlack = slack;
        minSlackEdge = e;
      }
    }
  });
  return minSlackEdge;
}
export function exchangeEdges(
  tree: any,
  graph: Graph | GraphStructure,
  edge: any,
  fEdge: any
) {
  tree.removeEdge(edge.get("source"), edge.get("target"));
  tree.addEdge(fEdge);
  // tree.neighbors = treeNeighbors(tree);
  initLowLimValues(tree, tree.root);
  initCutValues(tree, graph);
  updateRanks(tree, graph);
}

function updateRanks(tree: any, graph: Graph | GraphStructure) {
  Object.keys(tree.nodes).forEach((n) => {
    if (tree.parent[n] === undefined) {
      tree.root = n;
    }
  });
  const vs = preOrderAcc(tree, tree.root).slice(1);
  const nodeMap = graph.getNodeMap();
  vs.forEach((v: string) => {
    const parent = tree.parent[v] as string;
    const edge = tree.getGraphEdge(v, parent) ?? tree.getGraphEdge(parent, v);
    const fliped = v === edge.get("target");
    nodeMap[v].set(
      "rank",
      nodeMap[parent].get("rank") +
        (fliped ? edge.get("minlen") || 1 : -(edge.get("minlen") || 1))
    );
  });
}
function isDescendant(tree: any, node: string, root: string) {
  return tree.low[root] <= tree.lim[node] && tree.lim[node] <= tree.lim[root];
}

function postOrderAcc(tree: any, startNodes?: any) {
  const visited: any = {};
  const acc: any = [];
  function dfs(node: string) {
    if (!visited[node]) {
      visited[node] = true;
      tree.neighbors[node].forEach((n: string) => {
        dfs(n);
      });
      acc.push(node);
    }
  }
  if (startNodes === undefined) {
    startNodes = Object.keys(tree.nodes);
  } else if (!Array.isArray(startNodes)) {
    startNodes = [startNodes];
  }
  startNodes.forEach((key: any) => {
    dfs(key);
  });
  return acc;
}

function preOrderAcc(tree: any, startNodes?: any) {
  const visited: any = {};
  const acc: any = [];
  function dfs(node: string) {
    if (!visited[node]) {
      visited[node] = true;
      acc.push(node);
      tree.neighbors[node].forEach((n: string) => {
        dfs(n);
      });
    }
  }
  if (startNodes === undefined) {
    startNodes = Object.keys(tree.nodes);
  } else if (!Array.isArray(startNodes)) {
    startNodes = [startNodes];
  }
  startNodes.forEach((key: any) => {
    dfs(key);
  });
  return acc;
}
