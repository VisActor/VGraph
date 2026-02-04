import { NodeStructure } from '../../../src/graph_structure';
import { clusterNodes } from '../../../src/layouts/dag/order/cluster_nodes';

describe('src/dag/cluster_nodes.ts', () => {
  const a = new NodeStructure({
    id: 'a',
  });
  const b = new NodeStructure({
    id: 'b',
  });
  const c = new NodeStructure({
    id: 'c',
  });
  const d = new NodeStructure({
    id: 'd',
  });
  it('cluster should work with all isolated nodes', () => {
    expect(clusterNodes([a, b, c, d])).toEqual([[a], [b], [c], [d]]);
  });

  it('cluster should work', () => {
    // a - b c d
    // |-------|

    a.sources = ['d'];
    d.targets = ['a'];
    a.targets = ['b'];
    b.sources = ['a'];
    expect(clusterNodes([a, b, c, d])).toEqual([[d, a, b], [c]]);
    expect(a.sourceCount).toBe(1);
    expect(a.targetCount).toBe(1);
    expect(b.sourceCount).toBe(1);
    expect(b.targetCount).toBe(0);
    expect(c.sourceCount).toBe(0);
    expect(c.targetCount).toBe(0);
    expect(d.sourceCount).toBe(0);
    expect(d.targetCount).toBe(1);
  });

  it('cluster should work with multiple clusters', () => {
    // a -> b  c <- d
    a.sources = [];
    a.targets = ['b'];
    b.sources = ['a'];
    b.targets = [];
    c.sources = ['d'];
    c.targets = [];
    d.sources = [];
    d.targets = ['c'];
    expect(clusterNodes([a, b, c, d])).toEqual([
      [a, b],
      [d, c],
    ]);
    expect(a.sourceCount).toBe(0);
    expect(a.targetCount).toBe(1);
    expect(b.sourceCount).toBe(1);
    expect(b.targetCount).toBe(0);
    expect(c.sourceCount).toBe(1);
    expect(c.targetCount).toBe(0);
    expect(d.sourceCount).toBe(0);
    expect(d.targetCount).toBe(1);
  });
});
