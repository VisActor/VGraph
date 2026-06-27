import { Graph } from "../../graph";
import { GraphStructure } from "../../graph_structure";

export function connectedComponents(graph: Graph | GraphStructure) {
  const components: any = {};
  let componentId = 0;
  const visited: any = {};
  const adjList: any = adjacencyList(graph);
  let numLeaf = 0;
  const fa: any = {};
  const size: any = {};
  const nodes = graph.getNodes();
  nodes.forEach((n: any) => {
    const id = n.get("id");
    fa[id] = id;
    size[id] = 1;
    if (
      adjList[id].length <= 1 ||
      (adjList[id].length === 2 && adjList[id][0] === adjList[id][1])
    ) {
      numLeaf++;
    }
  });
  function dfs(id: string) {
    if (visited[id]) {
      return;
    }
    visited[id] = true;
    components[id] = componentId;
    adjList[id].forEach((nodeId: string) => {
      dfs(nodeId);
    });
  }
  nodes.forEach((n: any) => {
    if (!visited[n.get("id")]) {
      dfs(n.get("id"));
      componentId += 1;
    }
  });
  return { components, numLeaf, isMultiComponents: componentId > 1 };
}

export function adjacencyList(graph: Graph | GraphStructure) {
  const adjList = {} as any;
  graph.getNodes().forEach((node: any) => {
    const n = node.get("id");
    if (adjList[n] === undefined) {
      adjList[n] = [];
    }
    node.targets.forEach((t: any) => {
      if (adjList[t] === undefined) {
        adjList[t] = [];
      }
      adjList[n].push(t);
      adjList[t].push(n);
    });
    node.sources.forEach((s: any) => {
      if (adjList[s] === undefined) {
        adjList[s] = [];
      }
      adjList[n].push(s);
      adjList[s].push(n);
    });
  });
  return adjList;
}

export function isMultiComponentsForGraph(graph: Graph | GraphStructure) {
  let numLeaf = 0;
  const nodes = graph.getNodes();
  const nodeMap = graph.getNodeMap();
  graph.getNodes().forEach((node: any) => {
    const { sources, targets } = node;
    const sourceLen = sources.length;
    const targetLen = targets.length;
    if (sourceLen + targetLen <= 1) {
      numLeaf++;
    } else if (sourceLen + targetLen === 2 && sources[0] === targets[0]) {
      numLeaf++;
    }
  });
  let stack = [nodes[0].get("id")];
  const visited: string[] = [];
  while (stack.length) {
    const n = stack.shift();
    if (!visited.includes(n)) {
      visited.push(n);
      const node = nodeMap[n];
      stack = stack.concat(node.sources).concat(node.targets);
    }
  }
  return { numLeaf, isMultiComponents: visited.length < nodes.length };
}

export function isMultiComponentsForData(data: {
  nodes: { id: any; [key: string]: any }[];
  edges: { source: any; target: any; [key: string]: any }[];
}) {
  const adjList = {};
  const { nodes, edges } = data;
  let numLeaf = 0;
  if (nodes.length === 0) {
    return { numLeaf, isMultiComponents: false };
  }
  edges.forEach((edge) => {
    adjList[edge.source] = adjList[edge.source] || [];
    adjList[edge.target] = adjList[edge.target] || [];
    if (!adjList[edge.source].includes(edge.target)) {
      adjList[edge.source].push(edge.target);
    }
    if (!adjList[edge.target].includes(edge.source)) {
      adjList[edge.target].push(edge.source);
    }
  });
  nodes.forEach((node) => {
    const adj = adjList[node.id];
    if (!adj || adj.length === 1) {
      numLeaf++;
    }
  });
  let stack = [nodes[0].id];
  const visited: string[] = [];
  while (stack.length) {
    const n = stack.shift();
    if (!visited.includes(n)) {
      visited.push(n);
      const adj = adjList[n];
      stack = stack.concat(adj);
    }
  }
  return { numLeaf, isMultiComponents: visited.length < nodes.length };
}
