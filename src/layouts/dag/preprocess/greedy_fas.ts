import { Graph } from '../../../graph';
import { GraphStructure } from '../../../graph_structure';
import { List } from './list';


const DEFAULT_WEIGHT_FN = () => 1;
const EDGE_CONCAT = '-with-';
export function greedyFAS(graph: Graph | GraphStructure, weightFn?: (e: any) => number): any[] {
  const nodes = graph.getNodes();
  if (nodes.length <= 1) {
    return [];
  }
  const state = buildState(graph, weightFn || DEFAULT_WEIGHT_FN);
  const results = doGreedyFas(state);
  const edgeMap = getEdgeMap(graph);
  return results.map((e: any) => edgeMap[e.source + EDGE_CONCAT + e.target]);
}

function buildState(graph: Graph | GraphStructure, weightFn?: (e: any) => number) {
  const fasGraph = {} as any;
  fasGraph.edges = {} as any;
  fasGraph.nodes = {} as any;
  fasGraph.getEdge = (source: string, target: string) => {
    return fasGraph.edges[source + EDGE_CONCAT + target];
  };
  fasGraph.setEdge = (source: string, target: string, edge: any) => {
    fasGraph.edges[source + EDGE_CONCAT + target] = edge;
  };
  let maxIn = 0;
  let maxOut = 0;
  const nodes = graph.getNodes();
  fasGraph.nodeCnt = nodes.length;
  nodes.forEach((n: any) => {
    fasGraph.nodes[n.get('id')] = { ...n.configs, in: 0, out: 0 };
  });
  const edges = graph.getEdges();
  edges.forEach((e: any) => {
    const source = e.get('source');
    const target = e.get('target');
    const prevWeight = fasGraph.getEdge(source, target)?.weight || 0;
    const weight = prevWeight + (weightFn ? weightFn(e) || 1 : 1);
    fasGraph.setEdge(source, target, { source, target, weight });
    maxOut = Math.max(maxOut, (fasGraph.nodes[source].out += weight));
    maxIn = Math.max(maxIn, (fasGraph.nodes[target].in += weight));
  });
  const buckets = [] as any;
  for (let i = 0; i < maxIn + maxOut + 3; i++) {
    buckets.push(new List());
  }
  const zeroIdx = maxIn + 1;
  Object.keys(fasGraph.nodes).map((id: string) => {
    assignBuckets(buckets, zeroIdx, fasGraph.nodes[id]);
  });
  return { buckets, fasGraph, zeroIdx };
}

function assignBuckets(buckets: List[], zeroIdx: number, entry: any) {
  if (!entry.out) {
    buckets[0].enqueue(entry);
  } else if (!entry.in) {
    buckets[buckets.length - 1].enqueue(entry);
  } else {
    buckets[entry.out - entry.in + zeroIdx].enqueue(entry);
  }
}

function doGreedyFas(state: any) {
  const { buckets, fasGraph, zeroIdx } = state;
  let results = [] as any;
  const sources = buckets[buckets.length - 1];
  const slinks = buckets[0];
  const inEdges = getInEdges(fasGraph);
  const outEdges = getOutEdges(fasGraph);
  let entity;
  while (fasGraph.nodeCnt > 0) {
    entity = slinks.dequeue();
    while (entity !== undefined) {
      removeNode(fasGraph, inEdges, outEdges, buckets, zeroIdx, entity, false);
      entity = slinks.dequeue();
    }

    entity = sources.dequeue();
    while (entity !== undefined) {
      removeNode(fasGraph, inEdges, outEdges, buckets, zeroIdx, entity, false);
      entity = sources.dequeue();
    }
    if (fasGraph.nodeCnt > 0) {
      for (let i = buckets.length - 2; i > 0; i--) {
        entity = buckets[i].dequeue();
        if (entity) {
          results = results.concat(removeNode(fasGraph, inEdges, outEdges, buckets, zeroIdx, entity, true));
          break;
        }
      }
    }
  }
  return results;
}
function removeNode(
  fasGraph: any,
  inEdges: any,
  outEdges: any,
  buckets: any,
  zeroIdx: number,
  entity: any,
  collectPredecessors: boolean
) {
  const results: { source: any; target: any }[] = [];
  inEdges[entity.id].forEach((edge: any) => {
    const source = edge.source;
    const target = edge.target;
    const weight = edge.weight;
    if (fasGraph.nodes[source] === undefined) {
      return;
    }
    if (collectPredecessors) {
      results.push({ source, target });
    }
    fasGraph.nodes[source].out -= weight;
    assignBuckets(buckets, zeroIdx, fasGraph.nodes[source]);
  });
  outEdges[entity.id].forEach((edge: any) => {
    // const source = edge.source;
    const target = edge.target;
    const weight = edge.weight;
    if (fasGraph.nodes[target] === undefined) {
      return;
    }
    fasGraph.nodes[target].in -= weight;
    assignBuckets(buckets, zeroIdx, fasGraph.nodes[target]);
  });
  delete fasGraph.nodes[entity.id];
  fasGraph.nodeCnt--;
  return collectPredecessors ? results : undefined;
}

function getInEdges(fasGraph: any) {
  const inEdges = {} as any;
  Object.keys(fasGraph.nodes).forEach((n: string) => {
    inEdges[n] = [];
  });
  Object.keys(fasGraph.edges).forEach((e: string) => {
    const edge = fasGraph.edges[e];
    inEdges[edge.target].push(edge);
  });
  return inEdges;
}

function getOutEdges(fasGraph: any) {
  const outEdges = {} as any;
  Object.keys(fasGraph.nodes).forEach((n: string) => {
    outEdges[n] = [];
  });
  Object.keys(fasGraph.edges).forEach((e: string) => {
    const edge = fasGraph.edges[e];
    outEdges[edge.source].push(edge);
  });
  return outEdges;
}

function getEdgeMap(graph: Graph | GraphStructure) {
  const edgeMap = {} as any;
  const edges = graph.getEdges();
  edges.forEach((e: any) => {
    const source = e.get('source');
    const target = e.get('target');
    edgeMap[source + EDGE_CONCAT + target] = e;
  });
  return edgeMap;
}
