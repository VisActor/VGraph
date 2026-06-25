import { Graph } from "../../src/graph";
import { RawTooltip } from "../../src/components";

describe("src/tooltip", () => {
  const graphDiv = document.createElement("div");
  document.body.append(graphDiv);
  const data = {
    nodes: [
      {
        id: "0",
        groupType: 0,
        otherType: 1,
      },
      {
        id: "1",
        groupType: 1,
        otherType: 1,
      },
      {
        id: "2",
        groupType: 2,
        otherType: 2,
      },
      {
        id: "3",
        groupType: 3,
        otherType: 3,
      },
      {
        id: "4",
        groupType: 4,
        otherType: 2,
      },
    ],
    edges: [
      { source: "0", target: "2" },
      { source: "1", target: "2" },
      { source: "4", target: "3" },
      { source: "1", target: "3" },
      { source: "4", target: "2" },
      { source: "2", target: "3" },
    ],
  };
  const graph = new Graph({
    container: graphDiv,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode(node) {
      return {
        width: 15,
        height: 15,
      };
    },
    setDefaultEdge(edgeData) {
      return {
        lineWidth: 1,
      };
    },
  });
  graph.data(data);

  it("rawTooltip should work", () => {
    const tooltip = new RawTooltip(graph, {
      styles: {
        border: "1px solid #ccc",
        borderRadius: "4px",
      },
      content(entity: any, type: string) {
        return `${entity.get("id")}`;
      },
      target: "node",
    });

    expect(tooltip.container.style.border).toBe("1px solid #ccc");
    expect(tooltip.container.style.borderRadius).toBe("4px");

    const node = graph.getNodeById("1");
    tooltip.show(
      {
        clientX: 0,
        clientY: 0,
        target: node,
      } as any,
      { left: 100, top: 100, width: 15, height: 15 }
    );
    expect(tooltip.visible);
    expect(tooltip.container.style.visibility).toBe("visible");
    expect(tooltip.container.style.left).toBe("100px");
    expect(tooltip.container.style.top).toBe("96px");
    expect(tooltip.container.innerHTML).toBe("1");

    tooltip.hide();
    expect(!tooltip.visible);
    expect(tooltip.container.style.left).toBe("-999px");
    expect(tooltip.container.style.top).toBe("-999px");
    expect(tooltip.container.style.visibility).toBe("hidden");

    tooltip.updateOption("offset", [2, 2]);

    tooltip.show(
      {
        clientX: 0,
        clientY: 0,
        target: node,
      } as any,
      { left: 100, top: 100, width: 15, height: 15 }
    );
    expect(tooltip.container.style.visibility).toBe("visible");
    expect(tooltip.container.style.left).toBe("102px");
    expect(tooltip.container.style.top).toBe("102px");
    expect(tooltip.container.innerHTML).toBe("1");

    tooltip.destroy();
  });
});
