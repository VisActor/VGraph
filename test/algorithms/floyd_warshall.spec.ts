import { GraphStructure } from '../../src';
import { floydWarshallSP, getShortestPathToNode } from '../../src/algorithms';

describe('src/algorithms/floyd_warshall', () => {
  //    a
  //  b    c   -  d
  //     e
  const data = new GraphStructure({
    nodes: [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
      { id: 'd' },
      { id: 'e' },
    ],
    edges: [
      { source: 'a', target: 'b', weight: 5 },
      { source: 'a', target: 'c', weight: 2 },
      { source: 'c', target: 'd', weight: 1 },
      { source: 'b', target: 'e', weight: 4 },
      { source: 'c', target: 'e', weight: 3 },
      { source: 'd', target: 'e', weight: 1 },
    ],
  });
  it('should work without weight', () => {
    const { paths, nodeMap } = floydWarshallSP(data);
    expect(getShortestPathToNode(paths, nodeMap, 'a', 'e')).toEqual([
      'a',
      'b',
      'e'
    ]);
    expect(getShortestPathToNode(paths, nodeMap, 'a', 'd')).toEqual([
      'a',
      'c',
      'd'
    ]);
    expect(getShortestPathToNode(paths, nodeMap, 'e', 'a')).toBe(null);
  });

  it('should work with weight', () => {
    const { paths, nodeMap } = floydWarshallSP(data, (edge: any) => edge.get('weight'));
    expect(getShortestPathToNode(paths, nodeMap, 'a', 'e')).toEqual([
      'a',
      'c',
      'd',
      'e'
    ]);

    expect(getShortestPathToNode(paths, nodeMap, 'c', 'a')).toBe(null);
  });
});
