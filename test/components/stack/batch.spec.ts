import { Graph } from '../../../src/graph';
import { Stack, BatchCommand, SelectCommand } from '../../../src/components';

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

  const stack = new Stack(graph, {
    commands: { batch: BatchCommand, select: SelectCommand }
  });

  const node = graph.add('node', { id: '111' });
  stack.execute('select', { selections: [node] });

  it('batch should work', () => {
    expect(graph.getNodes().length).toBe(1);
    stack.execute('batch', {
      formerData: {},
      currentData: {
        nodes: [{ id: '111' }, { id: '222' }],
        edges: [{ source: '111', target: '222' }],
        groups: [{ id: 'group', children: ['111'] }],
        selections: {
          node: ['222'],
          edge: [],
          group: [],
        }
      },
    });

    stack.undo();
    expect(graph.getNodes().length).toBe(0);
    expect(graph.getEdges().length).toBe(0);
    expect(graph.getGroups().length).toBe(0);
    expect(graph.get('_selections')).toEqual({
      node: ['111'],
      edge: [],
      group: [],
    });

    stack.redo();
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getEdges().length).toBe(1);
    expect(graph.getGroups().length).toBe(1);
    expect(graph.get('_selections')).toEqual({
      node: ['222'],
      edge: [],
      group: [],
    });

    expect(graph.getNodeById('111')).not.toBe(undefined);
    expect(graph.getNodeById('111').belong).toBe(graph.getGroupById('group'));
    expect(graph.getNodeById('222')).not.toBe(undefined);
    expect(graph.getEdges()[0].get('source')).toBe('111');
    expect(graph.getEdges()[0].get('target')).toBe('222');

    stack.undo();
    expect(graph.getNodes().length).toBe(0);
    expect(graph.getEdges().length).toBe(0);
    expect(graph.getGroups().length).toBe(0);
  });
});