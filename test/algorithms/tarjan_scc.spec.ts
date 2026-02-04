import { GraphStructure } from '../../src';
import {  tarjanScc as scc } from '../../src/algorithms';

//      1
//     /  \
//   2  ->  3 -> 4 <-> 5
//

const unionData = {
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
    {
      id: '4',
    },
    {
      id: '5',
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
    {
      source: '3',
      target: '1',
    },
    {
      source: '3',
      target: '4',
    },
    {
      source: '4',
      target: '5',
    },
    {
      source: '5',
      target: '4',
    },
  ],
};

// 1 -> 2 -> 3 -> 4
const seperateData = {
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
    {
      id: '4',
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
    {
      source: '3',
      target: '4',
    },
  ],
};

describe('/src/tarjan_scc', () => {
  it('should work for single vertex', () => {
    const graphData = new GraphStructure(seperateData);
    const sccs = scc(graphData);
    expect(sccs.length).toBe(4);
    expect(sccs[0]).toEqual(['4']);
    expect(sccs[1]).toEqual(['3']);
    expect(sccs[2]).toEqual(['2']);
    expect(sccs[3]).toEqual(['1']);
  });

  it('should work for multiple sccs', () => {
    const graphData = new GraphStructure(unionData);
    const sccs = scc(graphData);
    expect(sccs.length).toBe(2);
    expect(sccs[0]).toEqual(['5', '4']);
    expect(sccs[1]).toEqual(['3', '2', '1']);
  });
});
