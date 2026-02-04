import { Graph } from '../../src';

describe('src/entities/edge.ts', () => {
  const div = document.createElement('div');
  const graph = new Graph({
    width: 1000,
    height: 400,
    container: div,
    setDefaultEdge(data: any) {
      if (data.data === 'a') {
        return { strokeStyle: 'blue' };
      }
      return { strokeStyle: 'red' }
    },
    setEdgeStateStyles(state: string, data: any) {
      if (state === 'a') {
        return { strokeStyle: '#eee' };
      }
      return { strokeStyle: '#ccc' };
    }
  });

  const node1 = graph.add('node', {
    type: 'rect',
    id: 'node1',
    x: 100,
    y: 100,
    width: 60,
    height: 30,
  });

  const node2 = graph.add('node', {
    type: 'rect',
    id: 'node2',
    x: 180,
    y: 230,
    width: 10,
    height: 10,
  });

  const edge = graph.add('edge', {
    source: 'node1',
    target: 'node2',
    data: 'a',
  });

  const group1 = graph.add('group', {
    id: 'group1',
  });

  const group2 = graph.add('group', {
    id: 'group2',
  });

  it('add & update edge should work', () => {
    const line = edge.getKeyShape();
    expect(edge.source).toBe(node1);
    expect(edge.target).toBe(node2);
    expect(line.get('strokeStyle')).toEqual('blue');
    expect(line.get('path')).toEqual([
      ['M', 109.23076923076923, 115],
      ['L', 176.92307692307693, 225]
    ]);
    expect(line.get('lineWidth')).toBe(1);
    expect(edge.getBBox()).toEqual({
      left: 108.73076923076923,
      top: 114.5,
      width: 68.69230769230771,
      height: 111,
    });
  });

  it('update edge should work', () => {
    // update attribute
    edge.updateData({
      data: 'b'
    });

    const line = edge.getKeyShape();
    expect(line.get('strokeStyle')).toEqual('red');
    expect(line.get('path')).toEqual([
      ['M', 109.23076923076923, 115],
      ['L', 176.92307692307693, 225]
    ]);

    // update source & target
    edge.updateData({
      source: 'node2',
      target: 'node1',
    });
    expect(line.get('strokeStyle')).toEqual('red');
    expect(line.get('path')).toEqual([
      ['M', 176.92307692307693, 225],
      ['L', 109.23076923076923, 115]
    ]);
    expect(edge.source).toBe(node2);
    expect(edge.target).toBe(node1);
  });

  it('updatePosition should work', () => {
    node1.updatePosition(400, 400, true);
    const line = edge.getKeyShape();
    expect(line.get('strokeStyle')).toEqual('red');
    expect(line.get('path')).toEqual([
      ['M', 176.92307692307693, 225],
      ['L', 109.23076923076923, 115]
    ]);
  });

  it('set & clear state should work', () => {
    edge.setState('a');
    const line = edge.getKeyShape();
    expect(line.get('strokeStyle')).toBe('#eee');
    expect(edge.states).toEqual(['a']);

    edge.setState('b');
    expect(line.get('strokeStyle')).toBe('#ccc');
    expect(edge.states).toEqual(['a', 'b']);

    edge.clearStates();
    expect(line.get('strokeStyle')).toEqual('red');
    expect(edge.states).toEqual([]);
  });

  it('getRealLinkEntities should work', () => {
    group1.addChild(node1);
    expect(edge.source).toBe(node2);
    expect(edge.target).toBe(group1);

    group2.addChild(node2);
    expect(edge.source).toBe(group2);
    expect(edge.target).toBe(group1);

    group2.addChild(group1);
    expect(edge.target).toBe(group1);
    expect(edge.source).toBe(node2);
  });

  it('bugfix: 0 should be a valid node id', () => {
    const n0 = graph.add('node', { id: 0, width: 140, height: 40 });
    const e1 = graph.add('edge', {
      source: 0,
      target: 'node1',
    });
    expect(e1.source).toEqual(n0);
    expect(e1.get('type')).not.toBe('loop');

    const e2 = graph.add('edge', {
      source: 0,
      target: 0,
    });
    expect(e2.get('type')).toBe('loop');
  });


  it('remove duplicate edge should work', () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 140, height: 40 }
      }
    });
    const node1 = graph.add('node', { id: '1' });
    const node2 = graph.add('node', { id: '2' });
    const edge1 = graph.add('edge', { source: '1', target: '2' });
    const edge2 = graph.add('edge', { source: '1', target: '2' });
    expect(node1.targets.length).toBe(1);
    expect(node1.targets[0]).toBe('2');
    expect(node1.edges.length).toBe(2);
    expect(node2.sources.length).toBe(1);
    expect(node2.sources[0]).toBe('1');
    expect(node2.edges.length).toBe(2);

    graph.removeDuplicateEdge(edge1);
    expect(node1.targets.length).toBe(1);
    expect(node1.targets[0]).toBe('2');
    expect(node1.edges.length).toBe(1);
    expect(node2.sources.length).toBe(1);
    expect(node2.sources[0]).toBe('1');
    expect(node2.edges.length).toBe(1);

    graph.remove(edge2);
    expect(node1.targets.length).toBe(0);
    expect(node1.edges.length).toBe(0);
    expect(node2.sources.length).toBe(0);
    expect(node2.edges.length).toBe(0);
    graph.clear();
  });

  it('bugfix: edge.updateData should set configs correctly', () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 140, height: 40 };
      },
      setDefaultEdge() {
        return { strokeStyle: '#ccc', lineWidth: 1, label: 'text' }
      }
    });

    graph.add('node', { id: '1' });
    graph.add('node', { id: '2' });
    const edge = graph.add('edge', { source: '1', target: '2' });
    const keyShape = edge.getKeyShape();
    const label = edge.getLabel();
    expect(keyShape.get('strokeStyle')).toBe('#ccc');
    expect(keyShape.get('lineWidth')).toBe(1);
    expect(label.get('text')).toBe('text');
    expect(label.get('textBaseline')).toBe('middle');

    edge.updateData({
      strokeStyle: '#ddd',
      lineWidth: 3,
      label: {
        text: 'update text',
        textBaseline: 'top',
      }
    });
    expect(keyShape.destroyed).toBe(false);
    expect(keyShape.get('strokeStyle')).toBe('#ddd');
    expect(keyShape.get('lineWidth')).toBe(3);
    expect(label.destroyed).toBe(false);
    expect(label.get('text')).toBe('update text');
    expect(label.get('textBaseline')).toBe('top');

    edge.updateData({ lineWidth: 1 });
    expect(keyShape.destroyed).toBe(false);
    expect(keyShape.get('strokeStyle')).toBe('#ccc');
    expect(keyShape.get('lineWidth')).toBe(1);
    expect(label.destroyed).toBe(false);
    expect(label.get('text')).toBe('text');
    expect(label.get('textBaseline')).toBe('middle');
  });
  it('bugfix: edge.getEdgeConfigs should remove adjacent duplicates', () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 100, height: 40 };
      },
      setDefaultEdge() {
        return { strokeStyle: '#ccc', lineWidth: 1, label: 'text' }
      }
    });

    graph.add('node', { id: '1', x: 100, y: 80 });
    graph.add('node', { id: '2', x: 200, y: 180 });
    const edge = graph.add('edge', { source: '1', target: '2', controlPoints: [[100, 100], [200, 200]] });
    let edgeConfigs = edge.getEdgeConfigs();
    expect(edgeConfigs.controlPoints).toEqual(undefined);
    expect(edgeConfigs.startPoint).toEqual([100, 100]);
    expect(edgeConfigs.endPoint).toEqual([200, 200]);
    edge.updateData({ controlPoints: [[100, 150], [200, 200]] });
    edgeConfigs = edge.getEdgeConfigs();
    expect(edgeConfigs.controlPoints).toEqual([[100, 150]]);
    expect(edgeConfigs.startPoint).toEqual([100, 100]);
    expect(edgeConfigs.endPoint).toEqual([200, 200]);
    graph.destroy();
  });

  it('bugfix: update type and source/target in the same time should update source/target node', () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 100, height: 40 };
      },
      setDefaultEdge() {
        return { type: 'line', strokeStyle: '#ccc', lineWidth: 1, label: 'text' }
      }
    });
    graph.add('node', { id: '1', x: 100, y: 80 });
    graph.add('node', { id: '2', x: 200, y: 180 });
    graph.add('node', { id: '3', x: 300, y: 180 });
    const edge = graph.add('edge', { source: '1', target: '2' });
    let edgeConfigs = edge.getEdgeConfigs();
    expect(edgeConfigs.source.get('id')).toBe('1');
    expect(edgeConfigs.target.get('id')).toBe('2');
    expect(edgeConfigs.type).toBe('line');
    edge.updateData({ type: 'vLine', source: '3', target: '2' });
    edgeConfigs = edge.getEdgeConfigs();
    expect(edgeConfigs.source.get('id')).toBe('3');
    expect(edgeConfigs.target.get('id')).toBe('2');
    graph.destroy();
  });


  it('bugfix: update source or target, node should update sources or targets.', () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 100, height: 40 };
      },
      setDefaultEdge() {
        return { type: 'line', strokeStyle: '#ccc', lineWidth: 1, label: 'text' }
      }
    });
    graph.add('node', { id: '1', x: 100, y: 80 });
    graph.add('node', { id: '2', x: 200, y: 180 });
    graph.add('node', { id: '3', x: 300, y: 180 });
    const edge = graph.add('edge', { source: '1', target: '1' });
    expect(graph.getNodeById('1').sources).toEqual([]);
    expect(graph.getNodeById('1').targets).toEqual(['1']);
    expect(graph.getNodeById('2').sources).toEqual([]);
    expect(graph.getNodeById('2').targets).toEqual([]);
    expect(graph.getNodeById('3').sources).toEqual([]);
    expect(graph.getNodeById('3').targets).toEqual([]);

    edge.updateData({ source: '3', target: '2' });

    expect(graph.getNodeById('1').sources).toEqual([]);
    expect(graph.getNodeById('1').targets).toEqual([]);
    expect(graph.getNodeById('2').sources).toEqual(['3']);
    expect(graph.getNodeById('2').targets).toEqual([]);
    expect(graph.getNodeById('3').sources).toEqual([]);
    expect(graph.getNodeById('3').targets).toEqual(['2']);

    edge.updateData({ source: '1', target: '3' });
    expect(graph.getNodeById('1').sources).toEqual([]);
    expect(graph.getNodeById('1').targets).toEqual(['3']);
    expect(graph.getNodeById('2').sources).toEqual([]);
    expect(graph.getNodeById('2').targets).toEqual([]);
    expect(graph.getNodeById('3').sources).toEqual(['1']);
    expect(graph.getNodeById('3').targets).toEqual([]);
    graph.destroy();
  })

  it('bugfix: use setSource/setTarget update source or target, node should update sources or targets.', () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 100, height: 40 };
      },
      setDefaultEdge() {
        return { type: 'line', strokeStyle: '#ccc', lineWidth: 1, label: 'text' }
      }
    });
    graph.add('node', { id: '1', x: 100, y: 80 });
    graph.add('node', { id: '2', x: 200, y: 180 });
    graph.add('node', { id: '3', x: 300, y: 180 });
    const edge = graph.add('edge', { source: '1', target: '2' });
    expect(graph.getNodeById('1').sources).toEqual([]);
    expect(graph.getNodeById('1').targets).toEqual(['2']);
    expect(graph.getNodeById('2').sources).toEqual(['1']);
    expect(graph.getNodeById('2').targets).toEqual([]);
    expect(graph.getNodeById('3').sources).toEqual([]);
    expect(graph.getNodeById('3').targets).toEqual([]);

    edge.setSource('3');

    expect(graph.getNodeById('1').sources).toEqual([]);
    expect(graph.getNodeById('1').targets).toEqual([]);
    expect(graph.getNodeById('2').sources).toEqual(['3']);
    expect(graph.getNodeById('2').targets).toEqual([]);
    expect(graph.getNodeById('3').sources).toEqual([]);
    expect(graph.getNodeById('3').targets).toEqual(['2']);

    // edge.updateData({ source: '1', target: '3' });
    edge.setSource('1');
    edge.setTarget('3');
    expect(graph.getNodeById('1').sources).toEqual([]);
    expect(graph.getNodeById('1').targets).toEqual(['3']);
    expect(graph.getNodeById('2').sources).toEqual([]);
    expect(graph.getNodeById('2').targets).toEqual([]);
    expect(graph.getNodeById('3').sources).toEqual(['1']);
    expect(graph.getNodeById('3').targets).toEqual([]);
    graph.destroy();
  });

  it('reversed v curve should have different controlPoints', () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 100, height: 40 };
      },
      setDefaultEdge() {
        return { type: 'cubic', adjustControlPoints: true }
      }
    });
    graph.data({
      nodes: [{
        id: '1',
        x: 100,
        y: 200,
        anchors: [[0.5, 1]],
      }, {
        id: '2',
        x: 400,
        y: 50,
        anchors: [[0.5, 0]]
      }
      ],
      edges: [{
        id: '11',
        source: '1',
        target: '2',
      }]
    });
    const edge = graph.getEdgeById('11');
    const cubic = edge.getKeyShape();
    expect(cubic.get('points')).toEqual([
      [100, 220],
      [160, 280],
      [340, -30],
      [400, 30]
    ]);

    graph.update(graph.getNodeById('2'), {
      x: 400,
      y: 400,
    });
    expect(cubic.get('points')).toEqual([
      [100, 220],
      [259.4117647058824, 282.3529411764706],
      [240.58823529411765, 317.6470588235294],
      [400, 380]
    ]);
    graph.destroy();
  });

  it('reversed h curve should have different controlPoints', () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 100, height: 40 };
      },
      setDefaultEdge() {
        return { type: 'cubic', adjustControlPoints: true }
      }
    });
    graph.data({
      nodes: [{
        id: '1',
        x: 100,
        y: 200,
        anchors: [[0, 0.5]],
      }, {
        id: '2',
        x: 400,
        y: 300,
        anchors: [[1, 0.5]]
      }
      ],
      edges: [{
        id: '11',
        source: '1',
        target: '2',
      }]
    });
    const edge = graph.getEdgeById('11');
    const cubic = edge.getKeyShape();
    expect(cubic.get('points')).toEqual([
      [50, 200],
      [-10, 260],
      [510, 240],
      [450, 300]
    ]);

    graph.destroy();
  });

  it('bugfix: background should be removed when update label', () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 100, height: 40 };
      },
      setDefaultEdge() {
        return {
          type: 'cubic',
          label: {
            text: 'test label',
            background: {
              fillStyle: '#ccc',
            },
          },
        }
      }
    });
    graph.data({
      nodes: [{
        id: '1',
        x: 100,
        y: 200,
        anchors: [[0, 0.5]],
      }, {
        id: '2',
        x: 400,
        y: 300,
        anchors: [[1, 0.5]]
      }
      ],
      edges: [{
        id: '11',
        source: '1',
        target: '2',
      }]
    });

    const edge = graph.getEdges()[0];
    const layer = edge.layer;
    expect(layer.children.length).toBe(3);
    expect(layer.children[0].type).toBe('cubic');
    expect(layer.children[1].type).toBe('rect');
    expect(layer.children[2].type).toBe('text');

    graph.update(edge, {
      label: null
    });
    expect(layer.children.length).toBe(1);
    expect(layer.children[0].type).toBe('cubic');
  });
});
