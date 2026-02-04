import { Graph } from '../../../src/graph';
import { Stack, CopyCommand, SelectCommand } from '../../../src/components';
import { PasteAsChildrenCommand } from '../../../src/solutions/dag_flow_editor/commands';

function getEvent() {
  return {
    preventDefault() { },
    clipboardData: {
      data: '',
      setData(type: string, data: string) {
        this.data = data;
      },
      getData() {
        return this.data;
      }
    }
  }
}

describe('/src/commands/copy', () => {
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
      { id: '1', x: 100, y: 100 },
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
        source: '1',
        target: '3'
      }
    ],
  });

  const stack = new Stack(graph, {
    commands: {
      copy: CopyCommand,
      select: SelectCommand,
      pasteAsChildren: PasteAsChildrenCommand,
    }
  });

  it('paste as children should work', () => {
    stack.execute('select', {selections: [
      graph.getNodeById('1'),
      graph.getNodeById('2'),
      graph.getEdgeById('11')
    ]})
    const event = getEvent();
    stack.execute('copy', { event });
    expect(stack.stack.length).toBe(0);
    const configs = JSON.parse(event.clipboardData.getData());
    expect(configs.id).toBe('xgraphEditor');
    expect(configs.node.length).toBe(2);
    expect(configs.edge.length).toBe(1);

    stack.execute('pasteAsChildren', { event, parentId: '3' });
    expect(stack.stack.length).toBe(1);
    expect(graph.getNodes().length).toBe(5);
    expect(graph.getEdges().length).toBe(4);
    expect(graph.getNodeById('3').targets.length).toBe(1);
    const rootId = graph.getNodeById('3').targets[0];
    let root = graph.getNodeById(rootId);
    expect(root.targets.length).toBe(1);
    expect(root.sources).toEqual(['3']);

    stack.undo();
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getNodeById('3').targets.length).toBe(0);
    expect(root.isDestroyed());

    stack.redo();
    expect(graph.getNodes().length).toBe(5);
    expect(graph.getEdges().length).toBe(4);
    expect(graph.getNodeById('3').targets.length).toBe(1);
    root = graph.getNodeById(rootId);
    expect(root.targets.length).toBe(1);
    expect(root.sources).toEqual(['3']);
  });

  it('paste nodes should work', () => {
    stack.execute('select', {selections: [
      graph.getNodeById('1'),
      graph.getNodeById('2'),
    ]});
    const event = getEvent();
    stack.execute('copy', { event });
    expect(stack.stack.length).toBe(1);
    const configs = JSON.parse(event.clipboardData.getData());
    expect(configs.id).toBe('xgraphEditor');
    expect(configs.node.length).toBe(2);
    expect(configs.edge.length).toBe(0);

    stack.execute('pasteAsChildren', { event, parentId: '3' });
    expect(stack.stack.length).toBe(2);
    expect(graph.getNodes().length).toBe(7);
    expect(graph.getEdges().length).toBe(6);
    expect(graph.getNodeById('3').targets.length).toBe(3);
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
    stack.collab = true;
    const stack2 = new Stack(graph2, {commands: { addTarget: PasteAsChildrenCommand }, treeLike: true});
    const data = graph.getData();
    graph2.data(data);
    // collapsed node 3
    graph2.getNodeById('3').set('collapsed', true);
    graph2.getNodes()[3].hide();
    graph2.getNodes()[4].hide();
    graph2.getNodes()[5].hide();
    graph2.getNodes()[6].hide();
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

    stack.execute('select', {selections: [
      graph.getNodes()[2],
      graph.getNodes()[3],
      graph.getNodes()[4],
      graph.getNodes()[5],
      graph.getNodes()[6],
      graph.getEdges()[2],
      graph.getEdges()[3],
      graph.getEdges()[4],
      graph.getEdges()[5],
    ]})
    const event = getEvent();
    stack.execute('copy', { event });
    stack.execute('pasteAsChildren', { event, parentId: '3' }); // 粘贴在收起的节点上。隐藏
    expect(graph.getNodes().length).toBe(12)
    expect(graph2.getNodes().length).toBe(12);
    expect(graph.getEdges().length).toBe(11);
    expect(graph2.getEdges().length).toBe(11);
    expect(graph2.getNodes()[7].isVisible()).toBe(false);
    expect(graph2.getNodes()[8].isVisible()).toBe(false);
    expect(graph2.getNodes()[9].isVisible()).toBe(false);
    expect(graph2.getNodes()[10].isVisible()).toBe(false);
    expect(graph2.getNodes()[11].isVisible()).toBe(false);
    expect(graph2.getEdges()[6].isVisible()).toBe(false);
    expect(graph2.getEdges()[7].isVisible()).toBe(false);
    expect(graph2.getEdges()[8].isVisible()).toBe(false);
    expect(graph2.getEdges()[9].isVisible()).toBe(false);
    expect(graph2.getEdges()[10].isVisible()).toBe(false);
    stack.undo();
    expect(graph.getNodes().length).toBe(7)
    expect(graph2.getNodes().length).toBe(7);
    expect(graph.getEdges().length).toBe(6);
    expect(graph2.getEdges().length).toBe(6);
    stack.execute('copy', { event });
    stack.execute('pasteAsChildren', { event, parentId: '2' }); // 粘贴在未被收起的节点上。不隐藏。
    expect(graph2.getNodes()[7].isVisible()).toBe(true);
    expect(graph2.getNodes()[8].isVisible()).toBe(true);
    expect(graph2.getNodes()[9].isVisible()).toBe(true);
    expect(graph2.getNodes()[10].isVisible()).toBe(true);
    expect(graph2.getNodes()[11].isVisible()).toBe(true);
    expect(graph2.getEdges()[6].isVisible()).toBe(true);
    expect(graph2.getEdges()[7].isVisible()).toBe(true);
    expect(graph2.getEdges()[8].isVisible()).toBe(true);
    expect(graph2.getEdges()[9].isVisible()).toBe(true);
    expect(graph2.getEdges()[10].isVisible()).toBe(true);
  });
});
