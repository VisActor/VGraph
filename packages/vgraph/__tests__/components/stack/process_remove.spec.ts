import { Graph } from "../../../src/graph";
import { Stack } from "../../../src/components";
import { ProcessRemoveCommand } from "../../../src/solutions/dag_flow_editor/commands";

describe("/src/commands/process_remove", () => {
  const div = document.createElement("div");
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

  graph.add("node", { id: "111" });

  const stack = new Stack(graph, {
    commands: { processRemove: ProcessRemoveCommand },
  });

  it("add sibling should work", () => {
    stack.execute("processRemove", { id: "111" });
    expect(graph.getNodes().length).toBe(0);
    expect(graph.getEdges().length).toBe(0);
    stack.undo();
    expect(graph.getNodes().length).toBe(1);
    expect(graph.getNodeById("111")).not.toBe(undefined);
    stack.redo();
    expect(graph.getNodes().length).toBe(0);
    expect(graph.getEdges().length).toBe(0);
    stack.undo();
    graph.add("node", { id: "222" });
    graph.add("node", { id: "333" });
    graph.add("edge", {
      source: "111",
      target: "222",
    });
    graph.add("edge", {
      source: "222",
      target: "333",
    });

    stack.execute("processRemove", { id: "222" });
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getEdges().length).toBe(1);
    expect(graph.getNodeById("333").sources).toEqual(["111"]);
    expect(graph.getNodeById("333").targets).toEqual([]);
    expect(graph.getNodeById("222")).toBe(undefined);

    stack.undo();
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getNodeById("222").sources).toEqual(["111"]);
    expect(graph.getNodeById("222").targets).toEqual(["333"]);
    expect(graph.getNodeById("333")).not.toBe(undefined);
    expect(graph.getNodeById("333").sources).toEqual(["222"]);
    expect(graph.getNodeById("333").targets).toEqual([]);

    stack.redo();
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getEdges().length).toBe(1);
    expect(graph.getNodeById("333").sources).toEqual(["111"]);
    expect(graph.getNodeById("333").targets).toEqual([]);
    expect(graph.getNodeById("222")).toBe(undefined);
  });

  it("should work with multiple sources & targets", () => {
    graph.data({
      nodes: [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }],
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
        {
          id: "24",
          source: "2",
          target: "4",
        },
        {
          id: "34",
          source: "3",
          target: "4",
        },
      ],
    });
    stack.execute("processRemove", { id: "2" });
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getNodeById("1").sources).toEqual([]);
    expect(graph.getNodeById("1").targets).toEqual(["3"]);
    expect(graph.getNodeById("3").sources).toEqual(["1"]);
    expect(graph.getNodeById("3").targets).toEqual(["4"]);
    expect(graph.getNodeById("4").sources).toEqual(["3"]);
    expect(graph.getNodeById("4").targets).toEqual([]);

    stack.undo();
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(4);
    expect(graph.getNodeById("1").sources).toEqual([]);
    expect(graph.getNodeById("1").targets).toEqual(["2", "3"]);
    expect(graph.getNodeById("3").sources).toEqual(["1"]);
    expect(graph.getNodeById("3").targets).toEqual(["4"]);
    expect(graph.getNodeById("4").sources).toEqual(["3", "2"]);
    expect(graph.getNodeById("4").targets).toEqual([]);

    stack.redo();
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getNodeById("1").sources).toEqual([]);
    expect(graph.getNodeById("1").targets).toEqual(["3"]);
    expect(graph.getNodeById("3").sources).toEqual(["1"]);
    expect(graph.getNodeById("3").targets).toEqual(["4"]);
    expect(graph.getNodeById("4").sources).toEqual(["3"]);
    expect(graph.getNodeById("4").targets).toEqual([]);

    graph.data({
      nodes: [
        { id: "1" },
        { id: "2" },
        { id: "3" },
        { id: "4" },
        { id: "5" },
        { id: "6" },
      ],
      edges: [
        {
          id: "13",
          source: "1",
          target: "3",
        },
        {
          id: "12",
          source: "1",
          target: "2",
        },
        {
          id: "26",
          source: "2",
          target: "6",
        },
        {
          id: "34",
          source: "3",
          target: "4",
        },
        {
          id: "35",
          source: "3",
          target: "5",
        },
        {
          id: "46",
          source: "4",
          target: "6",
        },
        {
          id: "56",
          source: "5",
          target: "6",
        },
      ],
    });

    stack.execute("processRemove", { id: "3" });
    expect(graph.getNodes().length).toBe(5);
    expect(graph.getEdges().length).toBe(6);
    expect(graph.getNodeById("1").sources).toEqual([]);
    expect(graph.getNodeById("1").targets).toEqual(["4", "5", "2"]);
    expect(graph.getNodeById("2").sources).toEqual(["1"]);
    expect(graph.getNodeById("2").targets).toEqual(["6"]);
    expect(graph.getNodeById("4").sources).toEqual(["1"]);
    expect(graph.getNodeById("4").targets).toEqual(["6"]);
    expect(graph.getNodeById("5").sources).toEqual(["1"]);
    expect(graph.getNodeById("5").targets).toEqual(["6"]);
    expect(graph.getNodeById("6").sources).toEqual(["2", "4", "5"]);
    expect(graph.getNodeById("6").targets).toEqual([]);

    stack.undo();
    expect(graph.getNodes().length).toBe(6);
    expect(graph.getEdges().length).toBe(7);
    expect(graph.getNodeById("1").sources).toEqual([]);
    expect(graph.getNodeById("1").sources).toEqual([]);
    expect(graph.getNodeById("1").targets).toEqual(["3", "2"]);
    expect(graph.getNodeById("2").sources).toEqual(["1"]);
    expect(graph.getNodeById("2").targets).toEqual(["6"]);
    expect(graph.getNodeById("3").sources).toEqual(["1"]);
    expect(graph.getNodeById("3").targets).toEqual(["4", "5"]);
    expect(graph.getNodeById("4").sources).toEqual(["3"]);
    expect(graph.getNodeById("4").targets).toEqual(["6"]);
    expect(graph.getNodeById("5").sources).toEqual(["3"]);
    expect(graph.getNodeById("5").targets).toEqual(["6"]);
    expect(graph.getNodeById("6").sources).toEqual(["2", "4", "5"]);
    expect(graph.getNodeById("6").targets).toEqual([]);

    stack.redo();
    expect(graph.getNodes().length).toBe(5);
    expect(graph.getEdges().length).toBe(6);
    expect(graph.getNodeById("1").sources).toEqual([]);
    expect(graph.getNodeById("1").targets).toEqual(["4", "5", "2"]);
    expect(graph.getNodeById("2").sources).toEqual(["1"]);
    expect(graph.getNodeById("2").targets).toEqual(["6"]);
    expect(graph.getNodeById("4").sources).toEqual(["1"]);
    expect(graph.getNodeById("4").targets).toEqual(["6"]);
    expect(graph.getNodeById("5").sources).toEqual(["1"]);
    expect(graph.getNodeById("5").targets).toEqual(["6"]);
    expect(graph.getNodeById("6").sources).toEqual(["2", "4", "5"]);
    expect(graph.getNodeById("6").targets).toEqual([]);
    graph.destroy();
  });
});
