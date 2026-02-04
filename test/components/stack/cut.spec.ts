import { Graph } from '../../../src/graph';
import { Stack, CutCommand, SelectCommand, PasteCommand } from '../../../src/components';

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

describe('/src/commands/cut', () => {
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
        source: '1',
        target: '3'
      }
    ],
    groups: [{
      id: 'group',
      children: ['1', '2']
    }],
  });

  const stack = new Stack(graph, {
    commands: {
      cut: CutCommand,
      select: SelectCommand,
      paste: PasteCommand,
    }
  });

  it('cut should work for node', () => {
    stack.execute('select', { selections: [graph.getNodeById('1'), graph.getNodeById('2')] });
    const e = getEvent();

    stack.execute('cut', { event: e });
    expect(stack.stack.length).toBe(1);
    expect(graph.getNodes().length).toBe(1);
    expect(graph.getEdges().length).toBe(0);
    expect(graph.getNodeById('1')).toBe(undefined);
    expect(graph.getNodeById('2')).toBe(undefined);
    const configs = JSON.parse(e.clipboardData.getData());
    expect(configs.id).toBe('xgraphEditor');
    expect(configs.node.length).toBe(2);
    expect(configs.edge.length).toBe(0);
    expect(configs.group.length).toBe(0);

    stack.execute('paste', { event: e });
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(0);
    const node1 = graph.getNodes().filter((node: any) => node.get('x') === 200)[0];
    expect(node1.get('y')).toBe(100);

    const node2 = graph.getNodes().filter((node: any) => node.get('x') === 300)[0];
    expect(node2.get('y')).toBe(300);
    // const edge1 = graph.getEdges().filter((edge: any) => edge.get('target') === '2')[0];
    // expect(edge1.get('source')).toBe(node1.get('id'));
    // const edge2 = graph.getEdges().filter((edge: any) => edge.get('target') === '3')[0];
    // expect(edge2.get('source')).toBe(node1.get('id'));
  });
});