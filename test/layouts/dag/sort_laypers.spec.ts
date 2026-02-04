import { GraphStructure } from '../../../src/graph_structure';
import { sortLayers } from '../../../src/layouts/dag/order/sort_layers';

describe('sortLayerGraphs should work', () => {
  it('should work with nodes', () => {
    // a   b
    //   x
    // c   d
    const graphData = new GraphStructure({
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
      edges: [
        { source: 'a', target: 'd' },
        { source: 'b', target: 'c' },
      ],
    });
    const nodeMap = graphData.getNodeMap();
    const a = nodeMap['a'];
    const b = nodeMap['b'];
    const c = nodeMap['c'];
    const d = nodeMap['d'];
    const ranks = {
      1: [a, b],
      2: [c, d],
    };
    sortLayers(ranks, null, 'down', true);
    expect(ranks[1]).toEqual([a, b]);
    expect(ranks[2]).toEqual([d, c]);
  });

  it('should work with clusters', () => {
    // a1  b1   c1
    // a  b   c - d
    const graphData = new GraphStructure({
      nodes: [
        { id: 'a' },
        { id: 'b' },
        { id: 'c' },
        { id: 'd' },
        { id: 'a1' },
        { id: 'b1' },
        { id: 'c1' },
      ],
      edges: [
        { source: 'a1', target: 'a' },
        { source: 'a1', target: 'b' },
        { source: 'a1', target: 'd' },
        { source: 'b1', target: 'b' },
        { source: 'c1', target: 'a' },
        { source: 'c', target: 'd' },
        { source: 'c', target: 'c' },
      ],
    });
    const nodeMap = graphData.getNodeMap();
    const a = nodeMap['a'];
    const b = nodeMap['b'];
    const c = nodeMap['c'];
    const d = nodeMap['d'];
    const a1 = nodeMap['a1'];
    const b1 = nodeMap['b1'];
    const c1 = nodeMap['c1'];
    const ranks = {
      1: [a1, b1, c1],
      2: [a, b, c, d],
    };
    sortLayers(
      ranks,
      {
        1: [[a1], [b1], [c1]],
        2: [[a], [b], [d, c]],
      },
      'down',
      false,
    );
    expect(ranks[1]).toEqual([a1, b1, c1]);
    expect(ranks[2]).toEqual([b, d, c, a]);
  });
});
