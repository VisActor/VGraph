import { GraphStructure } from "../../src";
import { depthFirstSearch as dfs } from "../../src/algorithms";

describe("src/dfs", () => {
  it("should work for strongly connected graph", () => {
    const data = {
      nodes: [
        {
          id: "1",
          count: 0,
        },
        {
          id: "2",
          count: 0,
        },
        {
          id: "3",
          count: 0,
        },
        {
          id: "4",
          count: 0,
        },
      ],
      edges: [
        {
          source: "1",
          target: "2",
        },
        {
          source: "1",
          target: "4",
        },
        {
          source: "2",
          target: "3",
        },
      ],
    };
    const graphData = new GraphStructure(data);
    const nodes: string[] = [];
    dfs(
      graphData,
      graphData.getNodeById("1"),
      ({ currentNode }: { currentNode: any }) => {
        currentNode.configs.count++;
        nodes.push(currentNode.get("id"));
      }
    );
    expect(graphData.getNodeById("1").get("count")).toBe(1);
    expect(graphData.getNodeById("2").get("count")).toBe(1);
    expect(graphData.getNodeById("3").get("count")).toBe(1);
    expect(graphData.getNodeById("4").get("count")).toBe(1);
    expect(nodes).toEqual(["1", "2", "3", "4"]);
  });

  it("should work when there are isolated nodes", () => {
    const data = {
      nodes: [
        {
          id: "1",
          count: 0,
        },
        {
          id: "2",
          count: 0,
        },
        {
          id: "3",
          count: 0,
        },
      ],
      edges: [
        {
          source: "1",
          target: "2",
        },
      ],
    };
    const graphData = new GraphStructure(data);
    dfs(
      graphData,
      graphData.getNodeById("1"),
      ({ currentNode }: { currentNode: any }) => {
        currentNode.configs.count++;
      }
    );
    expect(graphData.getNodeById("1").get("count")).toBe(1);
    expect(graphData.getNodeById("2").get("count")).toBe(1);
    expect(graphData.getNodeById("3").get("count")).toBe(0);
  });

  it("should stop when shouldVisit returns false", () => {
    const data = {
      nodes: [
        {
          id: "1",
          visited: false,
        },
        {
          id: "2",
          visited: false,
        },
        {
          id: "3",
          visited: false,
        },
      ],
      edges: [
        {
          source: "1",
          target: "2",
        },
        {
          source: "3",
          target: "1",
        },
      ],
    };
    const graphData = new GraphStructure(data);
    dfs(graphData, graphData.getNodeById("2"), {
      enterNode({ currentNode }: { currentNode: any }) {
        currentNode.configs.visited = true;
      },
      shouldVisit({ currentNode }: { currentNode: any }) {
        return currentNode.get("id") !== "1";
      },
    });
    expect(graphData.getNodeById("1").get("visited")).toBe(false);
    expect(graphData.getNodeById("2").get("visited")).toBe(true);
    expect(graphData.getNodeById("3").get("visited")).toBe(false);
  });
});
