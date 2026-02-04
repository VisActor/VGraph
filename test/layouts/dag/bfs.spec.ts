import { GraphStructure } from '../../../src/graph_structure';
import { bfsRank, longestPath } from '../../../src/layouts/dag/rank';
import { nestingGraph } from '../../../src/layouts/dag/preprocess/nested_graph';
import { acyclic } from '../../../src/layouts/dag/preprocess/acyclic';

describe('bfsRank', () => {
  it('can work in a single node', () => {
    const graph = new GraphStructure({
      nodes: [
        {
          id: 'a',
          root: true,
        },
      ],
      edges: [],
    });
    bfsRank(graph);
    expect(graph.getNodeMap()['a'].get('rank')).toBe(0);
  });
  it('can work in a simple graph', () => {
    const graph = new GraphStructure({
      nodes: [{ id: 'a', root: true }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
        { source: 'a', target: 'd' },
      ],
    });
    bfsRank(graph);
    expect(graph.getNodeMap()['a'].get('rank')).toBe(0);
    expect(graph.getNodeMap()['b'].get('rank')).toBe(1);
    expect(graph.getNodeMap()['c'].get('rank')).toBe(2);
    expect(graph.getNodeMap()['d'].get('rank')).toBe(1);
  });
  it('can work in a simple graph with a cycle', () => {
    const graph = new GraphStructure({
      nodes: [{ id: 'a', root: true }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
        { source: 'c', target: 'd' },
        { source: 'd', target: 'a' },
      ],
    });
    acyclic.run(graph);
    bfsRank(graph);
    acyclic.undo(graph);
    expect(graph.getNodeMap()['a'].get('rank')).toBe(0);
    expect(graph.getNodeMap()['b'].get('rank')).toBe(1);
    expect(graph.getNodeMap()['c'].get('rank')).toBe(2);
    expect(graph.getNodeMap()['d'].get('rank')).toBe(1);
  });
  it('can work in a graph with isoland nodes', () => {
    const graph = new GraphStructure({
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'd', target: 'a' },
      ],
    });
    longestPath(graph);
    const nest = nestingGraph(graph);
    nest.run();
    bfsRank(graph);
    nest.cleanup();
    expect(graph.getNodeMap()['a'].get('rank')).toBe(0);
    expect(graph.getNodeMap()['b'].get('rank')).toBe(1);
    expect(graph.getNodeMap()['c'].get('rank')).toBe(0);
    expect(graph.getNodeMap()['d'].get('rank')).toBe(-1);
  });
  it('can work in a graph with specified root', () => {
    const graph = new GraphStructure({
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
        { source: 'c', target: 'd' },
        { source: 'd', target: 'e' },
      ],
    });
    bfsRank(graph, graph.getNodeMap()['c']);
    expect(graph.getNodeMap()['a'].get('rank')).toBe(-2);
    expect(graph.getNodeMap()['b'].get('rank')).toBe(-1);
    expect(graph.getNodeMap()['c'].get('rank')).toBe(0);
    expect(graph.getNodeMap()['d'].get('rank')).toBe(1);
    expect(graph.getNodeMap()['e'].get('rank')).toBe(2);
  });
});
