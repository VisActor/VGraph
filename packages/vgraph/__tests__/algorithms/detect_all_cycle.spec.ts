import { GraphStructure } from "../../src";
import { detectAllCycles } from "../../src/algorithms";

// 1 -> 2 -> 3 -> 4
const seperateData = {
  nodes: [
    {
      id: "1",
    },
    {
      id: "2",
    },
    {
      id: "3",
    },
    {
      id: "4",
    },
  ],
  edges: [
    {
      source: "1",
      target: "2",
    },
    {
      source: "2",
      target: "3",
    },
    {
      source: "3",
      target: "4",
    },
  ],
};

//         4
//      /    \
// 1 -> 2 -> 3

const oneCycleData = {
  nodes: [
    {
      id: "1",
    },
    {
      id: "2",
    },
    {
      id: "3",
    },
    {
      id: "4",
    },
  ],
  edges: [
    {
      source: "1",
      target: "2",
    },
    {
      source: "2",
      target: "3",
    },
    {
      source: "3",
      target: "4",
    },
    {
      source: "4",
      target: "2",
    },
  ],
};

//  1 -> 2 \
//  |  /     5
//  3 -> 4 /
const moreCycleData = {
  nodes: [
    {
      id: "1",
    },
    {
      id: "2",
    },
    {
      id: "3",
    },
    {
      id: "4",
    },
    {
      id: "5",
    },
  ],
  edges: [
    {
      source: "1",
      target: "2",
    },
    {
      source: "1",
      target: "5",
    },
    {
      source: "2",
      target: "3",
    },
    {
      source: "3",
      target: "1",
    },
    {
      source: "3",
      target: "2",
    },
    {
      source: "3",
      target: "4",
    },
    {
      source: "4",
      target: "5",
    },
    {
      source: "5",
      target: "2",
    },
  ],
};

describe("src/detect_all_cycle", () => {
  it("should work when graph has no cycle", () => {
    const graphData = new GraphStructure(seperateData);
    const cycles = detectAllCycles(graphData);
    expect(cycles.length).toBe(0);
  });

  it("should work when graph has one cycle", () => {
    const graphData = new GraphStructure(oneCycleData);
    const cycles = detectAllCycles(graphData);
    expect(cycles.length).toBe(1);
    expect(cycles[0]).toEqual(["4", "2", "3", "4"]);
  });

  it("should work when graph has more than one cycle", () => {
    const graphData = new GraphStructure(moreCycleData);
    const cycles = detectAllCycles(graphData);
    expect(cycles.length).toBe(4);
    expect(cycles[0]).toEqual(["3", "1", "2", "3"]);
    expect(cycles[1]).toEqual(["3", "1", "5", "2", "3"]);
    expect(cycles[2]).toEqual(["3", "2", "3"]);
    expect(cycles[3]).toEqual(["3", "4", "5", "2", "3"]);
  });
});
