import { Graph } from '../../../src/graph';
import { Stack } from '../../../src/components';
import { AddTargetCommand } from '../../../src/solutions/dag_flow_editor/commands';

describe('/src/commands/add_target', () => {
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

  const stack = new Stack(graph, {
    commands: { addTarget: AddTargetCommand }
  });

  it('add target should work', () => {
    stack.execute('addTarget', { configs: { id: '33' }, relativeNodeId: '3' });
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(3);
    expect(graph.getNodeById('33').sources).toEqual(['3']);
    expect(graph.getNodeById('33').targets).toEqual([]);

    stack.undo();
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getNodeById('3').targets).toEqual([]);
    expect(graph.getNodeById('33')).toBe(undefined);

    stack.redo();
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(3);
    expect(graph.getNodeById('33').sources).toEqual(['3']);
    expect(graph.getNodeById('33').targets).toEqual([]);

    stack.execute('addTarget', { configs: { id: '22' }, relativeNodeId: '2' });
    expect(graph.getNodes().length).toBe(5);
    expect(graph.getEdges().length).toBe(4);
    expect(graph.getNodeById('22').sources).toEqual(['2']);
    expect(graph.getNodeById('22').targets).toEqual(['3']);
    expect(graph.getNodeById('3').sources).toEqual(['22']);
    expect(graph.getNodeById('3').targets).toEqual(['33']);
    expect(graph.getNodeById('2').sources).toEqual(['1']);
    expect(graph.getNodeById('2').targets).toEqual(['22']);

    stack.undo();
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(3);
    expect(graph.getNodeById('3').sources).toEqual(['2']);
    expect(graph.getNodeById('3').targets).toEqual(['33']);
    expect(graph.getNodeById('2').sources).toEqual(['1']);
    expect(graph.getNodeById('2').targets).toEqual(['3']);
    expect(graph.getNodeById('22')).toBe(undefined);

    stack.redo();
    expect(graph.getNodes().length).toBe(5);
    expect(graph.getEdges().length).toBe(4);
    expect(graph.getNodeById('22').sources).toEqual(['2']);
    expect(graph.getNodeById('22').targets).toEqual(['3']);
    expect(graph.getNodeById('3').sources).toEqual(['22']);
    expect(graph.getNodeById('3').targets).toEqual(['33']);
    expect(graph.getNodeById('2').sources).toEqual(['1']);
    expect(graph.getNodeById('2').targets).toEqual(['22']);
  });

  it('collab should work', () => {
    graph.clear();
    stack.collab = true;

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

    let count = 0;
    graph.on('stackchange', (data) =>{
      const { action, change } = data;
      if (count === 0) {
        expect(action).toBe('add');
        expect(change.node.length).toBe(1);
        expect(change.edge.length).toBe(1);
        expect(change.node[0]).toEqual({id: '33'});
        expect(change.edge[0].source).toBe('3');
        expect(change.edge[0].target).toBe('33');
      }
      if (count === 1){
        expect(action).toBe('update');
        expect(change.node.length).toBe(1);
        expect(change.node[0]).toEqual({id: '3', targets: ['33']});
      }
      if (count === 2){
        expect(action).toBe('remove');
        expect(change.node.length).toBe(1);
        expect(change.node[0]).toEqual({ id: '33' });
      }
      if (count === 3) {
        expect(action).toBe('update');
        expect(change.node.length).toBe(1);
        expect(change.node[0]).toEqual({id: '3', targets: []});
      }
      count++;
    })

    stack.execute('addTarget', { configs: { id: '33' }, relativeNodeId: '3' });
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(3);
    expect(graph.getNodeById('33').sources).toEqual(['3']);
    expect(graph.getNodeById('33').targets).toEqual([]);

    stack.undo();
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getNodeById('3').targets).toEqual([]);
    expect(graph.getNodeById('33')).toBe(undefined);
  });

  it('execute remote should work',()=>{
    const graph2 = new Graph({
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
    const stack2 = new Stack(graph2, {commands: { addTarget: AddTargetCommand }, treeLike: true});
    const data = graph.getData();
    graph2.data(data);
    graph2.getNodeById('1').set('collapsed', true);
    graph2.getNodeById('2').hide();
    graph2.getNodeById('3').hide();
    graph2.on('executeRemote',(data)=>{
      stack2.executeRemote(data)
    });
    graph.on('stackchange', (data) =>{
      const { action, change } = data;
      graph2.emit('executeRemote', {
        action,
        change
      });
    });
    stack.execute('addTarget', { configs: { id: '3-1' }, relativeNodeId: '3' });
    expect(graph2.getNodes().length).toBe(4);
    expect(graph2.getEdges().length).toBe(3);
    expect(graph2.getNodeById('3-1').isVisible()).toBe(false);
    expect(graph2.getEdges()[2].isVisible()).toBe(false);
    stack.execute('addTarget', { configs: { id: '1-2' }, relativeNodeId: '1' });
    expect(graph2.getNodes().length).toBe(5);
    expect(graph2.getEdges().length).toBe(4);
    expect(graph2.getNodeById('1-2').isVisible()).toBe(false);
    expect(graph2.getEdges()[3].isVisible()).toBe(false);
    stack.execute('addTarget', { configs: { id: '3-1-1' }, relativeNodeId: '3-1' });
    expect(graph2.getNodes().length).toBe(6);
    expect(graph2.getEdges().length).toBe(5);
    expect(graph2.getNodeById('3-1-1').isVisible()).toBe(false);
    expect(graph2.getEdges()[4].isVisible()).toBe(false);
    stack.undo();
    expect(graph2.getNodes().length).toBe(5);
    expect(graph2.getEdges().length).toBe(4);
    graph.destroy();
  })
});