import { detectAllCycles } from '../../../src/algorithms';
import { Graph } from '../../../src/graph';
import { GraphStructure } from '../../../src/graph_structure';
import { greedyFAS } from '../../../src/layouts/dag/preprocess/greedy_fas';

describe('greedyFAS', () => {
  let g: any;

  beforeEach(function () {
    g = new GraphStructure({ nodes: [], edges: [] });
  });

  it('returns the empty set for empty graphs', () => {
    expect(greedyFAS(g)).toEqual([]);
  });

  it('returns the empty set for single-node graphs', () => {
    g.add('node', { id: 'a' });
    expect(greedyFAS(g)).toEqual([]);
  });

  it('returns an empty set if the input graph is acyclic', () => {
    const g = new GraphStructure({
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
        { source: 'b', target: 'd' },
        { source: 'a', target: 'e' },
      ],
    });
    expect(greedyFAS(g)).toEqual([]);
  });

  it('returns the empty set if an already acyclic graph', () => {
    const data = {
      nodes: [
        {
          id: 'a',
        },
        {
          id: 'b',
        },
        {
          id: 'c',
        },
        {
          id: 'd',
        },
      ],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'd' },
        { source: 'a', target: 'c' },
        { source: 'c', target: 'd' },
      ],
    };
    const graph = new GraphStructure(data);
    expect(greedyFAS(graph)).toEqual([]);
  });

  it('returns a single edge with a simple cycle', () => {
    const g = new GraphStructure({
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'a' },
      ],
    });
    checkFAS(g, greedyFAS(g));
  });

  it('returns a single edge in a 4-node cycle', () => {
    const g = new GraphStructure({
      nodes: [
        { id: 'a' },
        { id: 'b' },
        { id: 'c' },
        { id: 'd' },
        { id: 'e' },
        { id: 'f' },
      ],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
        { source: 'c', target: 'd' },
        { source: 'd', target: 'e' },
        { source: 'e', target: 'b' },
        { source: 'c', target: 'e' },
        { source: 'd', target: 'b' },
        { source: 'd', target: 'f' },
      ],
    });
    // g.setEdge("n1", "n2");
    // g.setPath(["n2", "n3", "n4", "n5", "n2"]);
    // g.setEdge("n3", "n5");
    // g.setEdge("n4", "n2");
    // g.setEdge("n4", "n6");
    checkFAS(g, greedyFAS(g));
  });

  it('returns two edges for two 4-node cycles', () => {
    const g = new GraphStructure({
      nodes: [
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' },
        { id: '6' },
        { id: '7' },
        { id: '8' },
        { id: '9' },
        { id: '10' },
      ],
      edges: [
        { source: '1', target: '2' },
        { source: '2', target: '3' },
        { source: '3', target: '4' },
        { source: '4', target: '5' },
        { source: '5', target: '2' },
        { source: '3', target: '5' },
        { source: '4', target: '2' },
        { source: '4', target: '6' },
        { source: '6', target: '7' },
        { source: '7', target: '8' },
        { source: '8', target: '9' },
        { source: '9', target: '6' },
        { source: '7', target: '9' },
        { source: '8', target: '6' },
        { source: '8', target: '10' },
      ],
    });
    checkFAS(g, greedyFAS(g));
  });

  it('works with arbitrarily weighted edges', () => {
    // Our algorithm should also work for graphs with multi-edges, a graph
    // where more than one edge can be pointing in the same direction between
    // the same pair of incident nodes. We try this by assigning weights to
    // our edges representing the number of edges from one node to the other.

    const g1 = new GraphStructure({
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [
        { source: 'a', target: 'b', weight: 2 },
        { source: 'b', target: 'a', weight: 1 },
      ],
    });
    expect(greedyFAS(g1, weightFn(g1)).map(plainEdge)).toEqual([
      { source: 'b', target: 'a' },
    ]);

    const g2 = new GraphStructure({
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [
        { source: 'a', target: 'b', weight: 1 },
        { source: 'b', target: 'a', weight: 2 },
      ],
    });
    expect(greedyFAS(g2, weightFn(g2)).map(plainEdge)).toEqual([
      { source: 'a', target: 'b' },
    ]);
  });
});

function checkFAS(g: Graph | GraphStructure, fas: any[]) {
  const n = g.getNodes().length;
  const m = g.getEdges().length;
  fas.forEach((e: any) => {
    g.remove(e);
  });
  expect(detectAllCycles(g as GraphStructure)).toEqual([]);
  // The more direct m/2 - n/6 fails for the simple cycle A <-> B, where one
  // edge must be reversed, but the performance bound implies that only 2/3rds
  // of an edge can be reversed. I'm using floors to acount for this.
  expect(fas.length).toBeLessThanOrEqual(Math.floor(m / 2) - Math.floor(n / 6));
}

function weightFn(g: GraphStructure | Graph) {
  return (e: any) => e.get('weight');
}

function plainEdge(edge: any) {
  return { source: edge.get('source'), target: edge.get('target') };
}
