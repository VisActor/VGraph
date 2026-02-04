import { Graph } from "../../../src/graph";
import { Stack, UpdateCommand } from "../../../src/components";

describe("/src/commands/add", () => {
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
    commands: { update: UpdateCommand },
  });

  it("update node should work", () => {
    stack.execute("update", {
      id: "111",
      type: "node",
      configs: {
        width: 200,
        height: 60,
      },
    });
    expect(stack.stack.length).toBe(1);
    expect(graph.getNodeById("111").get("width")).toBe(200);
    expect(graph.getNodeById("111").get("height")).toBe(60);
    stack.undo();
    expect(graph.getNodeById("111").get("width")).toBe(100);
    expect(graph.getNodeById("111").get("height")).toBe(40);
    stack.redo();
    expect(graph.getNodeById("111").get("width")).toBe(200);
    expect(graph.getNodeById("111").get("height")).toBe(60);

    stack.execute("update", {
      id: "111",
      type: "node",
      configs: {
        test1: 200,
        test2: 60,
      },
    });
    expect(stack.stack.length).toBe(2);

    expect(graph.getNodeById("111").get("test1")).toBe(200);
    expect(graph.getNodeById("111").get("test2")).toBe(60);
    stack.undo();
    expect(graph.getNodeById("111").get("test1")).toBeUndefined();
    expect(graph.getNodeById("111").get("test2")).toBeUndefined();
    stack.redo();
    expect(graph.getNodeById("111").get("test1")).toBe(200);
    expect(graph.getNodeById("111").get("test2")).toBe(60);

    stack.execute("update", {
      id: "222",
      type: "node",
      configs: {
        test1: 200,
        test2: 60,
      },
    });
    expect(stack.stack.length).toBe(2);
    stack.undo();
    stack.undo();
    expect(stack.at).toBe(-1);
    expect(graph.getNodeById("111").get("test1")).toBeUndefined();
    expect(graph.getNodeById("111").get("test2")).toBeUndefined();
    expect(graph.getNodeById("111").get("width")).toBe(100);
    expect(graph.getNodeById("111").get("height")).toBe(40);
  });

  it("update edge should work", () => {
    graph.add("node", { id: "222" });
    graph.add("edge", { id: "111-222", source: "111", target: "222" });
    stack.execute("update", {
      id: "111-222",
      type: "edge",
      configs: {
        source: "111",
        target: "222",
        fillStyle: "#ccc",
      },
    });
    expect(graph.getEdges().length).toBe(1);
    const edge = graph.getEdges()[0];
    expect(edge.get("source")).toBe("111");
    expect(edge.get("target")).toBe("222");
    expect(edge.get("fillStyle")).toBe("#ccc");
    expect(stack.at).toBe(0);
    expect(stack.stack[stack.at].data.id).toBe(edge.get("id"));
    expect(stack.stack[stack.at].data.configs).toEqual({
      source: "111",
      target: "222",
      fillStyle: "#ccc",
    });
    stack.undo();
    expect(edge.get("fillStyle")).toBeUndefined();

    stack.redo();
    expect(edge.get("fillStyle")).toBe("#ccc");
    expect(stack.stack[stack.at + 1]).toBeUndefined();

    edge.set("controlPoints", [
      [30, 20],
      [50, 80],
    ]);
    stack.execute("update", {
      id: "111-222",
      type: "edge",
      configs: {
        controlPoints: [
          [100, 100],
          [200, 200],
        ],
      },
    });
    let controlPoints = edge.get("controlPoints");
    expect(controlPoints).toEqual([
      [100, 100],
      [200, 200],
    ]);
    controlPoints[0] = [43, 34];
    controlPoints[1][0] = [62];
    stack.undo();
    controlPoints = edge.get("controlPoints");
    expect(controlPoints).toEqual([
      [30, 20],
      [50, 80],
    ]);
    controlPoints[0] = [24, 65];
    controlPoints[1][0] = [73];
    stack.redo();
    controlPoints = edge.get("controlPoints");
    expect(controlPoints).toEqual([
      [100, 100],
      [200, 200],
    ]);
  });

  it("update group should work", () => {
    graph.add("group", { id: "group12" });
    expect(graph.getGroupById("group12").get("children")).toBeUndefined();
    expect(graph.getGroupById("group12").getBBox()).toEqual({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
    expect(graph.getGroupById("group12").children.length).toBe(0);
    stack.execute("update", {
      id: "group12",
      type: "group",
      configs: {
        children: ["111", "222"],
      },
    });
    expect(graph.getGroupById("group12").getBBox()).toEqual({
      left: -70,
      top: -40,
      width: 140,
      height: 80,
    });
    expect(graph.getGroupById("group12").children.length).toBe(2);
    expect(graph.getGroupById("group12").children[0].get("id")).toBe("111");
    expect(graph.getGroupById("group12").children[1].get("id")).toBe("222");
    expect(stack.at).toBe(2);
    expect(stack.stack[stack.at].data.id).toBe(
      graph.getGroupById("group12").get("id")
    );
    expect(stack.stack[stack.at].data.configs).toEqual({
      children: ["111", "222"],
    });
    expect(stack.stack[stack.at].data.originConfigs).toEqual({
      children: undefined,
    });
    stack.undo();
    expect(stack.at).toBe(1);
    expect(graph.getGroupById("group12").get("children")).toBeUndefined();
    expect(graph.getGroupById("group12").getBBox()).toEqual({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
    expect(graph.getGroupById("group12").children.length).toBe(0);
    stack.redo();
    expect(graph.getGroupById("group12").getBBox()).toEqual({
      left: -70,
      top: -40,
      width: 140,
      height: 80,
    });
    expect(graph.getGroupById("group12").children.length).toBe(2);
    expect(graph.getGroupById("group12").children[0].get("id")).toBe("111");
    expect(graph.getGroupById("group12").children[1].get("id")).toBe("222");
    expect(stack.at).toBe(2);
  });
});
