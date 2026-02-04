import { Graph } from '../../../src/graph';
import { Stack, AddCommand } from '../../../src/components';

describe('/src/commands/add', () => {
  const div = document.createElement('div');
  const graph = new Graph({
    width: 800,
    height: 600,
    container: div,
    setDefaultNode(nodeData: any) {
      return {
        width: 100,
        height: 40,
      };
    }
  });

  graph.add('node', { id: '111' });

  const stack = new Stack(graph, {
    commands: { add: AddCommand }
  });

  it('add should work for node', () => {
    stack.execute('add', {
      configs: { id: '111' }
    });
    expect(graph.getNodes().length).toBe(1);
    expect(graph.getNodes()[0].hasState('select'));
    expect(stack.stack.length).toBe(0);

    stack.execute('add', {
      configs: { test: 'test111' }
    });
    expect(stack.stack.length).toBe(1);
    expect(graph.getNodes().length).toBe(2);
    const nodes = graph.getNodes().filter((node: any) => node.get('test') === 'test111');
    expect(nodes.length).toBe(1);
    let n = nodes[0];
    const id = n.get('id');
    expect(stack.stack[0].data.id).toBe(id);
    expect(stack.stack[0].data.configs).toEqual({
      id,
      test: 'test111'
    });
    stack.undo();
    expect(graph.getNodes().length).toBe(1);
    expect(n.layer.destroyed);

    stack.redo();
    expect(graph.getNodes().length).toBe(2);
    n = graph.getNodes().filter((node: any) => node.get('test') === 'test111')[0];
    expect(n.get('id')).toBe(id);
    expect(n.get('test')).toBe('test111');
  });

  it('add should work for edge', () => {
    graph.add('node', { id: '222' });
    stack.execute('add', {
      type: 'edge',
      configs: {
        source: '111',
        target: '222',
        fillStyle: '#ccc',
      }
    });

    expect(graph.getEdges().length).toBe(1);
    let edge = graph.getEdges()[0];
    expect(edge.get('source')).toBe('111');
    expect(edge.get('target')).toBe('222');
    expect(edge.get('fillStyle')).toBe('#ccc');

    expect(stack.stack[1].data.id).toBe(edge.get('id'));
    expect(stack.stack[1].data.configs).toEqual({
      id: edge.get('id'),
      source: '111',
      target: '222',
      fillStyle: '#ccc',
    });

    stack.undo();
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(0);
    expect(edge.layer.destroyed);

    stack.redo();
    expect(graph.getEdges().length).toBe(1);
    edge = graph.getEdges()[0];
    expect(edge.get('source')).toBe('111');
    expect(edge.get('target')).toBe('222');
    expect(edge.get('fillStyle')).toBe('#ccc');
  });

  it('add should work for group', () => {
    stack.execute('add', {
      type: 'group',
      configs: {
        id: 'group',
        children: ['111']
      }
    });
    expect(graph.getGroups().length).toBe(1);
    let group = graph.getGroupById('group');
    expect(group).not.toBe(undefined);
    expect(group.children.length).toBe(1);
    expect(graph.getNodeById('111').belong).toBe(group);

    stack.undo()
    expect(graph.getGroups().length).toBe(0);
    expect(graph.getGroupById('group')).toBe(undefined);
    expect(graph.getNodeById('111').belong).toBe(null);

    stack.redo();
    expect(graph.getGroups().length).toBe(1);
    group = graph.getGroupById('group');
    expect(group.children.length).toBe(1);
    expect(graph.getNodeById('111').belong).toBe(group);
  });

  it('collab should work', () => {
    graph.clear();
    stack.collab = true;
    stack.execute('add', {
      configs: { id: '111' }
    });
    expect(graph.getNodes().length).toBe(1);
    expect(graph.getNodes()[0].hasState('select'));
    expect(graph.get('_selections')).toEqual({
      node: ['111'],
      edge: [],
      group: [],
    });

    stack.executeRemote({
      action: 'remove',
      change: {
        node: [{ id: '111' }]
      }
    });
    expect(graph.getNodes().length).toBe(0);
    expect(graph.get('_selections')).toEqual({
      node: [],
      edge: [],
      group: [],
    });
    stack.undo();
    expect(graph.get('_selections')).toEqual({
      node: [],
      edge: [],
      group: ['group'],
    });
    expect(graph.getNodes().length).toBe(0);
    stack.redo();
    expect(graph.getNodes().length).toBe(1);
    expect(graph.getNodes()[0].hasState('select'));
  });
});