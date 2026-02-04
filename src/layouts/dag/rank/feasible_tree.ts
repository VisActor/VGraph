import { Graph } from '../../../graph';
import { Node, Edge } from '../../../models/entities';
import { getNodeEdges } from './utils';
import { EdgeStructure, GraphStructure, NodeStructure } from '../../../graph_structure';

type TreeData = {
  nodes: (Node | NodeStructure)[];
  edges: (Edge | EdgeStructure)[];
  nodeCount: number;
  root: string;
};

export function feasibleTree(graph: Graph | GraphStructure) {
  const nodes = graph.getNodes() as any;
  const size = nodes.length;
  const start = nodes.find((node: Node | NodeStructure) => node.get('root')) ?? nodes[0];

  const tree: any = {
    nodes: {},
    edges: {},
    nodeCount: 0,
    root: start.get('id'),
  };

  const nodeEdges = getNodeEdges(graph);
  tree.nodes[start.get('id')] = start;
  tree.root = start.get('id');
  tree.nodeCount++;
  while (tightTree(tree, graph, nodeEdges) < size) {
    const edge = minSlackEdge(tree, graph);
    const delta = tree.nodes[edge.get('source')] !== undefined ? getSlack(graph, edge) : -getSlack(graph, edge);
    shiftRanks(tree, graph, delta);
  }
  return tree;
}

function tightTree(tree: TreeData, graph: Graph | GraphStructure, nodeEdges: Record<string, (Edge | EdgeStructure)[]>) {
  const nodeMap = graph.getNodeMap();
  function dfs(v: string) {
    nodeEdges[v].forEach((e: Edge | EdgeStructure) => {
      const w = e.get('source') + '' === v ? e.get('target') : e.get('source');
      if (tree.nodes[w] === undefined && !getSlack(graph, e)) {
        tree.edges[e.get('source') + '-' + e.get('target')] = e;
        tree.nodes[w] = nodeMap[w];
        tree.nodeCount++;
        dfs(w);
      }
    });
  }
  Object.keys(tree.nodes).forEach((v: string) => {
    dfs(v);
  });
  return tree.nodeCount;
}

function minSlackEdge(tree: TreeData, graph: Graph | GraphStructure) {
  let minSlack = Infinity;
  let resEdge = null as unknown as Edge | EdgeStructure;
  graph.getEdges().forEach((e: Edge | EdgeStructure) => {
    const source = e.get('source');
    const target = e.get('target');
    if (
      (tree.nodes[source] === undefined && tree.nodes[target] !== undefined) ||
      (tree.nodes[source] !== undefined && tree.nodes[target] === undefined)
    ) {
      const slack = getSlack(graph, e);
      if (slack < minSlack) {
        minSlack = slack;
        resEdge = e;
      }
    }
  });
  return resEdge;
}

export function getSlack(graph: Graph | GraphStructure, e: Edge | EdgeStructure) {
  const nodeMap = graph.getNodeMap();
  const source = e.get('source');
  const target = e.get('target');
  const sourceNode = nodeMap[source];
  const targetNode = nodeMap[target];
  const sourceRank = sourceNode.get('rank');
  const targetRank = targetNode.get('rank');
  const minlen = e.get('minlen') ?? 1;
  return targetRank - sourceRank - minlen;
}
function shiftRanks(tree: TreeData, graph: Graph | GraphStructure, delta: number) {
  const nodeMap = graph.getNodeMap();
  Object.keys(tree.nodes).forEach((v: string) => {
    const node = nodeMap[v];
    node.set('rank', node.get('rank') + delta);
  });
}
