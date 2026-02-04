import { Graph } from '../../src';

describe('src/graph/graph', () => {
  const div = document.createElement('div');
  const graph = new Graph({
    width: 600,
    height: 400,
    padding: 10,
    container: div,
    setDefaultNode() {
      return { width: 100, height: 100 };
    },
    setDefaultGroup() {
      return { padding: 10 };
    }
  });

  const data = {
    nodes: [
      { id: '1', x: -100, y: 100 },
      { id: '2', x: 800, y: 100 },
      { id: '3', x: 100, y: 900 },
      { id: '4', x: 900, y: -100 },
      { id: '5', x: 500, y: 200 },
    ],
    edges: []
  }
  graph.data(data);

  it('graph with alignView should work', () => {
    graph.alignView('lt');
    let bbox = graph.getContainer().getBBox();
    expect(bbox.left).toBe(10);
    expect(bbox.top).toBe(10);

    graph.alignView('lc');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left).toBe(10);
    expect(bbox.top + 0.5 * bbox.height).toBe(200);

    graph.alignView('lb');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left).toBe(10);
    expect(bbox.top + bbox.height).toBe(390);

    graph.alignView('rt');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + bbox.width).toBe(590);
    expect(bbox.top).toBe(10);

    graph.alignView('rc');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + bbox.width).toBe(590);
    expect(bbox.top + 0.5 * bbox.height).toBe(200);

    graph.alignView('rb');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + bbox.width).toBe(590);
    expect(bbox.top + bbox.height).toBe(390);

    graph.alignView('ct');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + 0.5 * bbox.width).toBe(300);
    expect(bbox.top).toBe(10);

    graph.alignView('cc');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + 0.5 * bbox.width).toBe(300);
    expect(bbox.top + 0.5 * bbox.height).toBe(200);

    graph.alignView('cb');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + 0.5 * bbox.width).toBe(300);
    expect(bbox.top + bbox.height).toBe(390);
  });

  it('graph with alignView after scale should work', () => {
    graph.scale(0.3);
    graph.translate(1423, -4563);
    graph.alignView('lt');
    let bbox = graph.getContainer().getBBox();
    expect(bbox.left).toBe(10);
    expect(bbox.top).toBe(10);

    graph.alignView('lc');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left).toBe(10);
    expect(bbox.top + 0.5 * bbox.height).toBe(200);

    graph.alignView('lb');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left).toBe(10);
    expect(bbox.top + bbox.height).toBe(390);

    graph.alignView('rt');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + bbox.width).toBe(590);
    expect(bbox.top).toBe(10);

    graph.alignView('rc');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + bbox.width).toBe(590);
    expect(bbox.top + 0.5 * bbox.height).toBe(200);

    graph.alignView('rb');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + bbox.width).toBe(590);
    expect(bbox.top + bbox.height).toBe(390);

    graph.alignView('ct');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + 0.5 * bbox.width).toBe(300);
    expect(bbox.top).toBe(10);

    graph.alignView('cc');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + 0.5 * bbox.width).toBe(300);
    expect(bbox.top + 0.5 * bbox.height).toBe(200);

    graph.alignView('cb');
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + 0.5 * bbox.width).toBe(300);
    expect(bbox.top + bbox.height).toBe(390);
  });
});