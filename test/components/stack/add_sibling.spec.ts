import { Graph } from '../../../src/graph';
import { Stack } from '../../../src/components';
import { AddSiblingCommand } from '../../../src/solutions/dag_flow_editor/commands';

describe('/src/commands/add_sibling', () => {
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
    commands: { addSibling: AddSiblingCommand }
  });

  it('add sibling should work', () => {
    stack.execute('addSibling', { configs: { id: '222' }, relativeNodeId: '111' });
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getNodeById('222')).not.toBe(undefined);
    expect(graph.getEdges().length).toBe(0);
    stack.undo();
    expect(graph.getNodes().length).toBe(1);
    expect(graph.getNodeById('222')).toBe(undefined);
    stack.redo();
    graph.add('edge', {
      source: '111',
      target: '222'
    });

    stack.execute('addSibling', { configs: { id: '333' }, relativeNodeId: '111' });
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getNodeById('222').sources).toEqual(['111', '333']);
    expect(graph.getNodeById('222').targets).toEqual([]);
    expect(graph.getNodeById('333')).not.toBe(undefined);
    expect(graph.getNodeById('333').sources).toEqual([]);
    expect(graph.getNodeById('333').targets).toEqual(['222']);

    stack.undo();
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getEdges().length).toBe(1);
    expect(graph.getNodeById('222').sources).toEqual(['111']);
    expect(graph.getNodeById('222').targets).toEqual([]);
    expect(graph.getNodeById('333')).toBe(undefined);

    stack.redo();
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getNodeById('222').sources).toEqual(['111', '333']);
    expect(graph.getNodeById('222').targets).toEqual([]);
    expect(graph.getNodeById('333')).not.toBe(undefined);
    expect(graph.getNodeById('333').sources).toEqual([]);
    expect(graph.getNodeById('333').targets).toEqual(['222']);
  });

  it('should work with multiple sources & targets', () => {
    graph.data({
      nodes: [
        { id: '1', x: 200, y: 100 },
        { id: '2', x: 300, y: 300 },
        { id: '3', x: 100, y: 200 }
      ],
      edges: [
        {
          id: '11',
          source: '1',
          target: '2',
        }, {
          id: '22',
          source: '2',
          target: '3'
        }
      ],
    });

    stack.execute('addSibling', { configs: { id: '22' }, relativeNodeId: '2' });
    expect(graph.getNodeById('1').sources).toEqual([]);
    expect(graph.getNodeById('1').targets).toEqual(['2', '22']);
    expect(graph.getNodeById('3').sources).toEqual(['2', '22']);
    expect(graph.getNodeById('3').targets).toEqual([]);
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(4);
    expect(graph.getNodeById('22').sources).toEqual(['1']);
    expect(graph.getNodeById('22').targets).toEqual(['3']);

    stack.undo();
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getNodeById('1').sources).toEqual([]);
    expect(graph.getNodeById('1').targets).toEqual(['2']);
    expect(graph.getNodeById('3').sources).toEqual(['2']);
    expect(graph.getNodeById('3').targets).toEqual([]);

    stack.redo();
    expect(graph.getNodeById('1').sources).toEqual([]);
    expect(graph.getNodeById('1').targets).toEqual(['2', '22']);
    expect(graph.getNodeById('3').sources).toEqual(['2', '22']);
    expect(graph.getNodeById('3').targets).toEqual([]);
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(4);
    expect(graph.getNodeById('22').sources).toEqual(['1']);
    expect(graph.getNodeById('22').targets).toEqual(['3']);

    graph.destroy();
  });
});