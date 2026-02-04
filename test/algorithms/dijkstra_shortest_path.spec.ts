import { GraphStructure } from '../../src';
import { dijkstraSP } from '../../src/algorithms';

describe('src/find_shortest_path', () => {
  const graphData = new GraphStructure({
    nodes: [
      {
        id: 'A',
      },
      {
        id: 'B',
      },
      {
        id: 'C',
      },
      {
        id: 'D',
      },
      {
        id: 'E',
      },
      {
        id: 'F',
      },
    ],
    edges: [
      { source: 'A', target: 'B', weight: 2 },
      { source: 'A', target: 'C', weight: 4 },
      { source: 'B', target: 'C', weight: 2 },
      { source: 'B', target: 'D', weight: 4 },
      { source: 'B', target: 'E', weight: 2 },
      { source: 'C', target: 'E', weight: 3 },
      { source: 'D', target: 'F', weight: 2 },
      { source: 'E', target: 'D', weight: 1 },
      { source: 'E', target: 'F', weight: 2 },
    ],
  });

  it('should work with weighted edges', () => {
    const path1 = dijkstraSP(graphData, 'A', 'C', (edge: any) => edge.get('weight'));
    expect(path1.path).toEqual(['A', 'C']);
    expect(path1.cost).toBe(4);

    const path2 = dijkstraSP(graphData, 'A', 'D', (edge: any) => edge.get('weight'));
    expect(path2.path).toEqual(['A', 'B', 'E', 'D']);
    expect(path2.cost).toBe(5);
  });

  it('should work with unweighted edges', () => {
    const path3 = dijkstraSP(graphData, 'A', 'C');
    expect(path3.path).toEqual(['A', 'C']);
    expect(path3.cost).toBe(1);

    const path4 = dijkstraSP(graphData, 'A', 'D');
    expect(path4.path).toEqual(['A', 'B', 'D']);
    expect(path4.cost).toBe(2);
  });

  const graphData1 = new GraphStructure({
    nodes: [
      {
        id: 'A',
      },
      {
        id: 'B',
      },
      {
        id: 'C',
      },
    ],
    edges: [{ source: 'A', target: 'B' }],
  });

  it('should work with two nodes are not connected', () => {
    const path5 = dijkstraSP(graphData1, 'A', 'B');
    expect(path5.path).toEqual(['A', 'B']);
    expect(path5.cost).toBe(1);

    const path6 = dijkstraSP(graphData1, 'A', 'C');
    expect(path6.path).toEqual([]);
    expect(path6.cost).toBe(Infinity);
  });
});
