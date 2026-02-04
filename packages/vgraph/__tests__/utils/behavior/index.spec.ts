import { isDragDist, getMagnetAnchor } from "../../../src/utils/behavior";
import { Graph } from "../../../src";

describe("/src/behavior", () => {
  it("isDragDist should work", () => {
    expect(isDragDist({ x: 2, y: 2 }, { clientX: 0, clientY: 0 })).toBe(false);
    expect(isDragDist({ x: -2, y: -2 }, { clientX: 0, clientY: 0 })).toBe(
      false
    );
    expect(isDragDist({ x: 4, y: 4 }, { clientX: 0, clientY: 0 })).toBe(true);
    expect(isDragDist({ x: -4, y: -4 }, { clientX: 0, clientY: 0 })).toBe(true);
    expect(isDragDist({ x: 0, y: 5 }, { clientX: 0, clientY: 0 })).toBe(true);
    expect(isDragDist({ x: -5, y: 0 }, { clientX: 0, clientY: 0 })).toBe(true);
  });

  it("getMagnetAnchor should work", () => {
    const div = document.createElement("div");
    div.setAttribute("width", "800px");
    div.setAttribute("height", "600px");
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return {
          width: 140,
          height: 40,
          anchors: [
            {
              show: "always",
              position: [0.5, 0],
              setStyles() {
                return {
                  fillStyle: "#F3F9FF",
                };
              },
            },
            {
              show: "hover",
              position: [0.5, 1],
              setStyles() {
                return {
                  fillStyle: "#F3F9FF",
                };
              },
            },
          ],
        };
      },
    });
    const node1 = graph.add("node", {
      id: "node1",
      x: 200,
      y: 100,
    });
    const node2 = graph.add("node", {
      id: "node2",
      x: 400,
      y: 200,
    });

    let result: any = getMagnetAnchor({ x: 270, y: 120 }, node1, graph);
    expect(result).toBe(null);

    result = getMagnetAnchor({ x: 400, y: 180 }, node1, graph);
    expect(result?.node.get("id")).toBe("node2");
    expect(result?.anchorIndex).toBe(0);

    result = getMagnetAnchor({ x: 400, y: 200 }, node1, graph);
    expect(result?.node.get("id")).toBe("node2");
    expect(result?.anchorIndex).toBe(0);

    result = getMagnetAnchor({ x: 400, y: 220 }, node1, graph);
    expect(result).toBe(null);
  });
});
