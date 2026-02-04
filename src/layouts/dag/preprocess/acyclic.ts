import { Graph } from '../../../graph';
import { Edge, Node } from '../../../models/entities';
import { GraphStructure, EdgeStructure, NodeStructure } from '../../../graph_structure';

import { greedyFAS } from './greedy_fas';


export function reverseEdge(graph: GraphStructure | Graph, edge: any) {
  if (edge.get('reversed')) {
    unReverseEdge(graph, edge);
    // 去环时将边翻转 + custom rank 将边再次翻转导致， 此时将重新构成环。
  } else {
    const source = edge.get('source');
    const target = edge.get('target');
    const edgeId = edge.get('id');
    graph.remove(edge);
    edge.set('source', target);
    edge.set('target', source);
    edge.set('forwardName', edgeId);
    edge.set('id', 'reversed' + edgeId);
    edge.set('reversed', true);
    graph.add('edge', edge.configs, true);
  }
}


export function acyclicRun(
  graph: GraphStructure | Graph,
  acyclicer: 'greedy' | 'dfs' | string = 'dfs',
): void {
  const fas = (acyclicer === 'greedy') ? greedyFAS(graph, weightFn()) : dfsFAS(graph);
  fas.forEach((e: Edge | EdgeStructure) => {
    reverseEdge(graph, e);
  });
}

function weightFn() {
  return (e: Edge | EdgeStructure) => e.get('weight');
}

function dfsFAS(graph: GraphStructure | Graph) {
  const targets = new Map();
  graph.getNodes().forEach((n: Node | NodeStructure) => {
    targets.set(n.get('id'), []);
  });
  graph.getEdges().forEach((e: Edge | EdgeStructure) => {
    // const target = e.get('target');
    const source = e.get('source');
    if (!targets.has(source)) {
      targets.set(source, []);
    }
    targets.get(source).push(e);
  });
  const fas: any = [];
  const visited = new Map();
  const stack = new Map();
  function dfs(vid: string) {
    if (visited.has(vid)) {
      return;
    }
    visited.set(vid, true);
    stack.set(vid, true);
    targets.get(vid).forEach((e: Edge | EdgeStructure) => {
      const target = e.get('target');
      if (stack.has(target)) {
        fas.push(e);
      } else {
        dfs(target);
      }
    });
    stack.delete(vid);
  }
  graph.getNodes().forEach((node: Node | NodeStructure) => {
    dfs(node.get('id'));
  });
  return fas;
}

function unReverseEdge(graph: GraphStructure | Graph, edge: any) {
  const source = edge.get('source');
  const target = edge.get('target');
  const edgeId = edge.get('forwardName');
  graph.remove(edge);
  edge.set('source', target);
  edge.set('target', source);
  edge.set('id', edgeId);
  edge.set('reversed', undefined);
  edge.set('forwardName', undefined);
  graph.add('edge', edge.configs, edge.configs.temp);
}

function acyclicUndo(graph: GraphStructure | Graph) {
  graph.getEdges().forEach((e: Edge | EdgeStructure) => {
    if (e.get('reversed')) {
      unReverseEdge(graph, e);
    }
  });
}

export const acyclic = {
  run: acyclicRun,
  undo: acyclicUndo,
};
