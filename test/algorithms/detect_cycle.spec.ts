import { GraphStructure } from '../../src';
import { detectCycle } from '../../src/algorithms';

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

//         4
//      /    \
// 1 -> 2 -> 3

const oneCycleData = {
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
    {
      source: '4',
      target: '2',
    },
  ],
};

//  1 -> 2 \
//  |  /     5
//  3 -> 4 /
const moreCycleData = {
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
      source: '1',
      target: '5',
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
      target: '2',
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
      target: '2',
    },
  ],
};

describe('src/detect_cycle', () => {
  it('should work when graph has no cycle', () => {
    const graphData = new GraphStructure(seperateData);
    const cycle = detectCycle(graphData);
    expect(cycle).toBe(null);
  });

  it('should work when graph has one cycle', () => {
    const graphData = new GraphStructure(oneCycleData);
    const cycle = detectCycle(graphData);
    expect(cycle).toEqual(['2', '3', '4', '2']);
  });

  it('should work when graph has more than one cycle', () => {
    const graphData = new GraphStructure(moreCycleData);
    const cycle = detectCycle(graphData);
    expect(cycle).toEqual(['1', '2', '3', '1']);
  });
});
