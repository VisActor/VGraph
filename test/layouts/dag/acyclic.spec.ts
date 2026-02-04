import { detectAllCycles } from '../../../src/algorithms';
import { GraphStructure } from '../../../src/graph_structure';
import { acyclic } from '../../../src/layouts/dag/preprocess/acyclic';
const ACYCLICERS = ['greedy', 'dfs', 'unknown-should-still-work'];
ACYCLICERS.forEach((acyclicer) => {
  describe(acyclicer + '.run', () => {
    it('does not change an already acyclic graph', () => {
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
      const graphData = new GraphStructure(data);
      acyclic.run(graphData, acyclicer);
      const edges = graphData.getEdges().map(stripEdge);
      expect(edges).toEqual([
        { source: 'a', target: 'b' },
        { source: 'b', target: 'd' },
        { source: 'a', target: 'c' },
        { source: 'c', target: 'd' },
      ]);
    });

    it('breaks cycles in the input graph', function () {
      const data = {
        nodes: [
          {
            id: 'a',
            type: 'circle',
          },
          {
            id: 'b',
            type: 'circle',
          },
          {
            id: 'c',
            type: 'circle',
          },
          {
            id: 'd',
            type: 'circle',
          },
        ],
        edges: [
          { source: 'a', target: 'b' },
          { source: 'b', target: 'c' },
          { source: 'c', target: 'd' },
          { source: 'd', target: 'a' },
        ],
      };
      const graphData = new GraphStructure(data);
      acyclic.run(graphData, acyclicer);
      const edges = graphData.getEdges().map(stripEdge);
      expect(edges).toEqual([
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
        { source: 'c', target: 'd' },
        { source: 'a', target: 'd' },
      ]);
    });
    it('creates a multi-edge where necessary', function () {
      const data = {
        nodes: [
          {
            id: 'a',
          },
          {
            id: 'b',
          },
        ],
        edges: [
          { source: 'a', target: 'b' },
          { source: 'b', target: 'a' },
        ],
      };
      const graphData = new GraphStructure(data);
      acyclic.run(graphData, acyclicer);
      expect(detectAllCycles(graphData)).toEqual([]);
      const edges = graphData.getEdges().map(stripEdge);
      expect(edges).toEqual([
        { source: 'a', target: 'b' },
        { source: 'a', target: 'b' },
      ]);
    });
  });

  describe(acyclicer + '.undo', function () {
    it('does not change edges where the original graph was acyclic', function () {
      const data = {
        nodes: [
          {
            id: 'a',
          },
          {
            id: 'b',
          },
        ],
        edges: [{ source: 'a', target: 'b', minlen: 2, weight: 3 }],
      };
      const graphData = new GraphStructure(data);
      acyclic.run(graphData, acyclicer);
      acyclic.undo(graphData);
      const edges = graphData.getEdges();
      expect(edges.length).toBe(1);
      expect(edges[0].get('minlen')).toBe(2);
      expect(edges[0].get('weight')).toBe(3);
    });

    it('can restore previosuly reversed edges', function () {
      const data = {
        nodes: [
          {
            id: 'a',
          },
          {
            id: 'b',
          },
        ],
        edges: [
          { source: 'a', target: 'b', minlen: 2, weight: 3 },
          { source: 'b', target: 'a', minlen: 3, weight: 4 },
        ],
      };
      const graphData = new GraphStructure(data);
      acyclic.run(graphData, acyclicer);
      acyclic.undo(graphData);
      const edges = graphData
        .getEdges()
        .sort((a: any, b: any) =>
          a.get('source').localeCompare(b.get('source'), 'en')
        );
      expect(edges.length).toBe(2);
      expect(edges.map(stripEdge)).toEqual([
        { source: 'a', target: 'b' },
        { source: 'b', target: 'a' },
      ]);
      expect(edges[0].get('minlen')).toBe(2);
      expect(edges[0].get('weight')).toBe(3);
      expect(edges[1].get('minlen')).toBe(3);
      expect(edges[1].get('weight')).toBe(4);
    });
  });
});

describe('greedy-specific functionality', function () {
  it('prefers to break cycles at low-weight edges', function () {
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
        { source: 'a', target: 'b', weight: 2 },
        { source: 'b', target: 'c', weight: 2 },
        { source: 'c', target: 'd', weight: 1 },
        { source: 'd', target: 'a', weight: 2 },
      ],
    };
    const graphData = new GraphStructure(data);
    acyclic.run(graphData, 'greedy');
    expect(detectAllCycles(graphData)).toEqual([]);
    const edges = graphData.getEdges().map(stripEdge);
    expect(edges).toEqual([
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
      { source: 'd', target: 'a' },
      { source: 'd', target: 'c' },
    ]);
  });
});

function stripEdge(e: any) {
  return {
    source: e.get('source'),
    target: e.get('target'),
  };
}
