import { GraphStructure } from '../../src/graph_structure';

describe('/src/graph_structure', () => {
  it('should work for directed plan data', () => {
    const graphData = new GraphStructure({
      nodes: [
        {
          id: '1',
        },
        {
          id: '2',
        },
        {
          id: '3',
        },
      ],
      edges: [
        {
          source: '1',
          target: '2',
        },
        {
          source: '2',
          target: '3',
        },
      ],
    });

    expect(graphData.directed);
    const nodeMap = graphData.getNodeMap();
    expect(nodeMap['1'].configs).toEqual({ id: '1' });
    expect(nodeMap['1'].sources).toEqual([]);
    expect(nodeMap['1'].targets).toEqual(['2']);
    expect(nodeMap['1'].edges.length).toBe(1);

    expect(nodeMap['2'].configs).toEqual({ id: '2' });
    expect(nodeMap['2'].sources).toEqual(['1']);
    expect(nodeMap['2'].targets).toEqual(['3']);
    expect(nodeMap['2'].edges.length).toBe(2);

    expect(nodeMap['3'].configs).toEqual({ id: '3' });
    expect(nodeMap['3'].sources).toEqual(['2']);
    expect(nodeMap['3'].targets).toEqual([]);
    expect(nodeMap['3'].edges.length).toBe(1);

    expect(graphData.getEdges().length).toBe(2);
  });

  it('should work for abstract data', () => {
    const nodes = [
      {
        guid: '1',
      },
      {
        guid: '2',
      },
      {
        guid: '3',
      },
    ];
    const edges = [
      {
        fromEntityId: '1',
        toEntityId: '2',
      },
      {
        fromEntityId: '2',
        toEntityId: '3',
      },
    ];
    const graphData = new GraphStructure({
      nodes,
      edges,
      getNodeId(node: any) {
        return node.guid;
      },
      getEdgeSource(edge: any) {
        return edge.fromEntityId;
      },
      getEdgeTarget(edge: any) {
        return edge.toEntityId;
      },
    });
    const nodeMap = graphData.getNodeMap();
    expect(graphData.getEdges().length).toBe(2);
    expect(nodeMap['1'].configs).toEqual({
      guid: '1',
      id: '1',
    });
    expect(nodeMap['1'].sources).toEqual([]);
    expect(nodeMap['1'].targets).toEqual(['2']);

    expect(nodeMap['2'].configs).toEqual({
      guid: '2',
      id: '2',
    });
    expect(nodeMap['2'].sources).toEqual(['1']);
    expect(nodeMap['2'].targets).toEqual(['3']);

    expect(nodeMap['3'].configs).toEqual({
      guid: '3',
      id: '3',
    });
    expect(nodeMap['3'].sources).toEqual(['2']);
    expect(nodeMap['3'].targets).toEqual([]);

    const edgeData = graphData.getEdges();
    expect(edgeData[0].get('source')).toBe('1');
    expect(edgeData[0].get('target')).toBe('2');

    expect(edgeData[1].get('source')).toBe('2');
    expect(edgeData[1].get('target')).toBe('3');

    const exportData = graphData.getData();
    expect(exportData.nodes.length).toBe(3);
    expect(exportData.nodes[0]).toEqual({
      guid: '1',
      id: '1',
    });
    expect(exportData.nodes[1]).toEqual({
      guid: '2',
      id: '2',
    });
    expect(exportData.nodes[2]).toEqual({
      guid: '3',
      id: '3',
    });
  });

  it('add should work', () => {
    const graphData = new GraphStructure({
      nodes: [{ uid: '1' }],
      edges: [],
      getNodeId: (node: any) => node.uid,
    });
    expect(Object.keys(graphData.getNodeMap()).length).toBe(1);
    expect(graphData.getEdges().length).toBe(0);
    expect(graphData.getNodeMap()['1'].configs).toEqual({
      id: '1',
      uid: '1',
    });
    graphData.add('node', { uid: '2' });
    expect(Object.keys(graphData.getNodeMap()).length).toBe(2);
    expect(graphData.getNodeMap()['2'].configs).toEqual({
      id: '2',
      uid: '2',
    });

    graphData.add('edge', {
      source: '1',
      target: '2',
    });
    expect(graphData.getNodeMap()['1'].targets).toEqual(['2']);
    expect(graphData.getNodeMap()['2'].sources).toEqual(['1']);
    expect(graphData.getEdges().length).toBe(1);
  });

  it('temp entity should work', () => {
    let nodeCallCnt = 0;
    let edgeCallCnt = 0;
    const graphData = new GraphStructure({
      nodes: [{ id: 'other', uid: '1' }],
      edges: [],
      getNodeId: (node: any) => {
        nodeCallCnt++;
        return node.uid;
      },
      getEdgeSource: (edge: any) => {
        edgeCallCnt++;
        return edge._source;
      },
      getEdgeTarget: (edge: any) => {
        edgeCallCnt++;
        return edge._target;
      },
    });
    expect(nodeCallCnt).toBe(1);
    expect(Object.keys(graphData.getNodeMap()).length).toBe(1);
    expect(graphData.getNodeMap()['1'].configs).toEqual({
      id: '1',
      uid: '1',
    }); // id 发生变化
    graphData.add('node', { id: '2', uid: '3', dummy: true }, true);
    expect(Object.keys(graphData.getNodeMap()).length).toBe(2);
    expect(graphData.getNodeMap()['2'].configs).toEqual({
      id: '2',
      uid: '3',
      dummy: true,
    }); // nodeCallCnt, id 不变化
    expect(nodeCallCnt).toBe(1);

    expect(edgeCallCnt).toBe(0);
    graphData.add('edge', {
      _source: '1',
      _target: '2',
    });
    expect(edgeCallCnt).toBe(2);
    expect(graphData.getNodeMap()['1'].targets).toEqual(['2']);
    expect(graphData.getNodeMap()['2'].sources).toEqual(['1']);

    graphData.add(
      'edge',
      {
        source: '2',
        target: '1',
        dummy: true,
      },
      true,
    );
    expect(edgeCallCnt).toBe(2);
    expect(graphData.getNodeMap()['1'].sources).toEqual(['2']);
    expect(graphData.getNodeMap()['2'].targets).toEqual(['1']);

    graphData.remove(graphData.getEdges()[0]);
    expect(graphData.getNodeMap()['1'].targets).toEqual([]);
    expect(graphData.getNodeMap()['2'].sources).toEqual([]);
    expect(graphData.getNodeMap()['1'].sources).toEqual(['2']);
    expect(graphData.getNodeMap()['2'].targets).toEqual(['1']);
    graphData.remove(graphData.getEdges()[0]);
    expect(graphData.getNodeMap()['1'].targets).toEqual([]);
    expect(graphData.getNodeMap()['2'].sources).toEqual([]);
    expect(graphData.getNodeMap()['1'].sources).toEqual([]);
    expect(graphData.getNodeMap()['2'].targets).toEqual([]);
    graphData.remove(graphData.getNodes()[0]);
    expect(Object.keys(graphData.getNodeMap()).length).toBe(1);
    expect(graphData.getNodeMap()['1']).toBeUndefined();
    expect(graphData.getNodeMap()['2']).toBeDefined();
    graphData.remove(graphData.getNodes()[0]);
    expect(Object.keys(graphData.getNodeMap()).length).toBe(0);
    expect(graphData.getNodeMap()['2']).toBeUndefined();
  });

  it('remove duplicate edge should work', () => {
    const graph = new GraphStructure({
      nodes: [
        {
          id: '1',
        },
        {
          id: '2',
        },
      ],
      edges: [
        {
          source: '1',
          target: '2',
        },
        {
          source: '1',
          target: '2',
        },
      ],
    });

    const node1 = graph.getNodeById('1');
    const node2 = graph.getNodeById('2');
    const edge1 = graph.getEdges()[0];
    const edge2 = graph.getEdges()[1];
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

  });
});
