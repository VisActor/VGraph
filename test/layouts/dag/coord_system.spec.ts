import { GraphStructure } from '../../../src/graph_structure';
import { coordSystem } from '../../../src/layouts/dag/position/coord_system';

describe('src/dag/coord_system.ts', () => {
  const graph = new GraphStructure({
    nodes: [
      {
        id: 'a',
        width: 100,
        height: 50,
        x: 200,
        y: 300,
      },
      {
        id: 'b',
        width: 80,
        height: 60,
        x: 150,
        y: 50,
      },
    ],
    edges: [
      {
        source: 'a',
        target: 'b',
        controlPoints: [
          [100, 80],
          [180, 260],
        ],
      },
    ],
  });

  const a = graph.getNodeMap().a;
  const b = graph.getNodeMap().b;
  const e = graph.getEdges()[0];

  it('adjust TB should work', () => {
    coordSystem.adjust(graph, 'TB');
    expect(a.get('width')).toBe(100);
    expect(a.get('height')).toBe(50);
    expect(b.get('width')).toBe(80);
    expect(b.get('height')).toBe(60);
  });

  it('adjust BT should work', () => {
    coordSystem.adjust(graph, 'BT');
    expect(a.get('width')).toBe(100);
    expect(a.get('height')).toBe(50);
    expect(b.get('width')).toBe(80);
    expect(b.get('height')).toBe(60);
  });

  it('adjust LR should work', () => {
    coordSystem.adjust(graph, 'LR');
    expect(a.get('width')).toBe(50);
    expect(a.get('height')).toBe(100);
    expect(b.get('width')).toBe(60);
    expect(b.get('height')).toBe(80);
  });

  it('adjust RL should work', () => {
    coordSystem.adjust(graph, 'RL');
    expect(a.get('width')).toBe(100);
    expect(a.get('height')).toBe(50);
    expect(b.get('width')).toBe(80);
    expect(b.get('height')).toBe(60);
  });

  it('reverse TB should work', () => {
    coordSystem.revert(graph, 'TB');
    expect(a.get('x')).toBe(200);
    expect(a.get('y')).toBe(300);
    expect(a.get('width')).toBe(100);
    expect(a.get('height')).toBe(50);
    expect(b.get('x')).toBe(150);
    expect(b.get('y')).toBe(50);
    expect(b.get('width')).toBe(80);
    expect(b.get('height')).toBe(60);
    expect(e.get('controlPoints')).toEqual([
      [100, 80],
      [180, 260],
    ]);
  });

  it('reverse BT should work', () => {
    coordSystem.revert(graph, 'BT');
    expect(a.get('x')).toBe(200);
    expect(a.get('y')).toBe(-300);
    expect(a.get('width')).toBe(100);
    expect(a.get('height')).toBe(50);
    expect(b.get('x')).toBe(150);
    expect(b.get('y')).toBe(-50);
    expect(b.get('width')).toBe(80);
    expect(b.get('height')).toBe(60);
    expect(e.get('controlPoints')).toEqual([
      [100, -80],
      [180, -260],
    ]);
  });

  it('reverse LR should work', () => {
    coordSystem.revert(graph, 'LR');
    expect(a.get('x')).toBe(-300);
    expect(a.get('y')).toBe(200);
    expect(a.get('width')).toBe(50);
    expect(a.get('height')).toBe(100);
    expect(b.get('x')).toBe(-50);
    expect(b.get('y')).toBe(150);
    expect(b.get('width')).toBe(60);
    expect(b.get('height')).toBe(80);
    expect(e.get('controlPoints')).toEqual([
      [-80, 100],
      [-260, 180],
    ]);
  });

  it('reverse RL should work', () => {
    coordSystem.revert(graph, 'RL');
    expect(a.get('x')).toBe(-200);
    expect(a.get('y')).toBe(-300);
    expect(a.get('width')).toBe(100);
    expect(a.get('height')).toBe(50);
    expect(b.get('x')).toBe(-150);
    expect(b.get('y')).toBe(-50);
    expect(b.get('width')).toBe(80);
    expect(b.get('height')).toBe(60);
    expect(e.get('controlPoints')).toEqual([
      [-100, -80],
      [-180, -260],
    ]);
  });
});
