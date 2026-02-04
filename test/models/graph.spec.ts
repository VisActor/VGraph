import { Graph } from '../../src';

describe('src/graph/graph', () => {
  const div = document.createElement('div');
  const graph = new Graph({
    width: 1000,
    height: 400,
    container: div,
    setDefaultNode(nodeData: any) {
      return {
        width: 100,
        height: 20,
        fillStyle: '#666'
      };
    }
  });

  it('data should work', () => {
    graph.data({
      nodes: [{
        id: '1',
      }, {
        id: '2',
        fillStyle: '#ccc'
      }],
      edges: [{
        source: '1',
        target: '2'
      }],
    });

    expect(graph.getNodes().length).toBe(2);
    expect(graph.getEdges().length).toBe(1);

    const node1 = graph.getNodeById('1');
    const node2 = graph.getNodeById('2');
    const edge: any = graph.getEdges()[0];

    expect(node1.get('width')).toBe(100);
    expect(node1.get('height')).toBe(20);
    expect(node1.get('fillStyle')).toBe('#666');

    expect(node2.get('width')).toBe(100);
    expect(node2.get('height')).toBe(20);
    expect(node2.get('fillStyle')).toBe('#666');

    expect(edge.get('source')).toBe('1');
    expect(edge.get('target')).toBe('2');
    expect(edge.get('id')).not.toBe(undefined);
  });

  it('update should work', () => {
    graph.updateData({
      nodes: [{
        id: '3',
      }, {
        id: '2',
        fillStyle: '#f00'
      }],
      edges: [{
        source: '3',
        target: '2'
      }],
    });

    expect(graph.getNodes().length).toBe(2);
    expect(graph.getEdges().length).toBe(1);

    const node1 = graph.getNodeById('3');
    const node2 = graph.getNodeById('2');
    const edge: any = graph.getEdges()[0];

    expect(node1.get('width')).toBe(100);
    expect(node1.get('height')).toBe(20);
    expect(node1.get('fillStyle')).toBe('#666');

    expect(node2.get('width')).toBe(100);
    expect(node2.get('height')).toBe(20);
    expect(node2.get('fillStyle')).toBe('#f00');

    expect(edge.get('source')).toBe('3');
    expect(edge.get('target')).toBe('2');
    expect(edge.get('id')).not.toBe(undefined);
  });

  it('refresh should work', () => {
    const node1 = graph.getNodeById('3');
    const node2 = graph.getNodeById('2');
    const edge: any = graph.getEdges()[0];
    node1.configs.x = 100;
    node1.configs.y = 200;

    node2.configs.x = 300;
    node2.configs.y = 250;

    graph.refresh();

    expect(node1.layer.configs.x).toBe(100);
    expect(node1.layer.configs.y).toBe(200);
    expect(node2.layer.configs.x).toBe(300);
    expect(node2.layer.configs.y).toBe(250);

    expect(edge.getKeyShape().get('path')).toEqual([
      ['M', 140, 210],
      ['L', 260, 240]
    ]);
  });

  it('update should work', () => {
    graph.set('setDefaultNode', (nodeData: any) => {
      return {
        width: 50,
        height: 50,
        fillStyle: '#0f0'
      };
    });
    graph.updateEntities();

    const node1 = graph.getNodeById('3');
    const node2 = graph.getNodeById('2');
    const edge: any = graph.getEdges()[0];

    expect(node1.get('width')).toBe(50);
    expect(node1.get('height')).toBe(50);
    expect(node1.get('fillStyle')).toBe('#0f0');

    expect(node2.get('width')).toBe(50);
    expect(node2.get('height')).toBe(50);
    expect(node2.get('fillStyle')).toBe('#0f0');

    expect(edge.getKeyShape().get('path')).toEqual([
      ['M', 125, 206.25],
      ['L', 275, 243.75]
    ]);
  });

  it('bugfix: setDefaultNode specify id should work', () => {
    const g = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode(nodeData: any) {
        return { id: nodeData.name, width: 140, height: 40 }
      },
      setDefaultEdge(edgeData: any) {
        return { id: edgeData.name }
      }
    });

    g.data({
      nodes: [
        { name: '1' },
        { name: '2' },
      ],
      edges: [{ name: '12', source: '1', target: '2' }]
    });

    expect(g.getNodeById('1')).not.toBe(undefined);
    expect(g.getNodeById('2')).not.toBe(undefined);
    expect(g.getNodeById('12')).toBe(undefined);
    expect(g.getEdgeById('12')).not.toBe(undefined);

    g.destroy();
  });

  it('bugfix: update group should work', () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode(nodeData: any) {
        return {
          width: 140,
          height: 40
        }
      },
    });

    graph.data({
      nodes: [{
        id: '1',
        x: 100,
        y: 100
      }, {
        id: '2',
        x: 100,
        y: 100
      }],
      edges: [],
      groups: [{
        id: 'group1',
        children: ['1', '2']
      }]
    });

    const group = graph.getGroupById('group1');
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getNodes()[0].belong).toBe(group);
    expect(graph.getNodes()[1].belong).toBe(group);

    graph.updateData({
      nodes: [{
        id: '1',
        x: 100,
        y: 100
      }, {
        id: '2',
        x: 100,
        y: 100
      }],
      edges: [],
      groups: [{
        id: 'group1',
        children: ['1']
      }, {
        id: 'group2',
        children: ['2']
      }]
    });
    const group2 = graph.getGroupById('group2');
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getGroups().length).toBe(2);
    expect(graph.getNodeById('1').belong).toBe(group);
    expect(graph.getNodeById('2').belong).toBe(group2);
    expect(group.children.length).toBe(1);
    expect(group2.children.length).toBe(1);

    graph.updateData({
      nodes: [{
        id: '1',
        x: 100,
        y: 100
      }, {
        id: '2',
        x: 100,
        y: 100
      }, {
        id: '3',
        x: 100,
        y: 100
      }],
      edges: [],
      groups: [{
        id: 'group1',
        children: ['2', '3']
      }]
    });

    expect(graph.getNodes().length).toBe(3);
    expect(graph.getNodeById('1').belong).toBe(null);
    expect(graph.getNodeById('2').belong).toBe(group);
    expect(graph.getNodeById('3').belong).toBe(group);
    expect(group.children.length).toBe(2);
    expect(group2.isDestroyed());

    graph.destroy();
  });

  it('bugfix: update with number id should work', () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode(nodeData: any) {
        return {
          width: 140,
          height: 40
        }
      },
    });

    let dataRaw = {
      nodes: [{
        id: 1,
        x: 100,
        y: 100
      }, {
        id: 2,
        x: 100,
        y: 100
      }],
      edges: [],
      groups: [{
        id: 'group1',
        children: [1, 2]
      }]
    }
    let data = JSON.parse(JSON.stringify(dataRaw));
    graph.data(data);

    const group = graph.getGroupById('group1');
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getNodes()[0].belong).toBe(group);
    expect(graph.getNodes()[1].belong).toBe(group);

    dataRaw = {
      nodes: [{
        id: 1,
        x: 100,
        y: 100
      }, {
        id: 2,
        x: 100,
        y: 100
      }],
      edges: [],
      groups: [{
        id: 'group1',
        children: [1]
      }, {
        id: 'group2',
        children: [2]
      }]
    };
    data = JSON.parse(JSON.stringify(dataRaw));
    graph.updateData(data);
    const group2 = graph.getGroupById('group2');
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getGroups().length).toBe(2);
    expect(graph.getNodeById(data.nodes[0].id).belong).toBe(group);
    expect(graph.getNodeById(data.nodes[1].id).belong).toBe(group2);
    expect(group.children.length).toBe(1);
    expect(group2.children.length).toBe(1);


    dataRaw = {
      nodes: [{
        id: 1,
        x: 100,
        y: 100
      }, {
        id: 2,
        x: 100,
        y: 100
      }, {
        id: 3,
        x: 100,
        y: 100
      }],
      edges: [],
      groups: [{
        id: 'group1',
        children: [2, 3]
      }]
    };
    data = JSON.parse(JSON.stringify(dataRaw));
    graph.updateData(data);

    graph.updateData(data);

    expect(graph.getNodes().length).toBe(3);
    expect(graph.getNodeById(data.nodes[0].id).belong).toBe(null);
    expect(graph.getNodeById(data.nodes[1].id).belong).toBe(group);
    expect(graph.getNodeById(data.nodes[2].id).belong).toBe(group);
    expect(group.children.length).toBe(2);
    expect(group2.isDestroyed());

    graph.destroy();
  });

  it('bugfix: set id in setDefaultXxx should work for update', () => {
    const graph: any = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode(nodeData: any) {
        return {
          width: 140,
          height: 40,
          id: nodeData.name
        }
      },
      setDefaultEdge(edgeData: any) {
        return {
          id: `${edgeData.source}-${edgeData.target}`
        }
      }
    });

    graph.data({
      nodes: [{
        name: 'a',
        x: 100,
        y: 100
      }, {
        name: 'b',
        x: 100,
        y: 100
      }, {
        name: 'c',
        x: 100,
        y: 100
      }],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'a', target: 'c' }
      ],
    });
    const a = graph.getNodeById('a').layer;
    const b = graph.getEdgeById('a-b').layer;


    graph.updateData({
      nodes: [{
        name: 'a',
        x: 100,
        y: 100
      }, {
        name: 'b',
        x: 100,
        y: 100
      }, {
        name: 'd',
        x: 100,
        y: 100
      }],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'a', target: 'd' }
      ],
    });

    expect(a.destroyed).toBe(false);
    expect(b.destroyed).toBe(false);
    expect(Object.keys(graph.entityMap.node)).toEqual(['a', 'b', 'd']);
    expect(Object.keys(graph.entityMap.edge)).toEqual(['a-b', 'a-d']);
  });

  it('dom node should work', () => {
    const graph: any = new Graph({
      width: 1000,
      height: 400,
      renderMode: 'dom',
      container: div,
      setDefaultNode(nodeData: any) {
        return {
          width: 140,
          height: 40,
          id: nodeData.name
        }
      },
      setDefaultEdge(edgeData: any) {
        return {
          id: `${edgeData.source}-${edgeData.target}`
        }
      }
    });

    graph.data({
      nodes: [{
        name: 'a',
        x: 100,
        y: 100
      }, {
        name: 'b',
        x: 200,
        y: 100
      }],
      edges: [
        { source: 'a', target: 'b' },
      ],
    });
    const aNode = graph.getNodeById('a');
    const a = aNode.layer;
    const b = graph.getNodeById('b').layer;
    const edge = graph.getEdgeById('a-b');

    // init
    expect(a.children.length).toBe(0);
    expect(b.children.length).toBe(0);
    expect(edge.layer.children.length).toBe(1);

    // update
    graph.update(aNode, { fillStyle: '#fff', state: '111', type: 'icon' });
    expect(aNode.get('state')).toBe('111');
    expect(aNode.get('type')).toBe('icon');
    expect(a.children.length).toBe(0);
    expect(aNode.getLinkPoint([200, 100])).toEqual([170, 100]);
    expect(edge.getKeyShape().get('path')[0]).toEqual(['M', 170, 100]);
    graph.update(aNode, { width: 100, height: 50 });
    expect(a.children.length).toBe(0);
    expect(a.get('width')).toBe(100);
    expect(a.get('height')).toBe(50);
    expect(aNode.getLinkPoint([200, 100])).toEqual([150, 100]);
    expect(edge.getKeyShape().get('path')[0]).toEqual(['M', 150, 100]);
    graph.update(aNode, { x: 300, width: 100 });
    expect(a.children.length).toBe(0);
    expect(aNode.getLinkPoint([200, 100])).toEqual([250, 100]);
    expect(edge.getKeyShape().get('path')[0]).toEqual(['M', 250, 100]);

    // setState
    aNode.setState('a');
    aNode.setState('a');
    expect(aNode.states).toEqual(['a']);
    aNode.setState('b');
    expect(aNode.states).toEqual(['a', 'b']);
    aNode.removeState('a');
    expect(aNode.states).toEqual(['b']);
    expect(aNode.hasState('a')).toBe(false);
    expect(aNode.hasState('b')).toBe(true);
    aNode.clearStates();
    expect(aNode.states).toEqual([]);

    // destroy
    graph.remove(a);
    expect(aNode.isDestroyed());
    expect(a.destroyed);

    graph.destroy();
  });

  it('dom node in a group should work', () => {
    const graph: any = new Graph({
      width: 1000,
      height: 400,
      renderMode: 'dom',
      container: div,
      setDefaultNode(nodeData: any) {
        return {
          width: 140,
          height: 40,
          id: nodeData.name
        }
      },
      setDefaultEdge(edgeData: any) {
        return {
          id: `${edgeData.source}-${edgeData.target}`
        }
      }
    });

    graph.data({
      nodes: [{
        name: 'a',
        x: 100,
        y: 100,
        groupId: 'group1',
      }, {
        name: 'b',
        x: 200,
        y: 100,
        groupId: 'group2'
      }],
      edges: [
        { source: 'a', target: 'b' },
      ],
      groups: [
        { id: 'group1' },
        { id: 'group2' }
      ]
    });

    const a = graph.getNodeById('a');
    const b = graph.getNodeById('b');
    const group1 = graph.getGroupById('group1');
    const group2 = graph.getGroupById('group2');

    expect(a.layer.children.length).toBe(0);
    expect(b.layer.children.length).toBe(0);
    expect(group1.layer.children.length).toBe(1);
    expect(group2.layer.children.length).toBe(1);
    expect(group1.children.length).toBe(1);
    expect(group2.children.length).toBe(1);

    graph.update(a, { groupId: 'group2' });
    expect(a.layer.children.length).toBe(0);
    expect(b.layer.children.length).toBe(0);
    expect(group1.children.length).toBe(0);
    expect(group2.children.length).toBe(2);

    graph.remove(a);
    expect(group1.children.length).toBe(0);
    expect(group2.children.length).toBe(1);
    graph.remove(b);
    expect(group1.children.length).toBe(0);
    expect(group2.children.length).toBe(0);

    graph.destroy();
  });
});
