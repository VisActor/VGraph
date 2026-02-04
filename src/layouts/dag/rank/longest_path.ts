import { Graph } from '../../../graph';
import { Node, Edge } from '../../../models/entities';
import { EdgeStructure, GraphStructure, NodeStructure } from '../../../graph_structure';
import { normalizeRanks } from './utils'
const infinity = Infinity;

export function longestPath(graph: GraphStructure | Graph, normalize = true): void {
  const visited = new Map();
  const targets = new Map();
  const nodeMap = new Map();
  graph.getNodes().forEach((n: Node | NodeStructure) => {
    targets.set(n.get('id'), []);
    nodeMap.set(n.get('id'), n);
  });
  graph.getEdges().forEach((e: Edge | EdgeStructure) => {
    const source = e.get('source');
    if (!targets.has(source)) {
      targets.set(source, []);
    }
    targets.get(source).push(e);
  });

  function dfs(nodeId: string) {
    if (visited.has(nodeId)) {
      return nodeMap.get(nodeId).get('rank');
    }
    visited.set(nodeId, true);
    let rank = infinity;
    targets.get(nodeId).forEach((e: Edge | EdgeStructure) => {
      const target = e.get('target');
      const _rank = dfs(target) - (e.get('minlen') || 1);
      if (_rank < rank) {
        rank = _rank;
      }
    });
    if (rank === infinity || rank === undefined || rank === null) {
      rank = 0;
    }
    nodeMap.get(nodeId).set('rank', rank);
    return rank;
  }
  graph.getNodes().forEach((n: Node | NodeStructure) => {
    dfs(n.get('id'));
  });

  // normalizeRanks
  if (normalize) {
    normalizeRanks(graph);
  }
}