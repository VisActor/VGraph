
import { GraphStructure } from '../../src/graph_structure';
import { connectedComponents, isMultiComponentsForGraph, isMultiComponentsForData } from '../../src/layouts/utils';

describe('src/utils/connected_components', () => {
  //   a
  // b   c
  const data1 = {
    nodes: [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' }
    ],
    edges: [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'c' },
    ],
  };

  //   a  
  //  / \
  // b   c  d
  const data2 = {
    nodes: [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
      { id: 'd' }
    ],
    edges: [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'c' },
    ],
  };
  it('should work for connected components', () => {
    const g1 = new GraphStructure(data1);
    const { numLeaf, isMultiComponents } = connectedComponents(g1);
    expect(numLeaf).toBe(2);
    expect(isMultiComponents).toBe(false);

    const forGraph = isMultiComponentsForGraph(g1);
    expect(forGraph.numLeaf).toBe(2);
    expect(forGraph.isMultiComponents).toBe(false);

    const forData = isMultiComponentsForData(data1);
    expect(forData.numLeaf).toBe(2);
    expect(forData.isMultiComponents).toBe(false);
  });

  it('should work for multi components', () => {
    const g2 = new GraphStructure(data2);
    const { numLeaf, isMultiComponents } = connectedComponents(g2);

    expect(numLeaf).toBe(3);
    expect(isMultiComponents).toBe(true);

    const forGraph = isMultiComponentsForGraph(g2);
    expect(forGraph.numLeaf).toBe(3);
    expect(forGraph.isMultiComponents).toBe(true);

    const forData = isMultiComponentsForData(data2);
    expect(forData.numLeaf).toBe(3);
    expect(forData.isMultiComponents).toBe(true);
  });
});