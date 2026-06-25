import { Graph } from "../../src";
import { limitTranslate } from "../../src/behaviors/limit_translate";

describe("src/utils/limit_translate", () => {
  const div = document.createElement("div");
  const graph = new Graph({
    width: 500,
    height: 300,
    container: div,
    setDefaultNode(nodeData: any) {
      return {
        width: 400,
        height: 200,
        fillStyle: "#666",
      };
    },
  });
  graph.add("node", {
    x: 250,
    y: 150,
  });

  it("should work on ratio > 1", () => {
    graph.scale(2); // 2
    // 下底边过界
    let result = limitTranslate(graph, -300, -300);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    result = limitTranslate(graph, -300, -300, 20);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);

    result = limitTranslate(graph, 100, 100);
    expect(result.x).toBe(100);
    expect(result.y).toBe(100);
    result = limitTranslate(graph, 300, 300);
    expect(result.x).toBe(300);
    expect(result.y).toBe(300);
    result = limitTranslate(graph, 800, 300);
    expect(result.x).toBe(500);
    expect(result.y).toBe(300);
  });

  it("should work on ratio < 1", () => {
    graph.scale(0.4); // 0.8
    let result = limitTranslate(graph, -30, -30);
    expect(result.x).toBe(-30);
    expect(result.y).toBe(-30);
    result = limitTranslate(graph, -80, -80);
    expect(result.x).toBe(-80);
    expect(result.y).toBe(-60);
    result = limitTranslate(graph, -300, -300);
    expect(result.x).toBe(-100);
    expect(result.y).toBe(-60);

    // 上边过界
    result = limitTranslate(graph, 300, 300);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    result = limitTranslate(graph, 300, 300, 20);
    expect(result.x).toBe(24);
    expect(result.y).toBe(24);
  });
});
