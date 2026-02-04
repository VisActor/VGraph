import { Graph, GroupUtils } from '../../src';

describe('src/utils/group.ts', () => {
  const div = document.createElement('div');
  const graph = new Graph({
    width: 1000,
    height: 400,
    container: div,
    setDefaultNode() {
      return { width: 100, height: 100 };
    },
    setDefaultGroup() {
      return { padding: 10 };
    },
  });

  const rawData: any = {
    nodes: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }, { id: '6' }],
    edges: [
      { source: '3', target: '4' },
      { source: '2', target: '3' },
      { source: '1', target: '2' },
      { source: '1', target: '5' },
      { source: 'group', target: '6' },
    ],
    groups: [
      {
        id: 'group',
        children: ['5', '2', '3'],
      },
    ],
  };

  it('getCollapsableData should work', () => {
    const data = GroupUtils.getCollapsableData(rawData);
    expect(data.nodes.length).toBe(4);
    expect(data.nodes[0]).toEqual({
      id: '1',
    });
    expect(data.nodes[1]).toEqual({
      id: '4',
    });
    expect(data.nodes[2]).toEqual({
      id: '6',
    });
    expect(data.nodes[3]).toEqual({
      id: 'group',
      __data: { id: 'group', children: ['5', '2', '3'] },
      children: ['5', '2', '3'],
      childNodes: [
        {
          id: '5',
          group: 'group',
        },
        {
          id: '2',
          group: 'group',
        },
        {
          id: '3',
          group: 'group',
        },
      ],
      childEdges: [{ source: '2', target: '3' }],
    });

    expect(data.edges).toEqual([
      { source: 'group', target: '4', sourceIndex: 0, sourceRoute: ['3', 'group'] },
      { source: '1', target: 'group', targetIndex: 0, targetRoute: ['2', 'group'] },
      { source: '1', target: 'group', targetIndex: 0, targetRoute: ['5', 'group'] },
      { source: 'group', target: '6' },
    ]);
  });

  it('expandGroupNode should work', () => {
    const data = GroupUtils.getCollapsableData(rawData);
    graph.data(data);
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(4);

    // expand group should work
    GroupUtils.expandGroupNode(graph, graph.getNodeById('group'));
    expect(graph.getNodes().length).toBe(6);
    expect(graph.getEdges().length).toBe(5);
    expect(graph.getNodes().map((node) => node.get('id'))).toEqual(['1', '2', '3', '4', '5', '6']);

    expect(
      graph.getEdges().map((edge) => {
        return { source: edge.get('source'), target: edge.get('target') };
      })
    ).toEqual([
      { source: '2', target: '3' },
      { source: '3', target: '4' },
      { source: '1', target: '2' },
      { source: '1', target: '5' },
      { source: 'group', target: '6' },
    ]);

    // expand child node without data, graph should not change
    GroupUtils.expandGroupNode(graph, graph.getNodeById('1'));
    expect(graph.getNodes().length).toBe(6);
    expect(graph.getEdges().length).toBe(5);

    // expand child node with data should work
    GroupUtils.expandGroupNode(graph, graph.getNodeById('1'), {
      nodes: [
        {
          id: '7',
        },
        {
          id: '8',
        },
      ],
      edges: [
        {
          source: '7',
          target: '8',
        },
      ],
    });
    expect(graph.getNodes().length).toBe(7);
    expect(graph.getEdges().length).toBe(6);
    expect(graph.getNodes().map((node) => node.get('id'))).toEqual(['2', '3', '4', '5', '6', '7', '8']);
    expect(
      graph.getEdges().map((edge) => {
        return { source: edge.get('source'), target: edge.get('target') };
      })
    ).toEqual([
      { source: '2', target: '3' },
      { source: '3', target: '4' },
      { source: 'group', target: '6' },
      { source: '7', target: '8' },
      { source: '1', target: '2' },
      { source: '1', target: '5' },
    ]);
  });

  it('collapse group should work', () => {
    let group = GroupUtils.collapseGroup(graph, graph.getGroupById('group'));
    expect(graph.getNodes().length).toBe(5);
    expect(graph.getEdges().length).toBe(5);
    expect(graph.getNodes().map((node) => node.get('id'))).toEqual(['4', '6', '7', '8', 'group']);
    expect(
      graph.getEdges().map((edge) => {
        return { source: edge.get('source'), target: edge.get('target') };
      })
    ).toEqual([
      { source: 'group', target: '4' },
      { source: '7', target: '8' },
      { source: '1', target: 'group' },
      { source: '1', target: 'group' },
      { source: 'group', target: '6' },
    ]);
    expect(group.configs.childNodes.map((d: any) => d.id)).toEqual(['5', '2', '3']);
    expect(group.configs.childNodes.length).toBe(3);
    expect(group.configs.childEdges.length).toBe(1);
    expect(group.configs.childEdges[0].source).toBe('2');
    expect(group.configs.childEdges[0].target).toBe('3');

    group = GroupUtils.collapseGroup(graph, graph.getGroupById('1'));
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(4);
    expect(graph.getNodes().map((node) => node.get('id'))).toEqual(['1', '4', '6', 'group']);
    expect(
      graph.getEdges().map((edge) => {
        return { source: edge.get('source'), target: edge.get('target') };
      })
    ).toEqual([
      { source: 'group', target: '4' },
      { source: 'group', target: '6' },
      { source: '1', target: 'group' },
      { source: '1', target: 'group' },
    ]);
    expect(group.configs.childNodes.length).toBe(2);
    expect(group.configs.childEdges.length).toBe(1);
    expect(group.configs.childNodes.map((d: any) => d.id)).toEqual(['7', '8']);
    expect(group.configs.childEdges[0].source).toBe('7');
    expect(group.configs.childEdges[0].target).toBe('8');

    graph.destroy();
  });

  it('bugfix: raw data should be kept before initiating', () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 100, height: 40, opacity: 0, fillStyle: 'red' };
      },
      setDefaultGroup() {
        return { padding: 10, opacity: 1, strokeStyle: 'blue' };
      },
    });

    const data = GroupUtils.getCollapsableData({
      nodes: [{ id: '1' }, { id: '2' }],
      edges: [{ source: '1', target: '2' }],
      groups: [{ id: 'group', children: ['1', '2'] }],
    });

    graph.data(data);
    expect(graph.getNodeById('group').get('opacity')).toBe(0);
    expect(graph.getNodeById('group').get('fillStyle')).toBe('red');
    GroupUtils.expandGroupNode(graph, graph.getNodeById('group'));
    expect(graph.getGroupById('group').get('opacity')).toBe(1);
    expect(graph.getGroupById('group').get('fillStyle')).toBe(undefined);
    expect(graph.getGroupById('group').get('strokeStyle')).toBe('blue');
  });
});

describe('nested dag should work', () => {
  const div = document.createElement('div');
  const graph = new Graph({
    width: 1000,
    height: 400,
    container: div,
    setDefaultNode() {
      return { width: 100, height: 40 };
    },
    setDefaultGroup() {
      return { padding: 10 };
    },
  });
  const rawData = {
    nodes: [
      {
        id: 'X',
      },
      {
        id: 'Y',
      },
      {
        id: 'Z',
      },
      {
        id: 'Q',
      },
    ],
    edges: [
      // 跨分组
      { source: 'X', target: 'Y' },
      // 同分组
      { source: 'Y', target: 'Z' },
      // 节点 -> 分组内节点
      { source: 'Q', target: 'X' },
      // 分组 -> 分组
      { source: 'b', target: 'c' },
    ],
    groups: [
      { id: 'a', children: ['b', 'c'] },
      { id: 'b', children: ['X'] },
      { id: 'c', children: ['Y', 'Z'] },
    ],
  };
  it('covert nested data should work', () => {
    const data = GroupUtils.getCollapsableData(rawData);
    expect(data.nodes.length).toBe(2);
    expect(data.edges.length).toBe(1);
    expect(data.nodes[0]).toEqual({
      id: 'Q',
    });
    expect(data.nodes[1]).toEqual({
      id: 'a',
      children: ['b', 'c'],
      __data: {
        id: 'a',
        children: ['b', 'c'],
      },
      childNodes: [
        {
          id: 'b',
          group: 'a',
          children: ['X'],
          childNodes: [{ id: 'X', group: 'b' }],
          childEdges: [],
          __data: {
            id: 'b',
            children: ['X'],
          },
        },
        {
          id: 'c',
          group: 'a',
          children: ['Y', 'Z'],
          childNodes: [
            {
              id: 'Y',
              group: 'c',
            },
            {
              id: 'Z',
              group: 'c',
            },
          ],
          __data: {
            id: 'c',
            children: ['Y', 'Z'],
          },
          childEdges: [
            {
              source: 'Y',
              target: 'Z',
            },
          ],
        },
      ],
      childEdges: [
        {
          source: 'X',
          sourceIndex: 1,
          sourceRoute: ['X', 'b', 'a'],
          target: 'Y',
          targetIndex: 1,
          targetRoute: ['Y', 'c', 'a'],
        },
        {
          source: 'b',
          target: 'c',
        },
      ],
    });

    graph.data(data);
  });

  it('expand parent group should work', () => {
    GroupUtils.expandGroupNode(graph, graph.getNodeById('a'));
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getGroups().length).toBe(1);
    expect(graph.getNodeById('Q').sources).toEqual([]);
    expect(graph.getNodeById('Q').targets).toEqual(['b']);
    expect(graph.getNodeById('b').sources).toEqual(['Q']);
    expect(graph.getNodeById('b').targets).toEqual(['c']);
    expect(graph.getNodeById('b').belong).toEqual(graph.getGroupById('a'));
    expect(graph.getNodeById('c').sources).toEqual(['b']);
    expect(graph.getNodeById('c').targets).toEqual([]);
    expect(graph.getNodeById('c').belong).toEqual(graph.getGroupById('a'));
    expect(graph.getGroupById('a').children.length).toBe(2);
  });

  it('expand child group should work', () => {
    GroupUtils.expandGroupNode(graph, graph.getNodeById('b'));
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getGroups().length).toBe(2);
    expect(graph.getNodeById('Q').sources).toEqual([]);
    expect(graph.getNodeById('Q').targets).toEqual(['X']);
    expect(graph.getGroupById('b').sources).toEqual([]);
    expect(graph.getGroupById('b').targets).toEqual(['c']);
    expect(graph.getGroupById('b').belong).toEqual(graph.getGroupById('a'));
    expect(graph.getNodeById('c').sources).toEqual(['X', 'b']);
    expect(graph.getNodeById('c').targets).toEqual([]);
    expect(graph.getNodeById('c').belong).toEqual(graph.getGroupById('a'));
    expect(graph.getNodeById('X').sources).toEqual(['Q']);
    expect(graph.getNodeById('X').targets).toEqual(['c']);
    expect(graph.getNodeById('X').belong).toEqual(graph.getGroupById('b'));
    expect(graph.getGroupById('a').children.length).toBe(2);
  });

  it('expand child group2 should work', () => {
    GroupUtils.expandGroupNode(graph, graph.getNodeById('c'));
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getGroups().length).toBe(3);
    expect(graph.getNodeById('Q').sources).toEqual([]);
    expect(graph.getNodeById('Q').targets).toEqual(['X']);
    expect(graph.getGroupById('b').sources).toEqual([]);
    expect(graph.getGroupById('b').targets).toEqual(['c']);
    expect(graph.getGroupById('b').belong).toEqual(graph.getGroupById('a'));
    expect(graph.getGroupById('c').sources).toEqual(['b']);
    expect(graph.getGroupById('c').targets).toEqual([]);
    expect(graph.getGroupById('c').belong).toEqual(graph.getGroupById('a'));
    expect(graph.getNodeById('X').sources).toEqual(['Q']);
    expect(graph.getNodeById('X').targets).toEqual(['Y']);
    expect(graph.getNodeById('X').belong).toEqual(graph.getGroupById('b'));
    expect(graph.getNodeById('Y').sources).toEqual(['X']);
    expect(graph.getNodeById('Y').targets).toEqual(['Z']);
    expect(graph.getNodeById('Y').belong).toEqual(graph.getGroupById('c'));
    expect(graph.getNodeById('Z').sources).toEqual(['Y']);
    expect(graph.getNodeById('Z').targets).toEqual([]);
    expect(graph.getNodeById('Z').belong).toEqual(graph.getGroupById('c'));
  });

  it('collapse child group should work', () => {
    GroupUtils.collapseGroup(graph, graph.getGroupById('b'));
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getGroups().length).toBe(2);
    expect(graph.getNodeById('Q').sources).toEqual([]);
    expect(graph.getNodeById('Q').targets).toEqual(['b']);
    expect(graph.getNodeById('b').sources).toEqual(['Q']);
    expect(graph.getNodeById('b').targets).toEqual(['c', 'Y']);
    expect(graph.getNodeById('b').belong).toEqual(graph.getGroupById('a'));
    expect(graph.getGroupById('c').sources).toEqual(['b']);
    expect(graph.getGroupById('c').targets).toEqual([]);
    expect(graph.getGroupById('c').belong).toEqual(graph.getGroupById('a'));
    expect(graph.getNodeById('Y').sources).toEqual(['b']);
    expect(graph.getNodeById('Y').targets).toEqual(['Z']);
    expect(graph.getNodeById('Y').belong).toEqual(graph.getGroupById('c'));
    expect(graph.getNodeById('Z').sources).toEqual(['Y']);
    expect(graph.getNodeById('Z').targets).toEqual([]);
    expect(graph.getNodeById('Z').belong).toEqual(graph.getGroupById('c'));
  });

  it('collapse parent group should work', () => {
    GroupUtils.collapseGroup(graph, graph.getGroupById('a'));
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getGroups().length).toBe(0);
    expect(graph.getNodeById('Q').sources).toEqual([]);
    expect(graph.getNodeById('Q').targets).toEqual(['a']);
    expect(graph.getNodeById('a').sources).toEqual(['Q']);
    expect(graph.getNodeById('a').targets).toEqual([]);

    GroupUtils.expandGroupNode(graph, graph.getNodeById('a'));
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getGroups().length).toBe(1);
    expect(graph.getNodeById('Q').sources).toEqual([]);
    expect(graph.getNodeById('Q').targets).toEqual(['b']);
    expect(graph.getNodeById('b').sources).toEqual(['Q']);
    expect(graph.getNodeById('b').targets).toEqual(['c']);
    expect(graph.getNodeById('b').belong).toEqual(graph.getGroupById('a'));
    expect(graph.getNodeById('c').sources).toEqual(['b']);
    expect(graph.getNodeById('c').targets).toEqual([]);
    expect(graph.getNodeById('c').belong).toEqual(graph.getGroupById('a'));
    expect(graph.getGroupById('a').children.length).toBe(2);
  });


});
