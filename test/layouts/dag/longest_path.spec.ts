import { GraphStructure } from '../../../src/graph_structure';
import { longestPath } from '../../../src/layouts/dag/rank';

describe('src/longestPath', () => {
  const data = {
    nodes: [
      { label: 'a', class: 'type-TOP', id: 'a' },
      { label: 'b', class: 'type-S', id: 'b' },
      { label: 'c', class: 'type-NP', id: 'c' },
      { label: 'd', class: 'type-DT', id: 'd' },
      { label: 'e', class: 'type-TK', id: 'e' },
      { label: 'f', class: 'type-VP', id: 'f' },
      { label: 'g', class: 'type-VBZ', id: 'g' },
      { label: 'h', class: 'type-TK', id: 'h' },
    ],
    edges: [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
      { source: 'c', target: 'd' },
      { source: 'd', target: 'h' },
      { source: 'a', target: 'e' },
      { source: 'a', target: 'f' },
      { source: 'e', target: 'g' },
      { source: 'f', target: 'g' },
      { source: 'g', target: 'h' },
    ],
  };
  it('finds the longest path in a real data', () => {
    const graphData = new GraphStructure(data);
    longestPath(graphData);
    expect(graphData.getNodes().map(stripNode)).toEqual([
      0, 1, 2, 3, 2, 2, 3, 4,
    ]);
  });
  it('can assign a rank to a single node graph', () => {
    const graphData = new GraphStructure({
      nodes: [{ label: 'a', class: 'type-TOP', id: 'a' }],
      edges: [],
    });
    longestPath(graphData);
    expect(graphData.getNodes().map(stripNode)).toEqual([0]);
  });
  it('can assign ranks to unconnected nodes', () => {
    const graphData = new GraphStructure({
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [],
    });
    longestPath(graphData);
    expect(graphData.getNodes().map(stripNode)).toEqual([0, 0]);
  });
  it('can assign ranks to connected nodes', () => {
    const graphData = new GraphStructure({
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [{ source: 'a', target: 'b' }],
    });
    longestPath(graphData);
    expect(graphData.getNodes().map(stripNode)).toEqual([0, 1]);
  });

  it('can assign ranks for a diamond', () => {
    const graphData = new GraphStructure({
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'a', target: 'c' },
        { source: 'b', target: 'd' },
        { source: 'c', target: 'd' },
      ],
    });
    longestPath(graphData);
    expect(graphData.getNodes().map(stripNode)).toEqual([0, 1, 1, 2]);
  });
  it('uses the minlen attribute on the edge', () => {
    const graphData = new GraphStructure({
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
      edges: [
        { source: 'a', target: 'b', minlen: 1 },
        { source: 'a', target: 'c', minlen: 1 },
        { source: 'b', target: 'd', minlen: 1 },
        { source: 'c', target: 'd', minlen: 2 },
      ],
    });
    longestPath(graphData);
    expect(graphData.getNodes().map(stripNode)).toEqual([0, 2, 1, 3]);
  });
});
function stripNode(node: any) {
  return node.get('rank');
}
