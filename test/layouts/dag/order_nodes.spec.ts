import { GraphStructure } from '../../../src/graph_structure';
import { orderNodes } from '../../../src/layouts/dag/order/order_nodes';

describe('src/dag/order_nodes.ts', () => {
  const graph = new GraphStructure({
    nodes: [
      { id: 'a', order: 2 },
      { id: 'b', order: 6 },
      { id: 'c', order: 0 },
      { id: 'd', order: 3 },
      { id: 'e', order: 5 },
      { id: 'f', order: 4 },
      { id: 'g', order: 3 },
    ],
    edges: [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'e' },
      { source: 'b', target: 'c' },
      { source: 'b', target: 'd' },
      { source: 'e', target: 'f' },
    ],
  });
  const nodeMap = graph.getNodeMap();
  const a = nodeMap.a;
  const b = nodeMap.b;
  const c = nodeMap.c;
  const d = nodeMap.d;
  const e = nodeMap.e;
  const f = nodeMap.f;
  const g = nodeMap.g;
  it('should work for tree struct nodes', () => {
    //    a
    //  b   e
    // c  d  f
    const orders = orderNodes(
      {
        0: [a],
        1: [b, e],
        2: [c, d, f],
      },
      {
        order: 'minCross',
        ranker: 'networkSimplex',
      },
    );
    expect(orders).toEqual({
      0: ['a'],
      1: ['b', 'e'],
      2: ['c', 'd', 'f'],
    });
  });

  it('should work for simple graph', () => {
    //   a  d
    //   | x
    //   b f-e
    const orders = orderNodes(
      {
        0: [a, d],
        1: [b, f, e],
      },
      {
        order: 'minCross',
        ranker: 'custom',
      },
    );

    expect(orders).toEqual({
      0: ['a', 'd'],
      1: ['e', 'f', 'b'],
    });
    // a     d 
    // |  \  |
    // e-f   b
  });

  it('should work to minimize crossings', () => {
    //      a
    //   /  |
    //  b   e g
    //     x  \
    //  f   c   d
    //  |
    //  d
    const orders = orderNodes(
      {
        0: [a],
        1: [b, e, g],
        2: [c, f, d],
      },
      {
        order: 'minCross',
        ranker: 'networkSimplex',
      },
    );

    expect(orders).toEqual({
      0: ['a'],
      1: ['b', 'e', 'g'],
      2: ['c', 'd', 'f'],
    });
  });

  it('should work for customize order', () => {
    // a b  c  d
    // e   f   g
    const orders = orderNodes(
      {
        0: [a, b, c, d],
        1: [e, f, g],
      },
      {
        order: 'custom',
        ranker: 'networkSimplex',
      },
    );

    expect(orders).toEqual({
      0: ['c', 'a', 'd', 'b'],
      1: ['g', 'f', 'e'],
    });
  });
});
