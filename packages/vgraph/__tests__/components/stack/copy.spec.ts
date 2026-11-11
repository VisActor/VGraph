import { Graph, uuid } from "../../../src";
import {
  Stack,
  CopyCommand,
  SelectCommand,
  PasteCommand,
} from "../../../src/components";

function getEvent() {
  return {
    preventDefault() {},
    clipboardData: {
      data: "",
      setData(type: string, data: string) {
        this.data = data;
      },
      getData() {
        return this.data;
      },
    },
  };
}

describe("/src/commands/copy", () => {
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

  graph.data({
    nodes: [
      { id: "1", x: 100, y: 100 },
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
        source: "1",
        target: "3",
      },
    ],
    groups: [
      {
        id: "group",
        children: ["1", "2"],
      },
    ],
  });

  const stack = new Stack(graph, {
    commands: {
      copy: CopyCommand,
      select: SelectCommand,
      paste: PasteCommand,
    },
  });

  it("copy & paste should work for node", () => {
    stack.execute("select", {
      selections: [graph.getNodeById("1"), graph.getNodeById("2")],
    });
    const e = getEvent();

    stack.execute("copy", { event: e });
    expect(stack.stack.length).toBe(0);
    const configs = JSON.parse(e.clipboardData.getData());
    expect(configs.id).toBe("vgraphEditor");
    expect(configs.node.length).toBe(2);
    expect(configs.edge.length).toBe(0);
    expect(configs.group.length).toBe(0);
    expect(configs.node).toEqual([
      graph.getNodeById("1").configs,
      graph.getNodeById("2").configs,
    ]);

    stack.execute("paste", { event: e });
    expect(stack.stack.length).toBe(1);
    expect(graph.getNodes().length).toBe(5);
    const node1 = graph
      .getNodes()
      .filter((node: any) => node.get("x") === 120)[0];
    expect(node1.get("y")).toBe(120);
    const id1 = node1.get("id");

    const node2 = graph
      .getNodes()
      .filter((node: any) => node.get("x") === 320)[0];
    expect(node2.get("y")).toBe(320);
    const id2 = node2.get("id");

    stack.undo();
    expect(graph.getNodes().length).toBe(3);
    expect(node1.isDestroyed());
    expect(node2.isDestroyed());

    stack.redo();
    expect(graph.getNodes().length).toBe(5);
    expect(graph.getNodeById(id1).get("x")).toBe(120);
    expect(graph.getNodeById(id1).get("y")).toBe(120);
    expect(graph.getNodeById(id2).get("x")).toBe(320);
    expect(graph.getNodeById(id2).get("y")).toBe(320);

    stack.undo();
  });

  it("copy & paste should work for group", () => {
    stack.execute("select", { selections: [graph.getGroupById("group")] });
    const e = getEvent();
    stack.execute("copy", { event: e });
    const configs = JSON.parse(e.clipboardData.getData());
    expect(configs.id).toBe("vgraphEditor");
    expect(configs.node.length).toBe(2);
    expect(configs.edge.length).toBe(1);
    expect(configs.group.length).toBe(1);
    expect(configs.node).toEqual([
      graph.getNodeById("1").configs,
      graph.getNodeById("2").configs,
    ]);
    expect(configs.edge).toEqual([
      {
        ...graph.getEdgeById("11").configs,
        startPoint: [120, 120],
        endPoint: [280, 280],
      },
    ]);
    expect(configs.group).toEqual([graph.getGroupById("group").configs]);

    stack.execute("paste", { event: e });
    expect(graph.getNodes().length).toBe(5);
    expect(graph.getGroups().length).toBe(2);
    const node1 = graph
      .getNodes()
      .filter((node: any) => node.get("x") === 120)[0];
    expect(node1.get("y")).toBe(120);
    const id1 = node1.get("id");

    const node2 = graph
      .getNodes()
      .filter((node: any) => node.get("x") === 320)[0];
    expect(node2.get("y")).toBe(320);
    const id2 = node2.get("id");

    const group = graph
      .getGroups()
      .filter((group: any) => group.get("id") !== "group")[0];
    const groupId = group.get("id");
    expect(node1.get("groupId")).toBe(groupId);
    expect(node2.get("groupId")).toBe(groupId);
    expect(group.children.length).toBe(2);

    stack.undo();
    expect(node1.isDestroyed());
    expect(node2.isDestroyed());
    expect(group.isDestroyed());
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getGroups().length).toBe(1);

    stack.redo();
    expect(graph.getNodes().length).toBe(5);
    expect(graph.getGroups().length).toBe(2);
    expect(graph.getNodeById(id1).get("x")).toBe(120);
    expect(graph.getNodeById(id1).get("y")).toBe(120);
    expect(graph.getNodeById(id1).get("groupId")).toBe(groupId);
    expect(graph.getNodeById(id2).get("x")).toBe(320);
    expect(graph.getNodeById(id2).get("y")).toBe(320);
    expect(graph.getNodeById(id2).get("groupId")).toBe(groupId);
  });

  it("bugfix: setDefaultNode id should work for paste", () => {
    graph.clear();
    graph.set("setDefaultNode", (nodeData: any) => {
      return {
        id: nodeData.id || `test-${uuid(10)}`,
        width: 140,
        height: 40,
      };
    });
    graph.set("setDefaultEdge", (edgeData: any) => {
      return {
        id: `${edgeData.source}-${edgeData.target}`,
      };
    });
    graph.set("setDefaultGroup", () => {
      return {
        id: `group-${uuid(5)}`,
      };
    });
    graph.data({
      nodes: [
        { id: "1", x: 100, y: 100 },
        { id: "2", x: 300, y: 300 },
      ],
      edges: [
        {
          source: "1",
          target: "2",
        },
      ],
      groups: [
        {
          children: ["1", "2"],
        },
      ],
    });
    const errorSpy = jest.spyOn(console, "error").mockImplementation();
    try {
      stack.execute("select", { selections: [graph.getGroups()[0]] });
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Snapshot contains invalid")
      );
    } finally {
      errorSpy.mockRestore();
    }
    const e = getEvent();
    stack.execute("copy", { event: e });
    stack.execute("paste", { event: e });
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getGroups().length).toBe(2);
    const node1 = graph
      .getNodes()
      .filter((node: any) => node.get("x") === 120)[0];
    const groupId = node1.get("groupId");
    expect(/^group-/.test(groupId));
    const group = graph.getGroupById(groupId);
    expect(group);
    expect(node1.get("y")).toBe(120);
    expect(/^test-/.test(node1.get("id")));

    const node2 = graph
      .getNodes()
      .filter((node: any) => node.get("x") === 320)[0];
    expect(node2.get("y")).toBe(320);
    expect(/^test-/.test(node2.get("id")));
    expect(node2.get("groupId")).toBe(groupId);

    const edge = node1.edges[0];
    expect(edge.get("id")).toBe(`${node1.get("id")}-${node2.get("id")}`);
  });

  it("nested group should work", () => {
    graph.set("setDefaultGroup", undefined);
    graph.data({
      nodes: [
        { id: "1", x: 100, y: 100 },
        { id: "2", x: 300, y: 300 },
        { id: "3", x: 100, y: 200 },
      ],
      edges: [
        {
          id: "11",
          source: "1",
          target: "group2",
        },
        {
          id: "22",
          source: "2",
          target: "3",
        },
      ],
      groups: [
        {
          id: "group1",
          children: ["1"],
        },
        {
          id: "group2",
          children: ["group3", "2"],
        },
        {
          id: "group3",
          children: ["3"],
        },
      ],
    });

    const errorSpy = jest.spyOn(console, "error").mockImplementation();
    try {
      stack.execute("select", { selections: [graph.getGroupById("group2")] });
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Snapshot contains invalid")
      );
    } finally {
      errorSpy.mockRestore();
    }
    const e = getEvent();
    stack.execute("copy", { event: e });
    let configs = JSON.parse(e.clipboardData.getData());
    expect(configs.id).toBe("vgraphEditor");
    expect(configs.node.length).toBe(2);
    expect(configs.edge.length).toBe(1);
    expect(configs.group.length).toBe(2);
    expect(configs.group[0].id).toBe("group3");
    expect(configs.group[0].children).toEqual(["3"]);
    expect(configs.group[0].groupId).toEqual("group2");
    expect(configs.group[1].id).toBe("group2");
    expect(configs.group[1].children).toEqual(["group3", "2"]);
    expect(configs.group[1].groupId).toBe(undefined);

    stack.execute("select", { selections: [graph.getGroupById("group3")] });
    stack.execute("copy", { event: e });
    configs = JSON.parse(e.clipboardData.getData());
    expect(configs.id).toBe("vgraphEditor");
    expect(configs.node.length).toBe(1);
    expect(configs.edge.length).toBe(0);
    expect(configs.group.length).toBe(1);
    expect(configs.group[0].id).toBe("group3");
    expect(configs.group[0].children).toEqual(["3"]);
    expect(configs.group[0].groupId).toBe(undefined);
    expect(configs.node[0].id).toBe("3");
  });
});
