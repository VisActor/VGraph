import { Graph } from "../../../src/graph";
import { Stack } from "../../../src/components";
import { AddSourceCommand } from "../../../src/solutions/dag_flow_editor/commands";

describe("/src/commands/add_source", () => {
  const div = document.createElement("div");

  it("add source should work", () => {
    const graph = new Graph({
      width: 800,
      height: 600,
      container: div,
      setDefaultNode(nodeData: any) {
        return {
          width: 100,
          height: 40,
        };
      },
    });

    graph.data({
      nodes: [
        { id: "1", x: 200, y: 100 },
        { id: "2", x: 300, y: 300 },
        { id: "3", x: 100, y: 200 },
      ],
      edges: [
        {
          id: "11",
          source: "1",
          target: "2",
        },
        {
          id: "22",
          source: "2",
          target: "3",
        },
      ],
    });

    const stack = new Stack(graph, {
      commands: { addSource: AddSourceCommand },
    });
    stack.execute("addSource", { configs: { id: "11" }, relativeNodeId: "1" });
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(3);
    expect(graph.getNodeById("11").sources).toEqual([]);
    expect(graph.getNodeById("11").targets).toEqual(["1"]);

    stack.undo();
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getNodeById("1").sources).toEqual([]);
    expect(graph.getNodeById("11")).toBe(undefined);

    stack.redo();
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(3);
    expect(graph.getNodeById("11").sources).toEqual([]);
    expect(graph.getNodeById("11").targets).toEqual(["1"]);

    stack.execute("addSource", { configs: { id: "22" }, relativeNodeId: "2" });
    expect(graph.getNodes().length).toBe(5);
    expect(graph.getEdges().length).toBe(4);
    expect(graph.getNodeById("22").sources).toEqual(["1"]);
    expect(graph.getNodeById("22").targets).toEqual(["2"]);
    expect(graph.getNodeById("1").sources).toEqual(["11"]);
    expect(graph.getNodeById("1").targets).toEqual(["22"]);
    expect(graph.getNodeById("2").sources).toEqual(["22"]);
    expect(graph.getNodeById("2").targets).toEqual(["3"]);

    stack.undo();
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(3);
    expect(graph.getNodeById("1").sources).toEqual(["11"]);
    expect(graph.getNodeById("1").targets).toEqual(["2"]);
    expect(graph.getNodeById("2").sources).toEqual(["1"]);
    expect(graph.getNodeById("2").targets).toEqual(["3"]);
    expect(graph.getNodeById("22")).toBe(undefined);

    stack.redo();
    expect(graph.getNodes().length).toBe(5);
    expect(graph.getEdges().length).toBe(4);
    expect(graph.getNodeById("22").sources).toEqual(["1"]);
    expect(graph.getNodeById("22").targets).toEqual(["2"]);
    expect(graph.getNodeById("1").sources).toEqual(["11"]);
    expect(graph.getNodeById("1").targets).toEqual(["22"]);
    expect(graph.getNodeById("2").sources).toEqual(["22"]);
    expect(graph.getNodeById("2").targets).toEqual(["3"]);

    graph.destroy();
  });

  it("bugfix: add source command undo should recover targets order", () => {
    const graph = new Graph({
      width: 800,
      height: 600,
      container: div,
      setDefaultNode(nodeData: any) {
        return {
          width: 100,
          height: 40,
        };
      },
    });

    graph.data({
      nodes: [
        { id: "1", x: 200, y: 100 },
        { id: "2", x: 300, y: 300 },
        { id: "3", x: 100, y: 200 },
      ],
      edges: [
        {
          id: "12",
          source: "1",
          target: "2",
        },
        {
          id: "13",
          source: "1",
          target: "3",
        },
      ],
    });

    const stack = new Stack(graph, {
      commands: { addSource: AddSourceCommand },
    });

    stack.execute("addSource", { configs: { id: "4" }, relativeNodeId: "2" });
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(3);
    expect(graph.getNodeById("1").targets).toEqual(["4", "3"]);
    expect(graph.getNodeById("4").sources).toEqual(["1"]);
    expect(graph.getNodeById("4").targets).toEqual(["2"]);

    stack.undo();
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getNodeById("1").sources).toEqual([]);
    expect(graph.getNodeById("1").targets).toEqual(["2", "3"]);
    expect(graph.getNodeById("4")).toBe(undefined);

    stack.redo();
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(3);
    expect(graph.getNodeById("4").sources).toEqual(["1"]);
    expect(graph.getNodeById("4").targets).toEqual(["2"]);
  });
});
